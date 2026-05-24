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
import { formatNumber, PageHeader, QueryErrorState } from "../shared";

export function OverviewPage() {
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
    return <LoadingState label="Loading console overview" />;
  }

  const pendingCount = changes.data?.length ?? 0;

  return (
    <section className="page-stack" aria-labelledby="overview-title">
      <PageHeader eyebrow="Runtime" title="Overview">
        Current Moon Bridge runtime health, usage, sessions, and staged
        configuration changes.
      </PageHeader>

      <div className="metric-grid">
        <MetricCard label="Mode" value={status.data?.mode ?? "unknown"} />
        <MetricCard label="Providers" value={formatNumber(status.data?.provider_count)} />
        <MetricCard label="Routes" value={formatNumber(status.data?.route_count)} />
        <MetricCard label="Changes" value={`${pendingCount} pending`} />
        <MetricCard label="Requests" value={formatNumber(stats.data?.requests)} />
        <MetricCard label="Cache Hit Rate" value={`${Math.round((stats.data?.cache_hit_rate ?? 0) * 100)}%`} />
      </div>

      <div className="section-grid">
        <section className="content-panel">
          <h2>Active Sessions</h2>
          {(sessions.data?.length ?? 0) > 0 ? (
            <ul className="compact-list">
              {sessions.data?.map((session) => (
                <li key={`${session.key}-${session.created_at}`}>
                  <strong>{session.key}</strong>
                  <span>{session.model ?? "No model selected"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No active sessions</p>
          )}
        </section>

        <section className="content-panel">
          <h2>Pending Changes</h2>
          {(changes.data?.length ?? 0) > 0 ? (
            <ul className="compact-list">
              {changes.data?.slice(0, 6).map((change) => (
                <li key={change.ID ?? change.change_id ?? change.TargetKey}>
                  <strong>{change.TargetKey ?? change.target ?? "unknown"}</strong>
                  <span>{change.Resource ?? change.resource} / {change.Action ?? change.action}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No staged changes</p>
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
