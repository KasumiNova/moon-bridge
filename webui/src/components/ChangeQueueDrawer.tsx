import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  applyChanges,
  discardChanges,
  getChanges
} from "../rpc/management";
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
          aria-label="Pending changes"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.18 }}
        >
          <header className="drawer-header">
            <div>
              <p className="eyebrow">Change Queue</p>
              <h2>Pending Changes</h2>
            </div>
            <button type="button" className="icon-text-button" onClick={onClose}>
              Close
            </button>
          </header>

          {changes.isLoading ? (
            <LoadingState label="Loading changes" />
          ) : (
            <ChangeList changes={changes.data ?? []} compact />
          )}

          <div className="drawer-actions">
            <button
              type="button"
              onClick={() => apply.mutate()}
              disabled={apply.isPending}
            >
              Apply changes
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => discard.mutate()}
              disabled={discard.isPending}
            >
              Discard changes
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
  if (changes.length === 0) {
    return <p className="empty-state">No staged changes</p>;
  }

  return (
    <ul className={compact ? "change-list change-list--compact" : "change-list"}>
      {changes.map((change) => (
        <li key={change.ID ?? change.change_id ?? change.TargetKey ?? change.target}>
          <div>
            <span className="status-pill">{change.Resource ?? change.resource ?? "resource"}</span>
            <span className="status-pill status-pill--muted">{change.Action ?? change.action ?? "change"}</span>
          </div>
          <strong>{change.TargetKey ?? change.target ?? "unknown"}</strong>
          <p>{summarizeChange(change)}</p>
        </li>
      ))}
    </ul>
  );
}

function summarizeChange(change: ChangeRow) {
  const after = change.After ?? change.after;
  const before = change.Before ?? change.before;
  return compactJSON(after) || compactJSON(before) || "No payload summary";
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
