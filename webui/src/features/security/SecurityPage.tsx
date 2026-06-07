import { LoadingState } from "../../components/LoadingState";
import { useI18n } from "../../i18n/I18nProvider";
import type { ConfigResource } from "../../rpc/types";
import { GraphResourceField } from "../configGraph/GraphResourceField";
import { useConfigGraph } from "../configGraph/useConfigGraph";
import { PageHeader, QueryErrorState } from "../shared";

export function SecurityPage() {
  const { t } = useI18n();
  const graph = useConfigGraph();

  if (graph.error) {
    return <QueryErrorState error={graph.error} />;
  }
  if (graph.isLoading || !graph.data) {
    return <LoadingState label={t("common.loading")} />;
  }

  const server = graph.data.resources.find((resource) => resource.kind === "server");

  return (
    <section className="page-stack" aria-labelledby="security-title">
      <PageHeader eyebrow={t("pageEyebrow.config")} title={t("nav.security")}>
        Server access and session controls.
      </PageHeader>

      {server ? <ServerSection resource={server} revision={graph.data.revision} /> : null}
    </section>
  );
}

function ServerSection({
  resource,
  revision
}: {
  resource: ConfigResource;
  revision: string;
}) {
  return (
    <section className="content-panel" aria-label="Server">
      <h2>Server</h2>
      {resource.status === "restartRequired" || !resource.hotReloadable ? (
        <p className="edit-state-banner">Restart required</p>
      ) : null}
      <div className="form-grid">
        {resource.schema.fields.map((field) => (
          <GraphResourceField
            field={field}
            key={`${resource.kind}-${resource.id}-${field.path}`}
            resource={resource}
            revision={revision}
          />
        ))}
      </div>
    </section>
  );
}
