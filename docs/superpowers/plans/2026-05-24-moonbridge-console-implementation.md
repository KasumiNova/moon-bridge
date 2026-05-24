# Moon Bridge Console Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an embedded `/console/` Web operations console for Moon Bridge with Material Design 3 styling, default primary color `#7AA7A2`, default dark mode, RPC-backed config management, visual config editing, config generation/import/apply, and a lightweight Responses smoke-test panel.

**Architecture:** Add a Vite + React + TypeScript SPA in `webui/`, serve its production build from Go via `go:embed`, and keep the existing `/api/v1` and `/v1/responses` HTTP contracts as the RPC boundary. Frontend state is server-owned via TanStack Query; all mutations create staged changes and converge on the existing `POST /api/v1/changes/apply` flow.

**Tech Stack:** Go 1.25, `net/http`, `go:embed`, Vite, React, TypeScript, Material Web, TanStack Query, TanStack Table, Motion for React, Vitest, Playwright.

---

## Reference Documents

- Spec: `docs/superpowers/specs/2026-05-24-moonbridge-console-design.md`
- Existing API docs: `docs/api.md`
- Existing architecture docs: `docs/architecture.md`
- Go config file types: `internal/config/config_loader.go`
- Go config YAML conversion: `internal/config/convert.go`
- API route registration: `internal/service/api/router.go`
- HTTP server route registration: `internal/service/server/server.go`

## File Structure

Create:

- `internal/service/webui/embed.go` — embedded static file handler for built SPA assets.
- `internal/service/webui/embed_test.go` — static serving and SPA fallback tests.
- `webui/package.json` — frontend scripts and dependencies.
- `webui/vite.config.ts` — Vite config with `/console/` base and dev proxy.
- `webui/tsconfig.json`, `webui/tsconfig.node.json` — TypeScript configs.
- `webui/index.html` — SPA HTML shell.
- `webui/src/main.tsx` — React bootstrap.
- `webui/src/app/App.tsx` — app shell and route layout.
- `webui/src/app/routes.tsx` — client route definitions.
- `webui/src/app/queryClient.ts` — TanStack Query client.
- `webui/src/theme/tokens.ts` — Material 3 token values derived from `#7AA7A2`.
- `webui/src/theme/ThemeProvider.tsx` — dark/light mode state, persistence, CSS variable application.
- `webui/src/rpc/http.ts` — fetch wrapper, auth handling, error normalization.
- `webui/src/rpc/types.ts` — API DTOs aligned with existing Go responses.
- `webui/src/rpc/management.ts` — `/api/v1` typed client.
- `webui/src/rpc/responses.ts` — `/v1/responses` smoke-test client.
- `webui/src/rpc/configGenerator.ts` — visual generator state to YAML string.
- `webui/src/features/overview/OverviewPage.tsx`
- `webui/src/features/models/ModelsPage.tsx`
- `webui/src/features/providers/ProvidersPage.tsx`
- `webui/src/features/routes/RoutesPage.tsx`
- `webui/src/features/extensions/ExtensionsPage.tsx`
- `webui/src/features/changes/ChangesPage.tsx`
- `webui/src/features/config/ConfigPage.tsx`
- `webui/src/features/config/ConfigGenerator.tsx`
- `webui/src/features/rpcTest/RpcTestPage.tsx`
- `webui/src/components/AppShell.tsx`
- `webui/src/components/AuthGate.tsx`
- `webui/src/components/ChangeQueueDrawer.tsx`
- `webui/src/components/ErrorState.tsx`
- `webui/src/components/LoadingState.tsx`
- `webui/src/components/ResourceTable.tsx`
- `webui/src/test/server.ts` — MSW or fetch-mock fixtures for component tests.
- `webui/src/**/*.test.ts(x)` — Vitest tests beside modules.
- `webui/e2e/console.spec.ts` — Playwright smoke tests.

Modify:

