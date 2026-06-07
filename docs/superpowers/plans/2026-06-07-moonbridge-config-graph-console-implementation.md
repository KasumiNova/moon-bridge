# Moon Bridge Config Graph Console Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the console's staged snapshot/apply configuration workflow with a typed Config Graph API, realtime autosave UI, backend log view, fixed auth loading, and reliable SQLite parent-directory creation.

**Architecture:** Add a typed graph service beside the existing staged management API, then migrate the React console to graph reads and typed patch mutations. Keep the current `FileConfig` schema as the first implementation scope, preserve the current MD3 visual language and palette, keep legacy APIs temporarily, and make runtime reload failures leave committed graph revision and active runtime unchanged.

**Tech Stack:** Go 1.25, `net/http`, `log/slog`, SQLite via `modernc.org/sqlite`, React 19, TypeScript, Vite, Vitest, TanStack Query, Material Web.

---

## Reference Documents

- Approved spec: `docs/superpowers/specs/2026-06-07-moonbridge-console-config-graph-design.md`
- Config file shape: `internal/config/config_loader.go`
- Runtime config conversion: `internal/config/convert.go`
- Runtime reload: `internal/service/runtime/runtime.go`
- Existing API routing: `internal/service/api/router.go`
- Existing staged settings API: `internal/service/api/settings.go`
- Store interface and SQLite store: `internal/service/store/config_store.go`, `internal/service/store/sqlite_store.go`
- HTTP server and auth gate: `internal/service/server/server.go`
- Logger consume pipeline: `internal/logger/logger.go`, `internal/logger/consumer.go`
- SQLite extension plugin: `internal/extension/db/sqlite/plugin.go`
- Frontend RPC layer: `webui/src/rpc/management.ts`, `webui/src/rpc/types.ts`
- Frontend routes and shell: `webui/src/app/routes.tsx`, `webui/src/app/App.tsx`

## Implementation Notes

- Do not remove legacy staged endpoints until the new graph console has equivalent coverage.
- Do not add persisted config fields outside the current `FileConfig` schema in the first implementation.
- `offer.priority` is supported and remains editable. Route priority and route fallback chains are not in scope.
- The implementation must fail fast: return structured errors, log backend failures, and avoid silent fallback behavior.
- Tests must call Go/TypeScript behavior directly. Do not use source text contains checks.
- Keep commits small. Commit after each task unless the task is explicitly preparatory and creates no code.

## File Structure

Create:

- `internal/service/configgraph/types.go` — graph DTOs, patch DTOs, result enums, field schema types.
- `internal/service/configgraph/schema.go` — `FileConfig` to graph resource/schema mapping.
- `internal/service/configgraph/graph.go` — graph builder from `config.Config` and `config.FileConfig`.
- `internal/service/configgraph/patch.go` — typed patch application to `config.FileConfig`.
- `internal/service/configgraph/service.go` — graph read, validate, patch, create, delete orchestration.
- `internal/service/configgraph/service_test.go` — graph coverage and patch behavior tests.
- `internal/service/configgraph/schema_test.go` — resource/schema coverage tests.
- `internal/service/configgraph/patch_test.go` — patch validation, masking, and reference tests.
- `internal/service/api/config_graph.go` — `/api/v1/config/graph`, resource create/delete, and graph validate handlers.
- `internal/service/api/config_graph_test.go` — HTTP contract tests for graph endpoints.
- `internal/logger/ring.go` — bounded recent log buffer and subscriber fan-out.
- `internal/logger/ring_test.go` — recent log and subscription tests.
- `internal/service/api/logs.go` — `/api/v1/logs/recent` and `/api/v1/logs/stream`.
- `internal/service/api/logs_test.go` — log recent and SSE stream tests.
- `webui/src/rpc/configGraph.ts` — typed client for graph, patch, create, delete, validate.
- `webui/src/rpc/logs.ts` — typed recent logs and SSE stream client helpers.
- `webui/src/features/configGraph/useConfigGraph.ts` — shared graph query and autosave mutation hooks.
- `webui/src/features/configGraph/useAutosaveField.ts` — field-level dirty/saving/saved/error behavior.
- `webui/src/features/configGraph/FieldStatus.tsx` — compact field status indicator.
- `webui/src/features/configGraph/SchemaField.tsx` — schema-driven field editor for non-core fields.
- `webui/src/features/modelProviders/ModelsProvidersPage.tsx` — vertical Providers then Models page.
- `webui/src/features/modelProviders/ModelsProvidersPage.test.tsx`
- `webui/src/features/defaults/DefaultsPage.tsx`
- `webui/src/features/defaults/DefaultsPage.test.tsx`
- `webui/src/features/searchTools/SearchToolsPage.tsx`
- `webui/src/features/searchTools/SearchToolsPage.test.tsx`
- `webui/src/features/storage/StoragePage.tsx`
- `webui/src/features/storage/StoragePage.test.tsx`
- `webui/src/features/security/SecurityPage.tsx`
- `webui/src/features/security/SecurityPage.test.tsx`
- `webui/src/features/logs/LogsPage.tsx`
- `webui/src/features/logs/LogsPage.test.tsx`
- `webui/src/e2e/configGraphConsole.test.tsx`

Modify:

