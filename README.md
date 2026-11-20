# Ghostfolio 👻 — a haunted crypto portfolio tracker for memecoin traders

**Kiroween 2026 — Costume Contest entry.** Built with Kiro (CLI).

Memecoin traders hold dozens of tokens, and most of them die or rug. Ghostfolio
shows, in seconds, what is alive, what is dying, and what is already a ghost —
without connecting a wallet or paying for a terminal.

## The haunting is the function

- **Dead holdings become ghosts in a graveyard.** A token is dead when its
  liquidity drops below $100, its 24h volume is gone, its price has collapsed
  95%+ from its peak, or its trading pair no longer exists. Each ghost carries
  a RIP date — the day it died.
- **Ghosts wail.** When a holding drops sharply (>20% in a day) or loses
  liquidity fast, its ghost wails: a banner, an animation, and an entry in the
  recent-wails list. The wail IS the alert.
- **Fog is volatility.** The thicker the fog, the wilder your portfolio's 24h swing.
- **Living holdings are friendly spirits.** Dying ones flicker.

## How it works

1. Paste a token contract address (Solana, BSC, or Ethereum) and the amount you hold.
2. Ghostfolio prices it live from the **DexScreener public API** (free, no key) —
   price, liquidity, 24h volume, market cap.
3. Holdings are stored in your browser's `localStorage` only. Nothing leaves your
   machine. No wallet connection, no private keys, no signing, no server.

## Run it

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests (dead-detection rules + DexScreener parsing)
npm run build    # static build in dist/
```

## How Kiro was used

Ghostfolio was built spec-first with the **Kiro CLI** (`kiro-cli`, headless):

- **Specs** (`.kiro/specs/ghostfolio/`): requirements written in EARS format,
  a design doc, and a task list. The build followed the spec, not vibes.
- **Steering** (`.kiro/steering/`): `product.md` (what Ghostfolio is and is not),
  `tech.md` (DexScreener, dead rules, no-wallet constraint), `structure.md`
  (module boundaries: network only in `dexscreener.js`, storage only in `store.js`,
  pure rules in `dead.js`).
- **Agent hooks** (`.kiro/hooks/`): `lint-on-save` runs ESLint on every saved
  JS/JSX file.
- **Models:** cheap models (qwen3-coder-next, 0.05x) for scaffolding and tests;
  stronger models for the tricky parts (dead-rule edge cases, DexScreener parsing).
- **No IDE, no PBT:** this build used the Kiro CLI only. Property-based testing
  is an IDE feature and was not used.

## License

MIT. See [LICENSE](LICENSE).
