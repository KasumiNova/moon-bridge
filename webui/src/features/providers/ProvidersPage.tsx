import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { LoadingState } from "../../components/LoadingState";
import { ResourceTable } from "../../components/ResourceTable";
import { createOffer, listProviders, putProvider } from "../../rpc/management";
import { queryKeys } from "../../rpc/queryKeys";
import type { ProviderSummary } from "../../rpc/types";
import { defaultPage, formatNumber, PageHeader, QueryErrorState } from "../shared";

export function ProvidersPage() {
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
    return <LoadingState label="Loading providers" />;
  }

  return (
    <section className="page-stack" aria-labelledby="providers-title">
      <PageHeader eyebrow="Upstream" title="Providers">
        Provider endpoints, protocols, offer counts, and health labels.
      </PageHeader>
      <section className="content-panel">
        <ResourceTable<ProviderSummary>
          data={query.data?.data ?? []}
          emptyLabel="No providers configured"
          columns={[
            { header: "Key", accessor: (row) => row.key },
            { header: "Protocol", accessor: (row) => <span className="status-pill">{row.protocol}</span> },
            { header: "Base URL", accessor: (row) => row.base_url },
            { header: "Offers", accessor: (row) => formatNumber(row.offer_count) },
            { header: "Health", accessor: (row) => row.health_status },
            {
              header: "Test",
              accessor: (row) =>
                row.protocol === "anthropic" ? "Anthropic probe" : "Not available"
            }
          ]}
        />
      </section>
      <section className="section-grid">
        <section className="content-panel">
          <h2>Stage Provider</h2>
          <form className="form-grid" onSubmit={stageProvider}>
            <label>
              Key
              <input
                value={providerForm.key}
                onChange={(event) => updateProvider("key", event.currentTarget.value)}
                required
              />
            </label>
            <label>
              Protocol
              <select
                value={providerForm.protocol}
                onChange={(event) => updateProvider("protocol", event.currentTarget.value)}
              >
                <option value="anthropic">anthropic</option>
                <option value="openai">openai</option>
                <option value="google">google</option>
              </select>
            </label>
            <label className="form-grid__wide">
              Base URL
              <input
                value={providerForm.base_url}
                onChange={(event) => updateProvider("base_url", event.currentTarget.value)}
                required
              />
            </label>
            <label>
              API Key
              <input
                type="password"
                value={providerForm.api_key}
                onChange={(event) => updateProvider("api_key", event.currentTarget.value)}
                required
              />
            </label>
            <label>
              Version
              <input
                value={providerForm.version}
                onChange={(event) => updateProvider("version", event.currentTarget.value)}
              />
            </label>
            <label className="form-grid__wide">
              User Agent
              <input
                value={providerForm.user_agent}
                onChange={(event) => updateProvider("user_agent", event.currentTarget.value)}
              />
            </label>
            <div className="form-actions">
              <button type="submit">Stage provider</button>
              {feedback ? <span className="feedback-inline">{feedback}</span> : null}
            </div>
          </form>
        </section>

        <section className="content-panel">
          <h2>Stage Offer</h2>
          <form className="form-grid" onSubmit={stageOffer}>
            <label>
              Provider Key
              <input
                value={offerForm.provider_key || providerForm.key}
                onChange={(event) => updateOffer("provider_key", event.currentTarget.value)}
              />
            </label>
            <label>
              Offer Model
              <input
                value={offerForm.model}
                onChange={(event) => updateOffer("model", event.currentTarget.value)}
                required
              />
            </label>
            <label className="form-grid__wide">
              Upstream Name
              <input
                value={offerForm.upstream_name}
                onChange={(event) => updateOffer("upstream_name", event.currentTarget.value)}
              />
            </label>
            <label>
              Priority
              <input
                type="number"
                value={offerForm.priority}
                onChange={(event) => updateOffer("priority", event.currentTarget.value)}
              />
            </label>
            <label>
              Input Price
              <input
                type="number"
                value={offerForm.input_price}
                onChange={(event) => updateOffer("input_price", event.currentTarget.value)}
              />
            </label>
            <label>
              Output Price
              <input
                type="number"
                value={offerForm.output_price}
                onChange={(event) => updateOffer("output_price", event.currentTarget.value)}
              />
            </label>
            <div className="form-actions">
              <button type="submit">Stage offer</button>
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
    setFeedback(`Staged change #${result.change_id}`);
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
    setFeedback(`Staged change #${result.change_id}`);
  }
}