- `internal/service/server/server.go` — register `/console/` handler.
- `internal/service/server/server_test.go` or new focused tests — assert API routes remain unaffected.
- `Makefile` — add `webui-install`, `webui-test`, `webui-build`, and include frontend build in an explicit target.
- `.gitignore` — ignore `webui/dist`, `webui/node_modules`, and Playwright artifacts if not already covered.
- `package.json` at repo root — either leave Cloudflare worker scripts untouched or add workspace scripts only if they do not break existing `wrangler` flow.
- `docs/DEVELOPMENT.md` — document frontend development commands.
- `docs/api.md` — document `/console/` and console-related setup notes.

Do not modify:

- Existing protocol adapters unless a test proves the console exposed a real backend bug.
- Existing config storage semantics. Frontend writes must use existing staged-change APIs.

---

## Task 1: Serve Embedded Console Assets From Go

**Files:**

- Create: `internal/service/webui/embed.go`
- Create: `internal/service/webui/embed_test.go`
- Modify: `internal/service/server/server.go`
- Test: `internal/service/webui/embed_test.go`

- [ ] **Step 1: Write failing tests for SPA static serving**

Create `internal/service/webui/embed_test.go`:

```go
package webui_test

import (
	"io/fs"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"

	"moonbridge/internal/service/webui"
)

func TestHandlerServesIndexAtConsoleRoot(t *testing.T) {
	files := fstest.MapFS{
		"dist/index.html": {Data: []byte(`<div id="root"></div>`)},
		"dist/assets/app.js": {Data: []byte(`console.log("ok")`)},
	}
	sub, err := fs.Sub(files, "dist")
	if err != nil {
		t.Fatal(err)
	}
	handler := webui.NewHandler(sub)

	req := httptest.NewRequest(http.MethodGet, "/console/", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), `id="root"`) {
		t.Fatalf("body = %s", rec.Body.String())
	}
}

func TestHandlerFallsBackToIndexForClientRoute(t *testing.T) {
	files := fstest.MapFS{
		"dist/index.html": {Data: []byte(`<div id="root"></div>`)},
	}
	sub, err := fs.Sub(files, "dist")
	if err != nil {
		t.Fatal(err)
	}
	handler := webui.NewHandler(sub)

	req := httptest.NewRequest(http.MethodGet, "/console/routes/moonbridge", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), `id="root"`) {
		t.Fatalf("body = %s", rec.Body.String())
	}
}

func TestHandlerServesAssets(t *testing.T) {
	files := fstest.MapFS{
		"dist/index.html": {Data: []byte(`<div id="root"></div>`)},
		"dist/assets/app.js": {Data: []byte(`console.log("ok")`)},
	}
	sub, err := fs.Sub(files, "dist")
	if err != nil {
		t.Fatal(err)
	}
	handler := webui.NewHandler(sub)

	req := httptest.NewRequest(http.MethodGet, "/console/assets/app.js", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	if strings.TrimSpace(rec.Body.String()) != `console.log("ok")` {
		t.Fatalf("body = %s", rec.Body.String())
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/webui
```

Expected: FAIL because `internal/service/webui` does not exist.

- [ ] **Step 3: Implement embedded handler**

Create `internal/service/webui/embed.go`:

```go
package webui

import (
	"embed"
	"io/fs"
	"net/http"
	"path"
	"strings"
)

//go:embed dist
var embeddedDist embed.FS

// Embedded returns the production console handler backed by embedded dist files.
func Embedded() http.Handler {
	sub, err := fs.Sub(embeddedDist, "dist")
	if err != nil {
		return http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			http.Error(w, "console assets unavailable", http.StatusInternalServerError)
		})
	}
	return NewHandler(sub)
}

func NewHandler(files fs.FS) http.Handler {
	fileServer := http.FileServer(http.FS(files))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		clean := strings.TrimPrefix(path.Clean("/"+strings.TrimPrefix(r.URL.Path, "/console/")), "/")
		if clean == "." || clean == "" {
			serveIndex(w, r, files)
			return
		}
		if _, err := fs.Stat(files, clean); err == nil {
			r2 := r.Clone(r.Context())
			r2.URL.Path = "/" + clean
			fileServer.ServeHTTP(w, r2)
			return
		}
		serveIndex(w, r, files)
	})
}

func serveIndex(w http.ResponseWriter, r *http.Request, files fs.FS) {
	data, err := fs.ReadFile(files, "index.html")
	if err != nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(data)
}
```

