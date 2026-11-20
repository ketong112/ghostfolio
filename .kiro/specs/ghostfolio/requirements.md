# Ghostfolio — Requirements

## Introduction
Ghostfolio is a haunted crypto portfolio tracker for memecoin traders. It tracks
holdings by token contract address, prices them live from DexScreener, and shows
dead holdings as ghosts in a graveyard. The spooky UI visualizes portfolio health:
ghosts are dead coins, wails are alerts, fog is volatility.

## Glossary
- **Holding:** a token contract address + an amount held + the chain (solana, bsc, ethereum).
- **Canonical pair:** the DexScreener pair with the highest liquidity for a token.
- **Dead:** a holding whose canonical pair is effectively gone (see FR-4).
- **Dying:** a holding that is alive but at risk (see FR-5).
- **Wail:** an alert raised when a holding gets worse (see FR-6).
- **Graveyard:** the view that lists dead holdings as ghosts.

## Requirements

### FR-1: Add a holding
- **WHEN** a user pastes a token contract address and an amount, **THEN** the system
  SHALL fetch the token from DexScreener and add it to the portfolio.
- **WHEN** the address is not a valid contract address for the selected chain, **THEN**
  the system SHALL show "That address does not look like a token on {chain}." and SHALL
  NOT add a holding.
- **WHEN** DexScreener returns no pairs for the address, **THEN** the system SHALL show
  "No trading pair found for this token yet." and SHALL NOT add a holding.
- **WHEN** the same address is added twice, **THEN** the system SHALL merge the amounts
  into one holding instead of creating a duplicate row.

### FR-2: Live pricing
- **WHEN** the portfolio is open, **THEN** the system SHALL refresh prices from
  DexScreener at most once per 60 seconds per token.
- **WHEN** a refresh succeeds, **THEN** the system SHALL show the time of the last
  successful update next to every price ("DexScreener, updated HH:MM:SS").
- **WHEN** a refresh fails, **THEN** the system SHALL keep the last known prices and
  SHALL show "Prices may be stale — last update HH:MM:SS" instead of failing silently.

### FR-3: Portfolio value and profit/loss
- **WHEN** holdings have prices, **THEN** the system SHALL show total portfolio value
  (sum of amount x price) and total 24h change in USD and percent.
- **WHEN** a user enters a buy price (optional per holding), **THEN** the system SHALL
  show profit/loss per holding and in total; **WHEN** no buy price is entered, **THEN**
  the system SHALL show value only, with no profit/loss column.

### FR-4: Dead detection
- **WHEN** a holding's canonical pair has liquidity below $100, **THEN** the system
  SHALL classify the holding as dead.
- **WHEN** a holding's canonical pair has 24h volume below $1 AND 24h price change
  below 0, **THEN** the system SHALL classify the holding as dead.
- **WHEN** a holding's price is down 95% or more from its recorded peak, **THEN** the
  system SHALL classify the holding as dead.
- **WHEN** DexScreener no longer returns any pair for a holding, **THEN** the system
  SHALL classify the holding as dead.
- **WHEN** a holding becomes dead, **THEN** the system SHALL record the date it died
  (the first refresh that classified it dead) and SHALL move it to the graveyard view.

### FR-5: Dying detection
- **WHEN** a holding is not dead AND its canonical pair has liquidity below $1,000,
  **THEN** the system SHALL classify the holding as dying.
- **WHEN** a holding is not dead AND its 24h price change is -20% or worse, **THEN**
  the system SHALL classify the holding as dying.

### FR-6: Wails (alerts)
- **WHEN** a holding transitions alive -> dying, dying -> dead, or drops more than 20%
  in a single refresh tick, **THEN** the system SHALL raise a wail (banner + ghost
  animation + entry in the "Recent wails" list with a timestamp).
- **WHEN** the user enables sound, **THEN** a wail SHALL also play a short sound
  generated with WebAudio (no audio files); **WHEN** sound is off (default), **THEN**
  no sound SHALL play.

### FR-7: Graveyard view
- **WHEN** the user opens the graveyard, **THEN** the system SHALL list every dead
  holding as a ghost with its symbol, the amount held, its last value, and its RIP date.
- **WHEN** the user removes a dead holding, **THEN** the system SHALL delete it from
  the portfolio and the graveyard.
- **WHEN** a dead holding's pair comes back to life (liquidity returns), **THEN** the
  system SHALL move it back to the living portfolio and SHALL show "risen from the dead".

### FR-8: Persistence and privacy
- **WHEN** the user closes the page, **THEN** the system SHALL persist holdings in
  `localStorage` so they are still there on the next visit.
- **WHEN** the user clicks "Bury all" (clear data), **THEN** the system SHALL delete
  all holdings and all wail history from `localStorage`.
- The system SHALL NOT connect a wallet, SHALL NOT ask for a private key, and SHALL
  NOT send holdings to any server.

### FR-9: Spooky presentation (Costume Contest)
- **WHEN** the page loads, **THEN** the system SHALL render a dark graveyard theme
  (dark background, fog, green/purple accents) in which a first-time visitor can tell
  "ghost = dead coin" without reading documentation.
- **WHEN** portfolio volatility rises, **THEN** the fog effect SHALL thicken (CSS
  opacity tied to the portfolio's 24h absolute change).

### NFR-1: Performance
- The initial page load SHALL complete in under 3 seconds on a normal connection
  (static build, no server round-trip before first paint except the DexScreener fetch).

### NFR-2: Accessibility
- All ghost/wail states SHALL also be conveyed in text (not colour alone), so the
  dead/alive distinction is readable without colour vision.
