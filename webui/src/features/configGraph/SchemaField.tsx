import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { configDescriptions, type ConfigPath } from "../../configDocs/configDescriptions";
import type { FieldSchema } from "../../rpc/types";
import { useI18n } from "../../i18n/I18nProvider";
import { MaterialSwitch } from "../../components/MaterialSwitch";
import { SelectMenu, type SelectMenuOption } from "./SelectMenu";

export type SchemaFieldProps = {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  onCommit?: () => void;
  onCommitValue?: (value: unknown) => void;
  disabled?: boolean;
  idPrefix?: string;
  docPath?: ConfigPath;
  error?: string;
};

export function SchemaField({
  field,
  value,
  onChange,
  onCommit,
  onCommitValue,
  disabled = false,
  idPrefix,
  docPath,
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

  const wide = isWideField(field);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const helpParts = fieldHelpParts(field, docPath, locale);
  const fieldError = error || parseError;
  const describedBy = [
    field.secret ? hintId : undefined,
    helpOpen ? helpId : undefined,
    fieldError ? errorId : undefined
  ].filter(Boolean).join(" ") || undefined;
  const commitOnBlur = onCommit ? () => onCommit() : undefined;
  const commit = onCommitValue ?? onChange;

  if (field.control === "select" || (field.enum?.length ?? 0) > 0) {
    const labelId = `${id}-label`;
    const selected = typeof value === "string" ? value : "";
    const options: SelectMenuOption[] = (field.enum ?? []).map((option) => ({
      value: option,
      label: optionLabel(option),
      className: optionMenuClass(field, option),
      dotClassName: optionDotClass(field, option)
    }));
    return (
      <OutlinedField
        field={field}
        helpId={helpId}
        helpOpen={helpOpen}
        helpParts={helpParts}
        setHelpOpen={setHelpOpen}
        id={id}
        labelId={labelId}
        filled={selected.length > 0}
        invalid={Boolean(fieldError)}
        variant="select"
        messages={<FieldMessages errorId={errorId} hintId={hintId} error={fieldError} secret={field.secret} />}
      >
        <SelectMenu
          id={id}
          options={options}
          value={selected}
          onChange={(next) => commit(next)}
          disabled={disabled}
          labelledBy={labelId}
          ariaLabel={field.label}
          describedBy={describedBy}
        />
      </OutlinedField>
    );
  }

  if (field.type === "boolean" || field.control === "switch") {
    return (
      <div className="schema-field schema-field--inline">
        <div className="schema-field__switch-line">
          <span className="schema-field__label-row">
            <span className="schema-field__label">
              {field.label}
              {field.required ? <span className="schema-field__required" aria-hidden="true">*</span> : null}
            </span>
            <FieldHelpButton
              field={field}
              helpId={helpId}
              helpOpen={helpOpen}
              helpParts={helpParts}
              setHelpOpen={setHelpOpen}
            />
          </span>
          <MaterialSwitch
            disabled={disabled}
            label={field.label}
            selected={Boolean(value)}
            onChange={(selected) => commit(selected)}
          />
        </div>
        {fieldError ? (
          <p className="field-error" id={errorId} role="alert">
            {fieldError}
          </p>
        ) : null}
      </div>
    );
  }

  if (field.control === "textarea") {
    return (
      <OutlinedField
        field={field}
        helpId={helpId}
        helpOpen={helpOpen}
        helpParts={helpParts}
        setHelpOpen={setHelpOpen}
        id={id}
        filled={text.length > 0}
        invalid={Boolean(fieldError)}
        variant="textarea"
        wide={wide}
        messages={<FieldMessages errorId={errorId} hintId={hintId} error={fieldError} secret={field.secret} />}
      >
        <AutoGrowTextarea
          aria-describedby={describedBy}
          aria-invalid={fieldError ? "true" : undefined}
          id={id}
          disabled={disabled}
          value={text}
          onChange={(event) => updateText(event, onChange, field)}
          onBlur={commitOnBlur}
        />
      </OutlinedField>
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
          helpParts={helpParts}
          id={jsonExpanded ? id : summaryId}
          setHelpOpen={setHelpOpen}
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
            aria-invalid={fieldError ? "true" : undefined}
            aria-label={`${field.label} JSON editor`}
            id={id}
            ref={jsonEditorRef}
            disabled={disabled}
            spellCheck={false}
            value={text}
            onChange={(event) => updateJSON(event.currentTarget.value)}
            onBlur={commitOnBlur}
          />
        ) : null}
        <FieldMessages errorId={errorId} hintId={hintId} error={fieldError} secret={field.secret} />
      </div>
    );
  }

  return (
    <OutlinedField
      field={field}
      helpId={helpId}
      helpOpen={helpOpen}
      helpParts={helpParts}
      setHelpOpen={setHelpOpen}
      id={id}
      filled={text.length > 0}
      invalid={Boolean(fieldError)}
      leadingIcon={fieldLeadingIcon(field)}
      messages={<FieldMessages errorId={errorId} hintId={hintId} error={fieldError} secret={field.secret} />}
    >
      <input
        aria-describedby={describedBy}
        autoComplete={field.secret ? "new-password" : undefined}
        aria-invalid={fieldError ? "true" : undefined}
        disabled={disabled}
        id={id}
        type={inputType(field)}
        value={text}
        onChange={(event) => updateText(event, onChange, field)}
        onBlur={commitOnBlur}
      />
    </OutlinedField>
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

type FieldHelpParts = {
  subhead: string;
  body: string;
  metas: { label?: string; value: string }[];
};

// Outlined MD3 text field: the label rides the notched border (floating up when
// focused or populated), with an optional leading icon and the help affordance
// pinned to the top-right of the border.
function OutlinedField({
  field,
  helpId,
  helpOpen,
  helpParts,
  setHelpOpen,
  id,
  labelId,
  filled,
  invalid,
  leadingIcon,
  variant = "input",
  wide,
  messages,
  children
}: {
  field: FieldSchema;
  helpId: string;
  helpOpen: boolean;
  helpParts: FieldHelpParts;
  setHelpOpen: (open: boolean | ((current: boolean) => boolean)) => void;
  id: string;
  labelId?: string;
  filled: boolean;
  invalid?: boolean;
  leadingIcon?: string;
  variant?: "input" | "textarea" | "select";
  wide?: boolean;
  messages?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={wide ? "mb-field mb-field--wide" : "mb-field"}
      data-variant={variant}
      data-filled={filled ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      data-leading={leadingIcon ? "true" : undefined}
    >
      <div className="mb-field__control">
        {leadingIcon ? (
          <span className="mb-field__leading material-symbol" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}
        {children}
        <label className="mb-field__label" id={labelId} htmlFor={id}>
          {field.label}
          {field.required ? <span className="mb-field__required" aria-hidden="true">*</span> : null}
        </label>
        <FieldHelpButton
          field={field}
          helpId={helpId}
          helpOpen={helpOpen}
          helpParts={helpParts}
          setHelpOpen={setHelpOpen}
        />
      </div>
      {messages}
    </div>
  );
}

// Textarea that starts compact (single row) and grows with its content up to a
// cap, then scrolls — avoiding a large reserved block for long prompts.
function AutoGrowTextarea({ value, ...props }: ComponentPropsWithoutRef<"textarea"> & { value: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 260)}px`;
  }, [value]);
  return <textarea {...props} ref={ref} value={value} rows={1} />;
}

function fieldLeadingIcon(field: FieldSchema): string | undefined {
  if (field.secret || field.control === "secret") {
    return "key";
  }
  const path = field.path.toLowerCase();
  if (path.includes("url") || path.includes("endpoint") || path.includes("addr")) {
    return "link";
  }
  if (path.includes("model")) {
    return "smart_toy";
  }
  if (path.includes("agent")) {
    return "badge";
  }
  if (field.type === "number" || field.control === "number") {
    return "tag";
  }
  return undefined;
}

function FieldTopline({
  field,
  helpId,
  helpOpen,
  helpParts,
  id,
  labelForControl = true,
  labelId,
  setHelpOpen
}: {
  field: FieldSchema;
  helpId: string;
  helpOpen: boolean;
  helpParts: FieldHelpParts;
  id: string;
  labelForControl?: boolean;
  labelId?: string;
  setHelpOpen: (open: boolean | ((current: boolean) => boolean)) => void;
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
          helpParts={helpParts}
          setHelpOpen={setHelpOpen}
        />
      </span>
    </div>
  );
}

function FieldHelpButton({
  field,
  helpId,
  helpOpen,
  helpParts,
  setHelpOpen
}: {
  field: FieldSchema;
  helpId: string;
  helpOpen: boolean;
  helpParts: FieldHelpParts;
  setHelpOpen: (open: boolean | ((current: boolean) => boolean)) => void;
}) {
  const { t } = useI18n();
  const openedByHover = useRef(false);

  return (
    <span className="schema-field__help-wrap">
      <button
        type="button"
        className="schema-field__help"
        aria-label={t("field.helpFor", { label: field.label })}
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
        <span className="material-symbol" aria-hidden="true">help</span>
      </button>
      {helpOpen ? (
        <span className="rich-tooltip" id={helpId} role="tooltip">
          {helpParts.subhead ? <span className="rich-tooltip__subhead">{helpParts.subhead}</span> : null}
          {helpParts.body ? <span className="rich-tooltip__body">{helpParts.body}</span> : null}
          {helpParts.metas.length ? (
            <span className="rich-tooltip__metas">
              {helpParts.metas.map((meta, index) => (
                <span className="rich-tooltip__chip" key={index}>
                  {meta.label ? `${meta.label}: ${meta.value}` : meta.value}
                </span>
              ))}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

function FieldMessages({
  errorId,
  hintId,
  error,
  secret
}: {
  errorId: string;
  hintId: string;
  error: string;
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
      {error ? (
        <p className="field-error" id={errorId} role="alert">
          {error}
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

function fieldHelpParts(
  field: FieldSchema,
  docPath: ConfigPath | undefined,
  locale: "en-US" | "zh-CN"
): FieldHelpParts {
  const entry = docPath ? configDescriptions[docPath] : undefined;
  const metas: { label?: string; value: string }[] = [];
  if (entry) {
    metas.push({ label: "Type", value: entry.type });
    if (entry.defaultValue) {
      metas.push({ label: "Default", value: String(entry.defaultValue) });
    }
    if (entry.sensitive || field.secret) {
      metas.push({ value: "Sensitive" });
    }
    return { subhead: field.label, body: entry.description[locale], metas };
  }
  metas.push({ label: "Type", value: field.type });
  metas.push({ value: field.required ? "Required" : "Optional" });
  if (field.secret) {
    metas.push({ value: "Sensitive" });
  }
  metas.push({ value: field.hotReloadable ? "Saved in realtime" : "May require restart" });
  return { subhead: field.label, body: "", metas };
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

function optionMenuClass(field: FieldSchema, option: string) {
  if (field.path === "protocol") {
    return `select-menu__option--${protocolClass(option)}`;
  }
  return undefined;
}

function optionDotClass(field: FieldSchema, option: string) {
  if (field.path === "protocol") {
    return `select-menu__dot--${protocolClass(option)}`;
  }
  return undefined;
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