- [ ] **Step 4: Add temporary placeholder dist for Go tests**

Create `internal/service/webui/dist/index.html`:

```html
<div id="root"></div>
```

This file is only a development placeholder so `go:embed dist` compiles before the real Vite build exists. Later tasks replace production assets via `webui/dist` sync or an embed path decision.

- [ ] **Step 5: Register `/console/` in server**

Modify `internal/service/server/server.go` imports:

```go
import "moonbridge/internal/service/webui"
```

In `New`, after core API routes and before plugin routes:

```go
s.mux.Handle("/console/", webui.Embedded())
```

- [ ] **Step 6: Run tests**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/webui ./internal/service/server
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add internal/service/webui internal/service/server/server.go
git commit -m "feat: serve embedded console assets"
```

---

## Task 2: Scaffold Vite React App With Theme Shell

**Files:**

- Create: `webui/package.json`
- Create: `webui/vite.config.ts`
- Create: `webui/tsconfig.json`
- Create: `webui/tsconfig.node.json`
- Create: `webui/index.html`
- Create: `webui/src/main.tsx`
- Create: `webui/src/app/App.tsx`
- Create: `webui/src/app/routes.tsx`
- Create: `webui/src/app/queryClient.ts`
- Create: `webui/src/theme/tokens.ts`
- Create: `webui/src/theme/ThemeProvider.tsx`
- Modify: `.gitignore`
- Test: `webui/src/theme/ThemeProvider.test.tsx`

- [ ] **Step 1: Create frontend package metadata**

Create `webui/package.json`:

```json
{
  "name": "moonbridge-console",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  },
  "dependencies": {
    "@material/web": "^2.4.0",
    "@tanstack/react-query": "^5.90.0",
    "@tanstack/react-table": "^8.21.0",
    "motion": "^12.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.56.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^24.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "^5.9.0",
    "vite": "^7.0.0",
    "vitest": "^4.0.0",
    "yaml": "^2.8.0"
  }
}
```

Before installing, verify current package versions with `pnpm view` if network is available. If the repo's lockfile forces different versions, prefer the lockfile-compatible version.

- [ ] **Step 2: Add Vite config**

Create `webui/vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/console/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:38440',
      '/v1': 'http://127.0.0.1:38440',
      '/models': 'http://127.0.0.1:38440',
      '/responses': 'http://127.0.0.1:38440'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
});
```

- [ ] **Step 3: Add TypeScript config and HTML**

Create standard strict TS configs. `webui/index.html` should include:

```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

- [ ] **Step 4: Write failing theme test**

Create `webui/src/theme/ThemeProvider.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider, useThemeMode } from './ThemeProvider';

function Probe() {
  const { mode } = useThemeMode();
  return <span>mode:{mode}</span>;
}

describe('ThemeProvider', () => {
  it('defaults to dark mode', () => {
    localStorage.clear();
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByText('mode:dark')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run:

```bash
pnpm --dir webui test -- ThemeProvider.test.tsx
```

Expected: FAIL because provider is not implemented.

- [ ] **Step 6: Implement theme provider**

`ThemeProvider` requirements:

- Default mode is `dark`.
- Persist mode to `localStorage` key `moonbridge.console.theme`.
- Expose `mode`, `setMode`, and `toggleMode`.
- Apply `data-theme="dark|light"` to `document.documentElement`.
- Apply CSS variables from `tokens.ts`.
- Include primary seed `#7AA7A2`.
- Respect `prefers-reduced-motion` in CSS, not in JS state.

- [ ] **Step 7: Implement app shell placeholder**

