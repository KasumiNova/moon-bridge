import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  applyChanges,
  discardChanges,
  getChanges
} from "../rpc/management";
import { useI18n } from "../i18n/I18nProvider";
import { queryKeys } from "../rpc/queryKeys";
import type { ChangeRow } from "../rpc/types";
import { LoadingState } from "./LoadingState";

export function ChangeQueueDrawer({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const changes = useQuery({ queryKey: queryKeys.changes, queryFn: getChanges });

  const refreshConfigQueries = async () => {
    await queryClient.invalidateQueries();
  };

  const apply = useMutation({
    mutationFn: applyChanges,
    onSuccess: async (result) => {
      setMessage(result.message);
      await refreshConfigQueries();
    }
  });

  const discard = useMutation({
    mutationFn: discardChanges,
    onSuccess: async (result) => {
      setMessage(result.message);
      await refreshConfigQueries();
    }
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          className="change-drawer"
          aria-label={t("changes.drawerTitle")}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.18 }}
        >
          <header className="drawer-header">
            <div>
              <p className="eyebrow">{t("changes.drawerEyebrow")}</p>
              <h2>{t("changes.drawerTitle")}</h2>
            </div>
            <button type="button" className="icon-text-button" onClick={onClose}>
              {t("action.close")}
            </button>
          </header>

          {changes.isLoading ? (
            <LoadingState label={t("changes.loading")} />
          ) : (
            <ChangeList changes={changes.data ?? []} compact />
          )}

          <div className="drawer-actions">
            <button
              type="button"
              onClick={() => apply.mutate()}
              disabled={apply.isPending}
            >
              {t("action.applyChanges")}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => discard.mutate()}
              disabled={discard.isPending}
            >
              {t("action.discardChanges")}
            </button>
          </div>
          {message ? <p className="feedback-banner">{message}</p> : null}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}

export function ChangeList({
  changes,
  compact = false
}: {
  changes: ChangeRow[];
  compact?: boolean;
}) {
  const { t } = useI18n();
  if (changes.length === 0) {
    return <p className="empty-state">{t("changes.empty")}</p>;
  }

  return (
    <ul className={compact ? "change-list change-list--compact" : "change-list"}>
      {changes.map((change) => (
        <li key={change.ID ?? change.change_id ?? change.TargetKey ?? change.target}>
          <div>
            <span className="status-pill">{change.Resource ?? change.resource ?? t("common.resource")}</span>
            <span className="status-pill status-pill--muted">{change.Action ?? change.action ?? t("common.change")}</span>
          </div>
          <strong>{change.TargetKey ?? change.target ?? t("common.unknown")}</strong>
          <p>{summarizeChange(change) || t("changes.noSummary")}</p>
        </li>
      ))}
    </ul>
  );
}

function summarizeChange(change: ChangeRow) {
  const after = change.After ?? change.after;
  const before = change.Before ?? change.before;
  return compactJSON(after) || compactJSON(before);
}

function compactJSON(value: string | undefined) {
  if (!value) {
    return "";
  }
  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    return value;
  }
}
