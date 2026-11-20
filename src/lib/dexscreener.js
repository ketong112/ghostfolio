// Ghostfolio — DexScreener public API client.
// This is the ONLY module that talks to the network.

const BASE = 'https://api.dexscreener.com/latest/dex'
const CACHE_TTL_MS = 60_000

// In-memory cache: address (lowercased) -> { at, quote }
const cache = new Map()

/**
 * Normalize one DexScreener pair into a TokenQuote.
 * The canonical pair is the one with the highest liquidity.
 */
export function pickCanonicalPair(pairs) {
  if (!Array.isArray(pairs) || pairs.length === 0) return null
  return pairs.reduce((best, p) => {
    const liq = p?.liquidity?.usd ?? 0
    const bestLiq = best?.liquidity?.usd ?? 0
    if (liq > bestLiq) return p
    if (liq === bestLiq) {
      const vol = p?.volume?.h24 ?? 0
      const bestVol = best?.volume?.h24 ?? 0
      return vol > bestVol ? p : best
    }
    return best
  })
}

export function normalizePair(pair) {
  if (!pair) return null
  return {
    address: pair.baseToken?.address ?? '',
    chain: pair.chainId ?? '',
    symbol: pair.baseToken?.symbol ?? '???',
    name: pair.baseToken?.name ?? '',
    priceUsd: Number(pair.priceUsd) || 0,
    liquidityUsd: pair.liquidity?.usd ?? 0,
    volume24hUsd: pair.volume?.h24 ?? 0,
    priceChange24h: pair.priceChange?.h24 ?? 0,
    pairAddress: pair.pairAddress ?? '',
    pairUrl: pair.url ?? '',
    updatedAt: Date.now(),
  }
}

/**
 * Fetch the canonical quote for one token address.
 * Returns { quote } on success or { error } on failure — never throws.
 */
export async function fetchToken(address) {
  const key = address.trim().toLowerCase()
  const cached = cache.get(key)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return { quote: cached.quote }
  }
  let res
  try {
    res = await fetch(`${BASE}/tokens/${encodeURIComponent(key)}`)
  } catch (err) {
    return { error: `Network error: ${err.message}` }
  }
  if (!res.ok) {
    return { error: `DexScreener returned HTTP ${res.status}` }
  }
  let data
  try {
    data = await res.json()
  } catch {
    return { error: 'DexScreener returned an unreadable response' }
  }
  const pair = pickCanonicalPair(data?.pairs)
  if (!pair) {
    // No pairs at all — the token may be dead (FR-4d) or not listed yet.
    return { quote: null }
  }
  const quote = normalizePair(pair)
  cache.set(key, { at: Date.now(), quote })
  return { quote }
}