`App.tsx` should render:

- Top app bar.
- Navigation rail.
- Theme toggle.
- Placeholder route outlet.
- Default dark surfaces using CSS variables.

- [ ] **Step 8: Run frontend tests and build**

Run:

```bash
pnpm --dir webui test
pnpm --dir webui build
```

Expected: PASS and `webui/dist` produced.

- [ ] **Step 9: Commit**

```bash
git add webui .gitignore
git commit -m "feat: scaffold console web app"
```

---

## Task 3: Build Typed RPC Client and Auth Gate

**Files:**

- Create: `webui/src/rpc/http.ts`
- Create: `webui/src/rpc/types.ts`
- Create: `webui/src/rpc/management.ts`
- Create: `webui/src/components/AuthGate.tsx`
- Create: `webui/src/components/ErrorState.tsx`
- Create: `webui/src/components/LoadingState.tsx`
- Test: `webui/src/rpc/http.test.ts`
- Test: `webui/src/rpc/management.test.ts`

- [ ] **Step 1: Write failing error normalization tests**

Create `webui/src/rpc/http.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { apiFetch, ApiError } from './http';

describe('apiFetch', () => {
  it('normalizes management API errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify({ error: { code: 'store_unavailable', message: '配置存储不可用' } }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )));

    await expect(apiFetch('/api/v1/status')).rejects.toMatchObject({
      code: 'store_unavailable',
      message: '配置存储不可用',
      status: 503
    } satisfies Partial<ApiError>);
  });
});
```

- [ ] **Step 2: Implement `http.ts`**

Requirements:

- Read bearer token from session storage key `moonbridge.console.token`, fallback local storage only when user opted in.
- Add `Authorization: Bearer <token>` when token exists.
- Parse JSON response.
- Normalize errors from `{ error: { code, message } }`.
- Normalize OpenAI-style `{ error: { type, code, message } }`.
- Throw `ApiError` with `status`, `code`, `message`, and raw body.

- [ ] **Step 3: Define DTOs**

In `types.ts`, define types for:

- `Paginated<T>`
- `StatusResponse`
- `ProviderSummary`, `ProviderDetail`, `Offer`
- `ModelSummary`, `ModelDetail`
- `RouteSummary`, `RouteDetail`
- `ChangeRow`
- `StatsSummary`
- `SessionInfo`
- `DefaultsSettings`
- `WebSearchSettings`

Match field names from `internal/service/api/*.go`.

- [ ] **Step 4: Implement management client**

In `management.ts`, export functions:

- `getStatus`
- `listProviders`, `getProvider`, `putProvider`, `patchProvider`, `deleteProvider`, `testProvider`
- `listModels`, `getModel`, `putModel`, `deleteModel`
- `listRoutes`, `getRoute`, `putRoute`, `deleteRoute`
- `getChanges`, `applyChanges`, `discardChanges`
- `getEffectiveConfig`, `validateConfig`, `importConfig`, `exportConfig`
- `getDefaults`, `putDefaults`
- `getWebSearch`, `putWebSearch`
- `listExtensions`, `getExtension`, `putExtension`
- `getStatsSummary`, `getSessions`

- [ ] **Step 5: Implement AuthGate**

`AuthGate` should:

- Render children normally until a query reports 401.
- Show token entry form on 401.
- Store token in session storage by default.
- Provide explicit remember checkbox for local storage.
- Retry queries after saving token.

- [ ] **Step 6: Run tests**

Run:

```bash
pnpm --dir webui test
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add webui/src/rpc webui/src/components
git commit -m "feat: add console rpc client and auth gate"
```

---

## Task 4: Implement Overview and Read-Only Resource Pages

**Files:**

- Create: `webui/src/features/overview/OverviewPage.tsx`
- Create: `webui/src/features/models/ModelsPage.tsx`
- Create: `webui/src/features/providers/ProvidersPage.tsx`
- Create: `webui/src/features/routes/RoutesPage.tsx`
- Create: `webui/src/components/ResourceTable.tsx`
- Modify: `webui/src/app/routes.tsx`
- Test: feature tests beside each page

