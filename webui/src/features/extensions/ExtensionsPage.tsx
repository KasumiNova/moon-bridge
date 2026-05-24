import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LoadingState } from "../../components/LoadingState";
import { getExtension, listExtensions, putExtension } from "../../rpc/management";
import { PageHeader, QueryErrorState } from "../shared";

export function ExtensionsPage() {
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
    return <LoadingState label="Loading extensions" />;
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
    setFeedback(`Staged change #${result.change_id}`);
  }

  return (
    <section className="page-stack" aria-labelledby="extensions-title">
      <PageHeader eyebrow="Extensions" title="Extensions">
        Inspect extension config as JSON and stage safe updates through the management API.
      </PageHeader>
      <div className="section-grid">
        <section className="content-panel">
          <h2>Installed Extensions</h2>
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
            <p className="empty-state">No extensions registered</p>
          )}
        </section>
        <section className="content-panel">
          <h2>JSON Editor</h2>
          {detail.isFetching && selected ? <p className="empty-state">Refreshing {selected}</p> : null}
          <label className="textarea-field">
            Extension JSON
            <textarea
              value={editorValue}
              onChange={(event) => setEditorValue(event.currentTarget.value)}
              rows={18}
            />
          </label>
          <div className="form-actions">
            <button type="button" onClick={stageExtension} disabled={!selected}>
              Stage extension
            </button>
            {feedback ? <span className="feedback-inline">{feedback}</span> : null}
          </div>
        </section>
      </div>
    </section>
  );
}
