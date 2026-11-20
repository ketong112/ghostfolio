# Ghostfolio — Design

## Overview
A static React + Vite single-page app. No backend, no accounts, no wallet. Data comes
from the DexScreener public API; holdings live in `localStorage`. The build is a
static `dist/` folder deployed to Vercel.

## Architecture
```
App.jsx (usePortfolio state, 60s poll tick)
  ├── dexscreener.js  (network only: fetch + cache + parse)
  ├── dead.js         (pure rules: dead / dying / alive + wail triggers)
  ├── store.js        (localStorage only: holdings CRUD, wails, RIP dates)
  └── components/     (AddHolding, HoldingRow, Graveyard, WailList, PortfolioSummary)
```

## Data flow
1. User adds a holding (chain + contract address + amount). `store.js` saves it.
2. `App.jsx` polls `dexscreener.js` every 60s (one batched request per token).
   DexScreener response is parsed into a normalized `TokenQuote`:
   `{ address, chain, symbol, name, priceUsd, liquidityUsd, volume24hUsd, priceChange24h, pairAddress, peakPriceUsd, updatedAt }`.
3. `dead.js` classifies each holding (alive / dying / dead) from its `TokenQuote`
   and the previous classification. Transitions produce wails.
4. UI renders: living + dying holdings in the portfolio table, dead holdings in the
   graveyard, wails in the recent-wails list. Fog opacity = f(portfolio 24h |change|).

## Key decisions
- **DexScreener over CoinGecko:** most memecoins are not on CoinGecko; DexScreener
  covers Solana/BSC/Ethereum pairs with liquidity + volume, which is exactly what the
  dead rules need. Free, no key.
- **Canonical pair = highest liquidity.** A token can have many pairs; the deepest one
  is the honest price. If two pairs tie, prefer the one with the higher 24h volume.
- **Peak price tracking:** the app stores the highest `priceUsd` ever seen per holding
  in `localStorage` (updated on each successful refresh). The -95% dead rule compares
  against that stored peak. On first add, peak = current price.
- **No background polling when hidden:** the poll timer pauses on `visibilitychange`
  and refreshes once when the tab becomes visible again.
- **Sound:** WebAudio oscillator wail (a falling sine sweep), generated at runtime —
  no audio assets, no autoplay issues (only plays after a user gesture enabled sound).

## UI layout
- Header: Ghostfolio logo (ghost SVG) + total value + 24h change + fog meter.
- Add holding bar: chain select (Solana / BSC / Ethereum) + address input + amount.
- Portfolio table: symbol, amount, price, value, 24h change, status (Alive / Dying).
- Graveyard: grid of ghost cards (symbol, amount, last value, RIP date, "bury" button).
- Recent wails: timestamped list, newest first.
- Footer: "Prices by DexScreener — updated HH:MM:SS" + clear-data ("Bury all") button.

## Testing strategy
- Vitest unit tests for `dead.js` (every rule + every transition) and for the
  DexScreener response parser (real sample payloads, including empty pairs and 404).
- Manual checklist: add a live token, add a dead token (known rugged contract), verify
  the graveyard, verify a wail fires on a >20% drop (simulate by editing the stored
  peak in devtools), verify persistence across reload.
