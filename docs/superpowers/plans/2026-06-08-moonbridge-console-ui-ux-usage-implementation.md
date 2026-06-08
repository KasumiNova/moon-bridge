# Moonbridge Console UI/UX Usage Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development if subagents are available. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Moon Bridge console into a dense MD3-style usage-first UI with model usage charts, embedded logs, realtime resource creation/editing, field help tips, polished controls, and Chrome MCP visual acceptance.

**Architecture:** Add a stable backend usage stats DTO, then make the web UI consume it through focused RPC/view-model code. Replace visible native form controls in configuration surfaces with Material Web/custom MD3 controls, keep autosave behavior intact, and validate layout through tests plus Chrome MCP screenshots across desktop and mobile.

**Tech Stack:** Go management API, React 19, Vite, Vitest, Material Web, motion/react, optional lightweight chart rendering through React/SVG for graphs with MD3 styling.

## Final Execution Record

Recorded on 2026-06-08 after implementation and review.

- Plan artifact: this file.
- UI/UX reference: MD3 style principles from `https://m3.material.io/styles`, applied through existing Moon Bridge color tokens, compact MD3-like controls, state layers, icon buttons, and motion.
- Subagent loop:
  - UI/UX review found mobile Search & Tools field compression. Fixed with mobile grid rules so compact/medium/wide fields use one full-width column.
  - Code/spec review found embedded bundle asset drift risk. Fixed with `TestEmbeddedIndexReferencesExistingAssets`.
  - Final Chrome issue inspection found `label[for]` pointing at `div[role=group]` for option groups. Fixed by using `aria-labelledby` for option groups.
- Final package artifact: `packaging/arch/moon-bridge-0.1.0-2-x86_64.pkg.tar.zst`.
- Final embedded console asset: `internal/service/webui/dist/assets/index-Cz_qH__S.js`.
- `webui/dist/` remains ignored and is not intended for Git; `internal/service/webui/dist/` is the embedded production bundle to add when committing.
- Chrome MCP evidence report: `docs/superpowers/reports/mcp-functional-acceptance.json`.
- Accepted native-control exceptions:
  - Styled native text entry (`input[type=text]`, `input[type=password]`, `textarea`) is retained for IME, selection, password manager, and resize semantics; visual styling is MD3-like rather than browser-default.
  - Native table semantics are retained for model usage data; narrow screens use an explicit scroll container without page-level overflow.
- Final verification commands run during execution:
  - `cd webui && npm test -- --run`
  - `CGO_ENABLED=0 go test ./...`
  - `cd webui && npm run build`
  - `go test ./internal/service/webui ./internal/service/server -count=1`
  - `makepkg -Cf`
  - package smoke: extracted `/usr/bin/mb`, served `/console/`, fetched `assets/index-Cz_qH__S.js`, and verified Chrome MCP saw no console issues on the final package.

---

## Reference Principles

- Use Material Design 3 styles as the visual reference: color roles, type scale, motion, shape, state layers, and high-contrast readable surfaces. Official reference: `https://m3.material.io/styles`.
- Keep the existing Moon Bridge color tokens and MD3 Expressive feel.
- Keep UI density high: compact panels, predictable grid tracks, no decorative nested cards, no oversized empty sections.
- Treat Overview as the primary model-usage analytics workspace, not as a runtime status board.
- Runtime state, validation state, and similar operational badges must not occupy the top Overview hierarchy unless they are part of a focused error/empty state.
- Every configuration field must be understandable from the UI without exposing config-file paths or requiring source-code knowledge.
- No visible native browser controls in the final UI unless a specific control is intentionally justified in code review. Prefer Material Web custom elements or styled app-native controls.
- Fail fast: API and parsing errors must surface through tests/UI/logging; do not silently catch and ignore.

## Current Execution Notes

- The repository root does not contain a checked-in `AGENTS.md`; follow the AGENTS instructions supplied in the conversation for this workspace.
- Initial baseline before this plan's first implementation edits:
  - `go test ./internal/service/api ./internal/service/stats` passed.
  - `cd webui && npm test` passed with 26 files and 96 tests.
- Task 2 has already started in this worktree:
  - The Go red test for `/stats/usage` first failed with 404.
  - The endpoint, route, DTO conversion, TypeScript DTO, and `getUsageStats()` RPC were then added.
  - Focused Go/API and web RPC tests passed after implementation.
- Task 3 has already started in this worktree:
  - `webui/src/features/overview/OverviewPage.test.tsx` was rewritten as a red test for the usage dashboard and embedded logs.
  - `webui/src/features/logs/LogPanel.tsx` was introduced to extract reusable log behavior.
  - The current implementation must be judged against this in-progress Task 3 state, not as a clean baseline.

