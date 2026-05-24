import { type FormEvent, useState } from "react";
import {
  generateConfigYAML,
  type GeneratedConfigDraft
} from "../../rpc/configGenerator";

export function ConfigGenerator({ onGenerate }: { onGenerate: (yaml: string) => void }) {
  const [draft, setDraft] = useState({
    mode: "Transform",
    addr: "127.0.0.1:38440",
    auth_token: "",
    provider_key: "anthropic",
    base_url: "https://api.anthropic.com",
    api_key: "replace-with-provider-key",
    protocol: "anthropic",
    model_slug: "claude-sonnet",
    upstream_name: "",
    route_alias: "moonbridge"
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onGenerate(generateConfigYAML(toDraft()));
  }

  function update(field: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function toDraft(): GeneratedConfigDraft {
    return {
      mode: draft.mode as GeneratedConfigDraft["mode"],
      server: { addr: draft.addr, auth_token: draft.auth_token },
      persistence: { active_provider: "db_sqlite" },
      defaults: { model: draft.route_alias, max_tokens: 4096 },
      providers: [
        {
          key: draft.provider_key,
          base_url: draft.base_url,
          api_key: draft.api_key,
          protocol: draft.protocol,
          offers: [
            {
              model: draft.model_slug,
              upstream_name: draft.upstream_name
            }
          ]
        }
      ],
      models: [
        {
          slug: draft.model_slug,
          display_name: draft.model_slug,
          context_window: 128000,
          max_output_tokens: 4096
        }
      ],
      routes: [
        {
          alias: draft.route_alias,
          model: draft.model_slug,
          provider: draft.provider_key,
          display_name: draft.route_alias
        }
      ]
    };
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>
        Mode
        <select value={draft.mode} onChange={(event) => update("mode", event.currentTarget.value)}>
          <option value="Transform">Transform</option>
          <option value="CaptureResponse">CaptureResponse</option>
          <option value="CaptureAnthropic">CaptureAnthropic</option>
        </select>
      </label>
      <label>
        Server Addr
        <input value={draft.addr} onChange={(event) => update("addr", event.currentTarget.value)} />
      </label>
      <label>
        Auth Token
        <input value={draft.auth_token} onChange={(event) => update("auth_token", event.currentTarget.value)} />
      </label>
      <label>
        Provider Key
        <input value={draft.provider_key} onChange={(event) => update("provider_key", event.currentTarget.value)} />
      </label>
      <label className="form-grid__wide">
        Base URL
        <input value={draft.base_url} onChange={(event) => update("base_url", event.currentTarget.value)} />
      </label>
      <label>
        API Key
        <input value={draft.api_key} onChange={(event) => update("api_key", event.currentTarget.value)} />
      </label>
      <label>
        Protocol
        <select value={draft.protocol} onChange={(event) => update("protocol", event.currentTarget.value)}>
          <option value="anthropic">anthropic</option>
          <option value="openai-response">openai-response</option>
          <option value="google">google</option>
        </select>
      </label>
      <label>
        Model Slug
        <input value={draft.model_slug} onChange={(event) => update("model_slug", event.currentTarget.value)} />
      </label>
      <label>
        Upstream Name
        <input value={draft.upstream_name} onChange={(event) => update("upstream_name", event.currentTarget.value)} />
      </label>
      <label>
        Route Alias
        <input value={draft.route_alias} onChange={(event) => update("route_alias", event.currentTarget.value)} />
      </label>
      <div className="form-actions">
        <button type="submit">Generate YAML</button>
      </div>
    </form>
  );
}
