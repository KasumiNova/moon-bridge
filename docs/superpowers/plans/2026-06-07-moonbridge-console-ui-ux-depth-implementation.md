# Moon Bridge Console UI/UX Depth Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the config graph console from functional realtime forms into a polished MD3-style operational UI with better resource editing, field feedback, logs inspection, responsive behavior, and subtle motion.

**Architecture:** Keep the existing config graph API, page routing, and data hooks. Add focused frontend components for resource editor cards and log toolbar/rows, strengthen schema field presentation, and centralize the needed CSS in the existing app shell styles so the current palette and Material Web integration remain intact.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, TanStack Query, Material Web, motion/react, existing Moon Bridge CSS token variables.

---

## Reference Documents

- Base redesign: `docs/superpowers/specs/2026-06-07-moonbridge-console-config-graph-design.md`
- UI/UX depth design: `docs/superpowers/specs/2026-06-07-moonbridge-console-ui-ux-depth-design.md`
- Current shell styles: `webui/src/app/App.tsx`
- Config graph fields: `webui/src/features/configGraph/SchemaField.tsx`, `webui/src/features/configGraph/GraphResourceField.tsx`, `webui/src/features/configGraph/FieldStatus.tsx`
- Models and providers page: `webui/src/features/modelProviders/ModelsProvidersPage.tsx`
- Logs page: `webui/src/features/logs/LogsPage.tsx`
- Test fixtures: `webui/src/test/configGraphFixtures.ts`

## Implementation Notes

- Do not add a new UI framework.
- Do not expose YAML, config file paths, Apply, Changes, or Diagnostics.
- Preserve the current color palette and Material Web / MD3 Expressive direction.
- Keep Providers above Provider Offers above Models in one vertical scroll.
- Keep tests behavior-oriented. Do not use source text contains checks.
- `webui/dist/` must stay ignored and untracked. Only `internal/service/webui/dist/` may be committed after `make webui-build`.

## File Structure

Create:

- `webui/src/features/configGraph/ResourceEditorCard.tsx` — shared card for editable config graph resources.
- `webui/src/features/configGraph/ResourceEditorCard.test.tsx` — card structure and labels.

Modify:

- `webui/src/features/modelProviders/ModelsProvidersPage.tsx` — use shared card and section count headers.
- `webui/src/features/modelProviders/ModelsProvidersPage.test.tsx` — assert section order, counts, and status labels.
- `webui/src/features/searchTools/SearchToolsPage.tsx` — use shared card for extensions/proxy/web search resources.
- `webui/src/features/storage/StoragePage.tsx` — use shared card for cache/persistence.
- `webui/src/features/security/SecurityPage.tsx` — use shared card for server security.
- `webui/src/features/configGraph/SchemaField.tsx` — improve field markup, JSON error surface, secret helper text, and object field layout class.
- `webui/src/features/configGraph/SchemaField.test.tsx` — assert JSON parse error and secret replacement hint.
- `webui/src/features/configGraph/FieldStatus.tsx` — icon-ready status chip markup.
- `webui/src/features/logs/LogsPage.tsx` — add level filter, count metadata, row rendering, non-blocking stream status, copy/download visible raw lines.
- `webui/src/features/logs/LogsPage.test.tsx` — assert level filtering, visible count, and visible-only copy/download.
- `webui/src/app/App.tsx` — CSS upgrades for shell, nav, cards, fields, log rows, responsive states, and reduced motion.
- `webui/src/i18n/locales/en.ts`, `webui/src/i18n/locales/zh.ts` — add any user-facing labels introduced by UI controls.
- `webui/src/e2e/console.test.tsx` — extend smoke coverage for level filter and improved resource card surface.
- `internal/service/webui/dist/*` — rebuild after frontend implementation.

---

## Task 1: Add Resource Editor Card Component

**Files:**

- Create: `webui/src/features/configGraph/ResourceEditorCard.tsx`
- Create: `webui/src/features/configGraph/ResourceEditorCard.test.tsx`
- Modify: `webui/src/features/modelProviders/ModelsProvidersPage.tsx`
- Modify: `webui/src/features/modelProviders/ModelsProvidersPage.test.tsx`

- [ ] **Step 1: Write failing card tests**

Create tests that render a provider resource and assert:

- resource ID appears in a card header;
- status pill text appears;
- critical/restart metadata appears for non-hot-reloadable resources;
- fields render through accessible labels.

Run:

```bash
npm --prefix webui test -- ResourceEditorCard
```

