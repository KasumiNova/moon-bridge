import { useCallback, useMemo, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import type { ConfigResource, FieldError, FieldSchema, ResourceKind, ResourceStatus, RuntimeImpact } from "../../rpc/types";
import { configDescriptions } from "../../configDocs/configDescriptions";
import { useI18n } from "../../i18n/I18nProvider";
import type { MessageKey } from "../../i18n/messages";
import { springs } from "../../theme/motion";
import { MaterialFilledButton, MaterialOutlinedButton } from "../../components/MaterialButton";
import { MaterialInputChip } from "../../components/MaterialInputChip";
import { MaterialSelect, type MaterialSelectOption } from "../../components/MaterialSelect";
import { MaterialSwitch } from "../../components/MaterialSwitch";
import { MaterialOutlinedTextField } from "../../components/MaterialTextField";
import { EditorStatusProvider, useReportFieldStatus, type FieldStatusReporter } from "./editorStatus";
import { GraphResourceField } from "./GraphResourceField";
import { useAutosaveField, type AutosaveFieldStatus, type SaveFieldRequest } from "./useAutosaveField";
import { useDeleteConfigResource, useGraphFieldSaver } from "./useConfigGraph";
import { configDocPathForResource } from "./configDocPath";

const statusLabelKeys: Record<ResourceStatus, MessageKey> = {
  saved: "resource.status.saved",
  needsAttention: "resource.status.needsAttention",
  restartRequired: "resource.status.restartRequired"
};

const impactLabelKeys: Record<RuntimeImpact, MessageKey> = {
  normal: "resource.impact.normal",
  critical: "resource.impact.critical"
};

const statusIcons: Record<ResourceStatus, string> = {
  saved: "check_circle",
  needsAttention: "report",
  restartRequired: "restart_alt"
};

const impactIcons: Record<RuntimeImpact, string> = {
  normal: "info",
  critical: "priority_high"
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
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, AutosaveFieldStatus>>({});
  const reportFieldStatus = useCallback<FieldStatusReporter>((id, status) => {
    setFieldStatuses((current) => (current[id] === status ? current : { ...current, [id]: status }));
  }, []);
  const liveStatus = useMemo(() => deriveLiveStatus(fieldStatuses), [fieldStatuses]);
  const fieldCount = resource.schema.fields.length;
  const reloadText = resource.hotReloadable
    ? t("resource.reload.hot")
    : t("resource.reload.restart");
  const label = ariaLabel ?? resource.id;
  const fieldGroups = groupFields(resource.kind, resource.schema.fields);
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
      setDeleteError(errorMessage(cause, t("error.requestFailed")));
    }
  }

  return (
    <motion.section
      aria-label={label}
      className="resource-editor-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.spatial}
    >
      <div className="resource-editor-card__header">
        <div className="resource-editor-card__identity">
          <div className="resource-editor-card__identity-line">
            <span className="resource-kind-icon material-symbol" aria-hidden="true">
              {kindIcon(resource.kind)}
            </span>
            <h3>{resource.id}</h3>
          </div>
          <div className="resource-editor-card__facts">
            <span className="resource-editor-card__status-group" aria-label={t("resource.statusGroupLabel", { label })}>
              <span className={`resource-meta-pill status-pill status-pill--${resource.status}`}>
                <span className="material-symbol" aria-hidden="true">
                  {statusIcon(resource.status)}
                </span>
                {t(statusLabelKeys[resource.status])}
              </span>
              {resource.runtimeImpact === "critical" ? (
                <span className="resource-meta-pill status-pill status-pill--critical">
                  <span className="material-symbol" aria-hidden="true">
                    {impactIcon(resource.runtimeImpact)}
                  </span>
                  {t(impactLabelKeys[resource.runtimeImpact])}
                </span>
              ) : null}
              {liveStatus ? (
                <motion.span
                  key={liveStatus}
                  className={`resource-meta-pill editor-live-status editor-live-status--${liveStatus}`}
                  initial={{ opacity: 0, scale: 0.85, y: -2 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={springs.spatialFast}
                >
                  <span className="material-symbol" aria-hidden="true">
                    {liveStatusIcon(liveStatus)}
                  </span>
                  {t(liveStatusKeys[liveStatus])}
                </motion.span>
              ) : null}
            </span>
            <span className="resource-meta-pill resource-fact">
              <span className="material-symbol" aria-hidden="true">list_alt</span>
              {t(fieldCount === 1 ? "resource.fieldCount.one" : "resource.fieldCount.many", { count: fieldCount })}
            </span>
            <span className={`resource-meta-pill resource-fact resource-fact--${resource.hotReloadable ? "hot" : "restart"}`}>
              <span className="material-symbol" aria-hidden="true">
                {resource.hotReloadable ? "bolt" : "restart_alt"}
              </span>
              {reloadText}
            </span>
          </div>
        </div>
        {canDelete ? (
          <div className="resource-editor-card__meta">
            <MaterialFilledButton
              ariaLabel={t("resource.delete", { title: resourceTitle, id: resource.id })}
              className="fab-button fab-button--danger"
              icon="delete"
              onClick={() => {
                setConfirmingDelete(true);
                setDeleteError("");
              }}
            >
              {t("resource.deleteShort")}
            </MaterialFilledButton>
          </div>
        ) : null}
      </div>

      {confirmingDelete ? (
        <motion.div
          className="resource-delete-confirmation"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.spatial}
        >
          <p>{t("resource.deletePrompt", { id: resource.id })}</p>
          {deleteError ? (
            <p className="field-error" role="alert">
              {deleteError}
            </p>
          ) : null}
          <div className="resource-delete-confirmation__actions">
            <MaterialFilledButton
              ariaLabel={t("resource.confirmDelete", { id: resource.id })}
              className="resource-delete-confirmation__confirm"
              disabled={deleteResource.isPending}
              onClick={confirmDelete}
            >
              {t("resource.confirmDeleteShort")}
            </MaterialFilledButton>
            <MaterialOutlinedButton
              ariaLabel={t("resource.cancelDelete")}
              className="secondary-button"
              onClick={() => {
                setConfirmingDelete(false);
                setDeleteError("");
              }}
            >
              {t("resource.cancelDelete")}
            </MaterialOutlinedButton>
          </div>
        </motion.div>
      ) : null}

      <EditorStatusProvider report={reportFieldStatus}>
        <ResourceFieldGroups
          fieldGroups={fieldGroups}
          resource={resource}
          revision={revision}
        />
      </EditorStatusProvider>
    </motion.section>
  );
}

