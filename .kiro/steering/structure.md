# Ghostfolio — Structure Steering

```
ghostfolio/
├── .kiro/
│   ├── steering/          # product.md, tech.md, structure.md (always loaded)
│   ├── specs/
│   │   └── ghostfolio/    # requirements.md, design.md, tasks.md
│   └── hooks/             # lint-on-save.json
├── public/
│   └── favicon.svg        # ghost favicon
├── src/
│   ├── main.jsx           # React entry
│   ├── App.jsx            # layout: header, portfolio, graveyard, wails
│   ├── index.css          # graveyard theme (dark, fog, ghost greens/purples)
│   ├── lib/
│   │   ├── dexscreener.js # DexScreener API client (fetch, cache, parse)
│   │   ├── dead.js        # dead / dying / alive rules (pure, unit-tested)
│   │   └── store.js       # localStorage holdings CRUD
│   └── components/
│       ├── AddHolding.jsx # add by contract address + amount
│       ├── HoldingRow.jsx # one living/dying holding
│       ├── Graveyard.jsx  # dead holdings as ghosts
│       ├── WailList.jsx   # recent wails
│       └── PortfolioSummary.jsx
├── index.html
├── package.json
├── vite.config.js
├── LICENSE (MIT)
└── README.md
```

## Rules
- `src/lib/dead.js` is pure functions only (no fetch, no DOM, no dates from `Date.now()`
  inside the rule functions — pass timestamps in). This is what makes it unit-testable.
- `src/lib/dexscreener.js` is the ONLY module that talks to the network.
- `src/lib/store.js` is the ONLY module that touches `localStorage`.
- Components never call `fetch` directly. They read from a single `usePortfolio` state
  in `App.jsx`, which polls the DexScreener client on a 60s tick.
- Never put `/.kiro` in `.gitignore`. The Kiroween rules require it at the repo root.
- Keep the build static (`vite build` -> `dist/`). No SSR, no server functions.
