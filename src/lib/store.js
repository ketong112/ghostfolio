// Ghostfolio — localStorage persistence.
// This is the ONLY module that touches localStorage.

const HOLDINGS_KEY = 'ghostfolio.holdings.v1'
const WAILS_KEY = 'ghostfolio.wails.v1'
const MAX_WAILS = 20

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable (private mode) — the app keeps working
    // in-memory for this session.
  }
}

export function loadHoldings() {
  return read(HOLDINGS_KEY, [])
}

// A holding: { id, chain, address, symbol, amount, buyPriceUsd|null,
//   peakPriceUsd, diedAt|null }
export function saveHoldings(holdings) {
  write(HOLDINGS_KEY, holdings)
}

export function loadWails() {
  return read(WAILS_KEY, [])
}

export function saveWails(wails) {
  write(WAILS_KEY, wails.slice(0, MAX_WAILS))
}

export function clearAll() {
  try {
    localStorage.removeItem(HOLDINGS_KEY)
    localStorage.removeItem(WAILS_KEY)
  } catch {
    // ignore
  }
}