type FieldGroup = {
  key: "identity" | "settings" | "reasoning" | "advancedFeatures";
  labelKey: MessageKey;
  fields: FieldSchema[];
};

function ResourceFieldGroups({
  fieldGroups,
  resource,
  revision
}: {
  fieldGroups: FieldGroup[];
  resource: ConfigResource;
  revision: string;
}) {
  const hasReasoningSupportField = resource.kind === "model" &&
    resource.schema.fields.some((field) => field.path === "supports_reasoning");
  const reasoningLevelsField = hasReasoningSupportField
    ? resource.schema.fields.find((field) => field.path === "supported_reasoning_levels")
    : undefined;
  const modelReasoningLevels = useModelReasoningLevels(resource, revision, reasoningLevelsField);

  return (
    <div className="resource-field-groups">
      {fieldGroups.map((group) => (
        <ResourceFieldGroup
          group={group}
          key={group.key}
          modelReasoningLevels={modelReasoningLevels}
          resource={resource}
          revision={revision}
        />
      ))}
    </div>
  );
}

function ResourceFieldGroup({
  group,
  modelReasoningLevels,
  resource,
  revision
}: {
  group: FieldGroup;
  modelReasoningLevels: ModelReasoningLevelsState | undefined;
  resource: ConfigResource;
  revision: string;
}) {
  const { t } = useI18n();
  if (group.key === "reasoning") {
    return (
      <ReasoningFieldGroup
        group={group}
        modelReasoningLevels={modelReasoningLevels}
        resource={resource}
        revision={revision}
      />
    );
  }
  const toggleFields = group.fields.filter(isToggleField);
  const inputFields = group.fields.filter((field) => !isToggleField(field));

  return (
    <div
      aria-label={t(group.labelKey)}
      className={fieldGroupClass(resource.kind, group)}
      role="group"
    >
      <div className="resource-field-group__header">
        <h4>
          <span className="material-symbol" aria-hidden="true">
            {fieldGroupIcon(group)}
          </span>
          {t(group.labelKey)}
        </h4>
        <span>
          {t(group.fields.length === 1 ? "resource.fieldCount.one" : "resource.fieldCount.many", {
            count: group.fields.length
          })}
        </span>
      </div>
      {inputFields.length ? (
        <div className={fieldGridContainerClass(resource.kind, group)}>
          {renderInputFields(resource, revision, group, inputFields, modelReasoningLevels)}
        </div>
      ) : null}
      {toggleFields.length ? (
        <div className="switch-bank">
          {toggleFields.map((field) => (
            <GraphResourceField
              field={field}
              objectDisplay={fieldObjectDisplay(resource.kind, field, group)}
              resource={resource}
              revision={revision}
              key={`${resource.kind}-${resource.id}-${field.path}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ReasoningFieldGroup({
  group,
  modelReasoningLevels,
  resource,
  revision
}: {
  group: FieldGroup;
  modelReasoningLevels: ModelReasoningLevelsState | undefined;
  resource: ConfigResource;
  revision: string;
}) {
  const { t } = useI18n();
  const reasoningSupportField = group.key === "reasoning"
    ? group.fields.find((field) => field.path === "supports_reasoning")
    : undefined;
  const reasoningSupport = useModelReasoningSupport(resource, revision, reasoningSupportField);
  const supportsReasoning = requiredModelReasoningSupport(reasoningSupport).value;
  const visibleFields = group.fields.filter((field) => field.path !== "supports_reasoning");
  const toggleFields = visibleFields.filter(isToggleField);
  const inputFields = visibleFields.filter((field) => !isToggleField(field));

  return (
    <div
      aria-label={t(group.labelKey)}
      className={fieldGroupClass(resource.kind, group)}
      role="group"
    >
      <div className="resource-field-group__header">
        <h4>
          <span className="material-symbol" aria-hidden="true">
            {fieldGroupIcon(group)}
          </span>
          {t(group.labelKey)}
        </h4>
        {reasoningSupportField ? (
          <ReasoningSupportSwitch
            autosave={requiredModelReasoningSupport(reasoningSupport)}
            field={reasoningSupportField}
            resource={resource}
          />
        ) : null}
      </div>
      {supportsReasoning && inputFields.length ? (
        <div className={fieldGridContainerClass(resource.kind, group)}>
          {renderInputFields(resource, revision, group, inputFields, modelReasoningLevels)}
        </div>
      ) : null}
      {supportsReasoning && toggleFields.length ? (
        <div className="switch-bank">
          {toggleFields.map((field) => (
            <GraphResourceField
              field={field}
              objectDisplay={fieldObjectDisplay(resource.kind, field, group)}
              resource={resource}
              revision={revision}
              key={`${resource.kind}-${resource.id}-${field.path}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const advancedFeaturePaths = new Set(["web_search", "extensions"]);
const modelReasoningPaths = new Set([
  "supports_reasoning",
  "default_reasoning_level",
  "supported_reasoning_levels",
  "supports_reasoning_summaries",
  "default_reasoning_summary"
]);
const modelReasoningDefaultsPaths = [
  "default_reasoning_level",
  "default_reasoning_summary"
] as const;
const modelEditableListPaths = new Set(["input_modalities"]);
const modelFixedExpandedPaths = new Set(["web_search", "extensions"]);

const kindIcons: Record<string, string> = {
  provider: "dns",
  offer: "smart_toy",
  model: "smart_toy",
  route: "alt_route",
  defaults: "tune",
  server: "lan",
  cache: "database",
  persistence: "save",
  store: "database",
  proxy: "swap_horiz",
  plugin: "extension",
  extension: "extension"
};

function kindIcon(kind: string): string {
  return kindIcons[kind] ?? "tune";
}

function statusIcon(status: ResourceStatus): string {
  return statusIcons[status];
}

function impactIcon(impact: RuntimeImpact): string {
  return impactIcons[impact];
}

function isToggleField(field: FieldSchema): boolean {
  return field.type === "boolean" || field.control === "switch";
}

function deriveLiveStatus(
  statuses: Record<string, AutosaveFieldStatus>
): "saving" | "error" | "dirty" | null {
  const values = Object.values(statuses);
  if (values.includes("saving")) {
    return "saving";
  }
  if (values.includes("error")) {
    return "error";
  }
  if (values.includes("dirty")) {
    return "dirty";
  }
  return null;
}

const liveStatusKeys: Record<"saving" | "error" | "dirty", MessageKey> = {
  saving: "editor.liveSaving",
  error: "editor.liveError",
  dirty: "editor.liveUnsaved"
};

function liveStatusIcon(status: "saving" | "error" | "dirty") {
  if (status === "saving") {
    return "progress_activity";
  }
  if (status === "error") {
    return "error";
  }
  return "edit";
}

function groupFields(kind: ResourceKind, fields: FieldSchema[]): FieldGroup[] {
  const canRenderModelReasoning = kind === "model" &&
    fields.some((field) => field.path === "supports_reasoning");
  const groups: Record<FieldGroup["key"], FieldGroup> = {
    identity: { key: "identity", labelKey: "resource.group.identity", fields: [] },
    settings: { key: "settings", labelKey: "resource.group.settings", fields: [] },
    reasoning: { key: "reasoning", labelKey: "resource.group.reasoning", fields: [] },
    advancedFeatures: { key: "advancedFeatures", labelKey: "resource.group.advancedFeatures", fields: [] }
  };

  const order: FieldGroup["key"][] = [
    "identity",
    "settings",
    "reasoning",
    "advancedFeatures"
  ];

  for (const field of fields) {
    if (isIdentityField(field)) {
      groups.identity.fields.push(field);
    } else if (isModelReasoningField(kind, field) && canRenderModelReasoning) {
      groups.reasoning.fields.push(field);
    } else if (isAdvancedFeatureField(kind, field)) {
      groups.advancedFeatures.fields.push(field);
    } else if (isModelReasoningField(kind, field)) {
      continue;
    } else {
      groups.settings.fields.push(field);
    }
  }

  if (kind === "model") {
    groups.settings.fields = orderModelSettingsFields(groups.settings.fields);
    groups.reasoning.fields = orderModelReasoningFields(groups.reasoning.fields);
  }

  return order.map((key) => groups[key]).filter((group) => group.fields.length > 0);
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

function isAdvancedFeatureField(kind: ResourceKind, field: FieldSchema) {
  return (kind === "provider" || kind === "route") && advancedFeaturePaths.has(field.path);
}

function isModelReasoningField(kind: ResourceKind, field: FieldSchema) {
  return kind === "model" && modelReasoningPaths.has(field.path);
}

function fieldGroupClass(kind: ResourceKind, group: FieldGroup) {
  const base = `resource-field-group resource-field-group--${group.key}`;
  const classes = [base];
  if (group.key === "advancedFeatures" || group.key === "reasoning") {
    classes.push("resource-field-group--advanced");
  }
  if (group.key === "reasoning") {
    classes.push("resource-field-group--reasoning");
  }
  if (kind === "route" && group.key === "identity") {
    classes.push("resource-field-group--route-identity");
  }
  return classes.join(" ");
}

function fieldGridContainerClass(kind: ResourceKind, group: FieldGroup) {
  if (kind === "route" && group.key === "identity") {
    return "form-grid form-grid--route-identity";
  }
  return "form-grid";
}

function fieldGroupIcon(group: FieldGroup) {
  if (group.key === "identity") {
    return "badge";
  }
  if (group.key === "advancedFeatures") {
    return "extension";
  }
  if (group.key === "reasoning") {
    return "psychology";
  }
  return "tune";
}

function renderInputFields(
  resource: ConfigResource,
  revision: string,
  group: FieldGroup,
  fields: FieldSchema[],
  modelReasoningLevels: ModelReasoningLevelsState | undefined
) {
  const rendered: ReactNode[] = [];
  let index = 0;
  while (index < fields.length) {
    if (isModelReasoningDefaultsGroup(resource.kind, fields, index)) {
      const pair = fields.slice(index, index + modelReasoningDefaultsPaths.length);
      rendered.push(
        <div
          className="form-grid__wide form-grid__reasoning-defaults"
          key={`${resource.kind}-${resource.id}-reasoning-defaults`}
        >
          {pair.map((field) => renderInputField(resource, revision, group, field, modelReasoningLevels))}
        </div>
      );
      index += pair.length;
      continue;
    }
    rendered.push(renderInputField(resource, revision, group, fields[index], modelReasoningLevels));
    index += 1;
  }
  return rendered;
}

function renderInputField(
  resource: ConfigResource,
  revision: string,
  group: FieldGroup,
  field: FieldSchema,
  modelReasoningLevels: ModelReasoningLevelsState | undefined
) {
  if (isModelReasoningLevelsField(resource.kind, field)) {
    return (
      <div
        className="form-grid__wide"
        key={`${resource.kind}-${resource.id}-${field.path}`}
      >
        <EditableListResourceField
          field={field}
          autosave={requiredModelReasoningLevels(modelReasoningLevels)}
          valueFromDraft={reasoningLevelEffort}
          valueFromInput={newReasoningLevel}
        />
      </div>
    );
  }
  if (isModelEditableListField(resource.kind, field)) {
    return (
      <div
        className="form-grid__wide"
        key={`${resource.kind}-${resource.id}-${field.path}`}
      >
        <GenericEditableListResourceField
          field={field}
          resource={resource}
          revision={revision}
        />
      </div>
    );
  }
  if (isDefaultReasoningLevelField(resource.kind, field)) {
    return (
      <div
        className={fieldGridClass(field)}
        key={`${resource.kind}-${resource.id}-${field.path}`}
      >
        <DefaultReasoningLevelField
          field={field}
          levels={requiredModelReasoningLevels(modelReasoningLevels).value}
          resource={resource}
          revision={revision}
        />
      </div>
    );
  }
  return (
    <div
      className={fieldGridClass(field)}
      key={`${resource.kind}-${resource.id}-${field.path}`}
    >
      <GraphResourceField
        field={field}
        objectDisplay={fieldObjectDisplay(resource.kind, field, group)}
        resource={resource}
        revision={revision}
      />
    </div>
  );
}

function isModelEditableListField(kind: ResourceKind, field: FieldSchema) {
  return kind === "model" && modelEditableListPaths.has(field.path);
}

function isModelReasoningLevelsField(kind: ResourceKind, field: FieldSchema) {
  return kind === "model" && field.path === "supported_reasoning_levels";
}

function isDefaultReasoningLevelField(kind: ResourceKind, field: FieldSchema) {
  return kind === "model" && field.path === "default_reasoning_level";
}

function isModelReasoningDefaultsGroup(kind: ResourceKind, fields: FieldSchema[], index: number) {
  return (
    kind === "model" &&
    modelReasoningDefaultsPaths.every((path, offset) => fields[index + offset]?.path === path)
  );
}

function fieldObjectDisplay(kind: ResourceKind, field: FieldSchema, group: FieldGroup) {
  if (group.key === "advancedFeatures" || (kind === "model" && modelFixedExpandedPaths.has(field.path))) {
    return "expandedFixed";
  }
  return undefined;
}

function ReasoningSupportSwitch({
  autosave,
  field,
  resource
}: {
  autosave: BooleanFieldState;
  field: FieldSchema;
  resource: ConfigResource;
}) {
  const { locale } = useI18n();
  const docPath = configDocPathForResource(resource, field);
  const label = docPath ? configDescriptions[docPath].title[locale] : field.label;

  return (
    <span className="resource-field-group__switch" aria-label={label}>
      <MaterialSwitch
        disabled={autosave.status === "saving"}
        label={label}
        selected={autosave.value}
        onChange={autosave.commitValue}
      />
    </span>
  );
}

function GenericEditableListResourceField({
  field,
  resource,
  revision
}: {
  field: FieldSchema;
  resource: ConfigResource;
  revision: string;
}) {
  const autosave = useGenericEditableListState(resource, revision, field);
  return (
    <EditableListResourceField
      autosave={autosave}
      field={field}
      valueFromDraft={stringListItemLabel}
      valueFromInput={(input) => input}
    />
  );
}

function EditableListResourceField<T>({
  autosave,
  field,
  valueFromDraft,
  valueFromInput
}: {
  autosave: EditableListState<T>;
  field: FieldSchema;
  valueFromDraft: (item: T) => string;
  valueFromInput: (input: string) => T;
}) {
  const { locale, t } = useI18n();
  const [draft, setDraft] = useState("");
  const label = autosave.label[locale];
  const items = autosave.value;
  const trimmedDraft = draft.trim();
  const itemLabels = useMemo(
    () => items.map((item) => valueFromDraft(item)),
    [items, valueFromDraft]
  );
  const duplicateDraft = trimmedDraft ? itemLabels.includes(trimmedDraft) : false;
  const addDisabled = !trimmedDraft || duplicateDraft || autosave.status === "saving";

  function commitItems(nextItems: T[]) {
    autosave.commitValue(nextItems);
  }

  function addDraft() {
    if (!trimmedDraft || duplicateDraft) {
      return;
    }
    setDraft("");
    commitItems([...items, valueFromInput(trimmedDraft)]);
  }

  function removeItem(removed: T) {
    const removedLabel = valueFromDraft(removed);
    commitItems(items.filter((item) => valueFromDraft(item) !== removedLabel));
  }

  return (
    <div className="editable-list-field" aria-label={label}>
      <div className="editable-list-field__header">
        <span className="editable-list-field__title">{label}</span>
      </div>
      <md-chip-set className="editable-list-field__items" role="list" aria-label={label}>
        {items.map((item) => {
          const itemLabel = valueFromDraft(item);
          return (
            <MaterialInputChip
              className="editable-list-field__chip"
              disabled={autosave.status === "saving"}
              key={itemLabel}
              label={t("field.editableList.remove", { item: itemLabel, label })}
              onRemove={() => removeItem(item)}
            >
              {itemLabel}
            </MaterialInputChip>
          );
        })}
      </md-chip-set>
      <div className="editable-list-field__composer">
        <MaterialOutlinedTextField
          ariaLabel={t("field.editableList.addInput", { label })}
          className="editable-list-field__input"
          label={t("field.editableList.addInput", { label })}
          spellCheck={false}
          value={draft}
          onInput={setDraft}
          onBlur={() => undefined}
        />
        <MaterialFilledButton
          ariaLabel={t("field.editableList.addAction", { label })}
          className="editable-list-field__add"
          disabled={addDisabled}
          icon="add"
          onClick={addDraft}
        >
          {t("field.editableList.add")}
        </MaterialFilledButton>
      </div>
      {autosave.error ? (
        <p className="field-error" role="alert">
          {autosave.error.message}
        </p>
      ) : null}
    </div>
  );
}

type ReasoningLevelPreset = {
  effort: string;
  description?: string;
};

type LocalizedLabel = Record<"en-US" | "zh-CN", string>;

type BooleanFieldState = {
  commitValue: (value: boolean) => void;
  status: AutosaveFieldStatus;
  value: boolean;
};

type EditableListState<T> = {
  commitValue: (value: T[]) => void;
  error?: FieldError;
  label: LocalizedLabel;
  status: AutosaveFieldStatus;
  value: T[];
};

type ModelReasoningLevelsState = EditableListState<ReasoningLevelPreset>;

function useModelReasoningSupport(
  resource: ConfigResource,
  revision: string,
  field: FieldSchema | undefined
): BooleanFieldState | undefined {
  const { t } = useI18n();
  const selected = field ? resource.value[field.path] === true : false;
  const saveGraphField = useGraphFieldSaver<boolean>();
  const save = useCallback(
    (request: SaveFieldRequest<boolean>) => saveGraphField(request),
    [saveGraphField]
  );
  const autosave = useAutosaveField({
    resourceKind: resource.kind,
    resourceId: resource.id,
    field: "supports_reasoning",
    committedValue: selected,
    revision,
    save,
    disabled: !field,
    configUpdateFailedMessage: (result) => t("field.configUpdateFailed", { result }),
    requestFailedMessage: t("error.requestFailed")
  });
  useReportFieldStatus(`${resource.kind}:${resource.id}:supports_reasoning`, autosave.status);
  if (!field) {
    return undefined;
  }
  return {
    commitValue: autosave.commitValue,
    status: autosave.status,
    value: autosave.value
  };
}

function requiredModelReasoningSupport(state: BooleanFieldState | undefined) {
  if (!state) {
    throw new Error("Model reasoning support field is required to render model reasoning controls.");
  }
  return state;
}

function useGenericEditableListState(
  resource: ConfigResource,
  revision: string,
  field: FieldSchema
): EditableListState<string> {
  const { t } = useI18n();
  const value = resource.value[field.path];
  const committedItemsKey = Array.isArray(value)
    ? JSON.stringify(value.map((item) => String(item)))
    : "[]";
  const committedItems = useMemo(
    () => JSON.parse(committedItemsKey) as string[],
    [committedItemsKey]
  );
  const saveGraphField = useGraphFieldSaver<string[]>();
  const save = useCallback(
    (request: SaveFieldRequest<string[]>) => saveGraphField(request),
    [saveGraphField]
  );
  const autosave = useAutosaveField({
    resourceKind: resource.kind,
    resourceId: resource.id,
    field: field.path,
    committedValue: committedItems,
    revision,
    save,
    configUpdateFailedMessage: (result) => t("field.configUpdateFailed", { result }),
    requestFailedMessage: t("error.requestFailed")
  });
  useReportFieldStatus(`${resource.kind}:${resource.id}:${field.path}`, autosave.status);
  const docPath = configDocPathForResource(resource, field);
  const label = docPath ? configDescriptions[docPath].title : localizedFallback(field.label);
  return {
    commitValue: autosave.commitValue,
    error: autosave.error,
    label,
    status: autosave.status,
    value: autosave.value
  };
}

function useModelReasoningLevels(
  resource: ConfigResource,
  revision: string,
  field: FieldSchema | undefined
): ModelReasoningLevelsState | undefined {
  const { t } = useI18n();
  const value = field ? resource.value[field.path] : undefined;
  const committedItemsKey = JSON.stringify(toReasoningLevelPresets(value));
  const committedItems = useMemo(
    () => JSON.parse(committedItemsKey) as ReasoningLevelPreset[],
    [committedItemsKey]
  );
  const saveGraphField = useGraphFieldSaver<ReasoningLevelPreset[]>();
  const save = useCallback(
    (request: SaveFieldRequest<ReasoningLevelPreset[]>) => saveGraphField(request),
    [saveGraphField]
  );
  const autosave = useAutosaveField({
    resourceKind: resource.kind,
    resourceId: resource.id,
    field: "supported_reasoning_levels",
    committedValue: committedItems,
    revision,
    save,
    disabled: !field,
    configUpdateFailedMessage: (result) => t("field.configUpdateFailed", { result }),
    requestFailedMessage: t("error.requestFailed")
  });
  useReportFieldStatus(`${resource.kind}:${resource.id}:supported_reasoning_levels`, autosave.status);
  if (!field) {
    return undefined;
  }
  const docPath = configDocPathForResource(resource, field);
  return {
    commitValue: autosave.commitValue,
    error: autosave.error,
    label: docPath ? configDescriptions[docPath].title : localizedFallback(field.label),
    status: autosave.status,
    value: autosave.value
  };
}

function requiredModelReasoningLevels(state: ModelReasoningLevelsState | undefined) {
  if (!state) {
    throw new Error("Model reasoning levels field is required to render model reasoning controls.");
  }
  return state;
}

function DefaultReasoningLevelField({
  field,
  levels,
  resource,
  revision
}: {
  field: FieldSchema;
  levels: ReasoningLevelPreset[];
  resource: ConfigResource;
  revision: string;
}) {
  const { locale, t } = useI18n();
  const value = resource.value[field.path];
  const selected = typeof value === "string" ? value : "";
  const saveGraphField = useGraphFieldSaver<string>();
  const save = useCallback(
    (request: SaveFieldRequest<string>) => saveGraphField(request),
    [saveGraphField]
  );
  const autosave = useAutosaveField({
    resourceKind: resource.kind,
    resourceId: resource.id,
    field: field.path,
    committedValue: selected,
    revision,
    save,
    configUpdateFailedMessage: (result) => t("field.configUpdateFailed", { result }),
    requestFailedMessage: t("error.requestFailed")
  });
  useReportFieldStatus(`${resource.kind}:${resource.id}:${field.path}`, autosave.status);
  const docPath = configDocPathForResource(resource, field);
  const label = docPath ? configDescriptions[docPath].title[locale] : field.label;
  const options = useMemo(
    () => reasoningLevelOptions(levels, autosave.value),
    [autosave.value, levels]
  );

  return (
    <div className="mb-field" data-variant="select">
      <div className="mb-field__control">
        <MaterialSelect
          ariaLabel={label}
          disabled={autosave.status === "saving"}
          error={Boolean(autosave.error)}
          errorText={autosave.error?.message}
          label={label}
          options={options}
          required={field.required}
          value={autosave.value}
          onChange={autosave.commitValue}
        />
      </div>
      {autosave.error ? (
        <p className="field-error" role="alert">
          {autosave.error.message}
        </p>
      ) : null}
    </div>
  );
}

function toReasoningLevelPresets(value: unknown): ReasoningLevelPreset[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      if (typeof item === "string") {
        return { effort: item };
      }
      if (!item || typeof item !== "object") {
        return undefined;
      }
      const effort = "effort" in item ? (item as { effort?: unknown }).effort : undefined;
      if (typeof effort !== "string" || effort.trim() === "") {
        return undefined;
      }
      const description = "description" in item ? (item as { description?: unknown }).description : undefined;
      return typeof description === "string" && description.trim()
        ? { effort, description }
        : { effort };
    })
    .filter((item): item is ReasoningLevelPreset => item !== undefined);
}

function reasoningLevelOptions(levels: ReasoningLevelPreset[], selected: string): MaterialSelectOption[] {
  const options = levels.map((level) => ({
    value: level.effort,
    label: level.effort
  }));
  if (selected && !options.some((option) => option.value === selected)) {
    return [{ value: selected, label: selected }, ...options];
  }
  return options;
}

function reasoningLevelEffort(item: unknown) {
  if (!item || typeof item !== "object" || !("effort" in item) || typeof item.effort !== "string") {
    throw new Error("Reasoning level preset requires a string effort.");
  }
  return item.effort;
}

function newReasoningLevel(effort: string): ReasoningLevelPreset {
  return { effort };
}

function stringListItemLabel(item: unknown) {
  if (typeof item !== "string") {
    throw new Error("Editable string list item must be a string.");
  }
  return item;
}

function localizedFallback(label: string): LocalizedLabel {
  return {
    "en-US": label,
    "zh-CN": label
  };
}

function orderModelSettingsFields(fields: FieldSchema[]) {
  return moveFieldAfter(fields, "default_reasoning_summary", "default_reasoning_level");
}

function orderModelReasoningFields(fields: FieldSchema[]) {
  return [
    "supports_reasoning",
    "default_reasoning_level",
    "default_reasoning_summary",
    "supported_reasoning_levels",
    "supports_reasoning_summaries"
  ].flatMap((path) => fields.filter((field) => field.path === path))
    .concat(fields.filter((field) => !modelReasoningPaths.has(field.path)));
}

function moveFieldAfter(fields: FieldSchema[], movedPath: string, targetPath: string) {
  const movedIndex = fields.findIndex((field) => field.path === movedPath);
  const targetIndex = fields.findIndex((field) => field.path === targetPath);
  if (movedIndex < 0 || targetIndex < 0 || movedIndex === targetIndex + 1) {
    return fields;
  }
  const ordered = fields.filter((field) => field.path !== movedPath);
  const insertAfterIndex = ordered.findIndex((field) => field.path === targetPath);
  ordered.splice(insertAfterIndex + 1, 0, fields[movedIndex]);
  return ordered;
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

function errorMessage(cause: unknown, fallback: string) {
  const rawErrors = rawErrorsFrom(cause);
  if (rawErrors.length > 0 && typeof rawErrors[0]?.message === "string") {
    return rawErrors[0].message;
  }
  if (cause instanceof Error) {
    return cause.message;
  }
  return fallback;
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
