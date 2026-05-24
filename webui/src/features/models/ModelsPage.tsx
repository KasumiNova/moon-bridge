import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { LoadingState } from "../../components/LoadingState";
import { ResourceTable } from "../../components/ResourceTable";
import { listModels, putModel } from "../../rpc/management";
import { queryKeys } from "../../rpc/queryKeys";
import type { ModelSummary } from "../../rpc/types";
import { defaultPage, formatNumber, PageHeader, QueryErrorState } from "../shared";

export function ModelsPage() {
  const [form, setForm] = useState({
    slug: "",
    display_name: "",
    description: "",
    context_window: "128000",
    max_output_tokens: "4096"
  });
  const [feedback, setFeedback] = useState("");
  const query = useQuery({
    queryKey: queryKeys.models(defaultPage),
    queryFn: () => listModels(defaultPage)
  });

  if (query.error) {
    return <QueryErrorState error={query.error} />;
  }
  if (query.isLoading) {
    return <LoadingState label="Loading models" />;
  }

  return (
    <section className="page-stack" aria-labelledby="models-title">
      <PageHeader eyebrow="Catalog" title="Models">
        Runtime model definitions and provider availability from the management API.
      </PageHeader>
      <section className="content-panel">
        <ResourceTable<ModelSummary>
          data={query.data?.data ?? []}
          emptyLabel="No models configured"
          columns={[
            { header: "Slug", accessor: (row) => row.slug },
            { header: "Display Name", accessor: (row) => row.display_name ?? "-" },
            {
              header: "Context",
              accessor: (row) => formatNumber(row.context_window)
            },
            {
              header: "Providers",
              accessor: (row) => row.providers.length > 0 ? row.providers.join(", ") : "-"
            }
          ]}
        />
      </section>
      <section className="content-panel">
        <h2>Stage Model</h2>
        <form className="form-grid" onSubmit={stageModel}>
          <label>
            Slug
            <input
              value={form.slug}
              onChange={(event) => update("slug", event.currentTarget.value)}
              required
            />
          </label>
          <label>
            Display Name
            <input
              value={form.display_name}
              onChange={(event) => update("display_name", event.currentTarget.value)}
            />
          </label>
          <label className="form-grid__wide">
            Description
            <input
              value={form.description}
              onChange={(event) => update("description", event.currentTarget.value)}
            />
          </label>
          <label>
            Context Window
            <input
              type="number"
              min="1"
              value={form.context_window}
              onChange={(event) => update("context_window", event.currentTarget.value)}
            />
          </label>
          <label>
            Max Output Tokens
            <input
              type="number"
              min="1"
              value={form.max_output_tokens}
              onChange={(event) => update("max_output_tokens", event.currentTarget.value)}
            />
          </label>
          <div className="form-actions">
            <button type="submit">Stage model</button>
            {feedback ? <span className="feedback-inline">{feedback}</span> : null}
          </div>
        </form>
      </section>
    </section>
  );

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function stageModel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await putModel(form.slug.trim(), {
      display_name: form.display_name,
      description: form.description,
      context_window: Number(form.context_window),
      max_output_tokens: Number(form.max_output_tokens)
    });
    setFeedback(`Staged change #${result.change_id}`);
  }
}
