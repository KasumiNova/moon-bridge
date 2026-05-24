import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { LoadingState } from "../../components/LoadingState";
import { ResourceTable } from "../../components/ResourceTable";
import { listRoutes, putRoute } from "../../rpc/management";
import { queryKeys } from "../../rpc/queryKeys";
import type { RouteSummary } from "../../rpc/types";
import { defaultPage, FieldWithHint, PageHeader, QueryErrorState } from "../shared";
import { useI18n } from "../../i18n/I18nProvider";

export function RoutesPage() {
  const { t } = useI18n();
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
    return <LoadingState label={t("loading.routes")} />;
  }

  return (
    <section className="page-stack" aria-labelledby="routes-title">
      <PageHeader eyebrow={t("pageEyebrow.aliases")} title={t("nav.routes")}>
        {t("routes.description")}
      </PageHeader>
      <section className="content-panel">
        <ResourceTable<RouteSummary>
          data={query.data?.data ?? []}
          emptyLabel={t("empty.routes")}
          columns={[
            { header: t("field.alias"), accessor: (row) => row.alias },
            { header: t("field.model"), accessor: (row) => row.model },
            { header: t("field.provider"), accessor: (row) => row.provider },
            { header: t("field.displayName"), accessor: (row) => row.display_name ?? "-" }
          ]}
        />
      </section>
      <section className="content-panel">
        <h2>{t("routes.stage")}</h2>
        <form className="form-grid" onSubmit={stageRoute}>
          <label>
            {t("field.alias")}
            <input
              value={form.alias}
              onChange={(event) => update("alias", event.currentTarget.value)}
              required
            />
          </label>
          <FieldWithHint hintId="route-model-hint" hintPath="routes.<alias>.model">
            <label>
              {t("field.model")}
              <input
                aria-describedby="route-model-hint"
                value={form.model}
                onChange={(event) => update("model", event.currentTarget.value)}
                required
              />
            </label>
          </FieldWithHint>
          <FieldWithHint hintId="route-provider-hint" hintPath="routes.<alias>.provider">
            <label>
              {t("field.provider")}
              <input
                aria-describedby="route-provider-hint"
                value={form.provider}
                onChange={(event) => update("provider", event.currentTarget.value)}
              />
            </label>
          </FieldWithHint>
          <label>
            {t("field.displayName")}
            <input
              value={form.display_name}
              onChange={(event) => update("display_name", event.currentTarget.value)}
            />
          </label>
          <label>
            {t("field.contextWindow")}
            <input
              type="number"
              min="1"
              value={form.context_window}
              onChange={(event) => update("context_window", event.currentTarget.value)}
            />
          </label>
          <div className="form-actions">
            <button type="submit">{t("action.stageRoute")}</button>
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
    setFeedback(t("feedback.stagedChange", { id: result.change_id }));
  }
}
