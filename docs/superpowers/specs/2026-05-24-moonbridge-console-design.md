# Moon Bridge Console Frontend Integration Design

Date: 2026-05-24
Status: Approved direction, pending implementation plan

## Summary

Moon Bridge is a Go HTTP proxy and protocol conversion server. It exposes OpenAI-compatible endpoints such as `/v1/responses` and `/v1/models`, and, when persistence is enabled, a management API under `/api/v1/`.

This design adds an embedded Web frontend at `/console/`. The frontend is an operations console, not a chat product or marketing page. Its primary job is to make Moon Bridge's runtime configuration visible and editable: status, providers, models, offers, routes, extensions, pending changes, import/export, and a small RPC smoke-test panel.

Confirmed product direction:

- Product focus: operations console first.
- Integration form: embedded SPA served by the Go binary.
- Frontend stack: Vite + React + TypeScript, Material Design 3 visual language, TanStack Query for RPC state, Motion for React for UI motion.
- Theme: primary color `#7AA7A2`, support dark and light mode switching, default to dark mode.

## Current Project Architecture

The existing codebase is backend-first and already has most API boundaries needed by a console:

- Entry points: `cmd/moonbridge/main.go` loads config, initializes logging, handles CLI flags, and starts `app.RunServer`.
- Application lifecycle: `internal/service/app/app.go` builds provider managers, protocol adapters, extension registry, persistence, runtime snapshots, stats, trace, session management, and HTTP server wiring.
- HTTP server: `internal/service/server/server.go` registers `/v1/responses`, `/responses`, `/v1/models`, `/models`, plugin routes, and `/api/v1/` when runtime and store are available.
- Management API: `internal/service/api/router.go` registers providers, offers, models, routes, settings, config import/export/validate, pending changes, status, sessions, stats, logs, and version endpoints.
- Runtime model: `internal/service/runtime/runtime.go` exposes atomic config snapshots and reloads them after validation.
- Persistence: `internal/service/store` and DB extensions support staged changes and `ApplyPendingChanges`.
- Protocol conversion: `internal/format` plus `internal/protocol/{openai,anthropic,google,chat}` map OpenAI Responses to upstream provider protocols.
- Extensions: `internal/extension` includes DeepSeek V4 adaptation, visual delegation, web search, metrics, DB providers, Codex catalog support, and tool proxy logic.

The console should respect this shape: it should consume existing API boundaries instead of adding a parallel configuration mechanism.

## Primary User Workflows

1. View current runtime state.
   - Read mode, address, version, provider count, route count, active sessions, stats summary, and provider statuses.
   - Show a clear setup state when the management API is absent or returns `store_unavailable` because persistence/store is not active.

2. Understand and edit the configuration graph.
   - Models define metadata and capability hints.
   - Providers define upstream base URL, protocol, auth, user agent, web search, and offers.
   - Offers link providers to model slugs with pricing and upstream names.
   - Routes expose aliases that map to provider/model pairs.
   - The UI should make these relationships visible, not just expose isolated forms.

3. Stage, review, apply, or discard changes.
   - All mutations call existing API endpoints that create pending changes.
   - A persistent change queue shows resource, target, action, before/after summary, and creation time.
   - Apply calls `POST /api/v1/changes/apply`; discard calls `POST /api/v1/changes/discard`.
   - After apply/discard, invalidate status, providers, models, routes, defaults, web search, extensions, and changes queries.

4. Import/export configuration.
   - Import YAML through `POST /api/v1/config/import`, then review generated staged changes.
   - Validate YAML through `POST /api/v1/config/validate`.
   - Export masked or secret-including YAML through `GET /api/v1/config/export`, with the required `X-Confirm-Secrets: true` confirmation for secret export.

5. Run a lightweight RPC smoke test.
   - Select a route/model and send a minimal `POST /v1/responses` request.
   - Support non-streaming first.
   - Add streaming SSE inspection after the basic console is stable.
   - This panel is for route verification and debugging, not a full chat UI.

## Frontend Information Architecture

The first version should use a dense operational layout:

- Top app bar: product name, connection target, runtime mode, auth/session indicator.
- Navigation rail:
  - Overview
  - Models
  - Providers
  - Routes
  - Extensions
  - Changes
  - Config
  - RPC Test
- Global change queue indicator: visible in the app bar and as a right-side drawer on edit pages.
- Snackbar/toast area: mutation accepted, apply succeeded, validation failed, auth failed, store unavailable.

### Overview

Shows:

