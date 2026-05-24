# Console I18n And Config Descriptions Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add first-pass Chinese/English localization and complete inline configuration descriptions for the Moon Bridge console.

**Architecture:** Add a lightweight local i18n provider under `webui/src/i18n` with typed translation keys and persisted language selection. Add structured configuration documentation under `webui/src/configDocs` and render those descriptions from shared form helper components instead of scattering explanatory copy across pages.

**Tech Stack:** React 19, TypeScript, Vitest, React Testing Library, existing CSS and Material Web components.

---

### Task 1: Lightweight I18n Foundation

**Files:**
- Create: `webui/src/i18n/locales/en.ts`
- Create: `webui/src/i18n/locales/zh.ts`
- Create: `webui/src/i18n/messages.ts`
- Create: `webui/src/i18n/I18nProvider.tsx`
- Create: `webui/src/i18n/I18nProvider.test.tsx`
- Modify: `webui/src/main.tsx`

- [x] Add tests for default language detection, language switching, persistence fallback, and interpolation.
- [x] Implement locale dictionaries with typed message keys.
- [x] Wrap the console app in `I18nProvider`.
- [x] Run `npm --prefix webui test -- I18nProvider`.

### Task 2: Localize Console UI Text

**Files:**
- Modify: `webui/src/app/App.tsx`
- Modify: `webui/src/components/*.tsx`
- Modify: `webui/src/features/**/*.tsx`
- Modify: tests under `webui/src/**/*.test.tsx` and `webui/src/e2e/console.test.tsx`

- [x] Replace app shell navigation, actions, loading, empty states, page headers, buttons, table headers, form labels, and feedback text with `t(...)`.
- [x] Add a language switch control in the top app bar.
- [x] Keep protocol names, config keys, route aliases, provider keys, and model names untranslated.
- [x] Run targeted page tests and fix accessible-name expectations.
- [x] Run full frontend tests.

### Task 3: Structured Config Descriptions

**Files:**
- Create: `webui/src/configDocs/configDescriptions.ts`
- Create: `webui/src/configDocs/configDescriptions.test.ts`
- Modify: `webui/src/features/shared.tsx`
- Modify: `webui/src/features/config/ConfigPage.tsx`
- Modify: `webui/src/features/config/ConfigGenerator.tsx`
- Modify: `webui/src/features/models/ModelsPage.tsx`
- Modify: `webui/src/features/providers/ProvidersPage.tsx`
- Modify: `webui/src/features/routes/RoutesPage.tsx`
- Modify: `webui/src/features/extensions/ExtensionsPage.tsx`

- [x] Extract descriptions from `docs/CONFIGURATION.md`, `docs/GETTING-STARTED.md`, `docs/extensions-overview.md`, and `docs/api.md`.
- [x] Define config doc entries with path, title key, description key, type, default, sensitive, and apply semantics.
- [x] Render helper text below form controls through reusable `ConfigHint` and `FieldWithHint` helpers.
- [x] Cover core sections: server, persistence, cache, defaults, models, providers, offers, routes, web search, extensions, proxy/capture modes.
- [x] Add tests that important config paths have both English and Chinese descriptions.

### Task 4: Build, Embed, Visual Check, Commit

**Files:**
- Modify: `internal/service/webui/dist/**`

- [x] Run `npm --prefix webui run e2e`.
- [x] Run `npm --prefix webui test`.
- [x] Run `npm --prefix webui run build`.
- [x] Run `make webui-build`.
- [x] Run `go test ./...`.
- [x] Refresh `/console/overview` and `/console/config` in browser.
- [x] Capture desktop screenshot.
- [x] Commit optimization work.
