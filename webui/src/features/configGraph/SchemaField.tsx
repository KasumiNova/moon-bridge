import { type ChangeEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import type { FieldSchema } from "../../rpc/types";
import { useI18n } from "../../i18n/I18nProvider";
import { FieldStatus } from "./FieldStatus";
import type { AutosaveFieldStatus } from "./useAutosaveField";

export type SchemaFieldProps = {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  idPrefix?: string;
  status?: AutosaveFieldStatus;
  error?: string;
};

export function SchemaField({
  field,
  value,
  onChange,
  disabled = false,
  idPrefix,
  status,
  error
}: SchemaFieldProps) {
  const { t } = useI18n();
  const id = useMemo(() => {
    const prefix = idPrefix ? `${idPrefix}-` : "";
    return `schema-field-${prefix}${field.path}`.replace(/[^a-zA-Z0-9_-]/g, "-");
  }, [field.path, idPrefix]);
  const [text, setText] = useState(displayValue(field, value));
  const [parseError, setParseError] = useState("");

  useEffect(() => {
    setText(displayValue(field, value));
    setParseError("");
  }, [field, value]);

  const statusNode = status ? <FieldStatus status={status} message={error ?? parseError} /> : null;
  const wide = isWideField(field);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [
    field.secret ? hintId : undefined,
    parseError ? errorId : undefined
  ].filter(Boolean).join(" ") || undefined;

  if (field.control === "select" || (field.enum?.length ?? 0) > 0) {
    return (
      <div className={schemaFieldClass(wide)}>
        <FieldTopline field={field} id={id} statusNode={statusNode} />
        <select
          aria-describedby={describedBy}
          id={id}
          disabled={disabled}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.currentTarget.value)}
        >
          {field.enum?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <FieldMessages errorId={errorId} hintId={hintId} parseError={parseError} secret={field.secret} />
      </div>
    );
  }

  if (field.type === "boolean" || field.control === "switch") {
    return (
      <div className="schema-field schema-field--inline">
        <label className="schema-field__checkbox-label" htmlFor={id}>
          <input
            id={id}
            checked={Boolean(value)}
            disabled={disabled}
            type="checkbox"
            onChange={(event) => onChange(event.currentTarget.checked)}
          />
          <span className="schema-field__label">
            {field.label}
            {field.required ? <span className="schema-field__required" aria-hidden="true">*</span> : null}
          </span>
        </label>
        {statusNode}
      </div>
    );
  }

  if (field.control === "textarea") {
    return (
      <div className={schemaFieldClass(wide)}>
        <FieldTopline field={field} id={id} statusNode={statusNode} />
        <textarea
          aria-describedby={describedBy}
          id={id}
          disabled={disabled}
          value={text}
          onChange={(event) => updateText(event, onChange, field)}
        />
        <FieldMessages errorId={errorId} hintId={hintId} parseError={parseError} secret={field.secret} />
      </div>
    );
  }

  if (field.type === "object" || field.type === "array" || field.control === "object" || field.control === "array") {
    return (
      <div className={schemaFieldClass(wide)}>
        <FieldTopline field={field} id={id} statusNode={statusNode} />
        <textarea
          aria-describedby={describedBy}
          aria-invalid={parseError ? "true" : undefined}
          id={id}
          disabled={disabled}
          spellCheck={false}
          value={text}
          onChange={(event) => updateJSON(event.currentTarget.value)}
        />
        <FieldMessages errorId={errorId} hintId={hintId} parseError={parseError} secret={field.secret} />
      </div>
    );
  }

  return (
    <div className={schemaFieldClass(wide)}>
      <FieldTopline field={field} id={id} statusNode={statusNode} />
      <input
        aria-describedby={describedBy}
        autoComplete={field.secret ? "new-password" : undefined}
        disabled={disabled}
        id={id}
        type={inputType(field)}
        value={text}
        onChange={(event) => updateText(event, onChange, field)}
      />
      <FieldMessages errorId={errorId} hintId={hintId} parseError={parseError} secret={field.secret} />
    </div>
  );

  function updateJSON(next: string) {
    setText(next);
    try {
      const parsed = JSON.parse(next);
      setParseError("");
      onChange(parsed);
    } catch (cause) {
      setParseError(cause instanceof Error ? cause.message : t("field.invalidJson"));
    }
  }

  function updateText(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    emit: (value: unknown) => void,
    schema: FieldSchema
  ) {
    const next = event.currentTarget.value;
    setText(next);
    if (schema.type === "number" || schema.control === "number") {
      emit(next === "" ? undefined : Number(next));
      return;
    }
    emit(next);
  }
}

function FieldTopline({
  field,
  id,
  statusNode
}: {
  field: FieldSchema;
  id: string;
  statusNode: ReactNode;
}) {
  return (
    <div className="schema-field__topline">
      <label className="schema-field__label" htmlFor={id}>
        {field.label}
        {field.required ? <span className="schema-field__required" aria-hidden="true">*</span> : null}
      </label>
      {statusNode}
    </div>
  );
}

function FieldMessages({
  errorId,
  hintId,
  parseError,
  secret
}: {
  errorId: string;
  hintId: string;
  parseError: string;
  secret?: boolean;
}) {
  const { t } = useI18n();
  return (
    <>
      {secret ? (
        <p className="field-hint" id={hintId}>
          {t("field.secretReplacementHint")}
        </p>
      ) : null}
      {parseError ? (
        <p className="field-error" id={errorId} role="alert">
          {t("field.invalidJsonWithMessage", { message: parseError })}
        </p>
      ) : null}
    </>
  );
}

function schemaFieldClass(wide: boolean) {
  return wide ? "schema-field schema-field--wide" : "schema-field";
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

function displayValue(field: FieldSchema, value: unknown) {
  if (field.secret) {
    return "";
  }
  if (value === undefined || value === null) {
    return "";
  }
  if (field.type === "object" || field.type === "array" || field.control === "object" || field.control === "array") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function inputType(field: FieldSchema) {
  if (field.secret || field.control === "secret") {
    return "password";
  }
  if (field.type === "number" || field.control === "number") {
    return "number";
  }
  return "text";
}
