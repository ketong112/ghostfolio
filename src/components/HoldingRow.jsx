function fmtUsd(n) {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n < 1 ? 6 : 2,
  })
}

function fmtPct(n) {
  if (!Number.isFinite(n)) return '—'
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

export default function HoldingRow({ holding, quote, status, onRemove }) {
  const price = quote?.priceUsd ?? 0
  const value = price * holding.amount
  const change = quote?.priceChange24h
  const pnl =
    holding.buyPriceUsd != null && holding.buyPriceUsd > 0
      ? (price - holding.buyPriceUsd) * holding.amount
      : null

  return (
    <tr className={`holding-row status-${status}`}>
      <td>
        <strong>{quote?.symbol ?? holding.symbol ?? '???'}</strong>
        <br />
        <small>{holding.chain} · {holding.address.slice(0, 6)}…{holding.address.slice(-4)}</small>
      </td>
      <td>{holding.amount.toLocaleString('en-US')}</td>
      <td>{fmtUsd(price)}</td>
      <td>{fmtUsd(value)}</td>
      <td className={change < 0 ? 'neg' : 'pos'}>{fmtPct(change)}</td>
      <td>{pnl == null ? '—' : fmtUsd(pnl)}</td>
      <td>
        <span className="status-badge">
          {holding.risenAt ? '✅ Risen from the dead' : status === 'dying' ? '☠ Dying' : '✦ Alive'}
        </span>
      </td>
      <td>
        <button className="btn-bury" onClick={() => onRemove(holding.id)}>
          Bury
        </button>
      </td>
    </tr>
  )
}