- Status from `GET /api/v1/status`.
- Provider health summary from `GET /api/v1/status/providers`.
- Usage summary from `GET /api/v1/stats/summary`.
- Recent sessions from `GET /api/v1/sessions`.
- Pending changes from `GET /api/v1/changes`.
- Setup warning when `/api/v1/*` returns 404, 503, or `store_unavailable`.

### Models

Shows paginated model table from `GET /api/v1/models`.

Key controls:

- Create/update model metadata through `PUT /api/v1/models/{slug}`.
- Delete model through `DELETE /api/v1/models/{slug}`.
- Link to provider offers for the selected model.

### Providers

Shows paginated provider list from `GET /api/v1/providers`.

Key controls:

- View provider detail from `GET /api/v1/providers/{key}`.
- Create/update provider through `PUT/PATCH /api/v1/providers/{key}`.
- Delete provider through `DELETE /api/v1/providers/{key}`.
- Test provider through `POST /api/v1/providers/{key}/test` only when the provider is Anthropic-compatible. The current backend probe constructs an Anthropic Messages request and should not be presented as protocol-neutral.
- Manage offers under `POST/PATCH/DELETE /api/v1/providers/{key}/offers`.

### Routes

Shows routes from `GET /api/v1/routes`.

Key controls:

- Create/update alias through `PUT /api/v1/routes/{alias}`.
- Delete alias through `DELETE /api/v1/routes/{alias}`.
- Show route graph: alias -> model -> provider -> upstream base URL/protocol.

### Extensions

Shows extension names from `GET /api/v1/extensions` and details from `GET /api/v1/extensions/{name}`.

First version should provide safe JSON editing for extension config through `PUT /api/v1/extensions/{name}`. Typed forms can be added later when extension config specs are exposed through an API.

### Changes

Shows pending rows from `GET /api/v1/changes`.

Controls:

- Apply all pending changes.
- Discard all pending changes.
- Show normalized before/after diff for JSON payloads.
- Warn when route/provider/model deletions may affect visible aliases.

### Config

Controls:

- Effective masked config from `GET /api/v1/config/effective`.
- YAML import and validation.
- YAML export, with explicit confirmation for secret export.

### RPC Test

Controls:

- Select route/model from `/v1/models` or management route data.
- Send a short `POST /v1/responses`.
- Show request JSON, response JSON, latency, error object, and selected model/provider.
- Stream mode is optional for v1. If included, show SSE events in an append-only event list.

## Technical Architecture

### Repository Layout

Add:

```text
webui/
  package.json
  vite.config.ts
  tsconfig.json
  index.html
  src/
    app/
    components/
    features/
    rpc/
    theme/
    test/
internal/service/webui/
  embed.go
```

The Go server should serve the built SPA under `/console/`. In development, the Vite dev server can proxy API calls to Moon Bridge.

### Go Integration

Use `go:embed` for production assets:

- Embed `webui/dist`.
- Register `/console/` to serve static assets.
- Return `index.html` for unknown `/console/*` paths so client-side routing works.
- Keep `/api/v1/`, `/v1/responses`, and `/v1/models` unchanged.
- Prefer adding a small `internal/service/webui` package so `server.go` stays focused on HTTP API registration.

Required backend additions:

- Serve `/console/` static assets.
- Optionally add `GET /api/v1/capabilities` or include capability flags in `GET /api/v1/status`, so the UI can show whether persistence, metrics, logs, and RPC test are available.
- Implement a real recent log buffer before making `/api/v1/logs` prominent; the current handler returns an empty list.
- Consider broadening `POST /api/v1/providers/{key}/test` beyond Anthropic-only probing before presenting it as protocol-neutral. Until then, hide or label it for non-Anthropic protocols.

### Frontend Stack

Use:

- Vite + React + TypeScript for the SPA.
- Material Web components and Material 3 design tokens for core controls and visual language. Material Web is Google's Material Web Components library and follows Material Design guidelines; its docs also describe Material 3 tokens as CSS custom properties.
- TanStack Query for server-state fetching, caching, mutations, invalidation, and async state. Its docs describe it as async/server-state and data-fetching utilities for TS/JS applications.
- Motion for React for layout transitions, enter/exit animations, drawer/dialog animation, list reordering, and pending-change feedback.
- TanStack Table for dense resource tables unless Material Web table coverage is enough during implementation.
- React Router or TanStack Router for client-side routing. Choose the one that minimizes setup after dependency installation.

Rationale:

- Material Web gives the closest Material Design 3 base.
- MUI is mature and production-ready, but its own docs currently state Material UI adopts Material Design 2, so it should be a fallback for complex admin widgets rather than the default visual foundation.
- TanStack Query fits this app because nearly all state is remote runtime/config state.
- Motion fits the animation requirement while staying React-native and TypeScript-friendly.

