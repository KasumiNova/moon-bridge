# Moon Bridge Console Config Graph Redesign

Date: 2026-06-07

## Purpose

Refactor the Moon Bridge web console from a snapshot-and-apply configuration UI into a real-time configuration console backed by a typed configuration graph API.

The console must keep the current Material Web / MD3 Expressive visual direction and existing color palette. It must not expose configuration file paths, YAML editing, or apply-queue mechanics as the primary user experience. Users configure Moon Bridge through UI controls, while the backend remains responsible for validation, persistence, and runtime reload.

## Confirmed Product Decisions

- Use a full Typed Config Graph API as the new frontend editing model.
- Keep YAML as an internal persistence format if useful, but never as the primary UI model.
- Use real-time editing model B: edits are saved as in-page drafts and automatically applied to runtime after successful validation and persistence.
- Use failure handling model C:
  - Normal fields keep the user's local value and show field-level errors when rejected.
  - Critical runtime fields roll back to the last known valid value when runtime application fails.
- Merge Providers and Models into one page named `Models & Providers`.
- `Models & Providers` uses a vertical scrolling layout:
  - Providers section above.
  - Models section below.
- Add a `Logs` page whose content matches backend log output.
- Do not add a `Diagnostics` page. Validation, reload, and compatibility status belong in `Overview` or in resource-specific pages.

## Architecture

The backend exposes a typed configuration graph as the only editing surface used by the new console. The graph maps the full configuration supported by `internal/config/config_loader.go` into typed resources and fields.

The primary API shape is:

- `GET /api/v1/config/graph`
  - Returns the complete configuration graph.
  - Includes the current revision, resources, field schemas, validation status, runtime status, and frontend capabilities.
- `PATCH /api/v1/config/graph`
  - Applies a typed patch to one or more resources.
  - Requires `baseRevision` for optimistic concurrency.
  - Validates, persists, reloads runtime when possible, and returns the new graph revision.
- `POST /api/v1/config/resources/{kind}`
  - Creates typed resources such as providers, models, routes, and extensions.
- `DELETE /api/v1/config/resources/{kind}/{id}`
  - Deletes a resource after reference checks pass.
- `POST /api/v1/config/validate`
  - Validates a draft without persistence or runtime reload.

The old settings, staging, import, export, and apply APIs can remain temporarily for compatibility, but the refactored console must not depend on them.

## Config Graph Model

### ConfigGraph

`ConfigGraph` is the root response returned to the frontend.

It contains:

- `revision`: monotonically changing version used for optimistic concurrency.
- `resources`: typed editable resources.
- `validation`: current graph-level validation result.
- `runtime`: current runtime reload and restart-required status.
- `capabilities`: backend-supported UI and API capabilities.

### ConfigResource

Each editable unit is a `ConfigResource`.

Expected resource kinds include:

- `server`
- `defaults`
- `provider`
- `model`
- `route`
- `web_search`
- `cache`
- `persistence`
- `extension`
- `proxy`
- `log`
- `trace`

Each resource includes:

- `kind`
- `id`
- `label`
- `value`
- `schema`
- `status`
- `runtimeImpact`
- `hotReloadable`
- `references`

### FieldSchema

Each field exposes typed metadata for rendering and validation:

- primitive type or structured type
- required state
- default value
- enum values
- secret handling
- validation rules
- UI control hint
- hot-reload support
- runtime impact level
- danger level for destructive or restart-required changes

Core resources can still use hand-built React editors for a better workflow, but those editors must be backed by the same typed graph data and field schemas.

## Save Flow

The backend save chain is:

1. Decode typed patch.
2. Check `baseRevision`.
3. Validate schema.
4. Validate business rules and references.
5. Persist atomically.
6. Reload runtime if the changed resource is hot-reloadable.
7. Return the new revision, updated resource state, and any field-level errors.

The implementation should fail fast. Invalid patches, stale revisions, persistence failures, and reload failures must return explicit errors and logs.

If persistence succeeds but runtime reload fails:

- Critical runtime fields return `runtimeRejected` and the effective runtime config rolls back to the last valid value.
- Normal fields can remain as frontend drafts with field-level errors.
- The response must include the last valid value for fields that require rollback.

For non-hot-reloadable fields, the change can persist, but the resource returns `restartRequired`.

## Persistence

The backend remains the only component that reads or writes the physical config file.

Requirements:

- Users should not need to know about `~/.moon-bridge/config.yml`.
- Config writes must be atomic: write a temporary file, flush, and rename.
- Persistence failures must log explicit errors and return structured API errors.
- If SQLite remains involved, its role must be explicit:
  - Either runtime state/resource store.
  - Or config source of truth.
  - It must not silently compete with YAML as a second source of truth.
- Database parent directories must be created before opening SQLite. If creation fails, startup must log the reason and stop cleanly.

## Runtime Reload

Each resource and field declares whether it is hot-reloadable.

Hot-reloadable changes apply automatically after successful validation and persistence.

Non-hot-reloadable changes are saved but marked `restartRequired`.

Runtime reload failures must return field-level or resource-level status so the frontend can show the failure at the point of edit.

## Frontend Navigation

The refactored console uses these pages:

- `Overview`
- `Models & Providers`
- `Routes`
- `Defaults`
- `Search & Tools`
- `Storage`
- `Security`
- `Logs`

There is no `Diagnostics` page.

## Page Responsibilities

### Overview

Shows:

- runtime health
- config graph health
- recent failed saves
- restart-required state
- latest runtime reload result
- compatibility warnings for legacy APIs, if relevant

### Models & Providers

