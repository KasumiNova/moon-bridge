import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { configDescriptions, type ConfigPath } from "../../configDocs/configDescriptions";
import type { ConfigGraph } from "../../rpc/types";
import { useI18n } from "../../i18n/I18nProvider";
import type { MessageKey } from "../../i18n/messages";
import { useCreateConfigResource } from "./useConfigGraph";

type CreatableKind = "provider" | "model" | "provider_offer" | "route" | "extension";

type CreateResourcePanelProps = {
  availableExtensionIds?: string[];
  graph: ConfigGraph;
  kind: CreatableKind;
  providerId?: string;
};

type FormValues = {
  id: string;
  baseUrl: string;
  apiKey: string;
  protocol: string;
  displayName: string;
  contextWindow: string;
  model: string;
  provider: string;
  upstreamName: string;
  priority: string;
  inputPrice: string;
  outputPrice: string;
  cacheWritePrice: string;
  cacheReadPrice: string;
  enabled: boolean;
};

const initialValues: FormValues = {
  id: "",
  baseUrl: "",
  apiKey: "",
  protocol: "openai-response",
  displayName: "",
  contextWindow: "128000",
  model: "",
  provider: "",
  upstreamName: "",
  priority: "1",
  inputPrice: "0",
  outputPrice: "0",
  cacheWritePrice: "0",
  cacheReadPrice: "0",
  enabled: true
};

const createTextKeys: Record<CreatableKind, { add: MessageKey; submit: MessageKey; title: MessageKey }> = {
  extension: {
    add: "create.extension.add",
    submit: "create.extension.submit",
    title: "create.extension.title"
  },
  model: {
    add: "create.model.add",
    submit: "create.model.submit",
    title: "create.model.title"
  },
  provider: {
    add: "create.provider.add",
    submit: "create.provider.submit",
    title: "create.provider.title"
  },
  provider_offer: {
    add: "create.offer.add",
    submit: "create.offer.submit",
    title: "create.offer.title"
  },
  route: {
    add: "create.route.add",
    submit: "create.route.submit",
    title: "create.route.title"
  }
};