Expected: FAIL because the component does not exist.

- [ ] **Step 2: Implement `ResourceEditorCard`**

Implement a focused card component that accepts `resource`, `revision`, and optional `title`.

Use:

- `<section className="resource-editor-card">`;
- header with `.resource-editor-card__meta`, `.resource-editor-card__status`, and `.status-pill`;
- `.form-grid` for normal fields;
- `.form-grid__wide` class for object/array/textarea fields through `SchemaField`.

- [ ] **Step 3: Migrate Models & Providers**

Replace local `ResourceEditor` with `ResourceEditorCard`. Add section headers with counts:

- `Providers ({count})`
- `Provider Offers ({count})`
- `Models ({count})`

- [ ] **Step 4: Verify tests**

Run:

```bash
npm --prefix webui test -- ResourceEditorCard ModelsProvidersPage
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add webui/src/features/configGraph/ResourceEditorCard.tsx webui/src/features/configGraph/ResourceEditorCard.test.tsx webui/src/features/modelProviders/ModelsProvidersPage.tsx webui/src/features/modelProviders/ModelsProvidersPage.test.tsx
git commit -m "feat: polish config graph resource cards"
```

## Task 2: Upgrade Schema Field Presentation

**Files:**

- Modify: `webui/src/features/configGraph/SchemaField.tsx`
- Modify: `webui/src/features/configGraph/SchemaField.test.tsx`
- Modify: `webui/src/features/configGraph/FieldStatus.tsx`
- Modify: `webui/src/app/App.tsx`

- [ ] **Step 1: Write failing field behavior tests**

Add tests for:

- object field invalid JSON displays an inline error and `aria-invalid`;
- secret field shows replacement guidance without exposing the secret value;
- textarea/object fields get a wide layout marker.

Run:

```bash
npm --prefix webui test -- SchemaField
```

Expected: FAIL for the new assertions.

- [ ] **Step 2: Implement field markup**

Update `SchemaField` to:

- place label, optional required marker, and status in a stable header row;
- render parse errors in a `role="alert"` inline message;
- set `aria-describedby` for errors;
- add `schema-field--wide` for object, array, and textarea controls;
- add a secret replacement hint.

- [ ] **Step 3: Improve status chip markup**

Update `FieldStatus` to include a small state dot and use `data-status`. Keep existing accessible `role`.

- [ ] **Step 4: Add CSS**

Update `App.tsx` styles for:

- `.schema-field__topline`;
- `.schema-field__control`;
- `.schema-field--wide`;
- `.field-status` state colors;
- invalid control state;
- reduced-motion media query.

- [ ] **Step 5: Verify tests**

Run:

```bash
npm --prefix webui test -- SchemaField FieldStatus
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add webui/src/features/configGraph/SchemaField.tsx webui/src/features/configGraph/SchemaField.test.tsx webui/src/features/configGraph/FieldStatus.tsx webui/src/app/App.tsx
git commit -m "feat: refine realtime field controls"
```

## Task 3: Upgrade Logs Page Interaction

**Files:**

- Modify: `webui/src/features/logs/LogsPage.tsx`
- Modify: `webui/src/features/logs/LogsPage.test.tsx`
- Modify: `webui/src/app/App.tsx`
- Modify: `webui/src/i18n/locales/en.ts`
- Modify: `webui/src/i18n/locales/zh.ts`

- [ ] **Step 1: Write failing logs tests**

Add tests for:

- level filter hides non-matching levels;
- visible count updates after search/filter;
- copy writes only currently visible raw lines;
- download blob uses only currently visible raw lines;
- stream failure shows a non-blocking status.

Run:

```bash
npm --prefix webui test -- LogsPage
```

Expected: FAIL for the new assertions.

- [ ] **Step 2: Implement log filters and rows**

Update `LogsPage`:

- add level filter buttons/select;
- render logs as `.log-row` entries instead of one monolithic pre;
- preserve raw line in each row;
- show visible count;
- show stream status when SSE fails;
- keep copy/download visible-only.

- [ ] **Step 3: Add CSS**

Update `App.tsx` styles:

- `.logs-toolbar`;
- `.log-level-filter`;
- `.log-output`;
- `.log-row`;
- `.log-row--error`, `--warn`, `--info`, `--debug`;
- responsive wrapping.

- [ ] **Step 4: Verify tests**

Run:

