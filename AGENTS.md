# Repository Guidelines

## Project Structure & Module Organization

- Core TypeScript logic lives in `scripts/`; `core.ts` defines kana metadata and key positions, `generate-random.ts` builds and prints candidate layouts, `roman-table.ts` exports helpers for Google IME romanization tables, `stroke.ts` maps kana to keystroke sequences, and `utils.ts` holds small helpers.
- Generated or reference data belongs in `implementation/` (e.g., `romantable.tsv`). Keep design notes in `design.md`, activity context in `activity-log.md`, and visual artifacts under `images/`.
- Add new tooling or experiments alongside existing scripts unless they become large enough to justify a new folder (document the purpose in a short README if so).

## Build, Test, and Development Commands

- Run the layout sampler: `bun scripts/generate-random.ts` (or `npx ts-node scripts/generate-random.ts` if you prefer Node). It prints unordered/ordered layouts for quick inspection.
- Format on demand: `npx prettier --write scripts/*.ts` (respects `.prettierrc`).
- No formal build step exists; keep scripts runnable directly so contributors can iterate quickly.

## Coding Style & Naming Conventions

- TypeScript, ES modules, and 2-space indentation. Favor `const`, explicit types for exported APIs, and descriptive variable names (`layout`, `youonKana`, `shiftKeyPositions`).
- Prettier width is 120; avoid manual line wrapping. Keep helper names verb-based when they perform work (`generateRandomLayout`, `orderLayout`).
- When adding data files (e.g., TSV/CSV), prefer UTF-8 without BOM; match existing kana notation.
- When asserting invariants at runtime, prefer explicit guards that throw (or `assert.ok(...)` from Node/Bun, which narrows types) instead of relying solely on non-null assertions.

## Testing Guidelines

- `bun test` is available; add focused unit tests near new logic and keep fixtures deterministic (e.g., reuse the `exampleLayout` style seen in roman-table/stroke tests).
- Favor small, rule-focused cases (e.g., `拗音になるかなの後置シフトにかながあるとエラーになる`). When adding new rules, drive them TDD-style.
- Run tests locally before opening a PR; include steps or outputs in the PR description if non-trivial.

## Commit & Pull Request Guidelines

- Commit messages in history are short, imperative, and often Japanese; follow that style (e.g., `ローマ字テーブルの濁点対応を追加`).
- For PRs: describe the intent, list behavior changes, and attach screenshots for layout diagrams if relevant. Link issues or TODOs when applicable.
- Keep diffs minimal and documented. Note any generated artifacts (`implementation/romantable.tsv`, images) and how to reproduce them.