- `internal/service/runtime/runtime.go` — add candidate-build or validate helper so graph service can test a runtime config without replacing active runtime.
- `internal/service/store/config_store.go` — add direct graph save/load operations if the implementation keeps SQLite as config source of truth.
- `internal/service/store/sqlite_store.go` — implement direct atomic graph save or update existing load/seed helpers; avoid staging for new graph patches.
- `internal/service/store/sqlite_store_test.go` — cover direct save/load, unchanged revision behavior, and graph roundtrip.
- `internal/service/api/router.go` — register graph and logs endpoints.
- `internal/service/api/api_test.go` — reuse fixtures for graph endpoint tests.
- `internal/service/server/server.go` — allow `/console/` static assets to load when auth is enabled, while `/api/v1/*` remains authenticated.
- `internal/service/server/server_test.go` — cover console static auth behavior.
- `internal/extension/db/sqlite/plugin.go` — create database parent directory before `sql.Open`.
- `internal/extension/db/sqlite/plugin_test.go` — cover nested parent directory creation and failure.
- `webui/src/rpc/types.ts` — add graph, patch, and log DTOs.
- `webui/src/rpc/queryKeys.ts` — add graph and logs keys.
- `webui/src/app/App.tsx` — remove global Apply button and staged-change UI from the primary shell; update nav items.
- `webui/src/app/routes.tsx` — replace old config/extensions/provider/model routes with the approved navigation.
- `webui/src/i18n/locales/en.ts`, `webui/src/i18n/locales/zh.ts`, `webui/src/i18n/messages.ts` — add labels for new pages and realtime save statuses; remove primary YAML/apply wording from visible UI.
- `webui/src/features/overview/OverviewPage.tsx` — read graph status instead of pending changes.
- `webui/src/features/routes/RoutesPage.tsx` — migrate route editing to graph autosave.
- `webui/src/components/AuthGate.tsx` — keep token handling for API calls after static console loads.
- `webui/src/app/App.test.tsx`, feature tests, and e2e tests — update expected navigation and no-Apply behavior.
- `internal/service/webui/dist/*` — rebuild after frontend implementation.
- `docs/api.md`, `docs/CONFIGURATION.md`, `docs/DEVELOPMENT.md` — document graph API, logs API, and console UX changes.

Do not modify in this plan:

- Protocol adapter behavior.
- Model routing algorithms beyond validation needed for graph patches.
- Root `package.json` Cloudflare worker scripts.

---

## Task 1: Add Config Graph DTOs and Schema Coverage

**Files:**

- Create: `internal/service/configgraph/types.go`
- Create: `internal/service/configgraph/schema.go`
- Create: `internal/service/configgraph/schema_test.go`
- Test: `internal/service/configgraph/schema_test.go`

- [ ] **Step 1: Write failing schema coverage tests**

Create `internal/service/configgraph/schema_test.go`:

```go
package configgraph

import "testing"

func TestSchemaCoversCurrentFileConfigSections(t *testing.T) {
	got := map[string]bool{}
	for _, def := range ResourceDefinitions() {
		got[def.Kind] = true
	}
	for _, kind := range []ResourceKind{
		ResourceMode,
		ResourceTrace,
		ResourceLog,
		ResourceServer,
		ResourceDefaults,
		ResourceModel,
		ResourceProvider,
		ResourceRoute,
		ResourceWebSearch,
		ResourceCache,
		ResourcePersistence,
		ResourceExtension,
		ResourceProxy,
	} {
		if !got[string(kind)] {
			t.Fatalf("missing resource definition %q", kind)
		}
	}
}

func TestSchemaDoesNotAdvertiseOutOfScopeFields(t *testing.T) {
	for _, def := range ResourceDefinitions() {
		for _, field := range def.Fields {
			switch field.Path {
			case "enabled", "fallback", "priority":
				if def.Kind != string(ResourceProviderOffer) || field.Path != "priority" {
					t.Fatalf("out-of-scope field exposed on %s: %s", def.Kind, field.Path)
				}
			}
		}
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/configgraph
```

Expected: FAIL because `internal/service/configgraph` does not exist.

- [ ] **Step 3: Implement graph DTOs**

Create `internal/service/configgraph/types.go` with these public shapes:

```go
package configgraph

type ResourceKind string

const (
	ResourceMode          ResourceKind = "mode"
	ResourceTrace         ResourceKind = "trace"
	ResourceLog           ResourceKind = "log"
	ResourceServer        ResourceKind = "server"
	ResourceDefaults      ResourceKind = "defaults"
	ResourceModel         ResourceKind = "model"
	ResourceProvider      ResourceKind = "provider"
	ResourceProviderOffer ResourceKind = "provider_offer"
	ResourceRoute         ResourceKind = "route"
	ResourceWebSearch     ResourceKind = "web_search"
	ResourceCache         ResourceKind = "cache"
	ResourcePersistence   ResourceKind = "persistence"
	ResourceExtension     ResourceKind = "extension"
	ResourceProxy         ResourceKind = "proxy"
)

type Graph struct {
	Revision     string             `json:"revision"`
	Resources    []Resource         `json:"resources"`
	Validation   ValidationState    `json:"validation"`
	Runtime      RuntimeState       `json:"runtime"`
	Capabilities Capabilities       `json:"capabilities"`
}

type Resource struct {
	Kind          ResourceKind       `json:"kind"`
	ID            string             `json:"id"`
	Label         string             `json:"label"`
	Value         map[string]any     `json:"value"`
	Schema        ResourceSchema     `json:"schema"`
	Status        ResourceStatus     `json:"status"`
	RuntimeImpact RuntimeImpact      `json:"runtimeImpact"`
	HotReloadable bool               `json:"hotReloadable"`
	References    []ResourceRef      `json:"references,omitempty"`
}

type ResourceSchema struct {
	Fields []FieldSchema `json:"fields"`
}

type FieldSchema struct {
	Path          string   `json:"path"`
	Type          string   `json:"type"`
	Label         string   `json:"label"`
	Required      bool     `json:"required,omitempty"`
	Secret        bool     `json:"secret,omitempty"`
	Control       string   `json:"control,omitempty"`
	Enum          []string `json:"enum,omitempty"`
	HotReloadable bool     `json:"hotReloadable"`
	RuntimeImpact string   `json:"runtimeImpact,omitempty"`
}

type ResourceStatus string
type RuntimeImpact string

const (
	StatusSaved           ResourceStatus = "saved"
	StatusNeedsAttention  ResourceStatus = "needsAttention"
	StatusRestartRequired ResourceStatus = "restartRequired"

	ImpactNormal   RuntimeImpact = "normal"
	ImpactCritical RuntimeImpact = "critical"
)

type ResourceRef struct {
	Kind ResourceKind `json:"kind"`
	ID   string       `json:"id"`
}

type ValidationState struct {
	Valid  bool           `json:"valid"`
	Errors []FieldError   `json:"errors,omitempty"`
}

type RuntimeState struct {
	Status  string       `json:"status"`
	Errors  []FieldError `json:"errors,omitempty"`
	Message string       `json:"message,omitempty"`
}

type Capabilities struct {
	Autosave bool `json:"autosave"`
	Logs     bool `json:"logs"`
}

type FieldError struct {
	ResourceKind ResourceKind `json:"resourceKind"`
	ResourceID   string       `json:"resourceId"`
	Field        string       `json:"field,omitempty"`
	Code         string       `json:"code"`
	Message      string       `json:"message"`
}
```

