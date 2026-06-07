import { useCallback } from "react";
import type { ConfigResource, FieldSchema } from "../../rpc/types";
import { SchemaField } from "./SchemaField";
import { useAutosaveField, type SaveFieldRequest } from "./useAutosaveField";
import { useGraphFieldSaver } from "./useConfigGraph";

export function GraphResourceField({
  resource,
  field,
  revision
}: {
  resource: ConfigResource;
  field: FieldSchema;
  revision: string;
}) {
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
    save
  });

  return (
    <SchemaField
      error={autosave.error?.message}
      field={field}
      idPrefix={`${resource.kind}-${resource.id}`}
      onChange={autosave.setValue}
      status={autosave.status}
      value={autosave.value}
    />
  );
}
