import { motion } from "motion/react";
import type { ConfigResource, FieldSchema, ResourceStatus, RuntimeImpact } from "../../rpc/types";
import { GraphResourceField } from "./GraphResourceField";

const statusLabels: Record<ResourceStatus, string> = {
  saved: "Saved",
  needsAttention: "Needs attention",
  restartRequired: "Restart required"
};

const impactLabels: Record<RuntimeImpact, string> = {
  normal: "Runtime safe",
  critical: "Critical"
};

export function ResourceEditorCard({
  resource,
  revision,
  title
}: {
  resource: ConfigResource;
  revision: string;
  title?: string;
}) {
  const fieldCount = resource.schema.fields.length;
  const reloadText = resource.hotReloadable ? "Hot reload" : "Restart on change";

  return (
    <motion.section
      aria-label={resource.id}
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
        <div className="resource-editor-card__status" aria-label={`${resource.id} status`}>
          <span className={`status-pill status-pill--${resource.status}`}>
            {statusLabels[resource.status]}
          </span>
          {!resource.hotReloadable ? (
            <span className="status-pill status-pill--muted">{reloadText}</span>
          ) : null}
          {resource.runtimeImpact === "critical" ? (
            <span className="status-pill status-pill--critical">
              {impactLabels[resource.runtimeImpact]}
            </span>
          ) : null}
        </div>
      </div>

      <div className="resource-editor-card__summary">
        <span>{fieldCount === 1 ? "1 field" : `${fieldCount} fields`}</span>
        <span>{reloadText}</span>
      </div>

      <div className="form-grid">
        {resource.schema.fields.map((field) => (
          <div
            className={isWideField(field) ? "form-grid__wide" : undefined}
            key={`${resource.kind}-${resource.id}-${field.path}`}
          >
            <GraphResourceField field={field} resource={resource} revision={revision} />
          </div>
        ))}
      </div>
    </motion.section>
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
