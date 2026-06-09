import {
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { configDescriptions, type ConfigPath } from "../../configDocs/configDescriptions";
import type { FieldSchema } from "../../rpc/types";
import { useI18n } from "../../i18n/I18nProvider";
import type { MessageKey } from "../../i18n/messages";
import { MaterialIconButton, MaterialOutlinedButton } from "../../components/MaterialButton";
import { MaterialOutlinedTextField, type MaterialTextFieldElement } from "../../components/MaterialTextField";
import { MaterialSwitch } from "../../components/MaterialSwitch";
import { SelectMenu, type SelectMenuOption } from "./SelectMenu";
import type { MdOutlinedButton } from "@material/web/button/outlined-button.js";
import type { MdIconButton } from "@material/web/iconbutton/icon-button.js";
import { type TooltipPosition, useAnchoredTooltipPosition } from "./helpTooltipPosition";

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
  objectDisplay?: "collapsible" | "expandedFixed";
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
  error,
  objectDisplay = "collapsible"
}: SchemaFieldProps) {
  const { locale, t } = useI18n();
  const id = useMemo(() => {
    const prefix = idPrefix ? `${idPrefix}-` : "";
    return `schema-field-${prefix}${field.path}`.replace(/[^a-zA-Z0-9_-]/g, "-");
  }, [field.path, idPrefix]);
  const [text, setText] = useState(displayValue(field, value));
  const [parseError, setParseError] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const jsonFixedExpanded = objectDisplay === "expandedFixed";
  const [jsonExpanded, setJsonExpanded] = useState(jsonFixedExpanded || parseError !== "");
  const jsonEditorRef = useRef<MaterialTextFieldElement>(null);
  const jsonSummaryRef = useRef<MdOutlinedButton>(null);
  const trailingHelpAnchorRef = useRef<MdIconButton>(null);
  const displayLabel = fieldLabel(field, docPath, locale);

  useEffect(() => {
    setText(displayValue(field, value));
    setParseError("");
  }, [field, value]);

  useEffect(() => {
    if (jsonFixedExpanded && !jsonExpanded) {
      setJsonExpanded(true);
      return;
    }
    if (!jsonFixedExpanded && jsonExpanded) {
      jsonEditorRef.current?.focus();
    }
  }, [jsonExpanded, jsonFixedExpanded]);

  const wide = isWideField(field);
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const helpParts = fieldHelpParts(field, displayLabel, docPath, locale, {
    default: t("configDoc.default"),
    defaultEmpty: t("configDoc.default.empty"),
    optional: t("configDoc.optional"),
    required: t("configDoc.required"),
    restartMayBeRequired: t("configDoc.restartMayBeRequired"),
    savedRealtime: t("configDoc.savedRealtime"),
    sensitive: t("configDoc.sensitive"),
    type: t("configDoc.type"),
    typeArray: t("configDoc.type.array"),
    typeBoolean: t("configDoc.type.boolean"),
    typeHostPort: t("configDoc.type.hostPort"),
    typeNumber: t("configDoc.type.number"),
    typeObject: t("configDoc.type.object"),
    typeString: t("configDoc.type.string"),
    typeUrl: t("configDoc.type.url")
  });
  const fieldError = error || parseError;
  const fieldDescribedBy = [
    helpOpen ? helpId : undefined,
    fieldError ? errorId : undefined
  ].filter(Boolean).join(" ") || undefined;
  const commitOnBlur = onCommit ? () => onCommit() : undefined;
  const commit = onCommitValue ?? onChange;

  if (field.control === "select" || (field.enum?.length ?? 0) > 0) {
    const selected = typeof value === "string" ? value : "";
    const options: SelectMenuOption[] = (field.enum ?? []).map((option) => ({
      value: option,
      label: optionLabel(option, t)
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
            ariaLabel={displayLabel}
            describedBy={fieldError ? errorId : undefined}
            error={Boolean(fieldError)}
            errorText={fieldError}
            required={field.required}
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
              {displayLabel}
              {field.required ? <span className="schema-field__required" aria-hidden="true">*</span> : null}
            </span>
            <FieldHelpButton
              field={field}
              label={displayLabel}
              helpId={helpId}
              helpOpen={helpOpen}
              helpParts={helpParts}
              setHelpOpen={setHelpOpen}
            />
          </span>
          <MaterialSwitch
            disabled={disabled}
            label={displayLabel}
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
            ariaLabel={displayLabel}
            ariaInvalid={Boolean(fieldError)}
            className="schema-text-field"
            disabled={disabled}
            error={Boolean(fieldError)}
            errorText={fieldError}
            id={id}
            label={displayLabel}
            required={field.required}
            rows={6}
            supportingText={fieldSupportingText(field, t("field.secretReplacementHint"))}
            trailingIcon={(
              <FieldHelpIconButton
                anchorRef={trailingHelpAnchorRef}
                field={field}
                label={displayLabel}
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
            anchorRef={trailingHelpAnchorRef}
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
    const summary = jsonSummary(value, field, t);
    const jsonFieldLabel = t("field.jsonEditorLabel", { label: displayLabel });
    return (
      <div className={schemaFieldClass(wide)}>
        {jsonFixedExpanded ? null : (
          <FieldTopline
            field={field}
            label={displayLabel}
            helpId={helpId}
            helpOpen={helpOpen}
            helpParts={helpParts}
            id={jsonExpanded ? id : summaryId}
            setHelpOpen={setHelpOpen}
          />
        )}
        {jsonFixedExpanded ? null : (
          <MaterialOutlinedButton
            ariaExpanded={jsonExpanded}
            ariaLabel={t("field.summaryButtonLabel", { label: displayLabel, summary })}
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
            <span>{displayLabel}</span>
            <strong>{summary}</strong>
            <span className="material-symbol" aria-hidden="true">
              {jsonExpanded ? "expand_less" : "expand_more"}
            </span>
          </MaterialOutlinedButton>
        )}
        {jsonExpanded ? (
          <>
            <MaterialOutlinedTextField
              ariaDescribedBy={fieldDescribedBy}
              ariaLabel={jsonFieldLabel}
              ariaInvalid={Boolean(fieldError)}
              className={jsonFixedExpanded ? "schema-json-editor schema-json-editor--fixed" : "schema-json-editor"}
              disabled={disabled}
              error={Boolean(fieldError)}
              errorText={fieldError}
              id={id}
              label={jsonFieldLabel}
              ref={jsonEditorRef}
              required={field.required}
              spellCheck={false}
              supportingText={fieldSupportingText(field, t("field.secretReplacementHint"))}
              trailingIcon={jsonFixedExpanded ? (
                <FieldHelpIconButton
                  anchorRef={trailingHelpAnchorRef}
                  field={field}
                  label={displayLabel}
                  helpId={helpId}
                  helpOpen={helpOpen}
                  setHelpOpen={setHelpOpen}
                  slot="trailing-icon"
                />
              ) : undefined}
              type="textarea"
              value={text}
              onInput={updateJSON}
              onBlur={commitOnBlur}
            />
            {jsonFixedExpanded ? (
              <FieldHelpTooltip
                anchorRef={trailingHelpAnchorRef}
                helpId={helpId}
                helpOpen={helpOpen}
                helpParts={helpParts}
              />
            ) : null}
          </>
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
          ariaLabel={displayLabel}
          ariaInvalid={Boolean(fieldError)}
          autoComplete={field.secret ? "new-password" : undefined}
          className="schema-text-field"
          disabled={disabled}
          error={Boolean(fieldError)}
          errorText={fieldError}
          id={id}
          label={displayLabel}
          leadingIcon={fieldLeadingIcon(field)}
          required={field.required}
          supportingText={fieldSupportingText(field, t("field.secretReplacementHint"))}
          trailingIcon={(
            <FieldHelpIconButton
              anchorRef={trailingHelpAnchorRef}
              field={field}
              label={displayLabel}
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
          anchorRef={trailingHelpAnchorRef}
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

function fieldLabel(field: FieldSchema, docPath: ConfigPath | undefined, locale: "en-US" | "zh-CN") {
  const entry = docPath ? configDescriptions[docPath] : undefined;
  return entry?.title[locale] ?? field.label;
}

function FieldTopline({
  field,
  helpId,
  helpOpen,
  helpParts,
  id,
  label,
  labelForControl = true,
  labelId,
  setHelpOpen
}: {
  field: FieldSchema;
  helpId: string;
  helpOpen: boolean;
  helpParts: FieldHelpParts;
  id: string;
  label: string;
  labelForControl?: boolean;
  labelId?: string;
  setHelpOpen: (open: boolean | ((current: boolean) => boolean)) => void;
}) {
  const labelContent = (
    <>
      {label}
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
          label={label}
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
  label,
  setHelpOpen
}: {
  field: FieldSchema;
  helpId: string;
  helpOpen: boolean;
  helpParts: FieldHelpParts;
  label: string;
  setHelpOpen: (open: boolean | ((current: boolean) => boolean)) => void;
}) {
  const anchorRef = useRef<MdIconButton>(null);
  return (
    <span className="schema-field__help-wrap">
      <FieldHelpIconButton
        anchorRef={anchorRef}
        field={field}
        label={label}
        helpId={helpId}
        helpOpen={helpOpen}
        setHelpOpen={setHelpOpen}
      />
      <FieldHelpTooltip
        anchorRef={anchorRef}
        helpId={helpId}
        helpOpen={helpOpen}
        helpParts={helpParts}
      />
    </span>
  );
}

function FieldHelpIconButton({
  anchorRef,
  field,
  helpId,
  helpOpen,
  label,
  setHelpOpen,
  slot
}: {
  anchorRef?: RefObject<MdIconButton | null>;
  field: FieldSchema;
  helpId: string;
  helpOpen: boolean;
  label: string;
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
      label={t("field.helpFor", { label })}
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
      ref={anchorRef}
      slot={slot}
    />
  );
}

function FieldHelpTooltip({
  anchorRef,
  helpId,
  helpOpen,
  helpParts
}: {
  anchorRef: RefObject<HTMLElement | null>;
  helpId: string;
  helpOpen: boolean;
  helpParts: FieldHelpParts;
}) {
  const position = useAnchoredTooltipPosition(anchorRef, helpOpen);
  const style = tooltipPositionStyle(position);
  return helpOpen ? (
    <span className="rich-tooltip" id={helpId} role="tooltip" style={style}>
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

function tooltipPositionStyle(position: TooltipPosition | undefined): CSSProperties | undefined {
  if (!position) {
    return undefined;
  }
  return {
    left: `${position.left}px`,
    maxWidth: `${position.maxWidth}px`,
    position: "fixed",
    top: `${position.top}px`
  };
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
  label: string,
  docPath: ConfigPath | undefined,
  locale: "en-US" | "zh-CN",
  labels: FieldHelpLabels
): FieldHelpParts {
  const entry = docPath ? configDescriptions[docPath] : undefined;
  const metas: { label?: string; value: string }[] = [];
  if (entry) {
    metas.push({ label: labels.type, value: localizedConfigMetaValue(entry.type, labels) });
    if (entry.defaultValue) {
      metas.push({ label: labels.default, value: localizedConfigMetaValue(String(entry.defaultValue), labels) });
    }
    if (entry.sensitive || field.secret) {
      metas.push({ value: labels.sensitive });
    }
    return { subhead: label, body: entry.description[locale], metas };
  }
  metas.push({ label: labels.type, value: field.type });
  metas.push({ value: field.required ? labels.required : labels.optional });
  if (field.secret) {
    metas.push({ value: labels.sensitive });
  }
  metas.push({ value: field.hotReloadable ? labels.savedRealtime : labels.restartMayBeRequired });
  return { subhead: label, body: "", metas };
}

type FieldHelpLabels = {
  default: string;
  defaultEmpty: string;
  optional: string;
  required: string;
  restartMayBeRequired: string;
  savedRealtime: string;
  sensitive: string;
  type: string;
  typeArray: string;
  typeBoolean: string;
  typeHostPort: string;
  typeNumber: string;
  typeObject: string;
  typeString: string;
  typeUrl: string;
};

function localizedConfigMetaValue(value: string, labels: FieldHelpLabels) {
  const normalized = value.trim().toLowerCase();
  const localized: Record<string, string> = {
    array: labels.typeArray,
    boolean: labels.typeBoolean,
    empty: labels.defaultEmpty,
    "host:port": labels.typeHostPort,
    number: labels.typeNumber,
    object: labels.typeObject,
    string: labels.typeString,
    url: labels.typeUrl
  };
  return localized[normalized] ?? value;
}

function optionLabel(option: string, t: (key: MessageKey) => string) {
  const labels: Record<string, MessageKey> = {
    anthropic: "provider.protocol.anthropic",
    "openai-response": "provider.protocol.openaiResponses",
    "openai-chat": "provider.protocol.openaiChat",
    "google-genai": "provider.protocol.googleGenai"
  };
  const key = labels[option];
  return key ? t(key) : option;
}

function jsonSummary(
  value: unknown,
  field: FieldSchema,
  t: (key: MessageKey, values?: Record<string, string | number>) => string
) {
  if (Array.isArray(value)) {
    return t(summaryKey("field.summary.items", value.length), { count: value.length });
  }
  if (value && typeof value === "object") {
    const count = Object.keys(value).length;
    return t(summaryKey("field.summary.keys", count), { count });
  }
  return field.type === "array"
    ? t("field.summary.items.many", { count: 0 })
    : t("field.summary.keys.many", { count: 0 });
}

function summaryKey(prefix: "field.summary.items" | "field.summary.keys", count: number): MessageKey {
  return `${prefix}.${count === 1 ? "one" : "many"}` as MessageKey;
}
