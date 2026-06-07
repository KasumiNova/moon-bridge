import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldError, PatchOp, PatchResponse, ResourceKind } from "../../rpc/types";

export type AutosaveFieldStatus = "idle" | "dirty" | "saving" | "saved" | "error";

export type SaveFieldRequest<T> = {
  baseRevision: string;
  change: PatchOp & { value: T };
};

export type SaveField<T> = (request: SaveFieldRequest<T>) => Promise<PatchResponse>;

export type UseAutosaveFieldOptions<T> = {
  resourceKind: ResourceKind;
  resourceId: string;
  field: string;
  committedValue: T;
  revision: string;
  save: SaveField<T>;
  debounceMs?: number;
  disabled?: boolean;
};

export type AutosaveFieldState<T> = {
  value: T;
  status: AutosaveFieldStatus;
  error?: FieldError;
  setValue: (value: T) => void;
  reset: () => void;
};

export function useAutosaveField<T>({
  resourceKind,
  resourceId,
  field,
  committedValue,
  revision,
  save,
  debounceMs = 450,
  disabled = false
}: UseAutosaveFieldOptions<T>): AutosaveFieldState<T> {
  const [value, setValueState] = useState<T>(committedValue);
  const [status, setStatus] = useState<AutosaveFieldStatus>("idle");
  const [error, setError] = useState<FieldError | undefined>();
  const saveSeq = useRef(0);
  const committedRef = useRef(committedValue);

  useEffect(() => {
    committedRef.current = committedValue;
    setValueState(committedValue);
    setError(undefined);
    setStatus("idle");
  }, [committedValue, revision]);

  const setValue = useCallback(
    (next: T) => {
      setValueState(next);
      setError(undefined);
      setStatus(valuesEqual(next, committedRef.current) ? "idle" : "dirty");
    },
    []
  );

  const reset = useCallback(() => {
    setValueState(committedRef.current);
    setError(undefined);
    setStatus("idle");
  }, []);

  useEffect(() => {
    if (disabled || status !== "dirty") {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      const sequence = ++saveSeq.current;
      const pendingValue = value;
      setStatus("saving");

      save({
        baseRevision: revision,
        change: {
          kind: resourceKind,
          id: resourceId,
          field,
          value: pendingValue
        }
      })
        .then((response) => {
          if (sequence !== saveSeq.current) {
            return;
          }
          applySaveResponse(response, pendingValue);
        })
        .catch((cause: unknown) => {
          if (sequence !== saveSeq.current) {
            return;
          }
          setError({
            resourceKind,
            resourceId,
            field,
            code: "requestFailed",
            message: cause instanceof Error ? cause.message : "Request failed"
          });
          setStatus("error");
        });
    }, debounceMs);

    return () => window.clearTimeout(timeout);
  }, [debounceMs, disabled, field, resourceId, resourceKind, revision, save, status, value]);

  return { value, status, error, setValue, reset };

  function applySaveResponse(response: PatchResponse, pendingValue: T) {
    const fieldError = findFieldError(response.errors, resourceKind, resourceId, field);
    switch (response.result) {
      case "committed":
      case "restartRequired":
        committedRef.current = pendingValue;
        setError(undefined);
        setStatus("saved");
        return;
      case "draftRejected":
      case "validationRejected":
      case "revisionConflict":
        setError(fieldError ?? genericPatchError(response, resourceKind, resourceId, field));
        setStatus("error");
        return;
      case "runtimeRejected": {
        const rollback = response.rollbackValue === undefined
          ? committedRef.current
          : response.rollbackValue as T;
        setValueState(rollback);
        setError(fieldError ?? genericPatchError(response, resourceKind, resourceId, field));
        setStatus("error");
        return;
      }
      default:
        setError(genericPatchError(response, resourceKind, resourceId, field));
        setStatus("error");
    }
  }
}

function findFieldError(
  errors: FieldError[] | undefined,
  resourceKind: ResourceKind,
  resourceId: string,
  field: string
) {
  return errors?.find((error) =>
    (error.resourceKind === resourceKind || error.resourceKind === "") &&
    (error.resourceId === resourceId || error.resourceId === "") &&
    (!error.field || error.field === field)
  ) ?? errors?.[0];
}

function genericPatchError(
  response: PatchResponse,
  resourceKind: ResourceKind,
  resourceId: string,
  field: string
): FieldError {
  return {
    resourceKind,
    resourceId,
    field,
    code: response.result,
    message: `Config update ${response.result}`
  };
}

function valuesEqual(left: unknown, right: unknown) {
  if (Object.is(left, right)) {
    return true;
  }
  if (typeof left !== "object" || left === null || typeof right !== "object" || right === null) {
    return false;
  }
  return JSON.stringify(left) === JSON.stringify(right);
}
