import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AddHolding from './components/AddHolding.jsx'
import Graveyard from './components/Graveyard.jsx'
import HoldingRow from './components/HoldingRow.jsx'
import PortfolioSummary from './components/PortfolioSummary.jsx'
import WailList from './components/WailList.jsx'
import { classify, detectWail, STATUS_DEAD } from './lib/dead.js'
import { fetchToken } from './lib/dexscreener.js'
import {
  clearAll,
  loadHoldings,
  loadWails,
  saveHoldings,
  saveWails,
} from './lib/store.js'

const POLL_MS = 60_000

const WAIL_TEXT = {
  fading: 'is fading — liquidity is thinning',
  died: 'has died and joined the graveyard',
  crashed: 'crashed more than 20% in one refresh',
}

// A short falling sine sweep — a ghost wail, generated at runtime (no audio file).
function playWail() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.9)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 1)
  } catch {
    // Audio unavailable — the visual wail still shows.
  }
}

export default function App() {
  const [holdings, setHoldings] = useState(loadHoldings)
  const [quotes, setQuotes] = useState({})
  const [wails, setWails] = useState(loadWails)
  const [soundOn, setSoundOn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formNotice, setFormNotice] = useState('')
  const [stale, setStale] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const prevRef = useRef({}) // address -> { status, price }

  // Show latest wail in banner (if any and not dismissed).
  const latestWail = wails.length > 0 ? wails[0] : null
  const showBanner = latestWail && !bannerDismissed

  // Persist holdings whenever they change.
  useEffect(() => saveHoldings(holdings), [holdings])
  useEffect(() => saveWails(wails), [wails])

  const refresh = useCallback(async () => {
    if (holdings.length === 0) return
    let anyOk = false
    const nextQuotes = {}
    const nextHoldings = [...holdings]
    const newWails = []

    for (const h of nextHoldings) {
      const { quote, error } = await fetchToken(h.address)
      if (error) continue
      anyOk = true
      nextQuotes[h.address] = quote

      // Track the peak price (for the -95% dead rule).
      if (quote && quote.priceUsd > 0) {
        h.peakPriceUsd = Math.max(h.peakPriceUsd ?? quote.priceUsd, quote.priceUsd)
        if (!h.symbol) h.symbol = quote.symbol
      }

      const prev = prevRef.current[h.address]
      const status = classify(quote, h.peakPriceUsd ?? 0)
      const prevStatus = prev?.status ?? status
      const wailReason = detectWail(prevStatus, status, prev?.price, quote?.priceUsd)
      if (wailReason) {
        newWails.push({
          id: `${h.address}-${Date.now()}-${wailReason}`,
          symbol: quote?.symbol ?? h.symbol ?? '???',
          reason: wailReason,
          at: Date.now(),
        })
        if (soundOn) playWail()
      }
      if (status === STATUS_DEAD && !h.diedAt) {
        h.diedAt = Date.now()
        h.risenAt = null // clear risen when it becomes dead
      }
      if (status !== STATUS_DEAD && h.diedAt) {
        // risen from the dead
        h.risenAt = Date.now()
        h.diedAt = null
      }
      if (status === STATUS_DEAD) {
        h.risenAt = null // ensure risenAt is cleared if dead
      }
      prevRef.current[h.address] = { status, price: quote?.priceUsd }
    }

    setQuotes((q) => ({ ...q, ...nextQuotes }))
    setHoldings(nextHoldings)
    if (newWails.length > 0) {
      setWails((w) => [...newWails, ...w].slice(0, 20))
      setBannerDismissed(false) // Reset banner dismissal when new wails arrive
    }
    setStale(!anyOk)
    if (anyOk) setLastUpdated(new Date())
  }, [holdings, soundOn])

  // Poll every 60s; pause when the tab is hidden, refresh once on return.
  useEffect(() => {
    refresh()
    const id = setInterval(() => {
      if (!document.hidden) refresh()
    }, POLL_MS)
    const onVisible = () => {
      if (!document.hidden) refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  async function addHolding({ chain, address, amount, buyPriceUsd }) {
    setBusy(true)
    setFormNotice('')
    const { quote, error } = await fetchToken(address)
    setBusy(false)
    if (error) {
      setFormNotice(`Could not reach DexScreener: ${error}`)
      return
    }
    if (!quote) {
      setFormNotice('No trading pair found for this token yet.')
      return
    }
    setHoldings((prev) => {
      const existing = prev.find((h) => h.address.toLowerCase() === address.toLowerCase())
      if (existing) {
        // Merge into one holding (FR-1).
        return prev.map((h) =>
          h.id === existing.id
            ? { ...h, amount: h.amount + amount, buyPriceUsd: buyPriceUsd ?? h.buyPriceUsd }
            : h,
        )
      }
      return [
        ...prev,
        {
          id: `${address.toLowerCase()}-${Date.now()}`,
          chain,
          address,
          symbol: quote.symbol,
          amount,
          buyPriceUsd,
          peakPriceUsd: quote.priceUsd,
          diedAt: null,
          risenAt: null,
        },
      ]
    })
    setFormNotice(`${quote.symbol} summoned to your portfolio.`)
  }

  function removeHolding(id) {
    setHoldings((prev) => prev.filter((h) => h.id !== id))
  }

  function buryAll() {
    if (!window.confirm('Bury all holdings and wails? This cannot be undone.')) return
    clearAll()
    setHoldings([])
    setWails([])
    setQuotes({})
    prevRef.current = {}
  }

  // Split holdings into living/dying vs dead.
  const rows = useMemo(() => {
    return holdings.map((h) => {
      const quote = quotes[h.address]
      const status = classify(quote, h.peakPriceUsd ?? 0)
      return { holding: h, quote, status }
    })
  }, [holdings, quotes])

  const living = rows.filter((r) => r.status !== STATUS_DEAD)
  const ghosts = rows.filter((r) => r.status === STATUS_DEAD)

  const totalValue = living.reduce(
    (sum, r) => sum + (r.quote?.priceUsd ?? 0) * r.holding.amount,
    0,
  )
  const change24h =
    living.length > 0
      ? living.reduce((sum, r) => sum + (r.quote?.priceChange24h ?? 0), 0) / living.length
      : NaN
  // Fog thickens with volatility: |24h change| mapped to 0.15–0.6 opacity.
  const fogOpacity = Number.isFinite(change24h)
    ? Math.min(0.6, 0.15 + Math.abs(change24h) / 100)
    : 0.15

  return (
    <div className="app">
      <div className="fog" style={{ opacity: fogOpacity }} aria-hidden="true" />
      <header>
        <h1>👻 Ghostfolio</h1>
        <p className="tagline">
          A haunted portfolio tracker for memecoin traders. Dead coins become ghosts.
        </p>
      </header>

      {showBanner && (
        <div className="wail-banner" role="alert" aria-live="assertive">
          <span className="ghost-emoji" aria-hidden="true">👻</span>
          <span className="wail-message">
            <strong>{latestWail.symbol}</strong> {WAIL_TEXT[latestWail.reason] ?? 'wailed'}
          </span>
          <button
            className="btn-dismiss"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss wail alert"
          >
            ✕
          </button>
        </div>
      )}

      <PortfolioSummary
        totalValue={totalValue}
        change24h={change24h}
        aliveCount={living.filter((r) => r.status === 'alive').length}
        dyingCount={living.filter((r) => r.status === 'dying').length}
        deadCount={ghosts.length}
      />

      <AddHolding onAdd={addHolding} busy={busy} />
      {formNotice && <p className="notice">{formNotice}</p>}
      {stale && (
        <p className="stale-banner">
          Prices may be stale — DexScreener could not be reached. Last update:{' '}
          {lastUpdated ? lastUpdated.toLocaleTimeString('en-US') : 'never'}.
        </p>
      )}

      {living.length > 0 && (
        <section>
          <h2>✦ The Living</h2>
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Amount</th>
                <th>Price</th>
                <th>Value</th>
                <th>24h</th>
                <th>P/L</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {living.map((r) => (
                <HoldingRow
                  key={r.holding.id}
                  holding={r.holding}
                  quote={r.quote}
                  status={r.status}
                  onRemove={removeHolding}
                />
              ))}
            </tbody>
          </table>
        </section>
      )}

      <Graveyard ghosts={ghosts} onRemove={removeHolding} />
      <WailList wails={wails} soundOn={soundOn} onToggleSound={() => setSoundOn((s) => !s)} />

      <footer>
        <p>
          Prices by DexScreener
          {lastUpdated ? ` — updated ${lastUpdated.toLocaleTimeString('en-US')}` : ''}.
          Holdings never leave your browser. Not financial advice.
        </p>
        <button className="btn-bury" onClick={buryAll}>
          Bury all data
        </button>
      </footer>
    </div>
  )
}
