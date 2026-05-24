import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LoadingState } from "../../components/LoadingState";
import {
  exportConfig,
  getEffectiveConfig,
  getDefaults,
  getWebSearch,
  importConfig,
  putDefaults,
  putWebSearch,
  validateConfig
} from "../../rpc/management";
import { FieldWithHint, PageHeader, QueryErrorState } from "../shared";
import { useI18n } from "../../i18n/I18nProvider";
import { ConfigGenerator } from "./ConfigGenerator";

const defaultYAML = "mode: Transform\n";

export function ConfigPage() {
  const { t } = useI18n();
  const [yaml, setYAML] = useState(defaultYAML);
  const [includeSecrets, setIncludeSecrets] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [defaultsForm, setDefaultsForm] = useState({
    model: "",
    max_tokens: "4096",
    system_prompt: ""
  });
  const [webSearchForm, setWebSearchForm] = useState({
    support: "auto",
    max_uses: "4",
    tavily_api_key: "******",
    firecrawl_api_key: "******",
    search_max_rounds: "2"
  });
  const effective = useQuery({
    queryKey: ["config", "effective"],
    queryFn: getEffectiveConfig
  });
  const defaults = useQuery({
    queryKey: ["defaults"],
    queryFn: getDefaults
  });
  const webSearch = useQuery({
    queryKey: ["web-search"],
    queryFn: getWebSearch
  });

  useEffect(() => {
    if (defaults.data) {
      setDefaultsForm({
        model: defaults.data.model,
        max_tokens: String(defaults.data.max_tokens),
        system_prompt: defaults.data.system_prompt
      });
    }
  }, [defaults.data]);

  useEffect(() => {
    if (webSearch.data) {
      setWebSearchForm({
        support: webSearch.data.support,
        max_uses: String(webSearch.data.max_uses),
        tavily_api_key: "******",
        firecrawl_api_key: "******",
        search_max_rounds: String(webSearch.data.search_max_rounds)
      });
    }
  }, [webSearch.data]);

  async function validate() {
    const result = await validateConfig(yaml);
    setFeedback(result.valid ? t("config.valid") : t("config.invalid", { errors: (result.errors ?? []).join("; ") }));
  }

  async function importYAML() {
    const result = await importConfig(yaml);
    setFeedback(result.message || t("feedback.changesStaged", { count: result.count }));
  }

  async function exportYAML() {
    const exported = await exportConfig({ includeSecrets });
    setYAML(exported);
    setFeedback(includeSecrets ? t("config.exportedSecrets") : t("config.exportedMasked"));
  }

  async function stageDefaults() {
    const result = await putDefaults({
      model: defaultsForm.model,
      max_tokens: Number(defaultsForm.max_tokens),
      system_prompt: defaultsForm.system_prompt
    });
    setFeedback(t("feedback.stagedChange", { id: result.change_id }));
  }

  async function stageWebSearch() {
    const result = await putWebSearch({
      support: webSearchForm.support,
      max_uses: Number(webSearchForm.max_uses),
      tavily_api_key: webSearchForm.tavily_api_key,
      firecrawl_api_key: webSearchForm.firecrawl_api_key,
      search_max_rounds: Number(webSearchForm.search_max_rounds)
    });
    setFeedback(t("feedback.stagedChange", { id: result.change_id }));
  }

  return (
    <section className="page-stack" aria-labelledby="config-title">
      <PageHeader eyebrow={t("config.visualGenerator")} title={t("nav.config")}>
        {t("config.description")}
      </PageHeader>

      <section className="content-panel">
        <h2>{t("config.visualGenerator")}</h2>
        <ConfigGenerator onGenerate={setYAML} />
      </section>

      <section className="content-panel">
        <h2>{t("config.yamlImport")}</h2>
        <label className="textarea-field">
          {t("field.yamlEditor")}
          <textarea
            name="config.yaml"
            value={yaml}
            onChange={(event) => setYAML(event.currentTarget.value)}
            rows={18}
          />
        </label>
        <div className="form-actions">
          <button type="button" onClick={validate}>
            {t("action.validate")}
          </button>
          <button type="button" onClick={importYAML}>
            {t("action.import")}
          </button>
          <button type="button" className="secondary-button" onClick={exportYAML}>
            {t("action.export")}
          </button>
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={includeSecrets}
              onChange={(event) => setIncludeSecrets(event.currentTarget.checked)}
            />
            {t("config.includeSecrets")}
          </label>
          {feedback ? <span className="feedback-inline">{feedback}</span> : null}
        </div>
      </section>

      <div className="section-grid">
        <section className="content-panel">
          <h2>{t("config.defaults")}</h2>
          <div className="form-grid">
            <FieldWithHint hintId="defaults-model-hint" hintPath="defaults.model">
              <label>
                {t("field.defaultModel")}
                <input
                  aria-describedby="defaults-model-hint"
                  name="defaults.model"
                  value={defaultsForm.model}
                  onChange={(event) => updateDefaults("model", event.currentTarget.value)}
                />
              </label>
            </FieldWithHint>
            <FieldWithHint hintId="defaults-max-tokens-hint" hintPath="defaults.max_tokens">
              <label>
                {t("field.maxTokens")}
                <input
                  aria-describedby="defaults-max-tokens-hint"
                  name="defaults.max_tokens"
                  type="number"
                  value={defaultsForm.max_tokens}
                  onChange={(event) => updateDefaults("max_tokens", event.currentTarget.value)}
                />
              </label>
            </FieldWithHint>
            <FieldWithHint className="form-grid__wide" hintId="defaults-system-prompt-hint" hintPath="defaults.system_prompt">
              <label>
                {t("field.systemPrompt")}
                <textarea
                  aria-describedby="defaults-system-prompt-hint"
                  name="defaults.system_prompt"
                  rows={5}
                  value={defaultsForm.system_prompt}
                  onChange={(event) => updateDefaults("system_prompt", event.currentTarget.value)}
                />
              </label>
            </FieldWithHint>
            <div className="form-actions">
              <button type="button" onClick={stageDefaults}>
                {t("action.stageDefaults")}
              </button>
            </div>
          </div>
        </section>

        <section className="content-panel">
          <h2>{t("config.webSearch")}</h2>
          <div className="form-grid">
            <FieldWithHint hintId="web-search-support-hint" hintPath="web_search.support">
              <label>
                {t("field.webSearchSupport")}
                <select
                  aria-describedby="web-search-support-hint"
                  name="web_search.support"
                  value={webSearchForm.support}
                  onChange={(event) => updateWebSearch("support", event.currentTarget.value)}
                >
                  <option value="auto">auto</option>
                  <option value="enabled">enabled</option>
                  <option value="disabled">disabled</option>
                  <option value="injected">injected</option>
                </select>
              </label>
            </FieldWithHint>
            <FieldWithHint hintId="web-search-max-uses-hint" hintPath="web_search.max_uses">
              <label>
                {t("field.maxUses")}
                <input
                  aria-describedby="web-search-max-uses-hint"
                  name="web_search.max_uses"
                  type="number"
                  value={webSearchForm.max_uses}
                  onChange={(event) => updateWebSearch("max_uses", event.currentTarget.value)}
                />
              </label>
            </FieldWithHint>
            <FieldWithHint hintId="web-search-tavily-api-key-hint" hintPath="web_search.tavily_api_key">
              <label>
                {t("field.tavilyApiKey")}
                <input
                  aria-describedby="web-search-tavily-api-key-hint"
                  name="web_search.tavily_api_key"
                  value={webSearchForm.tavily_api_key}
                  onChange={(event) => updateWebSearch("tavily_api_key", event.currentTarget.value)}
                />
              </label>
            </FieldWithHint>
            <FieldWithHint hintId="web-search-firecrawl-api-key-hint" hintPath="web_search.firecrawl_api_key">
              <label>
                {t("field.firecrawlApiKey")}
                <input
                  aria-describedby="web-search-firecrawl-api-key-hint"
                  name="web_search.firecrawl_api_key"
                  value={webSearchForm.firecrawl_api_key}
                  onChange={(event) => updateWebSearch("firecrawl_api_key", event.currentTarget.value)}
                />
              </label>
            </FieldWithHint>
            <FieldWithHint hintId="web-search-max-rounds-hint" hintPath="web_search.search_max_rounds">
              <label>
                {t("field.searchMaxRounds")}
                <input
                  aria-describedby="web-search-max-rounds-hint"
                  name="web_search.search_max_rounds"
                  type="number"
                  value={webSearchForm.search_max_rounds}
                  onChange={(event) => updateWebSearch("search_max_rounds", event.currentTarget.value)}
                />
              </label>
            </FieldWithHint>
            <div className="form-actions">
              <button type="button" onClick={stageWebSearch}>
                {t("action.stageWebSearch")}
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="content-panel">
        <h2>{t("config.effectiveSnapshot")}</h2>
        {effective.isLoading ? (
          <LoadingState label={t("config.loadingEffective")} />
        ) : effective.error ? (
          <QueryErrorState error={effective.error} />
        ) : (
          <pre className="json-block">{JSON.stringify(effective.data ?? {}, null, 2)}</pre>
        )}
      </section>
    </section>
  );

  function updateDefaults(field: keyof typeof defaultsForm, value: string) {
    setDefaultsForm((current) => ({ ...current, [field]: value }));
  }

  function updateWebSearch(field: keyof typeof webSearchForm, value: string) {
    setWebSearchForm((current) => ({ ...current, [field]: value }));
  }
}