```bash
npm --prefix webui test -- LogsPage
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add webui/src/features/logs/LogsPage.tsx webui/src/features/logs/LogsPage.test.tsx webui/src/app/App.tsx webui/src/i18n/locales/en.ts webui/src/i18n/locales/zh.ts
git commit -m "feat: improve logs inspection ux"
```

## Task 4: Apply Resource Cards Across Config Pages

**Files:**

- Modify: `webui/src/features/searchTools/SearchToolsPage.tsx`
- Modify: `webui/src/features/storage/StoragePage.tsx`
- Modify: `webui/src/features/security/SecurityPage.tsx`
- Modify: existing page tests for those files

- [ ] **Step 1: Write failing page tests**

Assert Search & Tools, Storage, and Security pages render resource card headers and status labels.

Run:

```bash
npm --prefix webui test -- SearchToolsPage StoragePage SecurityPage
```

Expected: FAIL until pages use the shared card component.

- [ ] **Step 2: Replace local resource editor markup**

Use `ResourceEditorCard` in all three pages. Keep page-specific banners/errors.

- [ ] **Step 3: Verify tests**

Run:

```bash
npm --prefix webui test -- SearchToolsPage StoragePage SecurityPage
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add webui/src/features/searchTools/SearchToolsPage.tsx webui/src/features/searchTools/SearchToolsPage.test.tsx webui/src/features/storage/StoragePage.tsx webui/src/features/storage/StoragePage.test.tsx webui/src/features/security/SecurityPage.tsx webui/src/features/security/SecurityPage.test.tsx
git commit -m "feat: unify config resource editing surfaces"
```

## Task 5: Shell, Motion, and Responsive Polish

**Files:**

- Modify: `webui/src/app/App.tsx`
- Modify: `webui/src/app/App.test.tsx`
- Modify: `webui/src/e2e/console.test.tsx`

- [ ] **Step 1: Write failing shell tests**

Add assertions:

- nav still omits Config/YAML/Apply/Changes/Diagnostics;
- content surface keeps route content landmark;
- mobile-safe nav labels remain present.

Run:

```bash
npm --prefix webui test -- App
```

Expected: FAIL only for newly required structure if absent.

- [ ] **Step 2: Polish shell CSS**

Refine:

- active nav indicator;
- top app bar density;
- page stack spacing;
- card hover/focus;
- reduced motion behavior;
- mobile horizontal nav.

- [ ] **Step 3: Update e2e smoke**

Extend `console.test.tsx` to cover:

- improved logs filter;
- resource card presence on Models & Providers;
- primary UI still has no Apply/YAML entry.

- [ ] **Step 4: Verify targeted tests**

Run:

```bash
npm --prefix webui test -- App
npm --prefix webui run e2e
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add webui/src/app/App.tsx webui/src/app/App.test.tsx webui/src/e2e/console.test.tsx
git commit -m "feat: refine console shell ux"
```

## Task 6: Rebuild Embedded WebUI and Full Verification

**Files:**

- Modify: `internal/service/webui/dist/index.html`
- Modify/create/delete: `internal/service/webui/dist/assets/*`

- [ ] **Step 1: Run full frontend verification**

Run:

```bash
npm --prefix webui test
npm --prefix webui run e2e
npm --prefix webui run build
```

Expected: PASS. `webui/dist/` may be generated locally but must remain ignored.

- [ ] **Step 2: Rebuild embedded assets**

Run:

```bash
make webui-build
```

Expected: PASS and `internal/service/webui/dist/` updates to the current hash.

- [ ] **Step 3: Run Go verification**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/webui ./internal/service/server ./internal/service/api
```

Expected: PASS.

- [ ] **Step 4: Check ignored output**

Run:

```bash
git status --short --ignored
git check-ignore -v webui/dist webui/dist/index.html
git diff --check
```

Expected:

- `webui/dist/` appears only as ignored output;
- no whitespace errors;
- no `webui/node_modules` symlink is left behind.

- [ ] **Step 5: Commit embedded assets**

```bash
git add internal/service/webui/dist
git commit -m "build: refresh embedded console ui"
```

If no embedded asset changes remain after prior commits, skip this commit.

## Final Acceptance

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./...
npm --prefix webui test
npm --prefix webui run e2e
npm --prefix webui run build
git status --short --ignored
git check-ignore -v webui/dist webui/dist/index.html
```

Completion requires:

- all commands pass;
- `webui/dist/` remains ignored and untracked;
- the resource card and logs tests prove the UI/UX changes;
- no primary UI path exposes YAML, config paths, Apply, Changes, or Diagnostics.
