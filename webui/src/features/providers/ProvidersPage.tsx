import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { LoadingState } from "../../components/LoadingState";
import { ResourceTable } from "../../components/ResourceTable";
import { createOffer, listProviders, putProvider } from "../../rpc/management";
import { queryKeys } from "../../rpc/queryKeys";
import type { ProviderSummary } from "../../rpc/types";
import { defaultPage, FieldWithHint, formatNumber, PageHeader, QueryErrorState } from "../shared";
import { useI18n } from "../../i18n/I18nProvider";

export function ProvidersPage() {
  const { t } = useI18n();
  const [providerForm, setProviderForm] = useState({
    key: "",
    base_url: "",
    api_key: "",
    version: "",
    protocol: "anthropic",
    user_agent: ""
  });
  const [offerForm, setOfferForm] = useState({
    provider_key: "",
    model: "",
    upstream_name: "",
    priority: "0",
    input_price: "0",
    output_price: "0",
    cache_write: "0",
    cache_read: "0"
  });
  const [feedback, setFeedback] = useState("");
  const query = useQuery({
    queryKey: queryKeys.providers(defaultPage),
    queryFn: () => listProviders(defaultPage)
  });

  if (query.error) {
    return <QueryErrorState error={query.error} />;
  }
  if (query.isLoading) {
    return <LoadingState label={t("loading.providers")} />;
  }

  return (
    <section className="page-stack" aria-labelledby="providers-title">
      <PageHeader eyebrow={t("pageEyebrow.upstream")} title={t("nav.providers")}>
        {t("providers.description")}
      </PageHeader>
      <section className="content-panel">
        <ResourceTable<ProviderSummary>
          data={query.data?.data ?? []}
          emptyLabel={t("empty.providers")}
          columns={[
            { header: t("field.key"), accessor: (row) => row.key },
            { header: t("field.protocol"), accessor: (row) => <span className="status-pill">{row.protocol}</span> },
            { header: t("field.baseUrl"), accessor: (row) => row.base_url },
            { header: t("field.offers"), accessor: (row) => formatNumber(row.offer_count) },
            { header: t("field.health"), accessor: (row) => row.health_status },
            {
              header: t("field.test"),
              accessor: (row) =>
                row.protocol === "anthropic" ? t("providers.anthropicProbe") : t("common.notAvailable")
            }
          ]}
        />
      </section>
      <section className="section-grid">
        <section className="content-panel">
          <h2>{t("providers.stageProvider")}</h2>
          <form className="form-grid" onSubmit={stageProvider}>
            <label>
              {t("field.key")}
              <input
                value={providerForm.key}
                onChange={(event) => updateProvider("key", event.currentTarget.value)}
                required
              />
            </label>
            <FieldWithHint hintId="provider-protocol-hint" hintPath="providers.<key>.protocol">
              <label>
                {t("field.protocol")}
                <select
                  aria-describedby="provider-protocol-hint"
                  value={providerForm.protocol}
                  onChange={(event) => updateProvider("protocol", event.currentTarget.value)}
                >
                  <option value="anthropic">anthropic</option>
                  <option value="openai-response">openai-response</option>
                  <option value="google-genai">google-genai</option>
                  <option value="openai-chat">openai-chat</option>
                </select>
              </label>
            </FieldWithHint>
            <FieldWithHint className="form-grid__wide" hintId="provider-base-url-hint" hintPath="providers.<key>.base_url">
              <label>
                {t("field.baseUrl")}
                <input
                  aria-describedby="provider-base-url-hint"
                  value={providerForm.base_url}
                  onChange={(event) => updateProvider("base_url", event.currentTarget.value)}
                  required
                />
              </label>
            </FieldWithHint>
            <FieldWithHint hintId="provider-api-key-hint" hintPath="providers.<key>.api_key">
              <label>
                {t("field.apiKey")}
                <input
                  aria-describedby="provider-api-key-hint"
                  type="password"
                  value={providerForm.api_key}
                  onChange={(event) => updateProvider("api_key", event.currentTarget.value)}
                  required
                />
              </label>
            </FieldWithHint>
            <FieldWithHint hintId="provider-version-hint" hintPath="providers.<key>.version">
              <label>
                {t("field.version")}
                <input
                  aria-describedby="provider-version-hint"
                  value={providerForm.version}
                  onChange={(event) => updateProvider("version", event.currentTarget.value)}
                />
              </label>
            </FieldWithHint>
            <FieldWithHint className="form-grid__wide" hintId="provider-user-agent-hint" hintPath="providers.<key>.user_agent">
              <label>
                {t("field.userAgent")}
                <input
                  aria-describedby="provider-user-agent-hint"
                  value={providerForm.user_agent}
                  onChange={(event) => updateProvider("user_agent", event.currentTarget.value)}
                />
              </label>
            </FieldWithHint>
            <div className="form-actions">
              <button type="submit">{t("action.stageProvider")}</button>
              {feedback ? <span className="feedback-inline">{feedback}</span> : null}
            </div>
          </form>
        </section>

        <section className="content-panel">
          <h2>{t("providers.stageOffer")}</h2>
          <form className="form-grid" onSubmit={stageOffer}>
            <label>
              {t("field.providerKey")}
              <input
                value={offerForm.provider_key || providerForm.key}
                onChange={(event) => updateOffer("provider_key", event.currentTarget.value)}
              />
            </label>
            <FieldWithHint hintId="offer-model-hint" hintPath="providers.<key>.offers[].model">
              <label>
                {t("field.offerModel")}
                <input
                  aria-describedby="offer-model-hint"
                  value={offerForm.model}
                  onChange={(event) => updateOffer("model", event.currentTarget.value)}
                  required
                />
              </label>
            </FieldWithHint>
            <FieldWithHint className="form-grid__wide" hintId="offer-upstream-name-hint" hintPath="providers.<key>.offers[].upstream_name">
              <label>
                {t("field.upstreamName")}
                <input
                  aria-describedby="offer-upstream-name-hint"
                  value={offerForm.upstream_name}
                  onChange={(event) => updateOffer("upstream_name", event.currentTarget.value)}
                />
              </label>
            </FieldWithHint>
            <label>
              {t("field.priority")}
              <input
                type="number"
                value={offerForm.priority}
                onChange={(event) => updateOffer("priority", event.currentTarget.value)}
              />
            </label>
            <label>
              {t("field.inputPrice")}
              <input
                type="number"
                value={offerForm.input_price}
                onChange={(event) => updateOffer("input_price", event.currentTarget.value)}
              />
            </label>
            <label>
              {t("field.outputPrice")}
              <input
                type="number"
                value={offerForm.output_price}
                onChange={(event) => updateOffer("output_price", event.currentTarget.value)}
              />
            </label>
            <div className="form-actions">
              <button type="submit">{t("action.stageOffer")}</button>
            </div>
          </form>
        </section>
      </section>
    </section>
  );

  function updateProvider(field: keyof typeof providerForm, value: string) {
    setProviderForm((current) => ({ ...current, [field]: value }));
  }

  function updateOffer(field: keyof typeof offerForm, value: string) {
    setOfferForm((current) => ({ ...current, [field]: value }));
  }

  async function stageProvider(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await putProvider(providerForm.key.trim(), {
      base_url: providerForm.base_url,
      api_key: providerForm.api_key,
      protocol: providerForm.protocol,
      version: providerForm.version,
      user_agent: providerForm.user_agent
    });
    setFeedback(t("feedback.stagedChange", { id: result.change_id }));
  }

  async function stageOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const providerKey = (offerForm.provider_key || providerForm.key).trim();
    const result = await createOffer(providerKey, {
      model: offerForm.model,
      upstream_name: offerForm.upstream_name,
      priority: Number(offerForm.priority),
      input_price: Number(offerForm.input_price),
      output_price: Number(offerForm.output_price),
      cache_write: Number(offerForm.cache_write),
      cache_read: Number(offerForm.cache_read)
    });
    setFeedback(t("feedback.stagedChange", { id: result.change_id }));
  }
}