export function CreateResourcePanel({
  availableExtensionIds,
  graph,
  kind,
  providerId
}: CreateResourcePanelProps) {
  const { t } = useI18n();
  const create = useCreateConfigResource();
  const extensionIds = availableExtensionIds ?? [];
  const extensionCreateDisabled = kind === "extension" && extensionIds.length === 0;
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(() => defaultValues(kind, graph, providerId, extensionIds));
  const [error, setError] = useState("");

  const title = t(createTextKeys[kind].title);
  const addLabel = t(createTextKeys[kind].add);
  const submitLabel = t(createTextKeys[kind].submit);

  function openPanel() {
    setValues(defaultValues(kind, graph, providerId, extensionIds));
    setError("");
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const draft = createResourceDraft(
      kind,
      values,
      (field) => t("create.invalidNumber", { field }),
      (field) => t("create.positiveNumber", { field })
    );
    if (!draft.ok) {
      setError(draft.error);
      return;
    }
    try {
      await create.mutateAsync({
        kind,
        body: {
          baseRevision: graph.revision,
          id: draft.id,
          value: draft.value
        }
      });
      setOpen(false);
      setValues(defaultValues(kind, graph, providerId, extensionIds));
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  return (
    <div className="create-resource">
      <button
        type="button"
        className="create-resource__add"
        disabled={extensionCreateDisabled}
        onClick={openPanel}
      >
        <span className="material-symbol" aria-hidden="true">add</span>
        {addLabel}
      </button>
      {open ? (
        <form className="create-resource__panel" aria-label={title} onSubmit={submit}>
          <div className="create-resource__header">
            <h3>{title}</h3>
            <button
              type="button"
              className="icon-button"
              aria-label={t("create.close")}
              onClick={() => setOpen(false)}
            >
              <span className="material-symbol" aria-hidden="true">close</span>
            </button>
          </div>
          {error ? (
            <p className="field-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="form-grid create-resource__fields">
            <CreateFields
              graph={graph}
              kind={kind}
              availableExtensionIds={extensionIds}
              values={values}
              providerId={providerId}
              setValues={setValues}
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={create.isPending}>
              {submitLabel}
            </button>
            <button type="button" className="secondary-button" onClick={() => setOpen(false)}>
              {t("create.cancel")}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function CreateFields({
  availableExtensionIds = [],
  graph,
  kind,
  providerId,
  values,
  setValues
}: {
  availableExtensionIds?: string[];
  graph: ConfigGraph;
  kind: CreatableKind;
  providerId?: string;
  values: FormValues;
  setValues: (values: FormValues) => void;
}) {
  const { locale, t } = useI18n();
  const models = graph.resources.filter((resource) => resource.kind === "model");
  const providers = graph.resources.filter((resource) => resource.kind === "provider");
  const fieldHelp = (docPath: ConfigPath, fallback: string) => configDescriptions[docPath]?.description[locale] ?? fallback;

  if (kind === "provider") {
    return (
      <>
        <TextInput
          helpText={fieldHelp("providers.<key>.key", "Stable provider identifier.")}
          label={t("create.provider.id")}
          value={values.id}
          onChange={(id) => setValues({ ...values, id })}
        />
        <TextInput
          helpText={fieldHelp("providers.<key>.base_url", "Upstream API base URL.")}
          label={t("create.provider.baseUrl")}
          value={values.baseUrl}
          onChange={(baseUrl) => setValues({ ...values, baseUrl })}
        />
        <TextInput
          helpText={fieldHelp("providers.<key>.api_key", "Secret sent to the upstream provider.")}
          label={t("create.provider.apiKey")}
          value={values.apiKey}
          onChange={(apiKey) => setValues({ ...values, apiKey })}
          secret
        />
        <OptionGroup
          helpText={fieldHelp("providers.<key>.protocol", "Selects the upstream API format.")}
          label={t("create.provider.protocol")}
          options={["openai-response", "openai-chat", "anthropic", "google-genai"]}
          value={values.protocol}
          onChange={(protocol) => setValues({ ...values, protocol })}
          optionClassName={protocolOptionClass}
          optionLabel={protocolOptionLabel}
        />
      </>
    );
  }

  if (kind === "model") {
    return (
      <>
        <TextInput
          helpText={fieldHelp("models.<slug>.slug", "Stable model identifier.")}
          label={t("create.model.id")}
          value={values.id}
          onChange={(id) => setValues({ ...values, id })}
        />
        <TextInput
          helpText="Human-readable label shown in the console."
          label={t("create.model.displayName")}
          value={values.displayName}
          onChange={(displayName) => setValues({ ...values, displayName })}
        />
        <ContextWindowInput
          helpText={fieldHelp("models.<slug>.context_window", "Maximum context tokens.")}
          label={t("create.model.contextWindow")}
          value={values.contextWindow}
          onChange={(contextWindow) => setValues({ ...values, contextWindow })}
        />
      </>
    );
  }

  if (kind === "route") {
    return (
      <>
        <TextInput
          helpText={fieldHelp("routes.<alias>.alias", "Client-visible route alias.")}
          label={t("create.route.id")}
          value={values.id}
          onChange={(id) => setValues({ ...values, id })}
        />
        <OptionGroup
          helpText={fieldHelp("routes.<alias>.model", "Local model used by this route.")}
          label={t("create.route.model")}
          options={models.map((model) => model.id)}
          value={values.model}
          onChange={(model) => setValues({ ...values, model })}
        />
        <OptionGroup
          helpText={fieldHelp("routes.<alias>.provider", "Provider that handles this route.")}
          label={t("create.route.provider")}
          options={providers.map((provider) => provider.id)}
          value={values.provider}
          onChange={(provider) => setValues({ ...values, provider })}
        />
      </>
    );
  }

  if (kind === "provider_offer") {
    return (
      <>
        <div className="form-field form-field--create-track">
          <CreateFieldLabel
            helpText={fieldHelp("providers.<key>.key", "Provider that owns this offer.")}
            label={t("create.offer.provider")}
          />
          <span className="schema-option schema-option--active">{providerId ?? values.provider}</span>
        </div>
        <OptionGroup
          helpText={fieldHelp("providers.<key>.offers[].model", "Local model slug served by this offer.")}
          label={t("create.offer.model")}
          options={models.map((model) => model.id)}
          value={values.model}
          onChange={(model) => setValues({ ...values, model })}
        />
        <TextInput helpText={fieldHelp("providers.<key>.offers[].upstream_name", "Actual upstream model name.")} label={t("create.offer.upstreamName")} value={values.upstreamName} onChange={(upstreamName) => setValues({ ...values, upstreamName })} />
        <TextInput helpText="Provider offer ordering weight. Lower values are preferred first." label={t("create.offer.priority")} value={values.priority} onChange={(priority) => setValues({ ...values, priority })} />
        <TextInput helpText={fieldHelp("providers.<key>.offers[].pricing", "Input token price metadata used for cost tracking.")} label={t("create.offer.inputPrice")} value={values.inputPrice} onChange={(inputPrice) => setValues({ ...values, inputPrice })} />
        <TextInput helpText={fieldHelp("providers.<key>.offers[].pricing", "Output token price metadata used for cost tracking.")} label={t("create.offer.outputPrice")} value={values.outputPrice} onChange={(outputPrice) => setValues({ ...values, outputPrice })} />
        <TextInput helpText={fieldHelp("providers.<key>.offers[].pricing", "Prompt cache write price metadata used for cost tracking.")} label={t("create.offer.cacheWritePrice")} value={values.cacheWritePrice} onChange={(cacheWritePrice) => setValues({ ...values, cacheWritePrice })} />
        <TextInput helpText={fieldHelp("providers.<key>.offers[].pricing", "Prompt cache read price metadata used for cost tracking.")} label={t("create.offer.cacheReadPrice")} value={values.cacheReadPrice} onChange={(cacheReadPrice) => setValues({ ...values, cacheReadPrice })} />
      </>
    );
  }

  return (
    <>
      <OptionGroup
        helpText="Stable extension identifier, for example metrics or db_sqlite."
        label={t("create.extension.id")}
        options={availableExtensionIds}
        value={values.id}
        onChange={(id) => setValues({ ...values, id })}
      />
      <SwitchInput
        helpText={fieldHelp("extensions.<name>.enabled", "Enables the extension.")}
        label={t("create.extension.enabled")}
        value={values.enabled}
        onChange={(enabled) => setValues({ ...values, enabled })}
      />
    </>
  );
}

function TextInput({
  helpText,
  label,
  onChange,
  secret,
  value
}: {
  helpText: string;
  label: string;
  onChange: (value: string) => void;
  secret?: boolean;
  value: string;
}) {
  const id = useStableCreateId(label);
  return (
    <div className="form-field form-field--create-track">
      <CreateFieldLabel helpText={helpText} inputId={id} label={label} />
      <input
        autoComplete={secret ? "new-password" : undefined}
        id={id}
        type={secret ? "password" : "text"}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </div>
  );
}

function OptionGroup({
  helpText,
  label,
  onChange,
  optionClassName,
  optionLabel = (option) => option,
  options,
  value
}: {
  helpText: string;
  label: string;
  onChange: (value: string) => void;
  optionClassName?: (option: string) => string;
  optionLabel?: (option: string) => string;
  options: string[];
  value: string;
}) {
  return (
    <div className="form-field form-field--create-track">
      <CreateFieldLabel helpText={helpText} label={label} />
      <div className="schema-option-group" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={[
              "schema-option",
              optionClassName?.(option),
              option === value ? "schema-option--active" : undefined
            ].filter(Boolean).join(" ")}
            aria-pressed={option === value}
            onClick={() => onChange(option)}
          >
            {optionLabel(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

function ContextWindowInput({
  helpText,
  label,
  onChange,
  value
}: {
  helpText: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const id = useStableCreateId(label);
  const presets = [
    ["128k", "128000"],
    ["400k", "400000"],
    ["1m", "1000000"]
  ] as const;

  return (
    <div className="form-field form-field--compound form-field--create-track">
      <CreateFieldLabel helpText={helpText} inputId={id} label={label} />
      <div className="create-resource__compound-control">
        <div className="schema-option-group" role="group" aria-label={`${label} presets`}>
          {presets.map(([presetLabel, presetValue]) => (
            <button
              key={presetValue}
              type="button"
              className={value === presetValue ? "schema-option schema-option--active" : "schema-option"}
              aria-pressed={value === presetValue}
              onClick={() => onChange(presetValue)}
            >
              {presetLabel}
            </button>
          ))}
        </div>
        <input
          id={id}
          inputMode="numeric"
          type="text"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </div>
    </div>
  );
}

function SwitchInput({
  helpText,
  label,
  onChange,
  value
}: {
  helpText: string;
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <div className="form-field form-field--create-track">
      <CreateFieldLabel helpText={helpText} label={label} />
      <button
        type="button"
        className={value ? "schema-switch schema-switch--selected" : "schema-switch"}
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
      >
        <span aria-hidden="true" />
      </button>
    </div>
  );
}

function CreateFieldLabel({
  helpText,
  inputId,
  label
}: {
  helpText: string;
  inputId?: string;
  label: string;
}) {
  return (
    <span className="schema-field__label-row">
      {inputId ? (
        <label className="schema-field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : (
        <span className="schema-field__label">{label}</span>
      )}
      <CreateFieldHelpButton helpText={helpText} label={label} />
    </span>
  );
}

function CreateFieldHelpButton({ helpText, label }: { helpText: string; label: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const openedByHover = useRef(false);
  const helpId = `${useStableCreateId(label)}-help`;

  return (
    <span className="schema-field__help-wrap">
      <button
        type="button"
        className="schema-field__help"
        aria-label={t("field.helpFor", { label })}
        aria-describedby={open ? helpId : undefined}
        onBlur={() => setOpen(false)}
        onClick={() => {
          if (openedByHover.current) {
            openedByHover.current = false;
            setOpen(true);
            return;
          }
          setOpen((current) => !current);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => {
          openedByHover.current = true;
          setOpen(true);
        }}
        onMouseLeave={() => {
          openedByHover.current = false;
          setOpen(false);
        }}
      >
        ?
      </button>
      {open ? (
        <span className="schema-field__tooltip" id={helpId} role="tooltip">
          {helpText}
        </span>
      ) : null}
    </span>
  );
}

function useStableCreateId(label: string) {
  const id = useId();
  return `create-resource-${id}-${label}`.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function defaultValues(
  kind: CreatableKind,
  graph: ConfigGraph,
  providerId?: string,
  availableExtensionIds: string[] = []
): FormValues {
  const firstModel = graph.resources.find((resource) => resource.kind === "model")?.id ?? "";
  const firstProvider = graph.resources.find((resource) => resource.kind === "provider")?.id ?? "";
  return {
    ...initialValues,
    id: kind === "extension" ? availableExtensionIds[0] ?? "" : initialValues.id,
    model: kind === "route" || kind === "provider_offer" ? firstModel : "",
    provider: kind === "route" || kind === "provider_offer" ? providerId ?? firstProvider : ""
  };
}

function createResourceId(kind: CreatableKind, values: FormValues) {
  if (kind === "provider_offer") {
    return `${values.provider}/${values.model}`;
  }
  return values.id;
}

type ResourceDraft =
  | {
      ok: true;
      id: string;
      value: Record<string, unknown>;
    }
  | {
      ok: false;
      error: string;
    };

function createResourceDraft(
  kind: CreatableKind,
  values: FormValues,
  invalidNumberMessage: (field: string) => string,
  positiveNumberMessage: (field: string) => string
): ResourceDraft {
  const value = createValue(kind, values, invalidNumberMessage, positiveNumberMessage);
  if (!value.ok) {
    return value;
  }
  return {
    ok: true,
    id: createResourceId(kind, values),
    value: value.value
  };
}

function createValue(
  kind: CreatableKind,
  values: FormValues,
  invalidNumberMessage: (field: string) => string,
  positiveNumberMessage: (field: string) => string
): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  if (kind === "provider") {
    return {
      ok: true,
      value: {
        base_url: values.baseUrl,
        api_key: values.apiKey,
        protocol: values.protocol
      }
    };
  }
  if (kind === "model") {
    const contextWindow = positiveNumericValue(
      values.contextWindow,
      "Context window",
      invalidNumberMessage,
      positiveNumberMessage
    );
    if (!contextWindow.ok) {
      return contextWindow;
    }
    return {
      ok: true,
      value: {
        display_name: values.displayName,
        context_window: contextWindow.value
      }
    };
  }
  if (kind === "route") {
    return {
      ok: true,
      value: {
        model: values.model,
        provider: values.provider
      }
    };
  }
  if (kind === "provider_offer") {
    const priority = numericValue(values.priority, "Priority", invalidNumberMessage);
    const inputPrice = numericValue(values.inputPrice, "Input price", invalidNumberMessage);
    const outputPrice = numericValue(values.outputPrice, "Output price", invalidNumberMessage);
    const cacheWritePrice = numericValue(values.cacheWritePrice, "Cache write price", invalidNumberMessage);
    const cacheReadPrice = numericValue(values.cacheReadPrice, "Cache read price", invalidNumberMessage);
    if (!priority.ok) {
      return priority;
    }
    if (!inputPrice.ok) {
      return inputPrice;
    }
    if (!outputPrice.ok) {
      return outputPrice;
    }
    if (!cacheWritePrice.ok) {
      return cacheWritePrice;
    }
    if (!cacheReadPrice.ok) {
      return cacheReadPrice;
    }
    return {
      ok: true,
      value: {
        model: values.model,
        upstream_name: values.upstreamName,
        priority: priority.value,
        pricing: {
          input_price: inputPrice.value,
          output_price: outputPrice.value,
          cache_write_price: cacheWritePrice.value,
          cache_read_price: cacheReadPrice.value
        }
      }
    };
  }
  return {
    ok: true,
    value: {
      enabled: values.enabled
    }
  };
}

function numericValue(
  value: string,
  field: string,
  invalidNumberMessage: (field: string) => string
): { ok: true; value: number } | { ok: false; error: string } {
  if (value.trim() === "") {
    return { ok: true, value: 0 };
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return { ok: false, error: invalidNumberMessage(field) };
  }
  return { ok: true, value: parsed };
}

function positiveNumericValue(
  value: string,
  field: string,
  invalidNumberMessage: (field: string) => string,
  positiveNumberMessage: (field: string) => string
): { ok: true; value: number } | { ok: false; error: string } {
  const parsed = numericValue(value, field, invalidNumberMessage);
  if (!parsed.ok) {
    return parsed;
  }
  if (parsed.value <= 0) {
    return { ok: false, error: positiveNumberMessage(field) };
  }
  return parsed;
}

function errorMessage(cause: unknown) {
  const rawErrors = rawErrorsFrom(cause);
  if (rawErrors.length > 0 && typeof rawErrors[0]?.message === "string") {
    return rawErrors[0].message;
  }
  if (cause instanceof Error) {
    return cause.message;
  }
  return "Request failed";
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

export type { CreatableKind };

function protocolOptionLabel(option: string) {
  const labels: Record<string, string> = {
    anthropic: "Anthropic",
    "openai-response": "OpenAI Responses",
    "openai-chat": "OpenAI Chat",
    "google-genai": "Gemini"
  };
  return labels[option] ?? option;
}

function protocolOptionClass(option: string) {
  if (option === "anthropic") {
    return "schema-option--anthropic";
  }
  if (option === "openai-response" || option === "openai-chat") {
    return "schema-option--openai";
  }
  if (option === "google-genai" || option === "gemini") {
    return "schema-option--gemini";
  }
  return "schema-option--unknown";
}
