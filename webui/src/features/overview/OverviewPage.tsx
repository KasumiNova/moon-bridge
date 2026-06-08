import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { LoadingState } from "../../components/LoadingState";
import { useI18n } from "../../i18n/I18nProvider";
import { getUsageStats } from "../../rpc/management";
import { queryKeys } from "../../rpc/queryKeys";
import type { UsageStats, UsageStatsModelRow } from "../../rpc/types";
import { useConfigGraph } from "../configGraph/useConfigGraph";
import { LogPanel } from "../logs/LogPanel";
import { PageHeader, QueryErrorState } from "../shared";

export function OverviewPage() {
  const { t } = useI18n();
  const graph = useConfigGraph();
  const usage = useQuery({
    queryKey: queryKeys.usageStats,
    queryFn: getUsageStats
  });

  return (
    <section className="page-stack" aria-labelledby="overview-title">
      <PageHeader eyebrow={t("pageEyebrow.analytics")} title={t("nav.overview")}>
        {t("overview.description")}
      </PageHeader>

      {graph.error ? (
        <section className="state-panel state-panel--inline" role="status">
          <p className="eyebrow">{t("common.error")}</p>
          <h2>{t("overview.graphUnavailableTitle")}</h2>
          <p>{t("overview.graphUnavailableDescription")}</p>
        </section>
      ) : null}

      <section className="content-panel usage-dashboard" aria-labelledby="usage-title">
        <div className="panel-heading">
          <div>
            <h2 id="usage-title">{t("overview.usageTitle")}</h2>
            <p>{t("overview.usageDescription")}</p>
          </div>
          {usage.data ? <span className="status-pill status-pill--muted">{usage.data.totals.duration}</span> : null}
        </div>

        {usage.isLoading ? (
          <LoadingState label={t("common.loading")} />
        ) : usage.error ? (
          <QueryErrorState error={usage.error} />
        ) : usage.data ? (
          <UsageDashboard stats={usage.data} />
        ) : null}
      </section>

      <div id="logs" className="overview-logs-anchor">
        <div className="panel-heading">
          <div>
            <h2 id="overview-logs-title">{t("logs.panelTitle")}</h2>
            <p>{t("logs.description")}</p>
          </div>
        </div>
        <LogPanel labelledBy="overview-logs-title" />
      </div>
    </section>
  );
}

