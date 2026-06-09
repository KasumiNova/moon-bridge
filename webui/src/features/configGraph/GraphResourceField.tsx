import { useCallback } from "react";
import type { ConfigResource, FieldSchema } from "../../rpc/types";
import { useI18n } from "../../i18n/I18nProvider";
import { SchemaField } from "./SchemaField";
import { configDocPathForResource } from "./configDocPath";
import { useAutosaveField, type SaveFieldRequest } from "./useAutosaveField";
import { useReportFieldStatus } from "./editorStatus";
import { useGraphFieldSaver } from "./useConfigGraph";
import { resourceFieldModelIcon } from "./modelProviderIcons";

export function GraphResourceField({
  resource,
  field,
  objectDisplay,
  revision,
  modelDisplayNames = {}
}: {
  modelDisplayNames?: Record<string, string>;
  resource: ConfigResource;
  field: FieldSchema;
  objectDisplay?: "collapsible" | "expandedFixed";
  revision: string;
}) {
  const { t } = useI18n();
  const saveGraphField = useGraphFieldSaver<unknown>();
  const save = useCallback(
    (request: SaveFieldRequest<unknown>) => saveGraphField(request),
    [saveGraphField]
  );
  const autosave = useAutosaveField({
    resourceKind: resource.kind,
    resourceId: resource.id,
    field: field.path,
    committedValue: resource.value[field.path],
    revision,
    save,
    configUpdateFailedMessage: (result) => t("field.configUpdateFailed", { result }),
    requestFailedMessage: t("error.requestFailed")
  });
  useReportFieldStatus(`${resource.kind}:${resource.id}:${field.path}`, autosave.status);
  const draftResource = {
    ...resource,
    value: {
      ...resource.value,
      [field.path]: autosave.value
    }
  };

  return (
    <SchemaField
      error={autosave.error?.message}
      field={field}
      idPrefix={`${resource.kind}-${resource.id}`}
      leadingIconNode={resourceFieldModelIcon(draftResource, field, modelDisplayNames)}
      docPath={configDocPathForResource(resource, field)}
      objectDisplay={objectDisplay}
      onChange={autosave.setValue}
      onCommit={autosave.commit}
      onCommitValue={autosave.commitValue}
      value={autosave.value}
    />
  );
}
