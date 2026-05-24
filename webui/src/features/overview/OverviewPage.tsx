import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { LoadingState } from "../../components/LoadingState";
import {
  getChanges,
  getSessions,
  getStatsSummary,
  getStatus
} from "../../rpc/management";
import { queryKeys } from "../../rpc/queryKeys";
import { useI18n } from "../../i18n/I18nProvider";
import { formatNumber, PageHeader, QueryErrorState } from "../shared";

export function OverviewPage() {
  const { t } = useI18n();
  const status = useQuery({ queryKey: queryKeys.status, queryFn: getStatus });
  const stats = useQuery({
    queryKey: queryKeys.statsSummary,
    queryFn: getStatsSummary
  });
  const sessions = useQuery({ queryKey: queryKeys.sessions, queryFn: getSessions });
  const changes = useQuery({ queryKey: queryKeys.changes, queryFn: getChanges });

  const firstError = status.error ?? stats.error ?? sessions.error ?? changes.error;
  if (firstError) {
    return <QueryErrorState error={firstError} />;
  }
  if (status.isLoading || stats.isLoading || sessions.isLoading || changes.isLoading) {
    return <LoadingState label={t("loading.overview")} />;
  }

  const pendingCount = changes.data?.length ?? 0;

  return (
    <section className="page-stack" aria-labelledby="overview-title">
      <PageHeader eyebrow={t("pageEyebrow.runtime")} title={t("nav.overview")}>
        {t("overview.description")}
      </PageHeader>

      <div className="metric-grid">
        <MetricCard label={t("overview.mode")} value={status.data?.mode ?? t("common.unknown")} />
        <MetricCard label={t("overview.providers")} value={formatNumber(status.data?.provider_count)} />
        <MetricCard label={t("overview.routes")} value={formatNumber(status.data?.route_count)} />
        <MetricCard label={t("app.changes")} value={t("overview.pendingCount", { count: pendingCount })} />
        <MetricCard label={t("overview.requests")} value={formatNumber(stats.data?.requests)} />
        <MetricCard label={t("overview.cacheHitRate")} value={`${Math.round((stats.data?.cache_hit_rate ?? 0) * 100)}%`} />
      </div>

      <div className="section-grid">
        <section className="content-panel">
          <h2>{t("overview.activeSessions")}</h2>
          {(sessions.data?.length ?? 0) > 0 ? (
            <ul className="compact-list">
              {sessions.data?.map((session) => (
                <li key={`${session.key}-${session.created_at}`}>
                  <strong>{session.key}</strong>
                  <span>{session.model ?? t("overview.noModel")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">{t("overview.noActiveSessions")}</p>
          )}
        </section>

        <section className="content-panel">
          <h2>{t("overview.pendingChanges")}</h2>
          {(changes.data?.length ?? 0) > 0 ? (
            <ul className="compact-list">
              {changes.data?.slice(0, 6).map((change) => (
                <li key={change.ID ?? change.change_id ?? change.TargetKey}>
                  <strong>{change.TargetKey ?? change.target ?? t("common.unknown")}</strong>
                  <span>{change.Resource ?? change.resource} / {change.Action ?? change.action}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">{t("changes.empty")}</p>
          )}
        </section>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.article
      className="metric-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </motion.article>
  );
}
