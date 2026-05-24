import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { LoadingState } from "../../components/LoadingState";
import { ResourceTable } from "../../components/ResourceTable";
import { listModels, putModel } from "../../rpc/management";
import { queryKeys } from "../../rpc/queryKeys";
import type { ModelSummary } from "../../rpc/types";
import { defaultPage, FieldWithHint, formatNumber, PageHeader, QueryErrorState } from "../shared";
import { useI18n } from "../../i18n/I18nProvider";

export function ModelsPage() {
  const { t } = useI18n();
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
    return <LoadingState label={t("loading.models")} />;
  }

  return (
    <section className="page-stack" aria-labelledby="models-title">
      <PageHeader eyebrow={t("pageEyebrow.catalog")} title={t("nav.models")}>
        {t("models.description")}
      </PageHeader>
      <section className="content-panel">
        <ResourceTable<ModelSummary>
          data={query.data?.data ?? []}
          emptyLabel={t("empty.models")}
          columns={[
            { header: t("field.slug"), accessor: (row) => row.slug },
            { header: t("field.displayName"), accessor: (row) => row.display_name ?? "-" },
            {
              header: t("field.contextWindow"),
              accessor: (row) => formatNumber(row.context_window)
            },
            {
              header: t("overview.providers"),
              accessor: (row) => row.providers.length > 0 ? row.providers.join(", ") : "-"
            }
          ]}
        />
      </section>
      <section className="content-panel">
        <h2>{t("models.stage")}</h2>
        <form className="form-grid" onSubmit={stageModel}>
          <label>
            {t("field.slug")}
            <input
              value={form.slug}
              onChange={(event) => update("slug", event.currentTarget.value)}
              required
            />
          </label>
          <label>
            {t("field.displayName")}
            <input
              value={form.display_name}
              onChange={(event) => update("display_name", event.currentTarget.value)}
            />
          </label>
          <label className="form-grid__wide">
            {t("field.description")}
            <input
              value={form.description}
              onChange={(event) => update("description", event.currentTarget.value)}
            />
          </label>
          <FieldWithHint hintId="model-context-window-hint" hintPath="models.<slug>.context_window">
            <label>
              {t("field.contextWindow")}
              <input
                aria-describedby="model-context-window-hint"
                type="number"
                min="1"
                value={form.context_window}
                onChange={(event) => update("context_window", event.currentTarget.value)}
              />
            </label>
          </FieldWithHint>
          <FieldWithHint hintId="model-max-output-tokens-hint" hintPath="models.<slug>.max_output_tokens">
            <label>
              {t("field.maxOutputTokens")}
              <input
                aria-describedby="model-max-output-tokens-hint"
                type="number"
                min="1"
                value={form.max_output_tokens}
                onChange={(event) => update("max_output_tokens", event.currentTarget.value)}
              />
            </label>
          </FieldWithHint>
          <div className="form-actions">
            <button type="submit">{t("action.stageModel")}</button>
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
    setFeedback(t("feedback.stagedChange", { id: result.change_id }));
  }
}
