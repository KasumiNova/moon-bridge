import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { configDescriptions, type ConfigPath } from "../../configDocs/configDescriptions";
import type { FieldSchema } from "../../rpc/types";
import { useI18n } from "../../i18n/I18nProvider";
import { MaterialIconButton, MaterialOutlinedButton } from "../../components/MaterialButton";
import { MaterialOutlinedTextField, type MaterialTextFieldElement } from "../../components/MaterialTextField";
import { MaterialSwitch } from "../../components/MaterialSwitch";
import { SelectMenu, type SelectMenuOption } from "./SelectMenu";
import type { MdOutlinedButton } from "@material/web/button/outlined-button.js";

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
  const jsonEditorRef = useRef<MaterialTextFieldElement>(null);
  const jsonSummaryRef = useRef<MdOutlinedButton>(null);

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
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const helpParts = fieldHelpParts(field, docPath, locale);
  const fieldError = error || parseError;
  const fieldDescribedBy = [
    helpOpen ? helpId : undefined,
    fieldError ? errorId : undefined
  ].filter(Boolean).join(" ") || undefined;
  const selectDescribedBy = fieldError ? errorId : undefined;
  const commitOnBlur = onCommit ? () => onCommit() : undefined;
  const commit = onCommitValue ?? onChange;

  if (field.control === "select" || (field.enum?.length ?? 0) > 0) {
    const selected = typeof value === "string" ? value : "";
    const options: SelectMenuOption[] = (field.enum ?? []).map((option) => ({
      value: option,
      label: optionLabel(option)
    }));
    return (
      <div className={wide ? "mb-field mb-field--wide" : "mb-field"} data-variant="select">
        <div className="mb-field__control">
          <SelectMenu
            id={id}
            options={options}
            value={selected}
            onChange={(next) => commit(next)}
            disabled={disabled}
            ariaLabel={field.label}
            describedBy={selectDescribedBy}
            error={Boolean(fieldError)}
            errorText={fieldError}
            required={field.required}
            supportingText={fieldSelectSupportingText(helpParts)}
          />
        </div>
        <FieldA11yMessages errorId={errorId} error={fieldError} />
      </div>
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
      <div className={wide ? "mb-field mb-field--wide" : "mb-field"} data-variant="textarea">
        <div className="mb-field__control">
          <MaterialOutlinedTextField
            ariaDescribedBy={fieldDescribedBy}
            ariaLabel={field.label}
            ariaInvalid={Boolean(fieldError)}
            className="schema-text-field"
            disabled={disabled}
            error={Boolean(fieldError)}
            errorText={fieldError}
            id={id}
            label={field.label}
            required={field.required}
            rows={6}
            supportingText={fieldSupportingText(field, t("field.secretReplacementHint"))}
            trailingIcon={(
              <FieldHelpIconButton
                field={field}
                helpId={helpId}
                helpOpen={helpOpen}
                setHelpOpen={setHelpOpen}
                slot="trailing-icon"
              />
            )}
            type="textarea"
            value={text}
            onInput={(next) => updateTextValue(next, onChange, field)}
            onBlur={commitOnBlur}
          />
          <FieldHelpTooltip
            helpId={helpId}
            helpOpen={helpOpen}
            helpParts={helpParts}
          />
        </div>
        <FieldA11yMessages errorId={errorId} error={fieldError} />
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
          helpParts={helpParts}
          id={jsonExpanded ? id : summaryId}
          setHelpOpen={setHelpOpen}
        />
        <MaterialOutlinedButton
          ariaExpanded={jsonExpanded}
          ariaLabel={`${field.label}, ${summary}`}
          className="schema-json-summary"
          controls={id}
          id={summaryId}
          ref={jsonSummaryRef}
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
        </MaterialOutlinedButton>
        {jsonExpanded ? (
          <MaterialOutlinedTextField
            ariaDescribedBy={fieldDescribedBy}
            ariaLabel={`${field.label} JSON editor`}
            ariaInvalid={Boolean(fieldError)}
            className="schema-json-editor"
            disabled={disabled}
            error={Boolean(fieldError)}
            errorText={fieldError}
            id={id}
            label={`${field.label} JSON editor`}
            ref={jsonEditorRef}
            required={field.required}
            spellCheck={false}
            supportingText={fieldSupportingText(field, t("field.secretReplacementHint"))}
            type="textarea"
            value={text}
            onInput={updateJSON}
            onBlur={commitOnBlur}
          />
        ) : null}
        <FieldA11yMessages errorId={errorId} error={fieldError} />
      </div>
    );
  }

  return (
    <div className={wide ? "mb-field mb-field--wide" : "mb-field"} data-variant="input">
      <div className="mb-field__control">
        <MaterialOutlinedTextField
          ariaDescribedBy={fieldDescribedBy}
          ariaLabel={field.label}
          ariaInvalid={Boolean(fieldError)}
          autoComplete={field.secret ? "new-password" : undefined}
          className="schema-text-field"
          disabled={disabled}
          error={Boolean(fieldError)}
          errorText={fieldError}
          id={id}
          label={field.label}
          leadingIcon={fieldLeadingIcon(field)}
          required={field.required}
          supportingText={fieldSupportingText(field, t("field.secretReplacementHint"))}
          trailingIcon={(
            <FieldHelpIconButton
              field={field}
              helpId={helpId}
              helpOpen={helpOpen}
              setHelpOpen={setHelpOpen}
              slot="trailing-icon"
            />
          )}
          type={inputType(field)}
          value={text}
          onInput={(next) => updateTextValue(next, onChange, field)}
          onBlur={commitOnBlur}
        />
        <FieldHelpTooltip
          helpId={helpId}
          helpOpen={helpOpen}
          helpParts={helpParts}
        />
      </div>
      <FieldA11yMessages errorId={errorId} error={fieldError} />
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

  function updateTextValue(next: string, emit: (value: unknown) => void, schema: FieldSchema) {
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
  return (
    <span className="schema-field__help-wrap">
      <FieldHelpIconButton
        field={field}
        helpId={helpId}
        helpOpen={helpOpen}
        setHelpOpen={setHelpOpen}
      />
      <FieldHelpTooltip
        helpId={helpId}
        helpOpen={helpOpen}
        helpParts={helpParts}
      />
    </span>
  );
}

function FieldHelpIconButton({
  field,
  helpId,
  helpOpen,
  setHelpOpen,
  slot
}: {
  field: FieldSchema;
  helpId: string;
  helpOpen: boolean;
  setHelpOpen: (open: boolean | ((current: boolean) => boolean)) => void;
  slot?: string;
}) {
  const { t } = useI18n();
  const openedByHover = useRef(false);

  return (
    <MaterialIconButton
      className="schema-field__help"
      describedBy={helpOpen ? helpId : undefined}
      icon="help"
      label={t("field.helpFor", { label: field.label })}
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
      onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
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
      slot={slot}
    />
  );
}

function FieldHelpTooltip({
  helpId,
  helpOpen,
  helpParts
}: {
  helpId: string;
  helpOpen: boolean;
  helpParts: FieldHelpParts;
}) {
  return helpOpen ? (
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
  ) : null;
}

function FieldA11yMessages({
  errorId,
  error
}: {
  errorId: string;
  error: string;
}) {
  return (
    <>
      {error ? (
        <p className="field-error field-error--sr" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}

function fieldSupportingText(field: FieldSchema, secretReplacementHint: string) {
  if (field.secret) {
    return secretReplacementHint;
  }
  return "";
}

function fieldSelectSupportingText(helpParts: FieldHelpParts) {
  return [
    helpParts.body,
    ...helpParts.metas.map((meta) => (meta.label ? `${meta.label}: ${meta.value}` : meta.value))
  ].filter(Boolean).join(" ");
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
