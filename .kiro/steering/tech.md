# Ghostfolio — Tech Steering

## Stack
- **Frontend only (no backend).** React 18 + Vite. Static site, deployable to Vercel.
- **Data:** DexScreener public API (free, no API key).
  - `GET https://api.dexscreener.com/latest/dex/tokens/{tokenAddress}` — pairs for a token.
  - `GET https://api.dexscreener.com/latest/dex/pairs/{chainId}/{pairId}` — one pair.
  - Pick the pair with the highest liquidity as the token's canonical pair.
  - Respect rate limits: batch addresses, cache responses 60s, never fire more than
    one request per token per refresh tick.
- **Persistence:** `localStorage` only. Holdings never leave the user's browser.
- **Styling:** plain CSS (no component framework). Dark graveyard theme, system fonts
  + one display font for headings. All spooky visuals are CSS/SVG — no external images.
- **Testing:** Vitest for the dead-detection rules and the DexScreener response parsing.
  The dead rules are the product's brain; they must have unit tests before any UI polish.

## Dead rules (single source of truth — see `src/lib/dead.js`)
A holding is **dead** when ANY of these is true for its canonical pair:
1. Liquidity (USD) < $100.
2. 24h volume (USD) < $1 AND price change 24h < 0.
3. Price down >= 95% from the pair's recorded peak (all-time high in DexScreener data).
4. The pair no longer exists in DexScreener (404 / empty pairs array).

A holding is **dying** when liquidity < $1,000 OR 24h change <= -20%.
Otherwise it is **alive**.

## Wail (alert) rules
- A holding wails when it transitions alive -> dying, dying -> dead, or drops >20% in
  a single refresh tick. A wail is a banner + a ghost animation + (if the user enabled
  sound) a short wail sound generated with WebAudio — no audio files.
- Wails are shown in a "Recent wails" list with timestamps. No notifications API, no
  background polling when the tab is hidden (the page refreshes on visibility change).

## Constraints
- No wallet connection, no private keys, no signing, no transactions — ever.
- No paid APIs. No server. No user accounts. No tracking.
- All numbers show their source ("DexScreener, updated HH:MM:SS") so a wrong number
  can be traced, never silently trusted.
- English UI (hackathon requirement). Code comments in English.