## Task 1: Plan Review and Baseline Tests

**Files:**
- Modify: this plan document if review finds gaps.
- Read: user-supplied AGENTS instructions, `webui/package.json`, current console feature files.

- [ ] Spawn a UI/UX review subagent for this plan with the MD3 constraints, no implementation.
- [ ] Run baseline tests:
  - `go test ./internal/service/api ./internal/service/stats`
  - `cd webui && npm test`
- [ ] Record baseline failures before implementation. If the worktree already contains red/green changes from this plan, record those as current execution notes rather than treating them as baseline.

## Task 2: Stable Usage Stats API

**Files:**
- Modify: `internal/service/api/status.go`
- Modify: `internal/service/api/router.go`
- Test: `internal/service/api/api_test.go` or a focused stats API test file.
- Modify: `webui/src/rpc/types.ts`
- Modify: `webui/src/rpc/management.ts`
- Test: `webui/src/rpc/management.test.ts`

- [ ] Write failing Go test for `GET /api/v1/stats/usage` returning totals plus per-model rows with snake_case fields.
- [ ] Implement the endpoint from `stats.SessionStats.Summary()` without exposing Go struct default JSON field names.
- [ ] Include totals: requests, input_tokens, output_tokens, cache_creation, cache_read, cache_hit_rate, cache_write_rate, cache_rw_ratio, total_cost, duration.
- [ ] Include model rows: model, actual_model, requests, input_tokens, output_tokens, cache_creation, cache_read, cache_hit_rate, cost, avg_cost_per_mtoken.
- [ ] Sort model rows by descending cost, then model name ascending for stable charts/tests.
- [ ] For empty or unavailable stats, return `{ totals: zeroes, by_model: [] }`; do not return a string message that forces UI branching.
- [ ] Format duration as Go duration string for now; the UI formats/labels it and never parses it for math.
- [ ] Treat all costs as CNY values because the existing stats service computes RMB/CNY pricing; UI labels must show yuan/CNY.
- [ ] Use numeric values from the API without server-side rounding except normal float computation; UI owns display precision.
- [ ] Write failing web RPC test for `getUsageStats()`.
- [ ] Add TypeScript DTOs and RPC function.

## Task 3: Overview Usage Dashboard and Embedded Logs

**Files:**
- Modify: `webui/src/features/overview/OverviewPage.tsx`
- Modify: `webui/src/features/logs/LogsPage.tsx`
- Modify: `webui/src/app/routes.tsx`
- Modify: `webui/src/app/App.tsx`
- Modify: `webui/src/i18n/locales/en.ts`
- Modify: `webui/src/i18n/locales/zh.ts`
- Test: `webui/src/features/overview/OverviewPage.test.tsx`
- Test: `webui/src/features/logs/LogsPage.test.tsx`
- Test: `webui/src/app/App.test.tsx`

- [ ] Write failing Overview tests proving runtime/validation status cards are gone.
- [ ] Write failing Overview tests proving usage totals, model rows, charts, and bottom logs window render.
- [ ] Overview data layout:
  - top summary row: requests, input tokens, output tokens, cache hit rate, cache read/write ratio, total cost.
  - top summary must not include runtime, validation, config freshness, or generic service-health cards.
  - if runtime/config health must surface because an API call fails, show it as a contextual error banner near the affected content, not as permanent top-level status.
  - chart row: token split chart, cache split chart, cost-by-model chart.
  - model table: model, actual model, requests, input, output, cache write, cache read, cache hit, cost, avg cost/M tokens.
  - model usage must preserve the complete available accounting surface: request count, input/output token split, cache creation/cache read values, cache hit/read-write ratios, total cost, and per-model cost efficiency.
  - cache status should be visually legible at a glance: separate cache creation/write from cache read, show hit rate as a percentage, and show read/write ratio without requiring hover.
  - cost values use the backend-provided CNY/yuan accounting, with consistent precision and compact large-number formatting.
  - if future backend support adds time ranges, the UI may add time filters; until then label the data as all-time/session aggregate rather than faking range controls.
  - model rows sorted by descending cost, then model name; long model names truncate visually but preserve full value in title/aria-label.
  - empty stats show a compact empty state explaining that no requests have been recorded, while keeping chart/table containers stable.
  - usage fetch errors show a focused error panel and do not hide the logs panel.
  - chart marks expose keyboard-focusable summary labels and aria descriptions; hover/focus may show value details but core values remain visible without hover.
  - logs are embedded at the bottom of Overview after analytics content, with height clamped to `min(42vh, 560px)` on desktop and `360px` on mobile/tablet.
