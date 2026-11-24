# Ghostfolio — Tasks

- [ ] 1. Project scaffold
  - [~] 1.1 Create Vite + React app (`npm create vite@latest`, React template), install Vitest
  - [~] 1.2 Add MIT LICENSE, README, `.gitignore` (must NOT ignore `.kiro`), `vercel.json`
  - [~] 1.3 Verify `npm run build` produces a static `dist/` and `npm run dev` serves the page

- [ ] 2. DexScreener client (`src/lib/dexscreener.js`)
  - [~] 2.1 `fetchToken(address)` — call `/latest/dex/tokens/{address}`, pick the
    highest-liquidity pair, return a normalized `TokenQuote`
  - [~] 2.2 60s in-memory cache per address; batch multiple addresses per tick
  - [~] 2.3 Handle empty pairs + 404 + network failure (return `{ error }`, never throw
    into the UI)
  - [~] 2.4 Unit tests with real sample payloads (live pair, dead pair, empty response)

- [ ] 3. Dead rules (`src/lib/dead.js`)
  - [~] 3.1 `classify(quote, peakPriceUsd)` -> `alive | dying | dead` (pure functions)
  - [~] 3.2 `detectWail(prevStatus, nextStatus, prevPrice, nextPrice)` -> wail or null
  - [~] 3.3 Unit tests for every rule boundary (liquidity $99/$100, volume $0.99/$1,
    -95% drop, pair gone)

- [ ] 4. Storage (`src/lib/store.js`)
  - [~] 4.1 Holdings CRUD in `localStorage` (add/merge/remove, buy price optional)
  - [~] 4.2 Peak-price tracking per holding; RIP date recorded on first dead classification
  - [~] 4.3 Wail history (max 20, newest first); "Bury all" clears everything

- [x] 5. UI components
  - [x] 5.1 `AddHolding` — chain select + address + amount, with validation messages
    from FR-1
  - [x] 5.2 `PortfolioSummary` — total value, 24h change, fog meter
  - [x] 5.3 `HoldingRow` — living/dying rows with status text (not colour alone)
  - [x] 5.4 `Graveyard` — ghost cards with RIP dates + bury button + "risen" state
  - [x] 5.5 `WailList` — timestamped wails + sound toggle (WebAudio, off by default)

- [x] 6. Theme (`src/index.css`)
  - [x] 6.1 Dark graveyard theme: fog layers, green/purple accents, ghost SVG favicon
  - [x] 6.2 Fog opacity tied to portfolio 24h absolute change
  - [x] 6.3 Legibility pass: "ghost = dead coin" understandable without docs

- [x] 7. App wiring (`src/App.jsx`)
  - [x] 7.1 `usePortfolio` state + 60s poll tick, pause when tab hidden
  - [x] 7.2 Stale-price banner on refresh failure; "updated HH:MM:SS" label
  - [x] 7.3 Wire wails (banner + animation + list + optional sound)

- [ ] 8. Deploy + verify
  - [ ] 8.1 Deploy to Vercel (free), confirm the live URL loads and prices refresh
  - [ ] 8.2 Manual checklist from design.md (live token, dead token, wail, persistence)
  - [ ] 8.3 Run `npm test` — all unit tests green before submission

- [ ] 9. Submission materials
  - [ ] 9.1 README: what it is, how to run, how Kiro was used
  - [ ] 9.2 Demo video (<3 min, user records on the live site)
  - [ ] 9.3 Devpost submission (Costume Contest) with repo + live URL + video