- [ ] **Step 4: Implement static schema definitions**

Create `internal/service/configgraph/schema.go` with `ResourceDefinitions() []ResourceDefinition`. Include only current `FileConfig` fields. `provider_offer.priority` is allowed; route priority is not.

- [ ] **Step 5: Run schema tests**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/configgraph
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add internal/service/configgraph/types.go internal/service/configgraph/schema.go internal/service/configgraph/schema_test.go
git commit -m "feat: define config graph schema"
```

---

## Task 2: Build Read-Only Config Graph From Runtime Config

**Files:**

- Create: `internal/service/configgraph/graph.go`
- Create/modify: `internal/service/configgraph/service_test.go`
- Modify: `internal/service/configgraph/types.go`
- Test: `internal/service/configgraph/service_test.go`

- [ ] **Step 1: Write failing graph builder tests**

Add `internal/service/configgraph/service_test.go`:

```go
package configgraph

import (
	"testing"

	"moonbridge/internal/config"
)

func TestBuildGraphIncludesAllConfigSections(t *testing.T) {
	cfg := testConfig()
	graph := BuildGraph(cfg, "rev-1")

	assertResource(t, graph, ResourceMode, "main")
	assertResource(t, graph, ResourceTrace, "main")
	assertResource(t, graph, ResourceLog, "main")
	assertResource(t, graph, ResourceServer, "main")
	assertResource(t, graph, ResourceDefaults, "main")
	assertResource(t, graph, ResourceModel, "claude-sonnet")
	assertResource(t, graph, ResourceProvider, "anthropic")
	assertResource(t, graph, ResourceProviderOffer, "anthropic/claude-sonnet")
	assertResource(t, graph, ResourceRoute, "claude-sonnet")
	assertResource(t, graph, ResourceWebSearch, "main")
	assertResource(t, graph, ResourceCache, "main")
	assertResource(t, graph, ResourcePersistence, "main")
	assertResource(t, graph, ResourceProxy, "main")
}

func TestBuildGraphMasksSecrets(t *testing.T) {
	graph := BuildGraph(testConfig(), "rev-1")
	provider := assertResource(t, graph, ResourceProvider, "anthropic")
	if provider.Value["api_key"] == "sk-ant-test-key" {
		t.Fatal("provider api_key leaked")
	}
}

func assertResource(t *testing.T, graph Graph, kind ResourceKind, id string) Resource {
	t.Helper()
	for _, r := range graph.Resources {
		if r.Kind == kind && r.ID == id {
			return r
		}
	}
	t.Fatalf("missing resource %s/%s", kind, id)
	return Resource{}
}

