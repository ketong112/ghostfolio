function fmtUsd(n) {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })
}

function getFogLevel(change24h) {
  if (!Number.isFinite(change24h)) return { level: '—', opacity: 0 }
  const absChange = Math.abs(change24h)
  if (absChange < 5) return { level: 'Thin', opacity: 0.15 }
  if (absChange <= 20) return { level: 'Misty', opacity: 0.35 }
  return { level: 'Thick', opacity: 0.6 }
}

export default function PortfolioSummary({ totalValue, change24h, aliveCount, dyingCount, deadCount }) {
  const fog = getFogLevel(change24h)

  // Empty state hint when portfolio has no holdings
  if (aliveCount + dyingCount + deadCount === 0) {
    return (
      <section className="summary empty">
        <p className="empty-hint">No holdings yet. Paste a token contract address to summon your first holding.</p>
      </section>
    )
  }

  return (
    <section className="summary">
      <div className="summary-stat">
        <span>Total value</span>
        <strong>{fmtUsd(totalValue)}</strong>
      </div>
      <div className="summary-stat">
        <span>24h change</span>
        <strong className={change24h < 0 ? 'neg' : 'pos'}>
          {Number.isFinite(change24h) ? `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%` : '—'}
        </strong>
      </div>
      <div className="summary-stat">
        <span>Fog</span>
        <strong>
          <span className="fog-meter">
            <span className="fog-bar" style={{ opacity: fog.opacity }} />
            {fog.level}
          </span>
        </strong>
      </div>
      <div className="summary-stat">
        <span>Alive</span>
        <strong>{aliveCount} ✦</strong>
      </div>
      <div className="summary-stat">
        <span>Dying</span>
        <strong>{dyingCount} ☠</strong>
      </div>
      <div className="summary-stat">
        <span>Ghosts</span>
        <strong>{deadCount} 👻</strong>
      </div>
    </section>
  )
}
