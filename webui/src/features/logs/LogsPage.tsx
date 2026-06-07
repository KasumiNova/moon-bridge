import { useEffect, useMemo, useState } from "react";
import { LoadingState } from "../../components/LoadingState";
import { useI18n } from "../../i18n/I18nProvider";
import { createLogStream, getRecentLogs } from "../../rpc/logs";
import type { LogEntry } from "../../rpc/types";
import { PageHeader, QueryErrorState } from "../shared";

const logLevels = ["ALL", "ERROR", "WARN", "INFO", "DEBUG"] as const;
type LogLevelFilter = (typeof logLevels)[number];

export function LogsPage() {
  const { t } = useI18n();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevelFilter>("ALL");
  const [follow, setFollow] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    let cancelled = false;
    getRecentLogs({ limit: 200 })
      .then((recent) => {
        if (!cancelled) {
          setEntries(recent);
          setLoading(false);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!follow) {
      return undefined;
    }
    setStreamError(false);
    const abort = new AbortController();
    void consumeStream(abort.signal, (entry) => {
      setEntries((current) => [...current, entry]);
    }).catch((cause: unknown) => {
      if (!abort.signal.aborted) {
        setStreamError(true);
        console.error("log stream failed", cause);
      }
    });
    return () => abort.abort();
  }, [follow]);

  const visibleEntries = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return entries.filter((entry) => {
      if (levelFilter !== "ALL" && normalizeLevel(entry.level) !== levelFilter.toLowerCase()) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return logLine(entry).toLowerCase().includes(needle);
    });
  }, [entries, filter, levelFilter]);

  if (error) {
    return <QueryErrorState error={error} />;
  }
  if (loading) {
    return <LoadingState label={t("common.loading")} />;
  }

  return (
    <section className="page-stack" aria-labelledby="logs-title">
      <PageHeader eyebrow={t("pageEyebrow.runtime")} title={t("nav.logs")}>
        {t("logs.description")}
      </PageHeader>

      <section className="content-panel">
        <div className="logs-toolbar">
          <div className="drawer-actions">
            <button type="button" onClick={() => setFollow((current) => !current)}>
              {follow ? t("logs.pause") : t("logs.follow")}
            </button>
            <button type="button" onClick={() => copyLogs(visibleEntries)}>
              {t("logs.copy")}
            </button>
            <button type="button" onClick={() => downloadLogs(visibleEntries)}>
              {t("logs.download")}
            </button>
          </div>
          <p className="logs-count">
            {t("logs.visibleCount", { visible: visibleEntries.length, total: entries.length })}
          </p>
        </div>

        <div className="log-level-filter" aria-label={t("logs.levelFilter")}>
          {logLevels.map((level) => (
            <button
              className={levelFilter === level ? "active-button" : undefined}
              key={level}
              type="button"
              onClick={() => setLevelFilter(level)}
            >
              {level === "ALL" ? t("logs.levelAll") : level}
            </button>
          ))}
        </div>

        {streamError ? (
          <p className="logs-stream-status" role="status">
            {t("logs.streamDisconnected")}
          </p>
        ) : null}

        <label className="textarea-field logs-search">
          {t("logs.search")}
          <input
            value={filter}
            onChange={(event) => setFilter(event.currentTarget.value)}
          />
        </label>

        <div className="log-output" aria-label={t("logs.output")}>
          {visibleEntries.map((entry, index) => (
            <LogRow entry={entry} index={index} key={`${entry.timestamp}-${index}-${logLine(entry)}`} />
          ))}
        </div>
      </section>
    </section>
  );
}

function LogRow({ entry, index }: { entry: LogEntry; index: number }) {
  const level = normalizeLevel(entry.level);
  return (
    <article className={`log-row log-row--${level}`} aria-label={`Log ${index + 1}`}>
      <div className="log-row__meta">
        <span>{entry.timestamp}</span>
        <strong>{entry.level}</strong>
      </div>
      <pre>{logLine(entry)}</pre>
    </article>
  );
}

async function consumeStream(signal: AbortSignal, append: (entry: LogEntry) => void) {
  const response = await createLogStream({ signal });
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("log stream response body is empty");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      const entry = parseSSEEvent(event);
      if (entry) {
        append(entry);
      }
    }
  }
  buffer += decoder.decode();
  const entry = parseSSEEvent(buffer);
  if (entry) {
    append(entry);
  }
}

function parseSSEEvent(event: string): LogEntry | undefined {
  const data = event
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");
  if (!data) {
    return undefined;
  }
  return JSON.parse(data) as LogEntry;
}

function logLine(entry: LogEntry) {
  return entry.raw || `${entry.timestamp} ${entry.level} ${entry.message}`;
}

function normalizeLevel(level: string) {
  return level.trim().toLowerCase();
}

function copyLogs(entries: LogEntry[]) {
  const text = entries.map((entry) => logLine(entry)).join("\n");
  if (!navigator.clipboard) {
    console.error("clipboard API unavailable");
    return;
  }
  void navigator.clipboard.writeText(text).catch((cause: unknown) => {
    console.error("copy logs failed", cause);
  });
}

function downloadLogs(entries: LogEntry[]) {
  const blob = new Blob([entries.map((entry) => logLine(entry)).join("\n")], {
    type: "text/plain"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "moonbridge-logs.txt";
  anchor.click();
  URL.revokeObjectURL(url);
}
