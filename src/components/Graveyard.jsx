function fmtUsd(n) {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n < 1 ? 6 : 2,
  })
}

export default function Graveyard({ ghosts, onRemove, onResurrect }) {
  if (ghosts.length === 0) {
    return (
      <section className="graveyard empty">
        <h2>🪦 The Graveyard</h2>
        <p>No ghosts yet. May your bags stay alive.</p>
      </section>
    )
  }

  return (
    <section className="graveyard">
      <h2>🪦 The Graveyard — {ghosts.length} ghost{ghosts.length > 1 ? 's' : ''}</h2>
      <div className="ghost-grid">
        {ghosts.map((g) => (
          <article key={g.holding.id} className="ghost-card">
            <div className="ghost-face">👻</div>
            <h3>{g.quote?.symbol ?? g.holding.symbol ?? '???'}</h3>
            <p>
              {g.holding.amount.toLocaleString('en-US')} held
              <br />
              Last value: {fmtUsd((g.quote?.priceUsd ?? 0) * g.holding.amount)}
              <br />
              RIP: {g.holding.diedAt ? new Date(g.holding.diedAt).toLocaleDateString('en-US') : 'unknown'}
            </p>
            <button className="btn-bury" onClick={() => onRemove(g.holding.id)}>
              Bury forever
            </button>
          </article>
        ))}
      </div>
      {onResurrect && null}
    </section>
  )
}