This page uses a vertical scrolling layout.

The top section is `Providers`:

- provider identity
- base URL
- authentication and secret replacement
- offers
- capability declarations
- enabled state

The lower section is `Models`:

- model identity
- owning provider
- aliases
- default parameters
- enabled state
- route usage indicators

The Models section can filter or group by provider, but provider editing remains above the model section rather than in a side navigation panel.

### Routes

Manages:

- route rules
- match conditions
- target models
- fallback behavior
- priority
- enabled state

Route edits must validate model references before persistence.

### Defaults

Manages:

- default model selection
- request defaults
- trace defaults
- log defaults
- default generation parameters

### Search & Tools

Manages:

- `web_search`
- extensions
- proxy-related tool access
- schema-driven extension configuration

### Storage

Manages:

- cache configuration
- persistence configuration
- database status
- storage-related restart-required or runtime errors

### Security

Manages:

- server authentication
- console/API access behavior
- auth token replacement
- static console loading behavior

The console static assets must remain loadable when server auth is enabled, while API requests continue to require authentication.

### Logs

Shows backend logs with content matching backend log output.

The frontend can provide:

- live follow
- pause
- search
- level filtering
- copy
- download

The default log view must preserve original order and original line text. The frontend must not rewrite log content. Access control should protect the logs page rather than relying on frontend redaction.

Expected APIs:

- `GET /api/v1/logs/recent?limit=...`
- `GET /api/v1/logs/stream`

SSE is preferred unless there is already a project-standard WebSocket pattern.

## Frontend Data Flow

Frontend state is organized around graph revision and resource-level save state.

For each editable field:

1. User edits the value.
2. Field enters `dirty`.
3. A debounce schedules a typed patch.
4. Patch is submitted with `baseRevision`.
5. Field enters `saving`.
6. API returns success, validation error, revision conflict, runtime rejection, or restart-required state.
7. UI updates the resource and field status.

The UI does not show a global Apply button or pending changes queue.

Resource-level status labels:

- `Saved`
- `Saving`
- `Needs attention`
- `Restart required`

Field-level errors appear beside the field that caused them.

Secret fields are write-only from the UI perspective. Existing secret values should not be returned in clear text. The UI can show whether a secret is configured and allow replacement.

## Compatibility

The old APIs can remain while migration is in progress:

- settings import/export
- staging
- apply pending changes
- existing resource endpoints

The new console must not call YAML import/export or staging/apply as its normal save path.

If an advanced import/export feature remains, it should be in a maintenance-only path and must not be necessary for normal configuration.

## Testing Strategy

Tests must validate behavior through code execution, not source contains checks. JVM-style reflection constraints do not apply to this Go/TypeScript project, but the same principle applies: test public or package-visible behavior directly instead of inspecting implementation text.

Backend tests:

- `GET /api/v1/config/graph` returns full supported config coverage.
- `PATCH /api/v1/config/graph` rejects stale revisions.
- field schema validation returns field-level errors.
- business validation catches broken provider/model/route references.
- runtime reload success returns a new revision and effective resource status.
- runtime reload failure rolls back critical fields.
- normal rejected fields can remain as frontend drafts with structured errors.
- non-hot-reloadable changes return `restartRequired`.
- SQLite parent directories are created before opening the database.
- logs recent and stream APIs return backend log lines in order.

Frontend tests:

- real-time save state transitions: dirty, saving, saved, error.
- normal field rejection keeps local input and marks the field.
- critical runtime field rejection rolls back to the last valid value.
- revision conflict reloads or prompts without losing clear error state.
- `Models & Providers` renders Providers above Models in a vertical scroll layout.
- `Logs` supports recent logs, live follow, pause, search, and copy.
- no primary UI path exposes YAML editing, config file paths, or Apply queue controls.

Smoke tests:

- build and run `mb`.
- open `/console/`.
- create or edit a provider.
- create or edit a model under that provider.
- create or edit a route that references the model.
- edit defaults.
- confirm persisted config is valid.
- confirm runtime behavior uses the updated config.
- confirm backend logs appear in the `Logs` page with matching line content.
- confirm console static assets load when server auth is enabled and API requests remain protected.

## Migration Plan

1. Add read-only `ConfigGraph` coverage for all configuration sections supported by `config_loader.go`.
2. Add resource and field schema metadata.
3. Add typed patch validation and revision conflict handling.
4. Add atomic persistence.
5. Add runtime reload and restart-required reporting.
6. Add logs recent and stream APIs.
7. Refactor frontend data access to graph revision plus autosave.
8. Rebuild pages around the new navigation.
9. Remove YAML import/export/apply from the primary UI.
10. Keep legacy APIs temporarily for compatibility.
11. Fix console static asset loading under auth.
12. Fix SQLite parent-directory creation.

## Acceptance Criteria

- Every configuration section supported by `config_loader.go` is represented in the typed graph.
- Every supported field is editable through purpose-built UI or schema-driven controls.
- Users do not need to know the config file path or edit YAML.
- There is no global Apply queue in the primary UI.
- Edits save automatically and expose clear saved, saving, error, and restart-required states.
- Critical runtime failures roll back to the last valid value.
- Normal field failures keep user input and show field-level errors.
- `Models & Providers` is one page with Providers above Models in a vertical scroll layout.
- `Logs` shows backend log content in original order and original text.
- There is no `Diagnostics` page.
- Console static assets load when auth is enabled, while API endpoints remain authenticated.
- SQLite database parent directories are created or startup fails with a clear log.
- Tests exercise behavior directly and do not rely on source-text checks.