- [ ] **Step 1: Write failing overview test**

Test expected cards:

- mode
- provider count
- route count
- pending changes
- store unavailable state on 503 `store_unavailable`

- [ ] **Step 2: Implement reusable query keys**

Create `webui/src/rpc/queryKeys.ts` with stable keys:

```ts
export const queryKeys = {
  status: ['status'] as const,
  providers: (page: { limit: number; offset: number }) => ['providers', page] as const,
  models: (page: { limit: number; offset: number }) => ['models', page] as const,
  routes: (page: { limit: number; offset: number }) => ['routes', page] as const,
  changes: ['changes'] as const,
  statsSummary: ['stats', 'summary'] as const,
  sessions: ['sessions'] as const
};
```

- [ ] **Step 3: Implement OverviewPage**

Use TanStack Query for:

- `getStatus`
- `getStatsSummary`
- `getSessions`
- `getChanges`

Use Motion for card entrance and change-count updates.

- [ ] **Step 4: Implement read-only tables**

Use `ResourceTable` for:

- Models list.
- Providers list.
- Routes list.

Providers table should label protocol and show test action only for `anthropic`.

- [ ] **Step 5: Wire routes**

Routes:

- `/console/`
- `/console/models`
- `/console/providers`
- `/console/routes`

- [ ] **Step 6: Run tests and build**

Run:

```bash
pnpm --dir webui test
pnpm --dir webui build
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add webui/src
git commit -m "feat: add console overview and resource tables"
```

---

## Task 5: Add Visual CRUD Forms and Change Queue

**Files:**

- Create: `webui/src/components/ChangeQueueDrawer.tsx`
- Create: `webui/src/features/changes/ChangesPage.tsx`
- Modify: `webui/src/features/models/ModelsPage.tsx`
- Modify: `webui/src/features/providers/ProvidersPage.tsx`
- Modify: `webui/src/features/routes/RoutesPage.tsx`
- Modify: `webui/src/app/App.tsx`
- Test: form and change queue tests

- [ ] **Step 1: Write failing change queue test**

Expected behavior:

- Lists pending changes from `GET /api/v1/changes`.
- Apply calls `POST /api/v1/changes/apply`.
- Discard calls `POST /api/v1/changes/discard`.
- After apply/discard, invalidates config-derived queries.

- [ ] **Step 2: Implement ChangeQueueDrawer**

Requirements:

- Visible from app shell with pending count badge.
- Shows resource, action, target, before/after summary.
- Apply and discard buttons.
- Motion entry/exit animation.
- Snackbar feedback.

- [ ] **Step 3: Add visual model form**

Model fields:

- slug
- display name
- description
- context window
- max output tokens

Submit:

- `PUT /api/v1/models/{slug}`
- Show "staged, not active" message.

- [ ] **Step 4: Add visual provider form**

Provider fields:

- key
- base_url
- api_key
- version
- protocol
- user_agent

Submit:

- new provider: `PUT /api/v1/providers/{key}`
- edit provider: `PATCH /api/v1/providers/{key}`
- preserve `"******"` for masked secrets.

- [ ] **Step 5: Add offer editor inside provider detail**

Offer fields:

- model
- upstream_name
- priority
- input_price
- output_price
- cache_write
- cache_read

Use `POST/PATCH/DELETE /api/v1/providers/{key}/offers`.

- [ ] **Step 6: Add route form**

Route fields:

- alias
- model
- provider
- display_name
- context_window

Use `PUT /api/v1/routes/{alias}`.

- [ ] **Step 7: Run tests and build**

Run:

```bash
pnpm --dir webui test
pnpm --dir webui build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add webui/src
git commit -m "feat: add visual config editing and change queue"
```

---

## Task 6: Add Config Generator, YAML Preview, Import, Apply, and Export

**Files:**

