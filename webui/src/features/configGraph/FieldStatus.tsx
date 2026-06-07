import type { AutosaveFieldStatus } from "./useAutosaveField";

const statusLabels: Record<AutosaveFieldStatus, string> = {
  idle: "Saved",
  dirty: "Unsaved",
  saving: "Saving",
  saved: "Saved",
  error: "Error"
};

export function FieldStatus({
  status,
  message
}: {
  status: AutosaveFieldStatus;
  message?: string;
}) {
  const label = status === "error" && message ? message : statusLabels[status];
  return (
    <span
      aria-live="polite"
      className={`field-status field-status--${status}`}
      role={status === "error" ? "alert" : "status"}
    >
      {label}
    </span>
  );
}
