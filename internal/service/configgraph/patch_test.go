package configgraph

import (
	"testing"

	"moonbridge/internal/config"
)

func TestApplyPatchToFileConfigDoesNotHandleBaseRevision(t *testing.T) {
	fc := testConfig().ToFileConfig()
	request := PatchRequest{
		BaseRevision: "",
		Changes: []PatchOp{
			{Kind: ResourceDefaults, ID: mainResourceID, Field: "max_tokens", Value: 8192},
		},
	}

	patched, errs := ApplyPatchToFileConfig(fc, request.Changes)

	if len(errs) != 0 {
		t.Fatalf("ApplyPatchToFileConfig returned errors for empty base revision boundary: %+v", errs)
	}
	if patched.Defaults.MaxTokens != 8192 {
		t.Fatalf("Defaults.MaxTokens = %d, want 8192", patched.Defaults.MaxTokens)
	}
}

func TestApplyPatchToFileConfigUpdatesDefaultsMaxTokens(t *testing.T) {
	fc := testConfig().ToFileConfig()

	patched, errs := ApplyPatchToFileConfig(fc, []PatchOp{
		{Kind: ResourceDefaults, ID: mainResourceID, Field: "max_tokens", Value: 16384},
	})

	if len(errs) != 0 {
		t.Fatalf("ApplyPatchToFileConfig returned errors: %+v", errs)
	}
	if patched.Defaults.MaxTokens != 16384 {
		t.Fatalf("Defaults.MaxTokens = %d, want 16384", patched.Defaults.MaxTokens)
	}
}

func TestApplyPatchToFileConfigKeepsExistingProviderSecretWhenMaskedOrEmpty(t *testing.T) {
	for _, tc := range []struct {
		name  string
		value any
	}{
		{name: "masked", value: secretMask},
		{name: "empty", value: ""},
	} {
		t.Run(tc.name, func(t *testing.T) {
			fc := testConfig().ToFileConfig()

			patched, errs := ApplyPatchToFileConfig(fc, []PatchOp{
				{Kind: ResourceProvider, ID: "anthropic", Field: "api_key", Value: tc.value},
			})

			if len(errs) != 0 {
				t.Fatalf("ApplyPatchToFileConfig returned errors: %+v", errs)
			}
			if patched.Providers["anthropic"].APIKey != "sk-ant-test-key" {
				t.Fatalf("Providers[anthropic].APIKey = %q, want existing secret", patched.Providers["anthropic"].APIKey)
			}
		})
	}
}

func TestApplyPatchToFileConfigLeavesRouteReferenceValidationToConfigLoader(t *testing.T) {
	fc := testConfig().ToFileConfig()

	patched, errs := ApplyPatchToFileConfig(fc, []PatchOp{
		{Kind: ResourceRoute, ID: "claude-sonnet", Field: "provider", Value: "missing-provider"},
	})

	if len(errs) != 0 {
		t.Fatalf("ApplyPatchToFileConfig returned errors: %+v", errs)
	}
	if patched.Routes["claude-sonnet"].Provider != "missing-provider" {
		t.Fatalf("Routes[claude-sonnet].Provider = %q, want missing-provider", patched.Routes["claude-sonnet"].Provider)
	}
	if _, err := config.FromFileConfig(patched); err == nil {
		t.Fatal("config.FromFileConfig succeeded for route with missing provider, want validation error")
	}
}

func TestApplyPatchToFileConfigRejectsUnsupportedRoutePriority(t *testing.T) {
	fc := testConfig().ToFileConfig()

	_, errs := ApplyPatchToFileConfig(fc, []PatchOp{
		{Kind: ResourceRoute, ID: "claude-sonnet", Field: "priority", Value: 1},
	})

	if len(errs) != 1 {
		t.Fatalf("ApplyPatchToFileConfig returned %d errors, want 1: %+v", len(errs), errs)
	}
	if errs[0].ResourceKind != ResourceRoute || errs[0].ResourceID != "claude-sonnet" || errs[0].Field != "priority" {
		t.Fatalf("unexpected error target: %+v", errs[0])
	}
}
