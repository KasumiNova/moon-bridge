import { useState } from "react";
import { motion } from "motion/react";
import type { ConfigResource, FieldSchema, ResourceKind, ResourceStatus, RuntimeImpact } from "../../rpc/types";
import { useI18n } from "../../i18n/I18nProvider";
import type { MessageKey } from "../../i18n/messages";
import { GraphResourceField } from "./GraphResourceField";
import { useDeleteConfigResource } from "./useConfigGraph";

const statusLabelKeys: Record<ResourceStatus, MessageKey> = {
  saved: "resource.status.saved",
  needsAttention: "resource.status.needsAttention",
  restartRequired: "resource.status.restartRequired"
};

const impactLabelKeys: Record<RuntimeImpact, MessageKey> = {
  normal: "resource.impact.normal",
  critical: "resource.impact.critical"
};

const deletableKinds = new Set<ResourceKind>([
  "extension",
  "model",
  "provider",
  "provider_offer",
  "route"
]);

export function ResourceEditorCard({
  ariaLabel,
  resource,
  revision,
  title
}: {
  ariaLabel?: string;
  resource: ConfigResource;
  revision: string;
  title?: string;
}) {
  const { t } = useI18n();
  const deleteResource = useDeleteConfigResource();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const fieldCount = resource.schema.fields.length;
  const reloadText = resource.hotReloadable
    ? t("resource.reload.hot")
    : t("resource.reload.restart");
  const label = ariaLabel ?? resource.id;
  const fieldGroups = groupFields(resource.schema.fields);
  const resourceTitle = title ?? resource.label;
  const canDelete = deletableKinds.has(resource.kind);

  async function confirmDelete() {
    setDeleteError("");
    try {
      await deleteResource.mutateAsync({
        kind: resource.kind,
        id: resource.id,
        baseRevision: revision
      });
    } catch (cause) {
      setDeleteError(errorMessage(cause));
    }
  }

  return (
    <motion.section
      aria-label={label}
      className="resource-editor-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16 }}
    >
      <div className="resource-editor-card__header">
        <div className="resource-editor-card__identity">
          <span className="resource-kind-chip">{resourceTitle}</span>
          <h3>{resource.id}</h3>
        </div>
        <div className="resource-editor-card__meta">
          <div className="resource-editor-card__status" aria-label={`${label} status`}>
            <span className={`status-pill status-pill--${resource.status}`}>
              {t(statusLabelKeys[resource.status])}
            </span>
            {!resource.hotReloadable ? (
              <span className="status-pill status-pill--muted">{reloadText}</span>
            ) : null}
            {resource.runtimeImpact === "critical" ? (
              <span className="status-pill status-pill--critical">
                {t(impactLabelKeys[resource.runtimeImpact])}
              </span>
            ) : null}
          </div>
          {canDelete ? (
            <button
              type="button"
              className="resource-delete-button"
              aria-label={t("resource.delete", { title: resourceTitle, id: resource.id })}
              onClick={() => {
                setConfirmingDelete(true);
                setDeleteError("");
              }}
            >
              <span className="material-symbol" aria-hidden="true">delete</span>
              {t("resource.deleteShort")}
            </button>
          ) : null}
        </div>
      </div>

      {confirmingDelete ? (
        <motion.div
          className="resource-delete-confirmation"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.14 }}
        >
          <p>{t("resource.deletePrompt", { id: resource.id })}</p>
          {deleteError ? (
            <p className="field-error" role="alert">
              {deleteError}
            </p>
          ) : null}
          <div className="resource-delete-confirmation__actions">
            <button
              type="button"
              className="resource-delete-confirmation__confirm"
              aria-label={t("resource.confirmDelete", { id: resource.id })}
              disabled={deleteResource.isPending}
              onClick={confirmDelete}
            >
              {t("resource.confirmDeleteShort")}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setConfirmingDelete(false);
                setDeleteError("");
              }}
            >
              {t("resource.cancelDelete")}
            </button>
          </div>
        </motion.div>
      ) : null}

      <div className="resource-editor-card__summary">
        <span>{t(fieldCount === 1 ? "resource.fieldCount.one" : "resource.fieldCount.many", { count: fieldCount })}</span>
        <span>{reloadText}</span>
      </div>

      <div className="resource-field-groups">
        {fieldGroups.map((group) => (
          <div
            aria-label={t(group.labelKey)}
            className={`resource-field-group resource-field-group--${group.key}`}
            key={group.key}
            role="group"
          >
            <div className="resource-field-group__header">
              <h4>{t(group.labelKey)}</h4>
              <span>
                {t(group.fields.length === 1 ? "resource.fieldCount.one" : "resource.fieldCount.many", {
                  count: group.fields.length
                })}
              </span>
            </div>
            <div className="form-grid">
              {group.fields.map((field) => (
                <div
                  className={fieldGridClass(field)}
                  key={`${resource.kind}-${resource.id}-${field.path}`}
                >
                  <GraphResourceField field={field} resource={resource} revision={revision} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

type FieldGroup = {
  key: "identity" | "settings";
  labelKey: MessageKey;
  fields: FieldSchema[];
};

function groupFields(fields: FieldSchema[]): FieldGroup[] {
  const groups: FieldGroup[] = [
    { key: "identity", labelKey: "resource.group.identity", fields: [] },
    { key: "settings", labelKey: "resource.group.settings", fields: [] }
  ];

  for (const field of fields) {
    if (isIdentityField(field)) {
      groups[0].fields.push(field);
    } else {
      groups[1].fields.push(field);
    }
  }

  return groups.filter((group) => group.fields.length > 0);
}

function isIdentityField(field: FieldSchema) {
  return [
    "addr",
    "base_url",
    "display_name",
    "model",
    "mode",
    "provider",
    "protocol",
    "to",
    "upstream_name"
  ].includes(field.path);
}

function isWideField(field: FieldSchema) {
  return (
    field.control === "textarea" ||
    field.control === "object" ||
    field.control === "array" ||
    field.type === "object" ||
    field.type === "array"
  );
}

function fieldGridClass(field: FieldSchema) {
  if (isWideField(field)) {
    return "form-grid__wide";
  }
  if (
    field.type === "number" ||
    field.type === "boolean" ||
    field.control === "number" ||
    field.control === "switch" ||
    compactFieldPaths.has(field.path)
  ) {
    return "form-grid__compact";
  }
  return "form-grid__medium";
}

const compactFieldPaths = new Set([
  "active_provider",
  "addr",
  "default_reasoning_level",
  "default_reasoning_summary",
  "format",
  "level",
  "max_sessions",
  "mode",
  "priority",
  "search_max_rounds",
  "session_ttl",
  "support",
  "ttl",
  "version"
]);

function errorMessage(cause: unknown) {
  const rawErrors = rawErrorsFrom(cause);
  if (rawErrors.length > 0 && typeof rawErrors[0]?.message === "string") {
    return rawErrors[0].message;
  }
  if (cause instanceof Error) {
    return cause.message;
  }
  return "Request failed";
}

function rawErrorsFrom(cause: unknown): Array<{ message?: unknown }> {
  if (!cause || typeof cause !== "object") {
    return [];
  }
  const raw = "raw" in cause ? (cause as { raw?: unknown }).raw : undefined;
  if (!raw || typeof raw !== "object" || !("errors" in raw)) {
    return [];
  }
  const errors = (raw as { errors?: unknown }).errors;
  return Array.isArray(errors) ? errors : [];
}
