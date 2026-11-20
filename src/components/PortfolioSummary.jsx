function fmtUsd(n) {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })
}

export default function PortfolioSummary({ totalValue, change24h, aliveCount, dyingCount, deadCount }) {
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
