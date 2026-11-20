# How Kiro Was Used — Ghostfolio (Kiroween 2026, Costume Contest)

Ghostfolio was built **spec-first with the Kiro CLI** (`kiro-cli` v3.5.0, headless on a
Linux VM). No IDE was used. Everything below is visible in the repo's `/.kiro`
directory, which is committed at the root.

## Tools used

| Kiro tool | How it was used |
|---|---|
| **Kiro CLI** (headless, `--v3`, `--no-interactive`) | The only Kiro interface used for the build. Every implementation step was driven by a headless CLI run with `--trust-all-tools`, pinned to the V3 harness. |
| **Specs** (`.kiro/specs/ghostfolio/`) | `requirements.md` (EARS format), `design.md`, `tasks.md`. The build followed the spec task list in order — scaffold, DexScreener client, dead rules, storage, UI, deploy. No feature was built without a requirement first. |
| **Steering** (`.kiro/steering/`) | `product.md` (what Ghostfolio is and is NOT — no wallet, no trading, no financial advice), `tech.md` (DexScreener, dead-rule thresholds, no-backend constraint), `structure.md` (module boundaries: network only in `dexscreener.js`, storage only in `store.js`, pure rules in `dead.js`). These were always loaded and kept the build consistent. |
| **Agent hooks** (`.kiro/hooks/lint-on-save.json`) | A `PostFileSave` hook runs ESLint on every saved `.js`/`.jsx` file, so style and import errors are caught the moment a file is written. The hook is a `command` action, so it costs no credits. |
| **Kiro Web** | Used once, to create the account and confirm the Builder ID login. Kiro Web is a Pro feature, so the build itself used the CLI only. |

## Spec-driven development, not vibe coding

The requirements were written **before** any code. Every user-visible behaviour traces
to a numbered requirement (FR-1 … FR-9, NFR-1 … NFR-2). The dead-detection rules
(FR-4/FR-5) were written as pure functions first, with unit tests for every boundary
(liquidity $99 vs $100, volume $0.99 vs $1, a 95% drop from peak) — the tests were
green before the UI that displays the results was built. When a test failed during
the build (a boundary expectation in the test, not the code), the test was corrected
against the spec, not the other way round.

## Models and credit strategy

The build used **cheap models for scaffolding and tests** (`qwen3-coder-next`, 0.05x
multiplier) and **stronger models for the tricky parts** (dead-rule edge cases,
DexScreener response parsing). The 4,000 Kiroween credits were requested through the
official Credit Request Form and spent on the build, not on the scaffold — the
scaffold (steering, spec, hook, project skeleton) was written directly so the credits
went to implementation, testing, and polish.

## What Kiro did not do

- **No property-based testing (PBT / "Correctness").** That is an IDE-only feature;
  the CLI cannot do it, so it is not claimed here. The dead rules are instead covered
  by boundary unit tests (Vitest).
- **No MCP servers.** Ghostfolio needs no MCP: its only data source is the DexScreener
  public REST API, called directly from one module.
- **No Kiro Crew.** The project is solo; no crew app was built.

## What the human did

The human (solo builder, Ardiansyah) made every product decision: the category
(Costume Contest), the app idea (Ghostfolio), the target audience (memecoin traders),
the dead-rule thresholds, and the demo video. Kiro implemented, tested, and deployed
against the spec the human approved.
