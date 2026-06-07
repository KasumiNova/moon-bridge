import { motion } from "motion/react";
import type { ConfigResource, FieldSchema, ResourceStatus, RuntimeImpact } from "../../rpc/types";
import { useI18n } from "../../i18n/I18nProvider";
import type { MessageKey } from "../../i18n/messages";
import { GraphResourceField } from "./GraphResourceField";

const statusLabelKeys: Record<ResourceStatus, MessageKey> = {
  saved: "resource.status.saved",
  needsAttention: "resource.status.needsAttention",
  restartRequired: "resource.status.restartRequired"
};

const impactLabelKeys: Record<RuntimeImpact, MessageKey> = {
  normal: "resource.impact.normal",
  critical: "resource.impact.critical"
};

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
  const fieldCount = resource.schema.fields.length;
  const reloadText = resource.hotReloadable
    ? t("resource.reload.hot")
    : t("resource.reload.restart");
  const label = ariaLabel ?? resource.id;
  const fieldGroups = groupFields(resource.schema.fields);

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
          <span className="resource-kind-chip">{title ?? resource.label}</span>
          <h3>{resource.id}</h3>
        </div>
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
      </div>

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
                  className={isWideField(field) ? "form-grid__wide" : undefined}
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
  key: "identity" | "settings" | "advanced";
  labelKey: MessageKey;
  fields: FieldSchema[];
};

function groupFields(fields: FieldSchema[]): FieldGroup[] {
  const groups: FieldGroup[] = [
    { key: "identity", labelKey: "resource.group.identity", fields: [] },
    { key: "settings", labelKey: "resource.group.settings", fields: [] },
    { key: "advanced", labelKey: "resource.group.advancedJson", fields: [] }
  ];

  for (const field of fields) {
    if (isAdvancedJsonField(field)) {
      groups[2].fields.push(field);
    } else if (isIdentityField(field)) {
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

function isAdvancedJsonField(field: FieldSchema) {
  return (
    field.control === "object" ||
    field.control === "array" ||
    field.type === "object" ||
    field.type === "array"
  );
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
