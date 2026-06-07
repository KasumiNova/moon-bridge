import { LoadingState } from "../../components/LoadingState";
import { useI18n } from "../../i18n/I18nProvider";
import type { ConfigResource } from "../../rpc/types";
import { ResourceEditorCard } from "../configGraph/ResourceEditorCard";
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
        {t("searchTools.description")}
      </PageHeader>

      {webSearch ? (
        <ResourceSection
          resource={webSearch}
          revision={graph.data.revision}
          title={t("searchTools.webSearch")}
        />
      ) : null}

      <section className="content-panel" aria-labelledby="extensions-heading">
        <h2 id="extensions-heading">{t("searchTools.extensions")}</h2>
        <div className="resource-card-list">
          {extensions.map((extension) => (
            <ResourceEditorCard
              ariaLabel={`${t("searchTools.extension")} ${extension.id}`}
              key={extension.id}
              resource={extension}
              revision={graph.data.revision}
              title={t("searchTools.extension")}
            />
          ))}
        </div>
      </section>

      {proxy ? (
        <ResourceSection
          resource={proxy}
          revision={graph.data.revision}
          title={t("searchTools.proxy")}
        />
      ) : null}
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
      <ResourceEditorCard
        ariaLabel={`${title} ${resource.id}`}
        resource={resource}
        revision={revision}
        title={title}
      />
    </section>
  );
}
