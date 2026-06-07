import { motion } from "motion/react";
import { LoadingState } from "../../components/LoadingState";
import { useConfigGraph } from "../configGraph/useConfigGraph";
import type { ConfigGraph, ConfigResource, ResourceKind } from "../../rpc/types";
import { useI18n } from "../../i18n/I18nProvider";
import { formatNumber, PageHeader, QueryErrorState } from "../shared";

export function OverviewPage() {
  const { t } = useI18n();
  const graph = useConfigGraph();

  if (graph.error) {
    return <QueryErrorState error={graph.error} />;
  }
  if (graph.isLoading || !graph.data) {
    return <LoadingState label={t("loading.overview")} />;
  }

  const mode = resourceValue(graph.data, "mode", "main", "mode") ?? t("common.unknown");
  const providerCount = countResources(graph.data, "provider");
  const modelCount = countResources(graph.data, "model");
  const routeCount = countResources(graph.data, "route");
  const restartCount = graph.data.resources.filter((resource) => resource.status === "restartRequired").length;
  const runtimeErrors = graph.data.runtime.errors ?? [];
  const validationErrors = graph.data.validation.errors ?? [];

  return (
    <section className="page-stack" aria-labelledby="overview-title">
      <PageHeader eyebrow={t("pageEyebrow.runtime")} title={t("nav.overview")}>
        {t("overview.description")}
      </PageHeader>

      <div className="metric-grid">
        <MetricCard label={t("overview.mode")} value={String(mode)} />
        <MetricCard label="Runtime" value={graph.data.runtime.status} />
        <MetricCard label="Graph" value={graph.data.validation.valid ? "Valid" : "Invalid"} />
        <MetricCard label="Restart" value={`${restartCount} restart`} />
        <MetricCard label={t("overview.providers")} value={formatNumber(providerCount)} />
        <MetricCard label="Models" value={formatNumber(modelCount)} />
        <MetricCard label={t("overview.routes")} value={formatNumber(routeCount)} />
        <MetricCard label="Revision" value={graph.data.revision} />
      </div>

      <div className="section-grid">
        <section className="content-panel">
          <h2>Runtime</h2>
          {runtimeErrors.length > 0 ? (
            <ul className="compact-list">
              {runtimeErrors.map((error) => (
                <li key={`${error.resourceKind}-${error.resourceId}-${error.code}`}>
                  <strong>{error.resourceId || error.resourceKind || error.code}</strong>
                  <span>{error.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">{graph.data.runtime.message ?? graph.data.runtime.status}</p>
          )}
        </section>

        <section className="content-panel">
          <h2>Validation</h2>
          {validationErrors.length > 0 ? (
            <ul className="compact-list">
              {validationErrors.map((error) => (
                <li key={`${error.resourceKind}-${error.resourceId}-${error.field}-${error.code}`}>
                  <strong>{error.resourceId || error.resourceKind || error.code}</strong>
                  <span>{error.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">Valid</p>
          )}
        </section>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="metric-card"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </motion.article>
  );
}

function countResources(graph: ConfigGraph, kind: ResourceKind) {
  return graph.resources.filter((resource) => resource.kind === kind).length;
}

function resourceValue(
  graph: ConfigGraph,
  kind: ResourceKind,
  id: string,
  field: string
) {
  return graph.resources.find((resource: ConfigResource) =>
    resource.kind === kind && resource.id === id
  )?.value[field];
}