- [ ] Extract reusable log panel logic from Logs page into Overview without losing recent logs, stream, search, level filter, follow/pause, copy, download, or clear search.
- [ ] Add a clear-search action to the log search field; tests and Chrome MCP interactions must cover it.
- [ ] Redirect `/logs` to `/overview#logs` and remove Logs from first-level navigation.
- [ ] Build charts as compact MD3-styled React/SVG components: token split, cache split, cost-by-model. If a third-party chart library is introduced, justify it in the final notes and keep styling consistent.

## Task 4: Dense Resource Editor, Field Help, and Advanced Merge

**Files:**
- Modify: `webui/src/features/configGraph/ResourceEditorCard.tsx`
- Modify: `webui/src/features/configGraph/SchemaField.tsx`
- Modify: `webui/src/features/configGraph/GraphResourceField.tsx`
- Modify: `webui/src/configDocs/configDescriptions.ts`
- Modify: `webui/src/app/App.tsx`
- Test: `webui/src/features/configGraph/ResourceEditorCard.test.tsx`
- Test: `webui/src/features/configGraph/SchemaField.test.tsx`
- Test: `webui/src/configDocs/configDescriptions.test.ts`

- [ ] Write failing tests showing every schema field exposes a help button/tip with useful field description.
- [ ] Field help placement:
  - place a compact question-mark icon button immediately after the field name when the label is visible.
  - for compact inline controls where the label and input share one row, the help button may sit at the trailing edge of the input group, but it must remain visually associated with that exact field.
  - the tip must open on hover, keyboard focus, and touch/click; it must close on Escape, blur outside, or second click.
  - tips describe field purpose, accepted values, side effects, restart/runtime implications where known, and examples for non-obvious fields.
  - tips must not display config file paths such as `~/.moon-bridge/config.yml`; the UI should explain behavior, not storage details.
- [ ] Pass `resource.kind`, `resource.id`, and `field.path` from `GraphResourceField` into `SchemaField`; compute documentation keys with a deterministic mapper:
  - defaults/main -> `defaults.<field>`
  - provider/<id> -> `providers.<key>.<field>`
  - provider_offer/provider/model -> `providers.<key>.offers[].<field>`; if no entry exists, use the generated fallback rather than guessing another key.
  - model/<id> -> `models.<slug>.<field>`
  - route/<id> -> `routes.<alias>.<field>`
  - web_search/main, cache/main, persistence/main, server/main, proxy/main map to their top-level docs.
- [ ] Help tip behavior: icon button after the label, keyboard focus opens the tip, hover opens it, touch/click toggles it, Escape closes it, and the trigger uses `aria-describedby` while open.
- [ ] If no config description exists, show a generated fallback containing field label, type, required/secret/runtime impact metadata; coverage tests must make missing primary docs visible.
- [ ] Replace native checkbox/switch rendering with Material Web/custom MD3 switch rendering.
- [ ] Replace visible native text/select/textarea controls in schema fields with MD3 controls or styled custom controls; if any native element remains visible, document the exact reason.
- [ ] Merge Advanced JSON into the normal field flow as compact collapsible object/array editors.
- [ ] Object/array editor rules:
  - collapsed by default unless it currently has a validation/parse error.
  - collapsed row shows field label, summary count/size, saved/error status, and an expand chevron.
  - expanded editor uses a monospace textarea-like MD3 surface, validates JSON on every edit, and only emits autosave when JSON parses successfully.
  - parse errors stay local, show immediately, and do not overwrite the saved value.
  - focus moves to the editor on expand via keyboard; collapse returns focus to the summary button.
  - mobile layout uses full-width editor with stable height and vertical resize only.
- [ ] Apply width heuristics: short identifiers/selects/numbers use compact columns; prompts/descriptions/object JSON default collapsed or larger when expanded; resize is controlled and cannot break layout.
- [ ] Input sizing and field density rules:
  - model names, provider ids, route aliases, protocol choices, priorities, and numeric limits use compact widths with stable min/max constraints.
  - API keys and base URLs use medium-width single-line fields with copy/visibility affordances where appropriate.
  - prompts, rewrite templates, descriptions, tool instructions, and other long text use a larger textarea-like MD3 surface with vertical resize only.
  - long-text fields that are secondary or rarely edited should start collapsed with a summary; expansion must be explicit and animated.
  - no field may stretch only because its page column is wide; use predictable column spans based on expected content.
- [ ] Add protocol color chips and readable labels:
  - OpenAI Chat: green family chip.
  - OpenAI Responses: green family chip with a distinct label/icon treatment from Chat.
  - Anthropic: orange family chip.
  - Gemini: purple family chip.
  - unknown/custom protocols: neutral chip with the raw value visible.
  - protocol menus and selected values must both use the same chip grammar, not only the collapsed value.