References:

- Material Web intro: https://material-web.dev/about/intro/
- MUI Material UI overview and MD2 note: https://mui.com/material-ui/
- TanStack Query overview: https://tanstack.com/query/latest
- Motion for React docs: https://motion.dev/docs/react

## RPC Client Design

Create a typed API client in `webui/src/rpc/`.

Recommended modules:

- `http.ts`: base URL resolution, auth header injection, JSON parsing, error normalization.
- `management.ts`: `/api/v1` endpoints.
- `responses.ts`: `/v1/responses` smoke-test client, including optional SSE reader.
- `types.ts`: DTOs for status, providers, models, offers, routes, changes, settings, stats, sessions, and OpenAI error shape.

Error handling:

- Normalize `{ error: { code, message } }` from management endpoints.
- Normalize OpenAI-style errors from `/v1/responses`.
- Show auth failures as a global blocking state.
- Show store unavailable as a setup state explaining that persistence must be enabled for the console.

Auth handling:

- If `auth_token` is configured, the same Bearer token protects all server routes.
- The UI cannot discover the token. It should show a token entry screen when a protected API call returns 401.
- Store the token in session storage by default, with an explicit "remember on this device" option for local storage.

## Visual and Interaction Design

Material 3 direction:

- Use `#7AA7A2` as the default primary seed color.
- Default to dark mode on first load.
- Support explicit dark/light mode switching from the app shell.
- Persist the user's selected mode locally, and fall back to default dark mode when no preference is stored.
- Generate separate light and dark Material 3 token sets from the same primary seed color so surfaces, outlines, and state layers remain coherent in both modes.
- Use navigation rail on desktop and modal navigation drawer on narrow screens.
- Use surface levels, tonal buttons, outlined text fields, chips, dialogs, switches, segmented buttons, and snackbars.
- Keep cards to repeated resources and panels; avoid nested cards.
- Use compact dashboard typography, not landing-page hero typography.
- Use clear status colors: healthy, unknown, pending, error, disabled.

Motion:

- Page transitions: subtle fade/slide, 120-180ms.
- Change queue: animate item entry/exit and apply/discard collapse.
- Dialogs and drawers: use spring only where it helps, otherwise short easing.
- Resource tables: animate row insertion/removal only, not every hover.
- Respect `prefers-reduced-motion`.

## Data Consistency Rules

- Treat runtime configuration as server-owned.
- All write operations produce staged changes. The UI must not pretend a staged change is active.
- After any staged mutation, invalidate only `changes` plus the affected resource detail if needed.
- After apply/discard, invalidate all config-derived queries.
- For forms editing masked secrets, preserve `"******"` semantics where existing APIs support it.
- Never display plaintext secrets after masked reads.

## Testing Strategy

Frontend:

- Unit test RPC client error normalization and query key builders.
- Component test forms for provider, model, route, offers, and change queue.
- E2E smoke tests with a mock Moon Bridge server:
  - overview loads
  - provider edit stages a change
  - apply refreshes status/resources
  - auth prompt appears on 401
  - store unavailable state appears on 503

Backend:

- Add tests for `/console/` serving:
  - index served at `/console/`
  - assets served with correct content type
  - nested routes fallback to index
  - existing API routes unaffected
- Add tests for any new capability/status endpoint fields.

Manual verification:

- `go test ./...`
- `pnpm --dir webui test`
- `pnpm --dir webui build`
- Start Moon Bridge with `config.example.yml` style SQLite persistence and open `/console/`.

## Open Questions

- Should the console be enabled by default, or behind a config flag such as `server.console_enabled`?
- Should `/console/` be served in Capture modes, where the management API may not be meaningful?
- Should the first implementation include streaming SSE inspection, or defer it after CRUD/config flows?
- Should extension config specs be exposed over API to support generated typed forms?

## Non-Goals for v1

- Full chat application.
- Multi-user RBAC.
- Remote workspace/project management.
- Real-time websocket dashboard.
- Editing raw SQLite/D1 state directly.
- Replacing existing CLI config generation commands.

## Recommended Implementation Slices

1. Add embedded static serving and a minimal Vite React app at `/console/`.
2. Add typed RPC client and overview/status page.
3. Add provider/model/route read-only pages.
4. Add staged mutations and change queue apply/discard.
5. Add config import/export and validation.
6. Add RPC smoke-test panel.
7. Add animation polish and responsive navigation.
