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

	server := assertResource(t, graph, ResourceServer, "main")
	if server.Value["auth_token"] == "console-token" {
		t.Fatal("server auth_token leaked")
	}

	search := assertResource(t, graph, ResourceWebSearch, "main")
	if search.Value["tavily_api_key"] == "tvly-test-key" {
		t.Fatal("web_search tavily_api_key leaked")
	}
}

func TestBuildGraphReportsRevisionAndCapabilities(t *testing.T) {
	graph := BuildGraph(testConfig(), "rev-1")
	if graph.Revision != "rev-1" {
		t.Fatalf("Revision = %q, want rev-1", graph.Revision)
	}
	if !graph.Validation.Valid {
		t.Fatal("Validation.Valid = false, want true")
	}
	if !graph.Capabilities.Autosave {
		t.Fatal("Capabilities.Autosave = false, want true")
	}
	if !graph.Capabilities.Logs {
		t.Fatal("Capabilities.Logs = false, want true")
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
			"claude-sonnet": {
				DisplayName:   "Claude Sonnet",
				ContextWindow: 200000,
			},
		},
		ProviderDefs: map[string]config.ProviderDef{
			"anthropic": {
				BaseURL:  "https://api.anthropic.com",
				APIKey:   "sk-ant-test-key",
				Version:  "2023-06-01",
				Protocol: config.ProtocolAnthropic,
				Offers: []config.OfferEntry{
					{
						Model:    "claude-sonnet",
						Priority: 1,
						Pricing: config.ModelPricing{
							InputPrice:  3.0,
							OutputPrice: 15.0,
						},
					},
				},
			},
		},
		Routes: map[string]config.RouteEntry{
			"claude-sonnet": {
				Provider:      "anthropic",
				Model:         "claude-sonnet",
				DisplayName:   "Claude Sonnet",
				ContextWindow: 200000,
			},
		},
		WebSearchSupport: config.WebSearchSupportEnabled,
		WebSearchMaxUses: 8,
		TavilyAPIKey:     "tvly-test-key",
		SearchMaxRounds:  5,
		Cache: config.CacheConfig{
			Mode:                    "auto",
			TTL:                     "5m",
			PromptCaching:           true,
			AutomaticPromptCache:    true,
			AllowRetentionDowngrade: true,
		},
		Persistence: config.PersistenceConfig{
			ActiveProvider: "db_sqlite",
		},
		ResponseProxy: config.ResponseProxyConfig{
			ProviderBaseURL: "https://responses.example.test",
			ProviderAPIKey:  "response-key",
			Model:           "resp-model",
		},
		AnthropicProxy: config.AnthropicProxyConfig{
			ProviderBaseURL: "https://anthropic.example.test",
			ProviderAPIKey:  "anthropic-key",
			ProviderVersion: "2023-06-01",
			Model:           "anthropic-model",
		},
	}
}