- Create: `webui/src/rpc/configGenerator.ts`
- Create: `webui/src/rpc/configGenerator.test.ts`
- Create: `webui/src/features/config/ConfigPage.tsx`
- Create: `webui/src/features/config/ConfigGenerator.tsx`
- Modify: `webui/src/app/routes.tsx`
- Test: config feature tests

- [ ] **Step 1: Write failing config generator tests**

Create tests for:

- Transform mode with one provider, one model, one offer, one route, SQLite persistence.
- CaptureResponse mode with proxy response base URL/API key/model.
- CaptureAnthropic mode with proxy anthropic base URL/API key/version/model.

Each test should:

1. Generate YAML.
2. Assert key YAML sections exist.
3. Send generated YAML to a mocked `validateConfig` call in component tests.

- [ ] **Step 2: Implement generator state types**

Define:

- `GeneratedConfigDraft`
- `GeneratedProvider`
- `GeneratedModel`
- `GeneratedOffer`
- `GeneratedRoute`
- `GeneratedExtension`

Keep names close to `internal/config/config_loader.go` YAML fields.

- [ ] **Step 3: Implement YAML generation**

Use the `yaml` npm package.

Output rules:

- Omit empty optional fields.
- Include `mode`, `server`, `persistence`, `defaults`, `cache`, `models`, `providers`, `routes`, and `proxy` as appropriate.
- Default persistence active provider to `db_sqlite`.
- Default cache to the same practical defaults from `config.example.yml`.
- Preserve user-entered secrets in generated YAML preview until validation/import.

- [ ] **Step 4: Implement ConfigGenerator UI**

Wizard sections:

- Mode
- Server and auth
- Persistence
- Providers
- Models
- Offers
- Routes
- Cache and web search
- Extensions
- Preview and validate

Use visual controls, not raw YAML as the primary input.

- [ ] **Step 5: Implement YAML apply flow**

In `ConfigPage`:

- Preview generated YAML.
- Validate with `POST /api/v1/config/validate`.
- Import with `POST /api/v1/config/import`.
- Show generated pending changes.
- Link to change queue.
- Apply via existing `applyChanges`.

- [ ] **Step 6: Implement raw YAML import/export**

Raw import:

- Textarea for YAML.
- Validate.
- Import to staged changes.

Export:

- Masked export by default.
- Secret export requires explicit checkbox and sends `X-Confirm-Secrets: true`.

- [ ] **Step 7: Run tests and build**

Run:

```bash
pnpm --dir webui test
pnpm --dir webui build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add webui/src
git commit -m "feat: add config generation and apply flow"
```

---

## Task 7: Add Extensions, Settings, and RPC Smoke Test Pages

**Files:**

- Create: `webui/src/features/extensions/ExtensionsPage.tsx`
- Create: `webui/src/features/rpcTest/RpcTestPage.tsx`
- Create: `webui/src/rpc/responses.ts`
- Modify: `webui/src/app/routes.tsx`
- Test: extensions and RPC tests

- [ ] **Step 1: Implement Extensions page**

Requirements:

- List extensions.
- Show extension detail JSON.
- Safe JSON editor for `PUT /api/v1/extensions/{name}`.
- Make clear that changes are staged.

- [ ] **Step 2: Implement Defaults/Web Search settings**

Either add a Settings page or sections inside Config:

- `GET/PUT /api/v1/defaults`
- `GET/PUT /api/v1/web-search`

- [ ] **Step 3: Implement Responses RPC client**

`responses.ts`:

- `createResponse(request)`
- optional `streamResponse(request, onEvent)`
- Normalize OpenAI-style errors.

- [ ] **Step 4: Implement RPC Test page**

Fields:

- model/route select
- input text
- max output tokens
- temperature
- stream toggle

Output:

- request JSON
- response JSON
- latency
- error object
- event list for stream mode if implemented

- [ ] **Step 5: Run tests and build**

Run:

```bash
pnpm --dir webui test
pnpm --dir webui build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add webui/src
git commit -m "feat: add extensions settings and rpc test"
```

