import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { applyChanges, discardChanges, getChanges } from "../rpc/management";
import { useI18n } from "../i18n/I18nProvider";
import { queryKeys } from "../rpc/queryKeys";
import type { ChangeRow } from "../rpc/types";

export function ApplyChangesDialog({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const changes = useQuery({
    queryKey: queryKeys.changes,
    queryFn: getChanges,
    enabled: open
  });

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
        <motion.div
          className="dialog-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-dialog-title"
            className="apply-dialog"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <header className="drawer-header">
              <div>
                <p className="eyebrow">{t("apply.previewEyebrow")}</p>
                <h2 id="apply-dialog-title">{t("apply.title")}</h2>
              </div>
              <button type="button" className="icon-text-button" onClick={onClose}>
                {t("action.close")}
              </button>
            </header>

            {changes.isLoading ? (
              <p className="empty-state">{t("changes.loading")}</p>
            ) : (
              <ChangePreviewList changes={changes.data ?? []} />
            )}

            <div className="drawer-actions">
              <button type="button" onClick={() => apply.mutate()} disabled={apply.isPending}>
                {t("action.apply")}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => discard.mutate()}
                disabled={discard.isPending}
              >
                {t("action.discardEdits")}
              </button>
            </div>
            {message ? <p className="feedback-banner">{message}</p> : null}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ChangePreviewList({ changes }: { changes: ChangeRow[] }) {
  const { t } = useI18n();
  if (changes.length === 0) {
    return <p className="empty-state">{t("apply.noPendingEdits")}</p>;
  }

  return (
    <ul className="change-list change-list--compact">
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
