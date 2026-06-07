import { LoadingState } from "../../components/LoadingState";
import { useI18n } from "../../i18n/I18nProvider";
import type { ConfigResource } from "../../rpc/types";
import { ResourceEditorCard } from "../configGraph/ResourceEditorCard";
import { useConfigGraph } from "../configGraph/useConfigGraph";
import { PageHeader, QueryErrorState } from "../shared";

export function RoutesPage() {
  const { t } = useI18n();
  const graph = useConfigGraph();

  if (graph.error) {
    return <QueryErrorState error={graph.error} />;
  }
  if (graph.isLoading || !graph.data) {
    return <LoadingState label={t("loading.routes")} />;
  }

  const routes = graph.data.resources.filter((resource) => resource.kind === "route");

  return (
    <section className="page-stack" aria-labelledby="routes-title">
      <PageHeader eyebrow={t("pageEyebrow.aliases")} title={t("nav.routes")}>
        {t("routes.description")}
      </PageHeader>

      {routes.map((route) => (
        <RouteEditor key={route.id} resource={route} revision={graph.data.revision} />
      ))}
    </section>
  );
}

function RouteEditor({
  resource,
  revision
}: {
  resource: ConfigResource;
  revision: string;
}) {
  const { t } = useI18n();
  const title = t("routes.resourceTitle");
  return (
    <section className="content-panel" aria-label={resource.id}>
      <h2>{resource.id}</h2>
      <ResourceEditorCard
        ariaLabel={`${title} ${resource.id}`}
        resource={resource}
        revision={revision}
        title={title}
      />
    </section>
  );
}