---

## Task 8: Wire Frontend Build Into Go Embed and Developer Commands

**Files:**

- Modify: `Makefile`
- Modify: `internal/service/webui/embed.go`
- Modify: `internal/service/webui/dist/index.html` or replace placeholder strategy
- Modify: `.gitignore`
- Modify: `docs/DEVELOPMENT.md`
- Modify: `docs/api.md`

- [ ] **Step 1: Decide final embed artifact flow**

Use one of these:

- Preferred: copy `webui/dist` into `internal/service/webui/dist` during `make webui-embed`.
- Alternative: embed `../../webui/dist` is not allowed by `go:embed`, so do not use it.

- [ ] **Step 2: Add Makefile targets**

Add:

```make
webui-install:
	pnpm --dir webui install

webui-test:
	pnpm --dir webui test

webui-build:
	pnpm --dir webui build
	rm -rf internal/service/webui/dist
	mkdir -p internal/service/webui/dist
	cp -R webui/dist/. internal/service/webui/dist/

build: webui-build
	CGO_ENABLED=0 go build ./...
```

If changing `build` is too disruptive, add `build-with-webui` and document it. Preserve existing Cloudflare worker `package.json` behavior.

- [ ] **Step 3: Update `.gitignore`**

Ignore:

- `webui/node_modules/`
- `webui/dist/`
- `webui/playwright-report/`
- `webui/test-results/`

Do not ignore `internal/service/webui/dist` if embedded assets are committed.

- [ ] **Step 4: Update docs**

`docs/DEVELOPMENT.md`:

- install dependencies
- run frontend dev server
- run backend
- build embedded console
- test commands

`docs/api.md`:

- mention `/console/`
- explain management API requires persistence/store
- explain generated/imported config must be applied through change queue

- [ ] **Step 5: Run full verification**

Run:

```bash
pnpm --dir webui test
pnpm --dir webui build
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./...
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add Makefile .gitignore docs webui internal/service/webui
git commit -m "build: wire console frontend into moonbridge"
```

---

## Task 9: End-to-End Verification and Polish

**Files:**

- Create: `webui/e2e/console.spec.ts`
- Create: `webui/playwright.config.ts`
- Modify: `webui/src/**/*.tsx` as needed for accessibility and responsive fixes

- [ ] **Step 1: Add Playwright smoke test**

Test:

- Console loads at `/console/`.
- Default dark mode is active.
- Theme toggle switches to light mode.
- Overview cards render from mocked or test backend data.
- Config generator can produce YAML and call validate/import.
- Change queue apply button calls apply endpoint.

- [ ] **Step 2: Run Playwright**

Run:

```bash
pnpm --dir webui e2e
```

Expected: PASS.

- [ ] **Step 3: Manual responsive check**

Run frontend dev server and inspect:

- desktop 1440px
- tablet 900px
- mobile 390px

Check:

- no text overlap
- navigation rail becomes drawer/bottom-friendly layout
- tables scroll instead of breaking layout
- dialogs fit small screens

- [ ] **Step 4: Final full verification**

Run:

```bash
pnpm --dir webui test
pnpm --dir webui build
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./...
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add webui docs internal/service/webui
git commit -m "test: add console e2e coverage"
```

---

## Implementation Notes

- Use existing staged-change APIs. Do not introduce a separate frontend-only config state that bypasses `store.StageChange`.
- Provider test is currently Anthropic-specific. Hide or label it for other protocols.
- `/api/v1/logs` currently returns an empty array. Do not build a prominent logs page until backend log buffering exists.
- Generated config must not become active until validate -> import -> review changes -> apply completes.
- The frontend should distinguish active config from pending config in all screens.
- Keep frontend files focused. If a page exceeds roughly 250-300 lines, split forms, table columns, and hooks into sibling files.
- Avoid a one-hue UI. `#7AA7A2` is the primary seed, but status, warning, error, and neutral surfaces need distinct token colors.
