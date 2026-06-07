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
  const graphValidity = graph.data.validation.valid ? t("overview.valid") : t("overview.invalid");
  const restartLabel = t(restartCount === 1 ? "overview.restartCount.one" : "overview.restartCount.many", {
    count: restartCount
  });

  return (
    <section className="page-stack" aria-labelledby="overview-title">
      <PageHeader eyebrow={t("pageEyebrow.runtime")} title={t("nav.overview")}>
        {t("overview.description")}
      </PageHeader>

      <div className="metric-grid">
        <MetricCard label={t("overview.mode")} value={String(mode)} />
        <MetricCard label={t("overview.runtime")} value={graph.data.runtime.status} />
        <MetricCard label={t("overview.graph")} value={graphValidity} />
        <MetricCard label={t("overview.restart")} value={restartLabel} />
        <MetricCard label={t("overview.providers")} value={formatNumber(providerCount)} />
        <MetricCard label={t("overview.models")} value={formatNumber(modelCount)} />
        <MetricCard label={t("overview.routes")} value={formatNumber(routeCount)} />
        <MetricCard label={t("overview.revision")} value={graph.data.revision} />
      </div>

      <div className="section-grid">
        <section className="content-panel">
          <h2>{t("overview.runtime")}</h2>
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
          <h2>{t("overview.validation")}</h2>
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
            <p className="empty-state">{t("overview.valid")}</p>
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