func testConfig() config.Config {
	return config.Config{
		Mode:          config.ModeTransform,
		Addr:          "127.0.0.1:38440",
		AuthToken:     "console-token",
		TraceRequests: true,
		LogLevel:      "debug",
		LogFormat:     "text",
		Defaults: config.Defaults{
			Model:        "claude-sonnet",
			MaxTokens:    4096,
			SystemPrompt: "system",
		},
		Models: map[string]config.ModelDef{
			"claude-sonnet": {DisplayName: "Claude Sonnet", ContextWindow: 200000},
		},
		ProviderDefs: map[string]config.ProviderDef{
			"anthropic": {
				BaseURL: "https://api.anthropic.com",
				APIKey: "sk-ant-test-key",
				Version: "2023-06-01",
				Protocol: config.ProtocolAnthropic,
				Offers: []config.OfferEntry{{Model: "claude-sonnet", Priority: 1}},
			},
		},
		Routes: map[string]config.RouteEntry{
			"claude-sonnet": {Provider: "anthropic", Model: "claude-sonnet"},
		},
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/configgraph
```

Expected: FAIL because `BuildGraph` is missing.

- [ ] **Step 3: Implement `BuildGraph`**

Create `internal/service/configgraph/graph.go`. Build resources from `cfg.ToFileConfig()` so output tracks the YAML-compatible `FileConfig` shape. Mask secret fields with the existing API convention (`******`) or a graph-local `SecretValue` marker.

- [ ] **Step 4: Include references and status**

Set route references to provider/model resources. Set graph `Capabilities{Autosave: true, Logs: true}` and `Validation{Valid: true}` for valid current config.

- [ ] **Step 5: Run graph tests**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/configgraph
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add internal/service/configgraph/graph.go internal/service/configgraph/types.go internal/service/configgraph/service_test.go
git commit -m "feat: build config graph from runtime config"
```

---

## Task 3: Add Graph Patch Types and Pure Patch Application

**Files:**

- Create: `internal/service/configgraph/patch.go`
- Create: `internal/service/configgraph/patch_test.go`
- Modify: `internal/service/configgraph/types.go`
- Test: `internal/service/configgraph/patch_test.go`

- [ ] **Step 1: Write failing patch tests**

Create tests for:

- stale or empty `baseRevision` is rejected by service layer later, not pure patch.
- updating `defaults.max_tokens` changes `FileConfig.Defaults.MaxTokens`.
- updating provider masked `api_key` keeps existing secret.
- route patch rejects unknown provider/model by returning field errors when converted through validation.
- unsupported route `priority` is rejected.

Use behavior assertions on returned `config.FileConfig`.

- [ ] **Step 2: Add patch DTOs**

In `types.go`:

```go
type PatchRequest struct {
	BaseRevision string       `json:"baseRevision"`
	Changes      []PatchOp    `json:"changes"`
}

type PatchOp struct {
	Kind  ResourceKind `json:"kind"`
	ID    string       `json:"id"`
	Field string       `json:"field"`
	Value any          `json:"value"`
}

type PatchResult string

const (
	ResultCommitted          PatchResult = "committed"
	ResultRestartRequired    PatchResult = "restartRequired"
	ResultRevisionConflict   PatchResult = "revisionConflict"
	ResultValidationRejected PatchResult = "validationRejected"
	ResultRuntimeRejected    PatchResult = "runtimeRejected"
	ResultDraftRejected      PatchResult = "draftRejected"
)

type PatchResponse struct {
	Result        PatchResult  `json:"result"`
	Revision      string       `json:"revision"`
	Graph         *Graph       `json:"graph,omitempty"`
	Errors        []FieldError `json:"errors,omitempty"`
	RollbackValue any          `json:"rollbackValue,omitempty"`
}
```

- [ ] **Step 3: Implement pure patch application**

Implement `ApplyPatchToFileConfig(fc config.FileConfig, ops []PatchOp) (config.FileConfig, []FieldError)`.

Rules:

- Only accept fields present in schema.
- Keep existing secrets when incoming value is empty or masked.
- Mutate maps with fail-fast map initialization where creation is intended.
- Return `FieldError` for unknown kind/id/field.
- Do not validate business references here; leave that to `config.FromFileConfigWithOptions`.

- [ ] **Step 4: Run patch tests**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/configgraph
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add internal/service/configgraph/types.go internal/service/configgraph/patch.go internal/service/configgraph/patch_test.go
git commit -m "feat: apply typed config graph patches"
```

---

## Task 4: Add Runtime Candidate Validation

**Files:**

- Modify: `internal/service/runtime/runtime.go`
- Modify: `internal/service/runtime/runtime_test.go`
- Test: `internal/service/runtime/runtime_test.go`

- [ ] **Step 1: Write failing runtime test**

Add a test proving candidate validation failure does not replace `Runtime.Current()`:

```go
func TestValidateCandidateDoesNotReplaceCurrentOnFailure(t *testing.T) {
	valid := testRuntimeConfig(t)
	rt := NewRuntime(valid, nil, nil)
	before := rt.Current()

	invalid := valid
	invalid.Mode = "invalid"

	if err := rt.ValidateCandidate(invalid); err == nil {
		t.Fatal("ValidateCandidate() error = nil")
	}
	if got := rt.Current(); got != before {
		t.Fatal("runtime snapshot changed after failed candidate validation")
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/runtime
```

Expected: FAIL because `ValidateCandidate` is missing.

- [ ] **Step 3: Implement candidate validation**

Add:

```go
func (rt *Runtime) ValidateCandidate(cfg config.Config) error {
	if err := cfg.Validate(); err != nil {
		return fmt.Errorf("runtime candidate: config validation: %w", err)
	}
	providerCfg := config.ProviderFromGlobalConfig(&cfg)
	providerDefs := provider.BuildProviderDefsFromConfig(providerCfg)
	modelRoutes := provider.BuildModelRoutesFromConfig(providerCfg)
	if _, err := provider.NewProviderManager(providerDefs, modelRoutes); err != nil {
		return fmt.Errorf("runtime candidate: provider manager: %w", err)
	}
	return nil
}
```

Then make `Reload` call shared candidate-building logic to avoid drift.

- [ ] **Step 4: Run runtime tests**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/runtime
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add internal/service/runtime/runtime.go internal/service/runtime/runtime_test.go
git commit -m "feat: validate runtime config candidates"
```

---

## Task 5: Add Direct Config Graph Store Save

**Files:**

- Modify: `internal/service/store/config_store.go`
- Modify: `internal/service/store/sqlite_store.go`
- Modify: `internal/service/store/sqlite_store_test.go`
- Test: `internal/service/store/sqlite_store_test.go`

- [ ] **Step 1: Write failing direct save tests**

Add tests:

- `SaveConfig` overwrites settings/models/providers/offers/routes atomically without using staged changes.
- failed `SaveConfig` leaves prior `LoadAll` unchanged.
- revision changes after save and remains stable across load.

Suggested interface:

```go
SaveConfig(ctx context.Context, cfg *config.Config) (string, error)
CurrentRevision() (string, error)
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/store
```

Expected: FAIL because the new methods are missing.

- [ ] **Step 3: Extend `ConfigStore`**

Add to `internal/service/store/config_store.go`:

```go
SaveConfig(ctx context.Context, cfg *config.Config) (string, error)
CurrentRevision() (string, error)
```

Use these only for graph API. Keep staged APIs for legacy endpoints.

- [ ] **Step 4: Implement SQLite direct save**

Implement `SaveConfig` by wrapping `SeedFromConfig`-equivalent table replacement in one DB transaction. Generate revision from current UTC nanoseconds or a monotonically increasing persisted settings value.

Do not call runtime reload from store code.

- [ ] **Step 5: Run store tests**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/store
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add internal/service/store/config_store.go internal/service/store/sqlite_store.go internal/service/store/sqlite_store_test.go
git commit -m "feat: save config graph directly"
```

---

## Task 6: Implement Config Graph Service

**Files:**

- Create: `internal/service/configgraph/service.go`
- Modify: `internal/service/configgraph/service_test.go`
- Test: `internal/service/configgraph/service_test.go`

- [ ] **Step 1: Write failing service tests**

Cover:

- `Graph()` returns current revision from store and current runtime resources.
- stale `baseRevision` returns `revisionConflict` and does not call runtime/store save.
- invalid schema returns `validationRejected`.
- invalid runtime candidate returns `runtimeRejected` for critical fields and `draftRejected` for normal fields.
- runtime rejection keeps committed graph unchanged, revision unchanged, active runtime unchanged.
- non-hot-reloadable server/security fields save and return `restartRequired`.

Use small fakes instead of reflection:

```go
type fakeStore struct {
	cfg config.Config
	revision string
	saveCalls int
}

type fakeRuntime struct {
	current config.Config
	validateErr error
	reloadCalls int
}
```

If `runtime.Runtime` is too concrete for fakes, define a narrow interface inside `configgraph`:

```go
type Runtime interface {
	Current() *runtime.ConfigSnapshot
	ValidateCandidate(config.Config) error
	Reload(config.Config) error
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/configgraph
```

Expected: FAIL because `Service` is missing.

- [ ] **Step 3: Implement service orchestration**

Create:

```go
type Store interface {
	LoadAll() (*config.Config, error)
	SaveConfig(context.Context, *config.Config) (string, error)
	CurrentRevision() (string, error)
}

type Service struct {
	store Store
	runtime Runtime
	logger *slog.Logger
}
```

Implement:

- `Graph(ctx context.Context) (Graph, error)`
- `Patch(ctx context.Context, req PatchRequest) (PatchResponse, error)`
- `Validate(ctx context.Context, req PatchRequest) (PatchResponse, error)`
- `CreateResource(ctx context.Context, kind ResourceKind, id string, value map[string]any) (PatchResponse, error)`
- `DeleteResource(ctx context.Context, kind ResourceKind, id string, baseRevision string) (PatchResponse, error)`

- [ ] **Step 4: Enforce revision and runtime semantics**

For hot-reloadable changes:

1. Apply patch to current committed `FileConfig`.
2. Convert with `config.FromFileConfigWithOptions`.
3. Call `runtime.ValidateCandidate`.
4. Save accepted config to store.
5. Call `runtime.Reload`.
6. Return `committed` and new revision.

If validation/runtime candidate fails, do not save or reload; return unchanged revision.

- [ ] **Step 5: Run configgraph tests**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/configgraph
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add internal/service/configgraph/service.go internal/service/configgraph/service_test.go
git commit -m "feat: orchestrate config graph patches"
```

---

## Task 7: Expose Config Graph HTTP API

**Files:**

- Create: `internal/service/api/config_graph.go`
- Create: `internal/service/api/config_graph_test.go`
- Modify: `internal/service/api/router.go`
- Modify: `internal/service/api/api_test.go` if fixture helpers need new store methods.
- Test: `internal/service/api/config_graph_test.go`

- [ ] **Step 1: Write failing HTTP tests**

Add tests for:

- `GET /config/graph` returns resources including `mode`, `provider`, `model`, `route`.
- `PATCH /config/graph` with current revision updates defaults and returns `committed`.
- stale patch returns HTTP 409 with `revisionConflict`.
- invalid route provider returns HTTP 400 with field error.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/api
```

Expected: FAIL because routes are missing.

- [ ] **Step 3: Register routes**

In `router.go`:

```go
mux.HandleFunc("GET /config/graph", r.handleGetConfigGraph)
mux.HandleFunc("PATCH /config/graph", r.handlePatchConfigGraph)
mux.HandleFunc("POST /config/resources/{kind}", r.handleCreateConfigResource)
mux.HandleFunc("DELETE /config/resources/{kind}/{id}", r.handleDeleteConfigResource)
```

Keep existing `/config/validate` if needed, or route graph validation by request shape without breaking legacy callers.

- [ ] **Step 4: Implement handlers**

Handlers must:

- decode JSON with fail-fast error responses.
- return `respondError` for invalid path/kind.
- map `revisionConflict` to HTTP 409.
- map validation/runtime rejection to HTTP 400 with structured graph response.
- log unexpected store/runtime failures.

- [ ] **Step 5: Run API tests**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/api
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add internal/service/api/config_graph.go internal/service/api/config_graph_test.go internal/service/api/router.go internal/service/api/api_test.go
git commit -m "feat: expose config graph api"
```

---

## Task 8: Add Backend Log Ring Buffer and Log APIs

**Files:**

- Create: `internal/logger/ring.go`
- Create: `internal/logger/ring_test.go`
- Create: `internal/service/api/logs.go`
- Create: `internal/service/api/logs_test.go`
- Modify: `internal/logger/logger.go`
- Modify: `internal/logger/consumer.go`
- Modify: `internal/service/api/router.go`
- Modify: `internal/service/api/status.go`
- Test: `internal/logger`, `internal/service/api`

- [ ] **Step 1: Write failing logger ring tests**

Test:

- ring keeps last N entries.
- subscribers receive entries in order.
- fan-out consumer preserves plugin consume behavior and does not suppress logs unless a consumer suppresses.

- [ ] **Step 2: Run logger tests to verify failure**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/logger
```

Expected: FAIL because ring/fan-out APIs are missing.

- [ ] **Step 3: Implement ring and fan-out**

Add a `logger.Ring` with:

```go
func NewRing(limit int) *Ring
func (r *Ring) Append(entries []LogEntry)
func (r *Ring) Recent(limit int) []LogEntry
func (r *Ring) Subscribe(ctx context.Context) <-chan LogEntry
```

Add consume fan-out support so app code can register plugin consumer and ring consumer without overwriting either. Avoid empty catch blocks.

- [ ] **Step 4: Write failing API log tests**

Test:

- `GET /logs/recent?limit=2` returns the newest two raw-formatted lines in original order.
- `GET /logs/stream` returns SSE frames.

- [ ] **Step 5: Implement log handlers**

Use SSE:

- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- each event contains JSON with timestamp, level, message, attrs, and raw line if available.

Keep `GET /logs` as legacy alias only if existing tests rely on it; otherwise have it call recent logs.

- [ ] **Step 6: Run tests**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/logger ./internal/service/api
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add internal/logger/ring.go internal/logger/ring_test.go internal/logger/logger.go internal/logger/consumer.go internal/service/api/logs.go internal/service/api/logs_test.go internal/service/api/router.go internal/service/api/status.go
git commit -m "feat: expose backend log stream"
```

---

## Task 9: Fix Console Static Asset Auth and SQLite Parent Directory Creation

**Files:**

- Modify: `internal/service/server/server.go`
- Modify: `internal/service/server/server_test.go`
- Modify: `internal/extension/db/sqlite/plugin.go`
- Modify: `internal/extension/db/sqlite/plugin_test.go`
- Test: `internal/service/server`, `internal/extension/db/sqlite`

- [ ] **Step 1: Write failing console auth tests**

Add tests proving:

- `GET /console/` succeeds without Authorization when `AuthToken` is set.
- `GET /api/v1/status` still returns 401 without Authorization when `AuthToken` is set.
- authenticated API still succeeds.

- [ ] **Step 2: Run server tests to verify failure**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/server
```

Expected: FAIL because `ServeHTTP` auth blocks `/console/`.

- [ ] **Step 3: Change auth boundary**

In `Server.ServeHTTP`, let `/console/` and embedded assets pass to `s.mux` before global bearer auth. Keep auth for `/api/v1/`, `/v1/responses`, `/responses`, `/v1/models`, `/models`, and plugin routes unless a route explicitly opts out.

- [ ] **Step 4: Write failing SQLite parent-dir test**

Add:

```go
func TestOpenCreatesParentDirectories(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "nested", "data")
	cfg := &dbsqlite.Config{Path: filepath.Join(dir, "moonbridge.db")}
	// Init plugin, get provider, call Open, then assert DB file exists.
}
```

- [ ] **Step 5: Implement parent directory creation**

In `sqliteProvider.Open`:

```go
if err := os.MkdirAll(filepath.Dir(absPath), 0o700); err != nil {
	return fmt.Errorf("create sqlite parent directory %s: %w", filepath.Dir(absPath), err)
}
```

Skip `MkdirAll` for special SQLite paths such as `:memory:` and URI-style memory DSNs.

- [ ] **Step 6: Run targeted tests**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/server ./internal/extension/db/sqlite
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add internal/service/server/server.go internal/service/server/server_test.go internal/extension/db/sqlite/plugin.go internal/extension/db/sqlite/plugin_test.go
git commit -m "fix: load console under auth and create sqlite parent dirs"
```

---

## Task 10: Add Frontend Config Graph Client and Autosave Hooks

**Files:**

- Create: `webui/src/rpc/configGraph.ts`
- Create: `webui/src/rpc/logs.ts`
- Create: `webui/src/features/configGraph/useConfigGraph.ts`
- Create: `webui/src/features/configGraph/useAutosaveField.ts`
- Create: `webui/src/features/configGraph/FieldStatus.tsx`
- Create: `webui/src/features/configGraph/SchemaField.tsx`
- Create: tests beside each new module.
- Modify: `webui/src/rpc/types.ts`
- Modify: `webui/src/rpc/queryKeys.ts`
- Test: `webui/src/rpc/*.test.ts`, `webui/src/features/configGraph/*.test.tsx`

- [ ] **Step 1: Write failing client tests**

Test `getConfigGraph`, `patchConfigGraph`, `createConfigResource`, `deleteConfigResource`, `getRecentLogs`, and `createLogStream` by mocking `fetch`.

- [ ] **Step 2: Run frontend tests to verify failure**

Run:

```bash
npm --prefix webui test -- configGraph logs
```

Expected: FAIL because modules are missing.

- [ ] **Step 3: Add TypeScript DTOs**

Add graph types mirroring Go JSON:

```ts
export type ConfigGraph = {
  revision: string;
  resources: ConfigResource[];
  validation: { valid: boolean; errors?: FieldError[] };
  runtime: { status: string; errors?: FieldError[]; message?: string };
  capabilities: { autosave: boolean; logs: boolean };
};
```

- [ ] **Step 4: Implement RPC functions**

Use existing `apiFetch`. For SSE, use `EventSource` if token auth is not required; otherwise use `fetch` streaming with Authorization header from `readStoredToken()`.

- [ ] **Step 5: Write autosave hook tests**

Verify:

- field becomes dirty immediately.
- debounced patch enters saving.
- `committed` clears local draft.
- `draftRejected` keeps local value and sets field error.
- `runtimeRejected` rolls back to server value.

- [ ] **Step 6: Implement hooks and shared fields**

`useAutosaveField` should accept resource kind/id/field, current committed value, and rollback policy from field schema. Use a short debounce and cancel in-flight saves when unmounted.

- [ ] **Step 7: Run frontend unit tests**

Run:

```bash
npm --prefix webui test -- configGraph
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add webui/src/rpc/configGraph.ts webui/src/rpc/logs.ts webui/src/rpc/types.ts webui/src/rpc/queryKeys.ts webui/src/features/configGraph
git commit -m "feat: add config graph frontend client"
```

---

## Task 11: Update App Shell and Navigation

**Files:**

- Modify: `webui/src/app/App.tsx`
- Modify: `webui/src/app/App.test.tsx`
- Modify: `webui/src/app/routes.tsx`
- Modify: `webui/src/i18n/messages.ts`
- Modify: `webui/src/i18n/locales/en.ts`
- Modify: `webui/src/i18n/locales/zh.ts`
- Test: `webui/src/app/App.test.tsx`

- [ ] **Step 1: Write failing shell tests**

Assert nav contains only:

- Overview
- Models & Providers
- Routes
- Defaults
- Search & Tools
- Storage
- Security
- Logs

Assert no primary Apply button appears.

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm --prefix webui test -- App
```

Expected: FAIL because current shell still has Apply and old nav.

- [ ] **Step 3: Update routes and nav items**

Remove old primary routes from navigation. Legacy components can remain on disk until cleanup, but must not be primary nav items.

- [ ] **Step 4: Update i18n labels**

Add route labels and realtime save labels in both locales. Remove visible top-level copy that tells users to apply changes or edit YAML.

- [ ] **Step 5: Run shell tests**

Run:

```bash
npm --prefix webui test -- App
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add webui/src/app/App.tsx webui/src/app/App.test.tsx webui/src/app/routes.tsx webui/src/i18n/messages.ts webui/src/i18n/locales/en.ts webui/src/i18n/locales/zh.ts
git commit -m "feat: switch console navigation to config graph"
```

---

## Task 12: Rebuild Overview and Core Config Pages

**Files:**

- Modify: `webui/src/features/overview/OverviewPage.tsx`
- Modify: `webui/src/features/overview/OverviewPage.test.tsx`
- Create: `webui/src/features/modelProviders/ModelsProvidersPage.tsx`
- Create: `webui/src/features/modelProviders/ModelsProvidersPage.test.tsx`
- Modify: `webui/src/features/routes/RoutesPage.tsx`
- Modify: `webui/src/features/routes/RoutesPage.test.tsx`
- Create: `webui/src/features/defaults/DefaultsPage.tsx`
- Create: `webui/src/features/defaults/DefaultsPage.test.tsx`
- Modify: `webui/src/app/routes.tsx`
- Test: feature tests.

- [ ] **Step 1: Write failing Overview tests**

Assert Overview reads config graph and shows operation mode, runtime status, graph health, restart required, and recent failed save status. It must not show pending changes.

- [ ] **Step 2: Implement Overview graph view**

Use `useConfigGraph`. Keep MD3 surfaces and current palette.

- [ ] **Step 3: Write failing Models & Providers tests**

Assert:

- Providers heading appears before Models heading in document order.
- Provider fields use autosave.
- Offer priority is editable.
- No provider/model enabled toggle appears.

- [ ] **Step 4: Implement `ModelsProvidersPage`**

Use vertical scrolling layout:

1. Provider list and provider detail/edit controls.
2. Offer table/editor under provider.
3. Models list and model detail/edit controls.

- [ ] **Step 5: Write failing Routes tests**

Assert route alias, model, provider, display metadata, context window, web search, and extensions are editable. Assert no route priority or fallback chain controls exist.

- [ ] **Step 6: Implement Routes graph autosave**

Replace old PUT/stage behavior with typed patch calls.

- [ ] **Step 7: Write failing Defaults tests**

Assert defaults, trace, and log resources are visible and autosave.

- [ ] **Step 8: Implement Defaults page**

Use hand-built controls for defaults and simple schema fields for trace/log.

- [ ] **Step 9: Run feature tests**

Run:

```bash
npm --prefix webui test -- OverviewPage ModelsProvidersPage RoutesPage DefaultsPage
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add webui/src/features/overview webui/src/features/modelProviders webui/src/features/routes webui/src/features/defaults webui/src/app/routes.tsx
git commit -m "feat: rebuild core config graph pages"
```

---

## Task 13: Add Search & Tools, Storage, Security, and Logs Pages

**Files:**

- Create: `webui/src/features/searchTools/SearchToolsPage.tsx`
- Create: `webui/src/features/searchTools/SearchToolsPage.test.tsx`
- Create: `webui/src/features/storage/StoragePage.tsx`
- Create: `webui/src/features/storage/StoragePage.test.tsx`
- Create: `webui/src/features/security/SecurityPage.tsx`
- Create: `webui/src/features/security/SecurityPage.test.tsx`
- Create: `webui/src/features/logs/LogsPage.tsx`
- Create: `webui/src/features/logs/LogsPage.test.tsx`
- Modify: `webui/src/app/routes.tsx`
- Test: feature tests.

- [ ] **Step 1: Write failing Search & Tools tests**

Assert web search, global extensions, and proxy resources render from graph. Assert no YAML editor appears.

- [ ] **Step 2: Implement Search & Tools**

Use schema-driven fields for extensions and proxy, hand-built controls for web search keys and support mode.

- [ ] **Step 3: Write failing Storage tests**

Assert cache and persistence resources render. Assert DB status can show errors from graph/runtime state.

- [ ] **Step 4: Implement Storage**

Use schema-driven fields for cache and persistence.

- [ ] **Step 5: Write failing Security tests**

Assert server addr/auth/session fields render. Secret auth token field must be write-only and must not reveal existing token.

- [ ] **Step 6: Implement Security**

Use secret replacement control for auth token. Mark server auth changes restart-required or critical according to backend schema.

- [ ] **Step 7: Write failing Logs tests**

Mock recent logs and stream events. Assert:

- original line text appears.
- follow/pause works.
- search filters visible lines.
- copy/download controls are present.

- [ ] **Step 8: Implement Logs page**

Use `getRecentLogs` and stream helper. Keep raw order. Do not rewrite log text.

- [ ] **Step 9: Run feature tests**

Run:

```bash
npm --prefix webui test -- SearchToolsPage StoragePage SecurityPage LogsPage
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add webui/src/features/searchTools webui/src/features/storage webui/src/features/security webui/src/features/logs webui/src/app/routes.tsx
git commit -m "feat: add remaining config graph console pages"
```

---

## Task 14: Remove Primary YAML/Apply UX and Update E2E Coverage

**Files:**

- Modify: `webui/src/app/ApplyDraftContext.tsx` or remove from shell if unused.
- Modify: `webui/src/app/ApplyChangesDialog.tsx` if it becomes legacy-only.
- Modify: `webui/src/components/ChangeQueueDrawer.tsx` if it becomes legacy-only.
- Modify: `webui/src/features/config/ConfigPage.tsx` only if keeping a hidden maintenance route.
- Create/modify: `webui/src/e2e/configGraphConsole.test.tsx`
- Modify: `webui/src/e2e/console.test.tsx`
- Test: `webui/src/e2e`.

- [ ] **Step 1: Write failing E2E tests**

Assert:

- primary nav has no Config/YAML page.
- no Apply button is visible.
- editing a field calls `PATCH /api/v1/config/graph`.
- `draftRejected` leaves input value and shows error.
- `runtimeRejected` rolls back critical input.
- Logs page renders recent logs.

- [ ] **Step 2: Run E2E tests to verify failure**

Run:

```bash
npm --prefix webui run e2e
```

Expected: FAIL until pages and mocks are updated.

- [ ] **Step 3: Remove primary Apply providers from shell**

Stop wrapping the app in `ApplyDraftProvider` unless a legacy hidden route still needs it. Keep code only if tests prove a maintenance route uses it.

- [ ] **Step 4: Hide or remove primary YAML import/export UI**

If keeping a maintenance route, do not link it from primary nav and label it as maintenance-only.

- [ ] **Step 5: Run frontend full tests**

Run:

```bash
npm --prefix webui test
npm --prefix webui run e2e
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add webui/src/app webui/src/components webui/src/features/config webui/src/e2e
git commit -m "feat: remove primary apply and yaml console ux"
```

---

## Task 15: Rebuild Embedded WebUI and Update Documentation

**Files:**

- Modify: `internal/service/webui/dist/index.html`
- Modify/create: `internal/service/webui/dist/assets/*`
- Modify: `docs/api.md`
- Modify: `docs/CONFIGURATION.md`
- Modify: `docs/DEVELOPMENT.md`
- Test: webui build and Go embed tests.

- [ ] **Step 1: Build frontend**

Run:

```bash
npm --prefix webui run build
```

Expected: PASS and `webui/dist` updated.

- [ ] **Step 2: Copy built assets to embedded dist**

Use the repository's established dist copy/build workflow. If no script exists, copy `webui/dist/*` into `internal/service/webui/dist/` and remove stale hashed assets.

- [ ] **Step 3: Update API docs**

Document:

- `GET /api/v1/config/graph`
- `PATCH /api/v1/config/graph`
- resource create/delete endpoints
- patch result states
- `GET /api/v1/logs/recent`
- `GET /api/v1/logs/stream`

- [ ] **Step 4: Update configuration docs**

Clarify that normal console use does not require editing YAML. Keep `~/.moon-bridge/config.yml` documented for CLI/admin use only.

- [ ] **Step 5: Update development docs**

Document frontend commands and graph API testing commands.

- [ ] **Step 6: Run embed and docs-adjacent tests**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./internal/service/webui ./internal/service/server
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add internal/service/webui/dist docs/api.md docs/CONFIGURATION.md docs/DEVELOPMENT.md
git commit -m "docs: document config graph console"
```

---

## Task 16: Full Verification and Local Smoke

**Files:**

- No source changes expected unless verification exposes bugs.

- [ ] **Step 1: Run backend tests**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go test ./...
```

Expected: PASS.

- [ ] **Step 2: Run frontend tests and build**

Run:

```bash
npm --prefix webui test
npm --prefix webui run e2e
npm --prefix webui run build
```

Expected: PASS.

- [ ] **Step 3: Build local binary**

Run:

```bash
env GOCACHE=/tmp/moonbridge-go-build GOMODCACHE=/tmp/moonbridge-go-mod go build -o /tmp/mb-config-graph ./cmd/moonbridge
```

Expected: PASS and `/tmp/mb-config-graph` exists.

- [ ] **Step 4: Run local smoke server**

Create a temporary config with:

- `mode: Transform`
- one provider
- one model
- one offer
- one route
- `extensions.db_sqlite.config.path` under a nested temp directory

Run the built binary against that config. Expected:

- SQLite parent directory is created.
- `/console/` loads without Authorization when `server.auth_token` is set.
- `/api/v1/config/graph` requires Authorization.
- `/api/v1/config/graph` returns graph resources.
- `PATCH /api/v1/config/graph` updates defaults and returns `committed`.
- `/api/v1/logs/recent` returns backend log entries.

- [ ] **Step 5: Run final diff checks**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only intentional final changes remain.

- [ ] **Step 6: Final commit if verification fixes were needed**

If Step 1-5 required fixes, commit them:

```bash
git add <changed-files>
git commit -m "fix: complete config graph console verification"
```

---

## Implementation Order Summary

1. Backend graph schema and read model.
2. Pure patch and runtime candidate validation.
3. Direct store save and graph service orchestration.
4. HTTP graph endpoints.
5. Logs backend.
6. Auth and SQLite reliability fixes.
7. Frontend graph client and autosave.
8. Navigation and page rebuild.
9. Remove primary YAML/apply UX.
10. Rebuild embedded assets, docs, and smoke verification.

## Review Notes to Preserve

- Add explicit tests for runtime reload failure preserving committed graph, keeping revision unchanged, and leaving active runtime on the previous valid config.
- Keep `offer priority` separate from excluded `route priority`; offer priority is currently supported by `FileConfig`.
