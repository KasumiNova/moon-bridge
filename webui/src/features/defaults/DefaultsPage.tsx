import { LoadingState } from "../../components/LoadingState";
import { useI18n } from "../../i18n/I18nProvider";
import type { ConfigResource } from "../../rpc/types";
import { ResourceEditorCard } from "../configGraph/ResourceEditorCard";
import { useConfigGraph } from "../configGraph/useConfigGraph";
import { PageHeader, QueryErrorState } from "../shared";

const defaultResourceOrder = ["defaults", "trace", "log"] as const;

export function DefaultsPage() {
  const { t } = useI18n();
  const graph = useConfigGraph();

  if (graph.error) {
    return <QueryErrorState error={graph.error} />;
  }
  if (graph.isLoading || !graph.data) {
    return <LoadingState label={t("common.loading")} />;
  }

  const resources = defaultResourceOrder
    .map((kind) => graph.data.resources.find((resource) => resource.kind === kind))
    .filter((resource): resource is ConfigResource => Boolean(resource));

  return (
    <section className="page-stack" aria-labelledby="defaults-title">
      <PageHeader eyebrow={t("pageEyebrow.config")} title={t("nav.defaults")}>
        {t("config.description")}
      </PageHeader>

      {resources.map((resource) => (
        <section className="content-panel" key={resource.kind} aria-label={resource.label}>
          <h2>{resource.label}</h2>
          <ResourceEditorCard
            ariaLabel={`${resource.label} ${resource.id}`}
            resource={resource}
            revision={graph.data.revision}
            title={resource.label}
          />
        </section>
      ))}
    </section>
  );
}
