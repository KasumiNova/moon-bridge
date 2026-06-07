import { LoadingState } from "../../components/LoadingState";
import { useI18n } from "../../i18n/I18nProvider";
import type { ConfigResource, ResourceKind } from "../../rpc/types";
import { GraphResourceField } from "../configGraph/GraphResourceField";
import { useConfigGraph } from "../configGraph/useConfigGraph";
import { PageHeader, QueryErrorState } from "../shared";

export function SearchToolsPage() {
  const { t } = useI18n();
  const graph = useConfigGraph();

  if (graph.error) {
    return <QueryErrorState error={graph.error} />;
  }
  if (graph.isLoading || !graph.data) {
    return <LoadingState label={t("common.loading")} />;
  }

  const webSearch = graph.data.resources.find((resource) => resource.kind === "web_search");
  const extensions = graph.data.resources.filter((resource) => resource.kind === "extension");
  const proxy = graph.data.resources.find((resource) => resource.kind === "proxy");

  return (
    <section className="page-stack" aria-labelledby="search-tools-title">
      <PageHeader eyebrow={t("pageEyebrow.config")} title={t("nav.searchTools")}>
        {t("modelsProviders.description")}
      </PageHeader>

      {webSearch ? <ResourceSection resource={webSearch} revision={graph.data.revision} title="Web Search" /> : null}

      <section className="content-panel" aria-labelledby="extensions-heading">
        <h2 id="extensions-heading">Extensions</h2>
        <div className="resource-card-list">
          {extensions.map((extension) => (
            <ResourceEditor key={extension.id} resource={extension} revision={graph.data.revision} />
          ))}
        </div>
      </section>

      {proxy ? <ResourceSection resource={proxy} revision={graph.data.revision} title="Proxy" /> : null}
    </section>
  );
}

function ResourceSection({
  resource,
  revision,
  title
}: {
  resource: ConfigResource;
  revision: string;
  title: string;
}) {
  return (
    <section className="content-panel" aria-label={title}>
      <h2>{title}</h2>
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

function ResourceEditor({
  resource,
  revision
}: {
  resource: ConfigResource;
  revision: string;
}) {
  return (
    <section className="resource-editor" aria-label={resource.id}>
      <h3>{resource.id}</h3>
      <div className="form-grid">
        {resource.schema.fields.map((field) => (
          <GraphResourceField
            field={field}
            key={`${resource.kind as ResourceKind}-${resource.id}-${field.path}`}
            resource={resource}
            revision={revision}
          />
        ))}
      </div>
    </section>
  );
}
