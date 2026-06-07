import type { ConfigGraph, ConfigResource, FieldSchema, ResourceKind } from "../rpc/types";

export function configGraphFixture(overrides: Partial<ConfigGraph> = {}): ConfigGraph {
  const resources = overrides.resources ?? [
    resource("mode", "main", "Mode", { mode: "Transform" }, [
      field("mode", "Mode", "string", "select", ["Transform", "CaptureResponse", "CaptureAnthropic"])
    ]),
    resource("defaults", "main", "Defaults", {
      model: "claude-sonnet",
      max_tokens: 4096,
      system_prompt: "Be concise."
    }, [
      field("model", "Model"),
      field("max_tokens", "Max Tokens", "number", "number"),
      field("system_prompt", "System Prompt", "string", "textarea")
    ]),
    resource("trace", "main", "Trace", { enabled: true }, [
      field("enabled", "Enabled", "boolean", "switch")
    ]),
    resource("log", "main", "Log", { level: "info", format: "text" }, [
      field("level", "Level", "string", "select", ["debug", "info", "warn", "error"]),
      field("format", "Format", "string", "select", ["text", "json"])
    ]),
    resource("provider", "anthropic", "anthropic", {
      base_url: "https://api.anthropic.com",
      api_key: "******",
      version: "2023-06-01",
      user_agent: "MoonBridge",
      protocol: "anthropic"
    }, [
      field("base_url", "Base URL"),
      field("api_key", "API Key", "string", "secret", undefined, true),
      field("version", "Version"),
      field("user_agent", "User Agent"),
      field("protocol", "Protocol", "string", "select", ["anthropic", "openai-response"])
    ]),
    resource("provider_offer", "anthropic/claude-sonnet", "anthropic/claude-sonnet", {
      model: "claude-sonnet",
      upstream_name: "claude-3-5-sonnet",
      priority: 1,
      pricing: {
        input_price: 3,
        output_price: 15
      },
      overrides: {}
    }, [
      field("model", "Model"),
      field("upstream_name", "Upstream Name"),
      field("priority", "Priority", "number", "number"),
      field("pricing", "Pricing", "object", "object"),
      field("overrides", "Overrides", "object", "object")
    ]),
    resource("model", "claude-sonnet", "Claude Sonnet", {
      context_window: 200000,
      max_output_tokens: 8192,
      display_name: "Claude Sonnet",
      description: "Balanced model"
    }, [
      field("context_window", "Context Window", "number", "number"),
      field("max_output_tokens", "Max Output Tokens", "number", "number"),
      field("display_name", "Display Name"),
      field("description", "Description", "string", "textarea")
    ]),
    resource("route", "primary", "Primary Route", {
      to: "primary",
      model: "claude-sonnet",
      provider: "anthropic",
      display_name: "Primary Route",
      description: "Default route",
      context_window: 200000,
      web_search: { support: "auto" },
      extensions: {}
    }, [
      field("to", "Route Target"),
      field("model", "Model"),
      field("provider", "Provider"),
      field("display_name", "Display Name"),
      field("description", "Description", "string", "textarea"),
      field("context_window", "Context Window", "number", "number"),
      field("web_search", "Web Search", "object", "object"),
      field("extensions", "Extensions", "object", "object")
    ])
  ];

  return {
    revision: "rev-1",
    resources,
    validation: { valid: true },
    runtime: { status: "ok" },
    capabilities: { autosave: true, logs: true },
    ...overrides
  };
}

export function resource(
  kind: ResourceKind,
  id: string,
  label: string,
  value: Record<string, unknown>,
  fields: FieldSchema[],
  overrides: Partial<ConfigResource> = {}
): ConfigResource {
  return {
    kind,
    id,
    label,
    value,
    schema: { fields },
    status: "saved",
    runtimeImpact: "normal",
    hotReloadable: true,
    ...overrides
  };
}

export function field(
  path: string,
  label: string,
  type: FieldSchema["type"] = "string",
  control = type === "number" ? "number" : "text",
  enumValues?: string[],
  secret = false
): FieldSchema {
  return {
    path,
    type,
    label,
    control,
    enum: enumValues,
    secret,
    hotReloadable: true,
    runtimeImpact: "normal"
  };
}
