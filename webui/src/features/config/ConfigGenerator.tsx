import { type FormEvent, useState } from "react";
import {
  generateConfigYAML,
  type GeneratedConfigDraft
} from "../../rpc/configGenerator";
import { useI18n } from "../../i18n/I18nProvider";
import { FieldWithHint } from "../shared";

export function ConfigGenerator({ onGenerate }: { onGenerate: (yaml: string) => void }) {
  const { t } = useI18n();
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
      <FieldWithHint hintId="generator-mode-hint" hintPath="mode">
        <label>
          {t("field.mode")}
          <select
            aria-describedby="generator-mode-hint"
            name="mode"
            value={draft.mode}
            onChange={(event) => update("mode", event.currentTarget.value)}
          >
            <option value="Transform">Transform</option>
            <option value="CaptureResponse">CaptureResponse</option>
            <option value="CaptureAnthropic">CaptureAnthropic</option>
          </select>
        </label>
      </FieldWithHint>
      <FieldWithHint hintId="generator-server-addr-hint" hintPath="server.addr">
        <label>
          {t("field.serverAddr")}
          <input
            aria-describedby="generator-server-addr-hint"
            name="server.addr"
            value={draft.addr}
            onChange={(event) => update("addr", event.currentTarget.value)}
          />
        </label>
      </FieldWithHint>
      <FieldWithHint hintId="generator-auth-token-hint" hintPath="server.auth_token">
        <label>
          {t("field.authToken")}
          <input
            aria-describedby="generator-auth-token-hint"
            name="server.auth_token"
            value={draft.auth_token}
            onChange={(event) => update("auth_token", event.currentTarget.value)}
          />
        </label>
      </FieldWithHint>
      <FieldWithHint hintId="generator-provider-key-hint" hintPath="providers.<key>.key">
        <label>
          {t("field.providerKey")}
          <input
            aria-describedby="generator-provider-key-hint"
            name="provider.key"
            value={draft.provider_key}
            onChange={(event) => update("provider_key", event.currentTarget.value)}
          />
        </label>
      </FieldWithHint>
      <FieldWithHint className="form-grid__wide" hintId="generator-base-url-hint" hintPath="providers.<key>.base_url">
        <label>
          {t("field.baseUrl")}
          <input
            aria-describedby="generator-base-url-hint"
            name="provider.base_url"
            value={draft.base_url}
            onChange={(event) => update("base_url", event.currentTarget.value)}
          />
        </label>
      </FieldWithHint>
      <FieldWithHint hintId="generator-api-key-hint" hintPath="providers.<key>.api_key">
        <label>
          {t("field.apiKey")}
          <input
            aria-describedby="generator-api-key-hint"
            name="provider.api_key"
            value={draft.api_key}
            onChange={(event) => update("api_key", event.currentTarget.value)}
          />
        </label>
      </FieldWithHint>
      <FieldWithHint hintId="generator-protocol-hint" hintPath="providers.<key>.protocol">
        <label>
          {t("field.protocol")}
          <select
            aria-describedby="generator-protocol-hint"
            name="provider.protocol"
            value={draft.protocol}
            onChange={(event) => update("protocol", event.currentTarget.value)}
          >
            <option value="anthropic">anthropic</option>
            <option value="openai-response">openai-response</option>
            <option value="google-genai">google-genai</option>
            <option value="openai-chat">openai-chat</option>
          </select>
        </label>
      </FieldWithHint>
      <FieldWithHint hintId="generator-model-slug-hint" hintPath="models.<slug>.slug">
        <label>
          {t("field.slug")}
          <input
            aria-describedby="generator-model-slug-hint"
            name="model.slug"
            value={draft.model_slug}
            onChange={(event) => update("model_slug", event.currentTarget.value)}
          />
        </label>
      </FieldWithHint>
      <FieldWithHint hintId="generator-upstream-name-hint" hintPath="providers.<key>.offers[].upstream_name">
        <label>
          {t("field.upstreamName")}
          <input
            aria-describedby="generator-upstream-name-hint"
            name="offer.upstream_name"
            value={draft.upstream_name}
            onChange={(event) => update("upstream_name", event.currentTarget.value)}
          />
        </label>
      </FieldWithHint>
      <FieldWithHint hintId="generator-route-alias-hint" hintPath="routes.<alias>.alias">
        <label>
          {t("field.routeAlias")}
          <input
            aria-describedby="generator-route-alias-hint"
            name="route.alias"
            value={draft.route_alias}
            onChange={(event) => update("route_alias", event.currentTarget.value)}
          />
        </label>
      </FieldWithHint>
      <div className="form-actions">
        <button type="submit">{t("action.generateYaml")}</button>
      </div>
    </form>
  );
}