- [ ] Add context-window quick chips for 128k, 400k, and 1m while allowing custom numeric input.
- [ ] Context-window controls should parse shorthand labels (`128k`, `400k`, `1m`) into exact numeric values, keep custom values editable, and show validation for invalid or non-positive values.
- [ ] Add small, purposeful motion to configuration interactions:
  - expanding/collapsing advanced editors uses a short height/opacity transition.
  - autosave/saved state uses a subtle state transition rather than layout movement.
  - destructive or high-impact actions use stronger focus/pressed states.
  - animations must be disabled or reduced when the user prefers reduced motion.

## Task 5: Resource Creation, Deletion, and Models & Providers Layout

**Files:**
- Modify: `webui/src/features/configGraph/useConfigGraph.ts`
- Modify: `webui/src/features/modelProviders/ModelsProvidersPage.tsx`
- Modify: `webui/src/features/routes/RoutesPage.tsx`
- Modify: `webui/src/features/searchTools/SearchToolsPage.tsx`
- Modify: `webui/src/app/App.tsx`
- Test: page tests for each changed feature.

- [ ] Write failing tests for Add Provider, Add Model, Add Route, and Add Extension/Search-related resource where supported by graph resources.
- [ ] Write failing tests for Delete Provider, Delete Model, Delete Provider Offer, Delete Route, and Delete Extension where supported by graph resources.
- [ ] Resource creation scope:
  - supported create kinds are `provider`, `model`, `provider_offer`, `route`, and `extension`.
  - singleton resources (`defaults`, `web_search`, `cache`, `persistence`, `server`, `proxy`, `mode`, `trace`, `log`) do not show Add.
  - Add buttons appear only on pages where the kind is displayed.
- [ ] Resource deletion scope:
  - supported delete kinds are `provider`, `model`, `provider_offer`, `route`, and `extension`.
  - singleton resources (`defaults`, `web_search`, `cache`, `persistence`, `server`, `proxy`, `mode`, `trace`, `log`) do not show Delete.
  - Delete actions appear on the same resource cards that support deletion; they must be easy to discover without crowding normal editing.
  - destructive actions require an explicit second confirmation action inside the card, not a browser-native confirmation dialog.
  - deletion calls `deleteConfigResource(kind, id, baseRevision)` and must pass the current graph revision.
  - a successful delete refreshes the graph and removes the card from the realtime editor.
  - a failed delete shows the API error near the destructive action and keeps the resource visible with the confirmation state active.
  - provider offer ids containing `/` must delete through the encoded resource id path and be covered by RPC/page tests.
  - Chrome MCP acceptance must exercise at least one full create-then-delete flow and inspect the `DELETE /api/v1/config/resources/{kind}/{id}` network request.
- [ ] Create dialog default values:
  - Provider requires id, protocol, base_url, api_key; default protocol is OpenAI Responses.
  - Model requires id/display name and context window; default context window is 128k.
  - Provider offer requires provider, model, upstream name, priority, pricing fields; provider is prefilled when launched inside a provider.
  - Route requires alias, model, provider; model/provider options come from current graph.
  - Extension requires id and enabled flag.
- [ ] On duplicate id or revision conflict, show the API error in the dialog and keep entered values; do not close.
- [ ] Create dialog error extraction must unwrap `ApiError.raw.errors[0].message` when present, then fall back to `ApiError.message`; tests must cover duplicate/revision conflict by asserting the dialog remains open, input values remain, and the specific backend error text is visible.
- [ ] Implement a reusable create dialog that calls `createConfigResource(kind, { baseRevision, id, value })`.
- [ ] Refresh graph after create and keep the user on the realtime editor.
- [ ] Keep Models & Providers vertical: Providers first, Models second.
- [ ] Providers and Models use a single vertical scroll flow:
  - Providers section appears first and includes provider-level fields plus offers.
  - Models section appears below Providers, not side-by-side.
  - section headers remain compact and informative; avoid large empty hero-style headers.
  - Add actions should be available near the relevant section header and in empty states, not hidden behind global menus.
- [ ] Show provider offers inside the related provider section rather than as a large isolated top-level list.
- [ ] If a provider offer has no matching provider, show it in a compact "Unmatched offers" section below Providers and above Models.

## Task 6: Shell, Search, Buttons, and Non-Native Control Pass

**Files:**
- Modify: `webui/src/app/App.tsx`
- Modify: shared/page components as needed.
- Test: `webui/src/app/App.test.tsx`, affected page tests.

