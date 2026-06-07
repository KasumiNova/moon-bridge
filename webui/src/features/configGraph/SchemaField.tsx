import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import type { FieldSchema } from "../../rpc/types";
import { FieldStatus } from "./FieldStatus";
import type { AutosaveFieldStatus } from "./useAutosaveField";

export type SchemaFieldProps = {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  status?: AutosaveFieldStatus;
  error?: string;
};

export function SchemaField({
  field,
  value,
  onChange,
  disabled = false,
  status,
  error
}: SchemaFieldProps) {
  const id = useMemo(() => `schema-field-${field.path.replace(/[^a-zA-Z0-9_-]/g, "-")}`, [field.path]);
  const [text, setText] = useState(displayValue(field, value));
  const [parseError, setParseError] = useState("");

  useEffect(() => {
    setText(displayValue(field, value));
    setParseError("");
  }, [field, value]);

  const statusNode = status ? <FieldStatus status={status} message={error ?? parseError} /> : null;

  if (field.control === "select" || (field.enum?.length ?? 0) > 0) {
    return (
      <label className="schema-field" htmlFor={id}>
        <span className="schema-field__label">{field.label}</span>
        <select
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
        {statusNode}
      </label>
    );
  }

  if (field.type === "boolean" || field.control === "switch") {
    return (
      <label className="schema-field schema-field--inline" htmlFor={id}>
        <input
          id={id}
          checked={Boolean(value)}
          disabled={disabled}
          type="checkbox"
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
        <span className="schema-field__label">{field.label}</span>
        {statusNode}
      </label>
    );
  }

  if (field.control === "textarea") {
    return (
      <label className="schema-field" htmlFor={id}>
        <span className="schema-field__label">{field.label}</span>
        <textarea
          id={id}
          disabled={disabled}
          value={text}
          onChange={(event) => updateText(event, onChange, field)}
        />
        {statusNode}
      </label>
    );
  }

  if (field.type === "object" || field.type === "array" || field.control === "object" || field.control === "array") {
    return (
      <label className="schema-field" htmlFor={id}>
        <span className="schema-field__label">{field.label}</span>
        <textarea
          aria-invalid={parseError ? "true" : undefined}
          id={id}
          disabled={disabled}
          spellCheck={false}
          value={text}
          onChange={(event) => updateJSON(event.currentTarget.value)}
        />
        {statusNode}
      </label>
    );
  }

  return (
    <label className="schema-field" htmlFor={id}>
      <span className="schema-field__label">{field.label}</span>
      <input
        autoComplete={field.secret ? "new-password" : undefined}
        disabled={disabled}
        id={id}
        type={inputType(field)}
        value={text}
        onChange={(event) => updateText(event, onChange, field)}
      />
      {statusNode}
    </label>
  );

  function updateJSON(next: string) {
    setText(next);
    try {
      const parsed = JSON.parse(next);
      setParseError("");
      onChange(parsed);
    } catch (cause) {
      setParseError(cause instanceof Error ? cause.message : "Invalid JSON");
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
