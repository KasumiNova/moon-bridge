import { type ChangeEvent, type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { configDescriptions, type ConfigPath } from "../../configDocs/configDescriptions";
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
  docPath?: ConfigPath;
  status?: AutosaveFieldStatus;
  error?: string;
};

export function SchemaField({
  field,
  value,
  onChange,
  disabled = false,
  idPrefix,
  docPath,
  status,
  error
}: SchemaFieldProps) {
  const { locale, t } = useI18n();
  const id = useMemo(() => {
    const prefix = idPrefix ? `${idPrefix}-` : "";
    return `schema-field-${prefix}${field.path}`.replace(/[^a-zA-Z0-9_-]/g, "-");
  }, [field.path, idPrefix]);
  const [text, setText] = useState(displayValue(field, value));
  const [parseError, setParseError] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [jsonExpanded, setJsonExpanded] = useState(parseError !== "");
  const jsonEditorRef = useRef<HTMLTextAreaElement>(null);
  const jsonSummaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setText(displayValue(field, value));
    setParseError("");
  }, [field, value]);

  useEffect(() => {
    if (jsonExpanded) {
      jsonEditorRef.current?.focus();
    }
  }, [jsonExpanded]);

  const statusNode = status ? <FieldStatus status={status} message={error ?? parseError} /> : null;
  const wide = isWideField(field);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const helpText = fieldHelpText(field, docPath, locale);
  const describedBy = [
    field.secret ? hintId : undefined,
    helpOpen ? helpId : undefined,
    parseError ? errorId : undefined
  ].filter(Boolean).join(" ") || undefined;

  if (field.control === "select" || (field.enum?.length ?? 0) > 0) {
    const labelId = `${id}-label`;
    return (
      <div className={schemaFieldClass(wide)}>
        <FieldTopline
          field={field}
          helpId={helpId}
          helpOpen={helpOpen}
          helpText={helpText}
          id={id}
          labelId={labelId}
          labelForControl={false}
          setHelpOpen={setHelpOpen}
          statusNode={statusNode}
        />
        <div
          aria-describedby={describedBy}
          aria-labelledby={labelId}
          className="schema-option-group"
          id={id}
          role="group"
        >
          {field.enum?.map((option) => (
            <button
              key={option}
              type="button"
              className={optionButtonClass(field, option, value)}
              disabled={disabled}
              aria-pressed={value === option}
              onClick={() => onChange(option)}
            >
              {optionLabel(option)}
            </button>
          ))}
        </div>
        <FieldMessages errorId={errorId} hintId={hintId} parseError={parseError} secret={field.secret} />
      </div>
    );
  }

  if (field.type === "boolean" || field.control === "switch") {
    return (
      <div className="schema-field schema-field--inline">
        <div className="schema-field__switch-line">
          <span className="schema-field__label">
            {field.label}
            {field.required ? <span className="schema-field__required" aria-hidden="true">*</span> : null}
          </span>
          <FieldHelpButton
            field={field}
            helpId={helpId}
            helpOpen={helpOpen}
            helpText={helpText}
            setHelpOpen={setHelpOpen}
          />
          <button
            type="button"
            className={Boolean(value) ? "schema-switch schema-switch--selected" : "schema-switch"}
            disabled={disabled}
            role="switch"
            aria-checked={Boolean(value)}
            aria-label={field.label}
            aria-describedby={helpOpen ? helpId : undefined}
            onClick={() => onChange(!Boolean(value))}
          >
            <span aria-hidden="true" />
          </button>
        </div>
        {statusNode}
      </div>
    );
  }

  if (field.control === "textarea") {
    return (
      <div className={schemaFieldClass(wide)}>
        <FieldTopline
          field={field}
          helpId={helpId}
          helpOpen={helpOpen}
          helpText={helpText}
          id={id}
          setHelpOpen={setHelpOpen}
          statusNode={statusNode}
        />
        <textarea
          aria-describedby={describedBy}
          aria-invalid={parseError ? "true" : undefined}
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
    const summaryId = `${id}-summary`;
    const summary = jsonSummary(value, field);
    return (
      <div className={schemaFieldClass(wide)}>
        <FieldTopline
          field={field}
          helpId={helpId}
          helpOpen={helpOpen}
          helpText={helpText}
          id={jsonExpanded ? id : summaryId}
          setHelpOpen={setHelpOpen}
          statusNode={statusNode}
        />
        <button
          id={summaryId}
          ref={jsonSummaryRef}
          type="button"
          className="schema-json-summary"
          aria-label={`${field.label}, ${summary}`}
          aria-expanded={jsonExpanded}
          aria-controls={id}
          onClick={() => {
            setJsonExpanded((expanded) => {
              if (expanded) {
                window.requestAnimationFrame(() => jsonSummaryRef.current?.focus());
              }
              return !expanded;
            });
          }}
        >
          <span>{field.label}</span>
          <strong>{summary}</strong>
          <span className="material-symbol" aria-hidden="true">
            {jsonExpanded ? "expand_less" : "expand_more"}
          </span>
        </button>
        {jsonExpanded ? (
          <textarea
            aria-describedby={describedBy}
            aria-invalid={parseError ? "true" : undefined}
            aria-label={`${field.label} JSON editor`}
            id={id}
            ref={jsonEditorRef}
            disabled={disabled}
            spellCheck={false}
            value={text}
            onChange={(event) => updateJSON(event.currentTarget.value)}
          />
        ) : null}
        <FieldMessages errorId={errorId} hintId={hintId} parseError={parseError} secret={field.secret} />
      </div>
    );
  }

  return (
    <div className={schemaFieldClass(wide)}>
      <FieldTopline
        field={field}
        helpId={helpId}
        helpOpen={helpOpen}
        helpText={helpText}
        id={id}
        setHelpOpen={setHelpOpen}
        statusNode={statusNode}
      />
      <input
        aria-describedby={describedBy}
        autoComplete={field.secret ? "new-password" : undefined}
        aria-invalid={parseError ? "true" : undefined}
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
      const message = cause instanceof Error ? cause.message : t("field.invalidJson");
      setParseError(t("field.invalidJsonWithMessage", { message }));
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
      if (next === "") {
        setParseError("");
        emit(undefined);
        return;
      }
      const parsed = Number(next);
      if (!Number.isFinite(parsed)) {
        setParseError(t("field.invalidNumber"));
        return;
      }
      setParseError("");
      emit(parsed);
      return;
    }
    setParseError("");
    emit(next);
  }
}