function UsageDashboard({ stats }: { stats: UsageStats }) {
  const { t } = useI18n();
  const hasUsage = stats.totals.requests > 0 || stats.by_model.length > 0;

  return (
    <>
      {!hasUsage ? (
        <div className="usage-empty-state">
          <p>{t("overview.usageEmpty")}</p>
        </div>
      ) : null}

      <div className="usage-summary-grid">
        <UsageMetric value={t("overview.requestsValue", { count: stats.totals.requests })} label={t("overview.requests")} />
        <UsageMetric value={t("overview.inputValue", { count: formatTokenValue(stats.totals.input_tokens) })} label={t("overview.inputTokens")} />
        <UsageMetric value={t("overview.outputValue", { count: formatTokenValue(stats.totals.output_tokens) })} label={t("overview.outputTokens")} />
        <UsageMetric value={t("overview.cacheHitValue", { rate: formatPercent(stats.totals.cache_hit_rate) })} label={t("overview.cacheHit")} />
        <UsageMetric value={t("overview.cacheRatioValue", { ratio: formatRatio(stats.totals.cache_rw_ratio) })} label={t("overview.cacheReadWrite")} />
        <UsageMetric value={t("overview.totalCostValue", { cost: formatCurrency(stats.totals.total_cost) })} label={t("overview.totalCost")} />
      </div>

      <div className="usage-chart-grid">
        <UsageBarChart
          ariaLabel={chartAriaLabel(t("overview.tokenSplitChart"), [
            [t("overview.inputTokens"), stats.totals.input_tokens],
            [t("overview.outputTokens"), stats.totals.output_tokens]
          ])}
          title={t("overview.tokenSplit")}
          segments={[
            { label: t("overview.inputTokens"), value: stats.totals.input_tokens, className: "usage-segment--input" },
            { label: t("overview.outputTokens"), value: stats.totals.output_tokens, className: "usage-segment--output" }
          ]}
        />
        <UsageBarChart
          ariaLabel={chartAriaLabel(t("overview.cacheSplitChart"), [
            [t("overview.cacheWrite"), stats.totals.cache_creation],
            [t("overview.cacheRead"), stats.totals.cache_read]
          ])}
          title={t("overview.cacheSplit")}
          segments={[
            { label: t("overview.cacheWrite"), value: stats.totals.cache_creation, className: "usage-segment--cache-write" },
            { label: t("overview.cacheRead"), value: stats.totals.cache_read, className: "usage-segment--cache-read" }
          ]}
        />
        <UsageBarChart
          ariaLabel={chartAriaLabel(
            t("overview.costByModelChart"),
            stats.by_model.map((row) => [row.model, row.cost])
          )}
          title={t("overview.costByModel")}
          segments={stats.by_model.map((row, index) => ({
            label: row.model,
            value: row.cost,
            className: `usage-segment--cost-${(index % 6) + 1}`
          }))}
        />
      </div>

      <div className="table-scroll">
        <table className="resource-table usage-table" aria-label={t("overview.modelUsageTable")}>
          <thead>
            <tr>
              <th>{t("overview.model")}</th>
              <th>{t("overview.actualModel")}</th>
              <th>{t("overview.requests")}</th>
              <th>{t("overview.inputTokens")}</th>
              <th>{t("overview.outputTokens")}</th>
              <th>{t("overview.cacheWrite")}</th>
              <th>{t("overview.cacheRead")}</th>
              <th>{t("overview.cacheHit")}</th>
              <th>{t("overview.cost")}</th>
              <th>{t("overview.avgCost")}</th>
            </tr>
          </thead>
          <tbody>
            {stats.by_model.map((row) => (
              <UsageModelRow row={row} key={row.model} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function UsageMetric({ label, value }: { label: string; value: string }) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="usage-metric"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </motion.article>
  );
}

function UsageBarChart({
  ariaLabel,
  title,
  segments
}: {
  ariaLabel: string;
  title: string;
  segments: Array<{ label: string; value: number; className: string }>;
}) {
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);
  return (
    <section className="usage-chart" role="img" aria-label={ariaLabel} tabIndex={0}>
      <div className="usage-chart__header">
        <h3>{title}</h3>
        <span>{formatNumber(total)}</span>
      </div>
      <div className="usage-chart__bar" aria-hidden="true">
        {segments.map((segment) => (
          <span
            className={`usage-chart__segment ${segment.className}`}
            key={segment.label}
            style={{ inlineSize: `${total > 0 ? (Math.max(0, segment.value) / total) * 100 : 0}%` }}
            title={`${segment.label}: ${formatNumber(segment.value)}`}
          />
        ))}
      </div>
      <ul className="usage-chart__legend">
        {segments.map((segment) => (
          <li key={segment.label}>
            <span className={`usage-chart__dot ${segment.className}`} aria-hidden="true" />
            <span title={segment.label}>{segment.label}</span>
            <strong>{formatNumber(segment.value)}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}

function UsageModelRow({ row }: { row: UsageStatsModelRow }) {
  return (
    <tr aria-label={`${row.model} usage`}>
      <td title={row.model}>{row.model}</td>
      <td title={row.actual_model}>{row.actual_model || "-"}</td>
      <td>{formatNumber(row.requests)}</td>
      <td>{formatTokenValue(row.input_tokens)}</td>
      <td>{formatTokenValue(row.output_tokens)}</td>
      <td>{formatTokenValue(row.cache_creation)}</td>
      <td>{formatTokenValue(row.cache_read)}</td>
      <td>{formatPercent(row.cache_hit_rate)}</td>
      <td>{formatCurrency(row.cost)}</td>
      <td>{formatCurrency(row.avg_cost_per_mtoken)}/M</td>
    </tr>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatTokenValue(value: number) {
  return formatNumber(value);
}

function formatPercent(value: number) {
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value)}%`;
}

function formatRatio(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "CNY",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function chartAriaLabel(title: string, values: Array<[string, number]>) {
  const summary = values.length > 0
    ? values.map(([label, value]) => `${label}: ${formatNumber(value)}`).join(", ")
    : "no data";
  return `${title}. ${summary}`;
}
