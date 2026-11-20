import { describe, expect, it } from 'vitest'
import { classify, detectWail } from './dead.js'

function quote(overrides = {}) {
  return {
    priceUsd: 1,
    liquidityUsd: 50000,
    volume24hUsd: 10000,
    priceChange24h: 5,
    ...overrides,
  }
}

describe('classify', () => {
  it('alive: healthy pair', () => {
    expect(classify(quote(), 1)).toBe('alive')
  })

  it('dead: liquidity below $100', () => {
    expect(classify(quote({ liquidityUsd: 99 }), 1)).toBe('dead')
    // $100 is not dead, but it IS dying (below the $1,000 dying line).
    expect(classify(quote({ liquidityUsd: 100 }), 1)).toBe('dying')
    expect(classify(quote({ liquidityUsd: 1000 }), 1)).toBe('alive')
  })

  it('dead: no volume and price falling', () => {
    expect(classify(quote({ volume24hUsd: 0.5, priceChange24h: -1 }), 1)).toBe('dead')
    // No volume but price rising is NOT dead (could be a fresh listing).
    expect(classify(quote({ volume24hUsd: 0.5, priceChange24h: 2 }), 1)).toBe('alive')
  })

  it('dead: price down 95%+ from peak', () => {
    expect(classify(quote({ priceUsd: 0.05 }), 1)).toBe('dead')
    expect(classify(quote({ priceUsd: 0.051 }), 1)).toBe('alive')
  })

  it('dead: pair gone (null quote)', () => {
    expect(classify(null, 1)).toBe('dead')
  })

  it('dying: liquidity below $1,000', () => {
    expect(classify(quote({ liquidityUsd: 999 }), 1)).toBe('dying')
    expect(classify(quote({ liquidityUsd: 1000 }), 1)).toBe('alive')
  })

  it('dying: 24h change -20% or worse', () => {
    expect(classify(quote({ priceChange24h: -20 }), 1)).toBe('dying')
    expect(classify(quote({ priceChange24h: -19.9 }), 1)).toBe('alive')
  })

  it('dead beats dying when both apply', () => {
    expect(classify(quote({ liquidityUsd: 50, priceChange24h: -30 }), 1)).toBe('dead')
  })
})

describe('detectWail', () => {
  it('alive -> dying wails (fading)', () => {
    expect(detectWail('alive', 'dying', 1, 0.9)).toBe('fading')
  })

  it('any -> dead wails (died)', () => {
    expect(detectWail('alive', 'dead', 1, 0.01)).toBe('died')
    expect(detectWail('dying', 'dead', 0.5, 0.01)).toBe('died')
  })

  it('>20% drop in one tick wails (crashed)', () => {
    expect(detectWail('alive', 'alive', 1, 0.79)).toBe('crashed')
    expect(detectWail('alive', 'alive', 1, 0.81)).toBeNull()
  })

  it('no wail when nothing got worse', () => {
    expect(detectWail('alive', 'alive', 1, 1.05)).toBeNull()
    expect(detectWail('dead', 'dead', 0.01, 0.01)).toBeNull()
  })
})
