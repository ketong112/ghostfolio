const WAIL_TEXT = {
  fading: 'is fading — liquidity is thinning',
  died: 'has died and joined the graveyard',
  crashed: 'crashed more than 20% in one refresh',
}

export default function WailList({ wails, soundOn, onToggleSound }) {
  return (
    <section className="wails">
      <h2>🔔 Recent wails</h2>
      <label className="sound-toggle">
        <input type="checkbox" checked={soundOn} onChange={onToggleSound} />
        Sound wails
      </label>
      {wails.length === 0 ? (
        <p>Silence in the graveyard. No wails yet.</p>
      ) : (
        <ul>
          {wails.map((w) => (
            <li key={w.id}>
              <strong>{w.symbol}</strong> {WAIL_TEXT[w.reason] ?? 'wailed'}
              {' — '}
              <time>{new Date(w.at).toLocaleTimeString('en-US')}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
