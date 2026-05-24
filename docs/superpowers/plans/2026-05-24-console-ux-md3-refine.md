# Console UX And MD3 Refinement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove user-facing staged-change mechanics from the Moon Bridge console, make configuration editing feel direct, and tighten the UI into a more consistent Material Design 3 experience with motion.

**Architecture:** Keep the backend management API unchanged and treat staged changes as an internal commit mechanism. The frontend owns a local editable config draft, computes pending edits from dirty fields, and exposes one top-level Apply action that opens a preview dialog before submitting mutations and applying them. Layout and controls move toward shared MD3-style wrappers instead of scattered native controls.

**Tech Stack:** React 19, TypeScript, TanStack Query, Material Web components, motion/react, Vitest, React Testing Library.

---

### Task 1: Navigation And Global Apply Entry

**Files:**
- Modify: `webui/src/app/App.tsx`
- Modify: `webui/src/app/routes.tsx`
- Modify: `webui/src/i18n/locales/en.ts`
- Modify: `webui/src/i18n/locales/zh.ts`
- Test: existing app/e2e tests

- [ ] Write failing tests that the navigation does not include Changes and the top bar exposes Apply.
- [ ] Remove the Changes nav item and route from normal navigation.
- [ ] Replace the top-bar Changes button with Apply.
- [ ] Keep language and theme controls.

### Task 2: Apply Preview As The Only Visible Commit Flow

**Files:**
- Create: `webui/src/app/ApplyChangesDialog.tsx`
- Create: `webui/src/app/ApplyChangesDialog.test.tsx`
- Modify: `webui/src/app/App.tsx`
- Modify: `webui/src/components/ChangeQueueDrawer.tsx`
- Modify: `webui/src/i18n/locales/en.ts`
- Modify: `webui/src/i18n/locales/zh.ts`

- [ ] Write failing tests for opening Apply preview, listing changed resources, applying, and discarding without using staged wording.
- [ ] Reuse `getChanges`, `applyChanges`, and `discardChanges` internally.
- [ ] Present an MD3 dialog/sheet with preview list and Apply/Discard/Close actions.
- [ ] Remove side drawer styling and user-facing staged/change-queue copy.

### Task 3: Direct Config Editing UX

**Files:**
- Modify: `webui/src/features/config/ConfigPage.tsx`
- Modify: `webui/src/features/config/ConfigPage.test.tsx`
- Modify: `webui/src/features/config/ConfigGenerator.tsx`
- Modify: `webui/src/i18n/locales/en.ts`
- Modify: `webui/src/i18n/locales/zh.ts`

- [ ] Write failing tests that editing defaults/web-search calls no mutation until Apply.
- [ ] Rename buttons and feedback away from Stage.
- [ ] Replace per-section stage buttons with local dirty state and save-to-preview actions that submit internal mutations only through Apply.
- [ ] Hide visual generator unless debug query/local dev flag is present.
- [ ] Keep raw YAML import/export available as advanced tools but not first visual priority.

### Task 4: MD3 Form Layout And Motion

**Files:**
- Modify: `webui/src/app/App.tsx`
- Modify: `webui/src/features/shared.tsx`
- Modify: feature pages using buttons and forms

- [ ] Introduce shared MD3-ish button/field styles using Material Web components where practical.
- [ ] Convert config form controls to stable label + supporting text rows with predictable grid sizing.
- [ ] Add motion transitions to config sections and apply preview.
- [ ] Verify no text overlap at desktop and mobile widths.

### Task 5: Verify, Build, Preview, Commit

**Files:**
- Modify: `internal/service/webui/dist/**`

- [ ] Run `npm --prefix webui test`.
- [ ] Run `npm --prefix webui run e2e`.
- [ ] Run `make webui-build`.
- [ ] Run `go test ./...`.
- [ ] Browser-check `/console/config` in dark/light and Chinese/English.
- [ ] Commit the refinement.