- [ ] Convert top bar API chips, language control, and theme action to one visual system with consistent height, outline, hover, focus, selected, and motion states.
- [ ] Top menu visual rules:
  - route tabs, API/status chips, language control, theme toggle, and utility actions share one height scale, radius, focus ring, icon size, and state-layer behavior.
  - selected navigation state must be visually stronger than hover state and must be clear in both light and dark themes.
  - top-bar items must not mix filled pills, browser selects, bare text links, and unrelated icon-button shapes in the same row.
  - mobile top navigation may wrap or collapse, but it must keep target sizes usable and avoid horizontal overflow.
- [ ] Restyle search fields as compact MD3 search controls with icon and clear action.
- [ ] Search field polish:
  - use a leading search icon, trailing clear button when populated, compact height, and visible focus state.
  - placeholder text must be specific to the current page.
  - search results/filter counts should appear near the field when they help orientation, without consuming a full row unnecessarily.
- [ ] Replace visible native buttons with Material Web/custom MD3 button treatments where practical.
- [ ] Button and action motion:
  - primary actions use contained or filled-tonal treatment.
  - secondary actions use outlined/text treatment with consistent icons.
  - hover/press/focus states should animate color/state-layer changes without shifting layout.
  - icon-only buttons require accessible names and visible tooltips for unfamiliar actions.
- [ ] During visual optimization, inspect each major page for space efficiency, interaction sequence, animation timing, and whether the layout matches the user's mental workflow before treating screenshots as accepted.
- [ ] Non-native scope covers App shell, AuthGate, Overview/log panel, config resource pages, and any route reachable in the first-level console navigation. RPC Test is not in first-level navigation; if reachable during tests, style it too or document why it is excluded from the production console surface.
- [ ] Accepted native-element exceptions must be explicitly listed in the final report with reason, selector, and visual mitigation. Source grep is not enough: Chrome MCP must inspect DOM/visual output for visible browser-default controls.
- [ ] Run a search for visible native controls (`<input`, `<select`, `<textarea`, plain `<button`) and either remove them from visible UI or document specific accepted exceptions.

## Task 7: Subagent Review Loop

**Files:**
- No direct write scope unless review finds actionable issues.

- [ ] Spawn a UI/UX review subagent after implementation with screenshots or exact paths, asking specifically for density, control polish, information hierarchy, and MD3 consistency issues.
- [ ] Fix Critical/Important UI/UX issues.
- [ ] Spawn a code/spec review subagent for implementation against this plan.
- [ ] Fix Critical/Important code/spec issues.
- [ ] Close all subagents after reading their output.

## Task 8: Full Verification and Chrome MCP Acceptance

**Files:**
- No planned source edits unless verification finds issues.

- [ ] Run:
  - `go test ./internal/service/api ./internal/service/stats`
  - `cd webui && npm test`
  - `cd webui && npm run build`
  - package/build command used for pacman if previous packaging surface is affected.
- [ ] Start a local backend and Vite/preview server.
- [ ] Use Chrome MCP for desktop viewports `1440x900`, `1920x1080` and mobile/tablet viewports `390x844`, `768x1024`.
- [ ] Inspect these pages: Overview, Models & Providers, Routes, Defaults, Search & Tools, Storage, Security.
- [ ] Exercise interactions: usage chart hover/summary, logs follow/pause/search/clear/copy/download, Add dialogs, autosave fields, field tips, advanced editor expand/collapse, protocol select/readability, context-window quick chips, theme toggle, language switch.
- [ ] Check network calls for stats usage, logs, create resource, and patch config graph.
- [ ] Save Chrome MCP screenshots or textual snapshot evidence under `docs/superpowers/reports/` so the visual acceptance is reviewable.
- [ ] Iterate CSS/UX until screenshots show no overlap, no horizontal overflow, no browser-default visible controls, high density, clear hierarchy, and coherent MD3 styling.

## Acceptance Checklist

- [ ] The implementation plan is committed to repo history or present in the worktree for review.
- [ ] Overview is a model usage dashboard with bottom logs, not a status board.
- [ ] Logs are merged into Overview and `/logs` redirects.
- [ ] Usage API is stable, typed, and tested.
- [ ] All relevant pages support resource creation and deletion where the backend graph API supports it.
- [ ] Resource editors are dense, searchable/readable, include help tips, and do not expose config-file details.
- [ ] Advanced JSON is merged into compact collapsible editors.
- [ ] No visible native browser form controls remain without an explicit reason.
- [ ] Chrome MCP visual acceptance passes on all required viewports/pages.
- [ ] Full backend and frontend test/build flow passes.
