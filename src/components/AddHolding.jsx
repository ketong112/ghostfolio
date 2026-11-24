import { useState } from 'react'

const CHAINS = [
  { id: 'solana', label: 'Solana' },
  { id: 'bsc', label: 'BNB Chain' },
  { id: 'ethereum', label: 'Ethereum' },
]

// Very loose address-shape check per chain (the real check is DexScreener).
function looksLikeAddress(chain, address) {
  const a = address.trim()
  if (chain === 'solana') return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a)
  return /^0x[0-9a-fA-F]{40}$/.test(a)
}

export default function AddHolding({ onAdd, busy }) {
  const [chain, setChain] = useState('solana')
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    setError('')
    const addr = address.trim()
    const amt = Number(amount)
    if (!looksLikeAddress(chain, addr)) {
      setError(`That address does not look like a token on ${chain}.`)
      return
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setError('Enter an amount greater than 0.')
      return
    }
    
    onAdd({
      chain,
      address: addr,
      amount: amt,
      buyPriceUsd: buyPrice.trim() ? Number(buyPrice) : null,
    })
  }

  return (
    <form className="add-holding" onSubmit={submit}>
      <select value={chain} onChange={(e) => setChain(e.target.value)} aria-label="Chain">
        {CHAINS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Token contract address"
        aria-label="Token contract address"
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount held"
        min="0"
        step="any"
        aria-label="Amount held"
      />
      <input
        type="number"
        value={buyPrice}
        onChange={(e) => setBuyPrice(e.target.value)}
        placeholder="Buy price USD (optional)"
        min="0"
        step="any"
        aria-label="Buy price in USD (optional)"
      />
      <button type="submit" disabled={busy}>
        {busy ? 'Summoning…' : 'Summon holding'}
      </button>
      {error && <p className="form-error">{error}</p>}
    </form>
  )
}
