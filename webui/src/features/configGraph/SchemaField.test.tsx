import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import type { FieldSchema } from "../../rpc/types";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import { SchemaField } from "./SchemaField";

describe("SchemaField", () => {
  test("renders enum fields with the Material Web select", async () => {
    const field: FieldSchema = {
      path: "protocol",
      type: "string",
      label: "Protocol",
      control: "select",
      enum: ["anthropic", "openai-response", "openai-chat", "google-genai"],
      hotReloadable: true
    };
    const onChange = vi.fn();
    renderWithConsoleProviders(
      <SchemaField
        field={field}
        value="anthropic"
        onChange={onChange}
        docPath="providers.<key>.protocol"
      />
    );

    expect(document.querySelector(".schema-field select")).not.toBeInTheDocument();
    const materialSelect = await findMaterialSelect(document, "Protocol");
    expect(document.querySelector(".select-menu")).not.toBeInTheDocument();
    expect(materialSelect.value).toBe("anthropic");
    const options = getMaterialSelectOptions(materialSelect);
    expect(options.map((option) => option.value)).toEqual([
      "anthropic",
      "openai-response",
      "openai-chat",
      "google-genai"
    ]);
    expect(options.map((option) => option.displayText)).toEqual([
      "Anthropic",
      "OpenAI Responses",
      "OpenAI Chat",
      "Gemini"
    ]);
    expect(options[0].selected).toBe(true);
    expect(materialSelect.label).toBe("Protocol");
    expect(materialSelect.supportingText).toContain("Selects the upstream API format");
    expect(materialSelect.closest(".mb-field")?.querySelector(".schema-field__help-wrap")).not.toBeInTheDocument();
    expect(materialSelect.closest(".mb-field")?.querySelector("md-icon-button")).not.toBeInTheDocument();

    setMaterialSelectValue(materialSelect, "openai-response");

    expect(onChange).toHaveBeenCalledWith("openai-response");
  });

  test("shows field help from config docs on demand", async () => {
    const field: FieldSchema = {
      path: "base_url",
      type: "string",
      label: "Base URL",
      hotReloadable: true
    };

    renderWithConsoleProviders(
      <SchemaField
        field={field}
        value="https://api.anthropic.com"
        onChange={() => undefined}
        docPath="providers.<key>.base_url"
      />
    );

    const helpButton = getMaterialIconButton(document, "Help for Base URL");
    expect(helpButton.tagName.toLowerCase()).toBe("md-icon-button");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await userEvent.click(helpButton);

    expect(screen.getByRole("tooltip")).toHaveTextContent("Upstream provider API URL");
    expect(helpButton).toHaveAttribute("aria-describedby");
  });

  test("renders secret fields without exposing the value", () => {
    const field: FieldSchema = {
      path: "api_key",
      type: "string",
      label: "API key",
      secret: true,
      hotReloadable: true
    };

    renderWithConsoleProviders(<SchemaField field={field} value="sk-secret" onChange={() => undefined} />);

    const fieldElement = getMaterialTextField(document, "API key");
    expect(document.querySelector(".mb-field__control input")).not.toBeInTheDocument();
    expect(fieldElement.type).toBe("password");
    expect(fieldElement.value).toBe("");
  });

  test("renders text fields with Material label and icon slots instead of an outer outlined field", () => {
    const field: FieldSchema = {
      path: "base_url",
      type: "string",
      label: "Base URL",
      hotReloadable: true
    };

    renderWithConsoleProviders(
      <SchemaField
        field={field}
        value="https://api.example.invalid"
        onChange={() => undefined}
        docPath="providers.<key>.base_url"
      />
    );

    const fieldElement = getMaterialTextField(document, "Base URL");

    expect(fieldElement.label).toBe("Base URL");
    expect(fieldElement.getAttribute("spellcheck")).toBe("false");
    expect(fieldElement.closest(".mb-field")?.querySelector(".mb-field__label")).not.toBeInTheDocument();
    expect(fieldElement.querySelector("[slot='leading-icon']")).toHaveTextContent("link");
    const trailing = fieldElement.querySelector("[slot='trailing-icon']");
    expect(trailing?.tagName.toLowerCase()).toBe("md-icon-button");
    expect(trailing).toHaveAttribute("aria-label", "Help for Base URL");
  });

  test("guides secret replacement without exposing the committed value", () => {
    const field: FieldSchema = {
      path: "api_key",
      type: "string",
      label: "API key",
      secret: true,
      hotReloadable: true
    };

    renderWithConsoleProviders(<SchemaField field={field} value="sk-secret" onChange={() => undefined} />);

    expect(getMaterialTextField(document, "API key").supportingText).toBe("Enter a new value to replace the saved secret.");
    expect(screen.queryByDisplayValue("sk-secret")).not.toBeInTheDocument();
  });

  test("coerces numeric input before emitting changes", async () => {
    const field: FieldSchema = {
      path: "max_tokens",
      type: "number",
      label: "Max tokens",
      hotReloadable: true
    };
    const onChange = vi.fn();
    renderWithConsoleProviders(<SchemaField field={field} value={1024} onChange={onChange} />);

    const input = getMaterialTextField(document, "Max tokens");
    expect(document.querySelector(".mb-field__control input")).not.toBeInTheDocument();
    expect(input.type).toBe("text");

    setMaterialTextFieldValue(input, "2048");

    expect(onChange).toHaveBeenLastCalledWith(2048);
  });

  test("rejects invalid numeric input without emitting autosave changes", async () => {
    const field: FieldSchema = {
      path: "max_tokens",
      type: "number",
      label: "Max tokens",
      hotReloadable: true
    };
    const onChange = vi.fn();
    renderWithConsoleProviders(<SchemaField field={field} value={1024} onChange={onChange} />);

    const input = getMaterialTextField(document, "Max tokens");
    onChange.mockClear();
    setMaterialTextFieldValue(input, "abc");

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid number");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("shows an inline JSON error without emitting invalid object values", async () => {
    const field: FieldSchema = {
      path: "pricing",
      type: "object",
      label: "Pricing",
      control: "object",
      hotReloadable: true
    };
    const onChange = vi.fn();
    renderWithConsoleProviders(<SchemaField field={field} value={{ input_price: 3 }} onChange={onChange} />);

    expect(screen.queryByLabelText("Pricing JSON editor")).not.toBeInTheDocument();
    expect(getMaterialButton(document, /Pricing.*1 key/)).toBeInTheDocument();

    await userEvent.click(getMaterialButton(document, /Pricing.*1 key/));
    const jsonEditor = getMaterialTextField(document, "Pricing JSON editor");
    expect(jsonEditor).toHaveFocus();
    setMaterialTextFieldValue(jsonEditor, "{{");

    expect(jsonEditor.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid JSON");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("toggles boolean fields with the Material Web switch", async () => {
    const field: FieldSchema = {
      path: "enabled",
      type: "boolean",
      label: "Enabled",
      control: "switch",
      hotReloadable: true
    };
    const onChange = vi.fn();

    renderWithConsoleProviders(<SchemaField field={field} value={false} onChange={onChange} />);

    const materialSwitch = getMaterialSwitch(document, "Enabled");
    expect(document.querySelector(".schema-switch")).not.toBeInTheDocument();
    expect(document.querySelector(".schema-field input[type='checkbox']")).not.toBeInTheDocument();
    expect(materialSwitch.selected).toBe(false);

    setMaterialSwitchSelected(materialSwitch, true);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  test("marks textarea and object controls as wide layout fields", () => {
    const field: FieldSchema = {
      path: "system_prompt",
      type: "string",
      label: "System prompt",
      control: "textarea",
      hotReloadable: true
    };

    const { unmount } = renderWithConsoleProviders(
      <SchemaField field={field} value="Be concise." onChange={() => undefined} />
    );

    expect(getMaterialTextField(document, "System prompt").closest(".mb-field")).toHaveClass("mb-field--wide");

    unmount();
    renderWithConsoleProviders(
      <SchemaField
        field={{ ...field, path: "extensions", type: "object", label: "Extensions", control: "object" }}
        value={{}}
        onChange={() => undefined}
      />
    );

    expect(getMaterialButton(document, /Extensions.*0 keys/).closest(".schema-field")).toHaveClass("schema-field--wide");
  });
});

function getMaterialSwitch(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-switch")).find(
    (switchElement) => switchElement.getAttribute("aria-label") === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web switch labelled "${label}".`);
  }
  return element as HTMLElement & { selected: boolean };
}

function getMaterialSelect(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-outlined-select")).find(
    (selectElement) => materialElementLabel(selectElement as HTMLElement & { label?: string }) === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web select labelled "${label}".`);
  }
  return element as HTMLElement & { supportingText: string; value: string };
}

type MaterialSelectOptionElement = HTMLElement & {
  displayText: string;
  selected: boolean;
  value: string;
};

function getMaterialSelectOptions(select: ParentNode) {
  const options = Array.from(select.querySelectorAll<MaterialSelectOptionElement>("md-select-option"));
  if (options.length === 0) {
    throw new Error("Expected Material Web select options to be rendered.");
  }
  return options;
}

function getMaterialTextField(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-outlined-text-field")).find(
    (textField) => materialElementLabel(textField as HTMLElement & { label?: string }) === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web text field labelled "${label}".`);
  }
  return element as HTMLElement & { label: string; supportingText: string; type: string; value: string };
}

function materialElementLabel(element: HTMLElement & { label?: string }) {
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    return labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
      .filter(Boolean)
      .join(" ");
  }
  return element.label || element.getAttribute("aria-label") || element.getAttribute("label") || "";
}

function getMaterialIconButton(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-icon-button")).find(
    (button) => button.getAttribute("aria-label") === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web icon button labelled "${label}".`);
  }
  return element as HTMLElement;
}

function getMaterialButton(container: ParentNode, label: RegExp) {
  const element = Array.from(container.querySelectorAll("md-outlined-button")).find(
    (button) => label.test(button.getAttribute("aria-label") ?? button.textContent ?? "")
  );
  if (!element) {
    throw new Error(`Expected a Material Web outlined button labelled "${label}".`);
  }
  return element as HTMLElement;
}

async function findMaterialSelect(container: ParentNode, label: string) {
  const element = getMaterialSelect(container, label) as HTMLElement & {
    label: string;
    select: (value: string) => void;
    supportingText: string;
    updateComplete?: Promise<boolean>;
    value: string;
  };
  await element.updateComplete;
  return element;
}

function setMaterialTextFieldValue(element: HTMLElement & { value: string }, value: string) {
  act(() => {
    element.value = value;
    element.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
  });
}

function setMaterialSelectValue(element: HTMLElement & { select: (value: string) => void; value: string }, value: string) {
  act(() => {
    element.select(value);
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function setMaterialSwitchSelected(element: HTMLElement & { selected: boolean }, selected: boolean) {
  act(() => {
    element.selected = selected;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
