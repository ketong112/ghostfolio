# Ghostfolio — Product Steering

## What Ghostfolio is
Ghostfolio is a haunted crypto portfolio tracker built for **memecoin traders**.
A trader pastes token contract addresses (Solana, BSC, Ethereum) and an amount held.
Ghostfolio shows live value, profit/loss, and — the part that matters — which holdings
are **dead**.

## The haunting is the function, not decoration
- A holding whose liquidity has dried up, whose volume is gone, or whose price has
  collapsed 95%+ from its peak is **dead**. Dead holdings appear as **ghosts in a
  graveyard**, with a RIP date (the day it died).
- A holding that drops sharply (>20% in 24h) or loses liquidity fast makes its ghost
  **wail** — a visible + audible alert. The wail IS the alert, not a skin on top of one.
- Living holdings are friendly spirits; the fog thickens as portfolio volatility rises.
- The graveyard is a real portfolio view: it answers "how much of my money is in dead
  coins?" at a glance. That is the product's core insight.

## Who it is for
Memecoin traders who hold dozens of tokens, most of which die or rug. They need to
see, in seconds, what is alive, what is dying, and what is already a ghost — without
connecting a wallet or paying for a terminal.

## What it is NOT
- Not a trading app. No swaps, no wallet connection, no private keys, no signing.
- Not financial advice. Ghostfolio reports what the chain says; it never recommends
  buying or selling.
- Not a mint-safety scanner. (That problem is already solved by other Kiroween entries.)

## Success criteria
1. A trader can add a holding by contract address in under 10 seconds.
2. The graveyard view correctly separates dead from living holdings (per the dead rules).
3. Every price/liquidity number is traceable to DexScreener data, shown with a timestamp.
4. The spooky UI is legible: a first-time visitor understands "ghost = dead coin" without
   reading any documentation.
