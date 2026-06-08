import { useEffect, useId, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useI18n } from "../../i18n/I18nProvider";
import { createLogStream, getRecentLogs } from "../../rpc/logs";
import type { LogEntry } from "../../rpc/types";
import { springs } from "../../theme/motion";

const logLevels = ["ALL", "ERROR", "WARN", "INFO", "DEBUG"] as const;
type LogLevelFilter = (typeof logLevels)[number];

export function LogPanel({ labelledBy, embedded }: { labelledBy?: string; embedded?: boolean }) {
  const { t } = useI18n();
  const searchId = useId();
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

  return (
    <section
      aria-label={labelledBy ? undefined : t("logs.panelLabel")}
      aria-labelledby={labelledBy}
      className={embedded ? "logs-panel" : "content-panel logs-panel"}
    >
      {labelledBy ? null : <h2>{t("logs.panelTitle")}</h2>}

      <div className="logs-toolbar">
        <div className="logs-toolbar__actions">
          <div className="segmented-control" role="group" aria-label={t("logs.followMode")}>
            <button
              aria-pressed={follow}
              className={follow ? "active-button" : undefined}
              type="button"
              onClick={() => setFollow(true)}
            >
              {t("logs.follow")}
            </button>
            <button
              aria-pressed={!follow}
              className={!follow ? "active-button" : undefined}
              type="button"
              onClick={() => setFollow(false)}
            >
              {t("logs.pause")}
            </button>
          </div>
          <button type="button" disabled={visibleEntries.length === 0} onClick={() => copyLogs(visibleEntries)}>
            {t("logs.copy")}
          </button>
          <button type="button" disabled={visibleEntries.length === 0} onClick={() => downloadLogs(visibleEntries)}>
            {t("logs.download")}
          </button>
        </div>
        <p className="logs-count">
          {t("logs.visibleCount", { visible: visibleEntries.length, total: entries.length })}
        </p>
      </div>

      <div className="log-level-filter" role="group" aria-label={t("logs.levelFilter")}>
        {logLevels.map((level) => (
          <button
            className={levelFilter === level ? "active-button" : undefined}
            key={level}
            aria-pressed={levelFilter === level}
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

      {error ? (
        <p className="logs-stream-status" role="status">
          {error instanceof Error ? error.message : t("error.unknownRequest")}
        </p>
      ) : null}

      <div className="search-field logs-search">
        <label htmlFor={searchId}>{t("logs.search")}</label>
        <span className="search-field__control">
          <span className="material-symbol" aria-hidden="true">search</span>
          <input
            id={searchId}
            value={filter}
            onChange={(event) => setFilter(event.currentTarget.value)}
          />
          <button
            aria-label={t("logs.clearSearch")}
            type="button"
            disabled={filter.length === 0}
            onClick={() => setFilter("")}
          >
            <span className="material-symbol" aria-hidden="true">close</span>
          </button>
        </span>
      </div>

      <div className="log-output" aria-label={t("logs.output")}>
        {loading ? (
          <p className="log-empty-state" role="status">
            {t("common.loading")}
          </p>
        ) : visibleEntries.length === 0 ? (
          <p className="log-empty-state" role="status">
            {entries.length === 0 ? t("logs.empty") : t("logs.emptyFiltered")}
          </p>
        ) : (
          visibleEntries.map((entry, index) => (
            <LogRow entry={entry} index={index} key={`${entry.timestamp}-${index}-${logLine(entry)}`} />
          ))
        )}
      </div>
    </section>
  );
}

function LogRow({ entry, index }: { entry: LogEntry; index: number }) {
  const level = normalizeLevel(entry.level);
  return (
    <motion.article
      className={`log-row log-row--${level}`}
      aria-label={`Log ${index + 1}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.effects}
    >
      <div className="log-row__meta">
        <span>{entry.timestamp}</span>
        <strong>{entry.level}</strong>
      </div>
      <pre>{logLine(entry)}</pre>
    </motion.article>
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
