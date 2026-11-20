// Ghostfolio — dead / dying / alive rules.
// Pure functions only: no fetch, no DOM, no Date.now() inside the rules.
// Timestamps are passed in by the caller so every rule is unit-testable.

export const STATUS_ALIVE = 'alive'
export const STATUS_DYING = 'dying'
export const STATUS_DEAD = 'dead'

// Thresholds (single source of truth — mirrors .kiro/steering/tech.md).
export const DEAD_LIQUIDITY_USD = 100
export const DEAD_VOLUME_USD = 1
export const DEAD_DROP_FROM_PEAK = 0.95 // price down 95%+ from peak
export const DYING_LIQUIDITY_USD = 1000
export const DYING_DROP_24H = -20 // percent
export const WAIL_DROP_TICK = -20 // percent in a single refresh tick

/**
 * Classify a holding from its DexScreener quote.
 * @param {object|null} quote - normalized TokenQuote, or null when DexScreener
 *   returns no pairs at all (the pair is gone).
 * @param {number} peakPriceUsd - highest price ever seen for this holding.
 * @returns {'alive'|'dying'|'dead'}
 */
export function classify(quote, peakPriceUsd) {
  // Rule FR-4d: the pair no longer exists.
  if (!quote) return STATUS_DEAD

  const liquidity = quote.liquidityUsd ?? 0
  const volume24h = quote.volume24hUsd ?? 0
  const change24h = quote.priceChange24h ?? 0
  const price = quote.priceUsd ?? 0

  // Rule FR-4a: liquidity dried up.
  if (liquidity < DEAD_LIQUIDITY_USD) return STATUS_DEAD
  // Rule FR-4b: no volume and price falling.
  if (volume24h < DEAD_VOLUME_USD && change24h < 0) return STATUS_DEAD
  // Rule FR-4c: collapsed 95%+ from peak.
  if (peakPriceUsd > 0 && price <= peakPriceUsd * (1 - DEAD_DROP_FROM_PEAK)) {
    return STATUS_DEAD
  }

  // Rule FR-5a: low liquidity.
  if (liquidity < DYING_LIQUIDITY_USD) return STATUS_DYING
  // Rule FR-5b: sharp 24h drop.
  if (change24h <= DYING_DROP_24H) return STATUS_DYING

  return STATUS_ALIVE
}

/**
 * Detect whether a status/price transition should raise a wail (FR-6).
 * @param {string} prevStatus - previous classification
 * @param {string} nextStatus - new classification
 * @param {number} prevPrice - price at previous refresh
 * @param {number} nextPrice - price at this refresh
 * @returns {string|null} - wail reason, or null when no wail.
 */
export function detectWail(prevStatus, nextStatus, prevPrice, nextPrice) {
  if (prevStatus === STATUS_ALIVE && nextStatus === STATUS_DYING) {
    return 'fading'
  }
  if (nextStatus === STATUS_DEAD && prevStatus !== STATUS_DEAD) {
    return 'died'
  }
  if (
    prevPrice > 0 &&
    nextPrice > 0 &&
    (nextPrice - prevPrice) / prevPrice <= WAIL_DROP_TICK / 100
  ) {
    return 'crashed'
  }
  return null
}
