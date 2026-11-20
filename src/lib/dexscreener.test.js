import { describe, expect, it } from 'vitest'
import { normalizePair, pickCanonicalPair } from './dexscreener.js'

function pair(overrides = {}) {
  return {
    chainId: 'solana',
    pairAddress: 'pair1',
    baseToken: { address: 'tok1', name: 'Ghost Coin', symbol: 'GHOST' },
    priceUsd: '0.5',
    priceChange: { h24: -3 },
    volume: { h24: 12345 },
    liquidity: { usd: 50000 },
    url: 'https://dexscreener.com/solana/pair1',
    ...overrides,
  }
}

describe('pickCanonicalPair', () => {
  it('returns null for empty / missing pairs', () => {
    expect(pickCanonicalPair([])).toBeNull()
    expect(pickCanonicalPair(null)).toBeNull()
    expect(pickCanonicalPair(undefined)).toBeNull()
  })

  it('picks the highest-liquidity pair', () => {
    const low = pair({ pairAddress: 'low', liquidity: { usd: 100 } })
    const high = pair({ pairAddress: 'high', liquidity: { usd: 9000 } })
    expect(pickCanonicalPair([low, high]).pairAddress).toBe('high')
  })

  it('breaks liquidity ties by 24h volume', () => {
    const a = pair({ pairAddress: 'a', liquidity: { usd: 1000 }, volume: { h24: 10 } })
    const b = pair({ pairAddress: 'b', liquidity: { usd: 1000 }, volume: { h24: 99 } })
    expect(pickCanonicalPair([a, b]).pairAddress).toBe('b')
  })
})

describe('normalizePair', () => {
  it('returns null for a missing pair', () => {
    expect(normalizePair(null)).toBeNull()
  })

  it('normalizes numbers and symbols', () => {
    const q = normalizePair(pair())
    expect(q.symbol).toBe('GHOST')
    expect(q.priceUsd).toBe(0.5)
    expect(q.liquidityUsd).toBe(50000)
    expect(q.volume24hUsd).toBe(12345)
    expect(q.priceChange24h).toBe(-3)
    expect(q.chain).toBe('solana')
  })

  it('tolerates missing fields', () => {
    const q = normalizePair({ baseToken: { address: 'x', symbol: 'X' } })
    expect(q.priceUsd).toBe(0)
    expect(q.liquidityUsd).toBe(0)
    expect(q.symbol).toBe('X')
  })
})