function FieldTopline({
  field,
  helpId,
  helpOpen,
  helpText,
  id,
  labelForControl = true,
  labelId,
  setHelpOpen,
  statusNode
}: {
  field: FieldSchema;
  helpId: string;
  helpOpen: boolean;
  helpText: string;
  id: string;
  labelForControl?: boolean;
  labelId?: string;
  setHelpOpen: (open: boolean | ((current: boolean) => boolean)) => void;
  statusNode: ReactNode;
}) {
  const labelContent = (
    <>
      {field.label}
      {field.required ? <span className="schema-field__required" aria-hidden="true">*</span> : null}
    </>
  );

  return (
    <div className="schema-field__topline">
      <span className="schema-field__label-row">
        {labelForControl ? (
          <label className="schema-field__label" htmlFor={id}>
            {labelContent}
          </label>
        ) : (
          <span className="schema-field__label" id={labelId}>
            {labelContent}
          </span>
        )}
        <FieldHelpButton
          field={field}
          helpId={helpId}
          helpOpen={helpOpen}
          helpText={helpText}
          setHelpOpen={setHelpOpen}
        />
      </span>
      {statusNode}
    </div>
  );
}

function FieldHelpButton({
  field,
  helpId,
  helpOpen,
  helpText,
  setHelpOpen
}: {
  field: FieldSchema;
  helpId: string;
  helpOpen: boolean;
  helpText: string;
  setHelpOpen: (open: boolean | ((current: boolean) => boolean)) => void;
}) {
  const openedByHover = useRef(false);

  return (
    <span className="schema-field__help-wrap">
      <button
        type="button"
        className="schema-field__help"
        aria-label={`Help for ${field.label}`}
        aria-describedby={helpOpen ? helpId : undefined}
        onBlur={() => setHelpOpen(false)}
        onClick={() => {
          if (openedByHover.current) {
            openedByHover.current = false;
            setHelpOpen(true);
            return;
          }
          setHelpOpen((open) => !open);
        }}
        onFocus={() => setHelpOpen(true)}
        onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
          if (event.key === "Escape") {
            setHelpOpen(false);
          }
        }}
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => {
          openedByHover.current = true;
          setHelpOpen(true);
        }}
        onMouseLeave={() => {
          openedByHover.current = false;
          setHelpOpen(false);
        }}
      >
        ?
      </button>
      {helpOpen ? (
        <span className="schema-field__tooltip" id={helpId} role="tooltip">
          {helpText}
        </span>
      ) : null}
    </span>
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
          {parseError}
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
    return "text";
  }
  return "text";
}

function fieldHelpText(field: FieldSchema, docPath: ConfigPath | undefined, locale: "en-US" | "zh-CN") {
  const entry = docPath ? configDescriptions[docPath] : undefined;
  if (entry) {
    return [
      entry.description[locale],
      `Type: ${entry.type}`,
      entry.defaultValue ? `Default: ${entry.defaultValue}` : undefined,
      entry.sensitive || field.secret ? "Sensitive" : undefined
    ].filter(Boolean).join(" ");
  }
  return `${field.label}. Type: ${field.type}. ${field.required ? "Required." : "Optional."} ${
    field.secret ? "Sensitive." : ""
  } ${field.hotReloadable ? "Saved in realtime." : "May require restart."}`.trim();
}

function optionLabel(option: string) {
  const labels: Record<string, string> = {
    anthropic: "Anthropic",
    "openai-response": "OpenAI Responses",
    "openai-chat": "OpenAI Chat",
    "google-genai": "Gemini"
  };
  return labels[option] ?? option;
}

function optionButtonClass(field: FieldSchema, option: string, value: unknown) {
  const classes = ["schema-option"];
  if (field.path === "protocol") {
    classes.push(`schema-option--${protocolClass(option)}`);
  }
  if (value === option) {
    classes.push("schema-option--active");
  }
  return classes.join(" ");
}

function protocolClass(option: string) {
  if (option === "anthropic") {
    return "anthropic";
  }
  if (option === "openai-response" || option === "openai-chat") {
    return "openai";
  }
  if (option === "google-genai" || option === "gemini") {
    return "gemini";
  }
  return "unknown";
}

function jsonSummary(value: unknown, field: FieldSchema) {
  if (Array.isArray(value)) {
    return `${value.length} ${value.length === 1 ? "item" : "items"}`;
  }
  if (value && typeof value === "object") {
    const count = Object.keys(value).length;
    return `${count} ${count === 1 ? "key" : "keys"}`;
  }
  return field.type === "array" ? "0 items" : "0 keys";
}
