import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LoadingState } from "../../components/LoadingState";
import { getExtension, listExtensions, putExtension } from "../../rpc/management";
import { FieldWithHint, PageHeader, QueryErrorState } from "../shared";
import { useI18n } from "../../i18n/I18nProvider";

export function ExtensionsPage() {
  const { t } = useI18n();
  const [selected, setSelected] = useState("");
  const [editorValue, setEditorValue] = useState("{}");
  const [feedback, setFeedback] = useState("");
  const extensions = useQuery({
    queryKey: ["extensions"],
    queryFn: listExtensions
  });
  const detail = useQuery({
    queryKey: ["extensions", selected],
    queryFn: () => getExtension(selected),
    enabled: Boolean(selected)
  });

  if (extensions.error) {
    return <QueryErrorState error={extensions.error} />;
  }
  if (extensions.isLoading) {
    return <LoadingState label={t("loading.extensions")} />;
  }

  async function selectExtension(name: string) {
    setSelected(name);
    setFeedback("");
    const value = await getExtension(name);
    setEditorValue(JSON.stringify(value, null, 2));
  }

  async function stageExtension() {
    const parsed = JSON.parse(editorValue);
    const result = await putExtension(selected, parsed);
    setFeedback(t("feedback.stagedChange", { id: result.change_id }));
  }

  return (
    <section className="page-stack" aria-labelledby="extensions-title">
      <PageHeader eyebrow={t("nav.extensions")} title={t("nav.extensions")}>
        {t("extensions.description")}
      </PageHeader>
      <div className="section-grid">
        <section className="content-panel">
          <h2>{t("extensions.installed")}</h2>
          {(extensions.data?.length ?? 0) > 0 ? (
            <div className="button-list">
              {extensions.data?.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={name === selected ? "secondary-button active-button" : "secondary-button"}
                  onClick={() => void selectExtension(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          ) : (
            <p className="empty-state">{t("empty.extensions")}</p>
          )}
        </section>
        <section className="content-panel">
          <h2>{t("extensions.jsonEditor")}</h2>
          {detail.isFetching && selected ? <p className="empty-state">{t("extensions.refreshing", { name: selected })}</p> : null}
          <FieldWithHint className="textarea-field" hintId="extension-json-hint" hintPath="extensions.<name>.config">
            <label>
              {t("field.extensionJson")}
              <textarea
                aria-describedby="extension-json-hint"
                name="extensions.config"
                value={editorValue}
                onChange={(event) => setEditorValue(event.currentTarget.value)}
                rows={18}
              />
            </label>
          </FieldWithHint>
          <div className="form-actions">
            <button type="button" onClick={stageExtension} disabled={!selected}>
              {t("action.stageExtension")}
            </button>
            {feedback ? <span className="feedback-inline">{feedback}</span> : null}
          </div>
        </section>
      </div>
    </section>
  );
}
