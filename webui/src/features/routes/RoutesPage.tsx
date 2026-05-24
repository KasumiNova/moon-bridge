import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { LoadingState } from "../../components/LoadingState";
import { ResourceTable } from "../../components/ResourceTable";
import { listRoutes, putRoute } from "../../rpc/management";
import { queryKeys } from "../../rpc/queryKeys";
import type { RouteSummary } from "../../rpc/types";
import { defaultPage, PageHeader, QueryErrorState } from "../shared";

export function RoutesPage() {
  const [form, setForm] = useState({
    alias: "",
    model: "",
    provider: "",
    display_name: "",
    context_window: "128000"
  });
  const [feedback, setFeedback] = useState("");
  const query = useQuery({
    queryKey: queryKeys.routes(defaultPage),
    queryFn: () => listRoutes(defaultPage)
  });

  if (query.error) {
    return <QueryErrorState error={query.error} />;
  }
  if (query.isLoading) {
    return <LoadingState label="Loading routes" />;
  }

  return (
    <section className="page-stack" aria-labelledby="routes-title">
      <PageHeader eyebrow="Aliases" title="Routes">
        Route aliases mapped to provider/model pairs. Read values may include upstream model names.
      </PageHeader>
      <section className="content-panel">
        <ResourceTable<RouteSummary>
          data={query.data?.data ?? []}
          emptyLabel="No routes configured"
          columns={[
            { header: "Alias", accessor: (row) => row.alias },
            { header: "Model", accessor: (row) => row.model },
            { header: "Provider", accessor: (row) => row.provider },
            { header: "Display Name", accessor: (row) => row.display_name ?? "-" }
          ]}
        />
      </section>
      <section className="content-panel">
        <h2>Stage Route</h2>
        <form className="form-grid" onSubmit={stageRoute}>
          <label>
            Alias
            <input
              value={form.alias}
              onChange={(event) => update("alias", event.currentTarget.value)}
              required
            />
          </label>
          <label>
            Model
            <input
              value={form.model}
              onChange={(event) => update("model", event.currentTarget.value)}
              required
            />
          </label>
          <label>
            Provider
            <input
              value={form.provider}
              onChange={(event) => update("provider", event.currentTarget.value)}
            />
          </label>
          <label>
            Display Name
            <input
              value={form.display_name}
              onChange={(event) => update("display_name", event.currentTarget.value)}
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
          <div className="form-actions">
            <button type="submit">Stage route</button>
            {feedback ? <span className="feedback-inline">{feedback}</span> : null}
          </div>
        </form>
      </section>
    </section>
  );

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function stageRoute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await putRoute(form.alias.trim(), {
      model: form.model,
      provider: form.provider,
      display_name: form.display_name,
      context_window: Number(form.context_window)
    });
    setFeedback(`Staged change #${result.change_id}`);
  }
}
