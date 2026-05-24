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
import { PageHeader, QueryErrorState } from "../shared";
import { ConfigGenerator } from "./ConfigGenerator";

const defaultYAML = "mode: Transform\n";

export function ConfigPage() {
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
    setFeedback(result.valid ? "Valid config" : `Invalid config: ${(result.errors ?? []).join("; ")}`);
  }

  async function importYAML() {
    const result = await importConfig(yaml);
    setFeedback(result.message || `${result.count} changes staged`);
  }

  async function exportYAML() {
    const exported = await exportConfig({ includeSecrets });
    setYAML(exported);
    setFeedback(includeSecrets ? "Exported with secrets" : "Exported masked config");
  }

  async function stageDefaults() {
    const result = await putDefaults({
      model: defaultsForm.model,
      max_tokens: Number(defaultsForm.max_tokens),
      system_prompt: defaultsForm.system_prompt
    });
    setFeedback(`Staged change #${result.change_id}`);
  }

  async function stageWebSearch() {
    const result = await putWebSearch({
      support: webSearchForm.support,
      max_uses: Number(webSearchForm.max_uses),
      tavily_api_key: webSearchForm.tavily_api_key,
      firecrawl_api_key: webSearchForm.firecrawl_api_key,
      search_max_rounds: Number(webSearchForm.search_max_rounds)
    });
    setFeedback(`Staged change #${result.change_id}`);
  }

  return (
    <section className="page-stack" aria-labelledby="config-title">
      <PageHeader eyebrow="Configuration" title="Config">
        Generate, validate, import, export, and stage Moon Bridge YAML configuration.
      </PageHeader>

      <section className="content-panel">
        <h2>Visual Generator</h2>
        <ConfigGenerator onGenerate={setYAML} />
      </section>

      <section className="content-panel">
        <h2>YAML Preview and Import</h2>
        <label className="textarea-field">
          YAML Editor
          <textarea
            value={yaml}
            onChange={(event) => setYAML(event.currentTarget.value)}
            rows={18}
          />
        </label>
        <div className="form-actions">
          <button type="button" onClick={validate}>
            Validate
          </button>
          <button type="button" onClick={importYAML}>
            Import
          </button>
          <button type="button" className="secondary-button" onClick={exportYAML}>
            Export
          </button>
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={includeSecrets}
              onChange={(event) => setIncludeSecrets(event.currentTarget.checked)}
            />
            Include secrets
          </label>
          {feedback ? <span className="feedback-inline">{feedback}</span> : null}
        </div>
      </section>

      <div className="section-grid">
        <section className="content-panel">
          <h2>Defaults</h2>
          <div className="form-grid">
            <label>
              Default Model
              <input
                value={defaultsForm.model}
                onChange={(event) => updateDefaults("model", event.currentTarget.value)}
              />
            </label>
            <label>
              Max Tokens
              <input
                type="number"
                value={defaultsForm.max_tokens}
                onChange={(event) => updateDefaults("max_tokens", event.currentTarget.value)}
              />
            </label>
            <label className="form-grid__wide">
              System Prompt
              <textarea
                rows={5}
                value={defaultsForm.system_prompt}
                onChange={(event) => updateDefaults("system_prompt", event.currentTarget.value)}
              />
            </label>
            <div className="form-actions">
              <button type="button" onClick={stageDefaults}>
                Stage defaults
              </button>
            </div>
          </div>
        </section>

        <section className="content-panel">
          <h2>Web Search</h2>
          <div className="form-grid">
            <label>
              Web Search Support
              <select
                value={webSearchForm.support}
                onChange={(event) => updateWebSearch("support", event.currentTarget.value)}
              >
                <option value="auto">auto</option>
                <option value="enabled">enabled</option>
                <option value="disabled">disabled</option>
                <option value="injected">injected</option>
              </select>
            </label>
            <label>
              Max Uses
              <input
                type="number"
                value={webSearchForm.max_uses}
                onChange={(event) => updateWebSearch("max_uses", event.currentTarget.value)}
              />
            </label>
            <label>
              Tavily API Key
              <input
                value={webSearchForm.tavily_api_key}
                onChange={(event) => updateWebSearch("tavily_api_key", event.currentTarget.value)}
              />
            </label>
            <label>
              Firecrawl API Key
              <input
                value={webSearchForm.firecrawl_api_key}
                onChange={(event) => updateWebSearch("firecrawl_api_key", event.currentTarget.value)}
              />
            </label>
            <label>
              Search Max Rounds
              <input
                type="number"
                value={webSearchForm.search_max_rounds}
                onChange={(event) => updateWebSearch("search_max_rounds", event.currentTarget.value)}
              />
            </label>
            <div className="form-actions">
              <button type="button" onClick={stageWebSearch}>
                Stage web search
              </button>
            </div>
          </div>
        </section>
      </div>

      <section className="content-panel">
        <h2>Effective Config Snapshot</h2>
        {effective.isLoading ? (
          <LoadingState label="Loading effective config" />
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
