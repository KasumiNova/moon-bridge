import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import type { FieldSchema } from "../../rpc/types";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import { SchemaField } from "./SchemaField";

describe("SchemaField", () => {
  test("renders enum fields as an accessible dropdown menu", async () => {
    const field: FieldSchema = {
      path: "protocol",
      type: "string",
      label: "Protocol",
      control: "select",
      enum: ["anthropic", "openai-response", "openai-chat", "google-genai"],
      hotReloadable: true
    };
    const onChange = vi.fn();
    renderWithConsoleProviders(<SchemaField field={field} value="anthropic" onChange={onChange} />);

    expect(document.querySelector(".schema-field select")).not.toBeInTheDocument();
    const trigger = screen.getByRole("combobox", { name: "Protocol" });
    expect(trigger).toHaveTextContent("Anthropic");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("schema-field-protocol-label")).toHaveTextContent("Protocol");

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(screen.getByRole("option", { name: /OpenAI Responses/ }));

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

    const helpButton = screen.getByRole("button", { name: "Help for Base URL" });
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

    expect(screen.getByLabelText("API key")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText("API key")).toHaveValue("");
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

    expect(screen.getByText("Enter a new value to replace the saved secret.")).toBeInTheDocument();
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

    expect(screen.getByLabelText("Max tokens")).toHaveAttribute("type", "text");

    await userEvent.clear(screen.getByLabelText("Max tokens"));
    await userEvent.type(screen.getByLabelText("Max tokens"), "2048");

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

    const input = screen.getByLabelText("Max tokens");
    await userEvent.clear(input);
    onChange.mockClear();
    await userEvent.type(input, "abc");

    expect(input).toHaveAttribute("aria-invalid", "true");
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
    expect(screen.getByRole("button", { name: /Pricing.*1 key/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Pricing.*1 key/ }));
    expect(screen.getByLabelText("Pricing JSON editor")).toHaveFocus();
    await userEvent.clear(screen.getByLabelText("Pricing JSON editor"));
    await userEvent.type(screen.getByLabelText("Pricing JSON editor"), "{{");

    expect(screen.getByLabelText("Pricing JSON editor")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid JSON");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("toggles boolean fields with an app-styled switch instead of a native checkbox", async () => {
    const field: FieldSchema = {
      path: "enabled",
      type: "boolean",
      label: "Enabled",
      control: "switch",
      hotReloadable: true
    };
    const onChange = vi.fn();

    renderWithConsoleProviders(<SchemaField field={field} value={false} onChange={onChange} />);

    expect(document.querySelector(".schema-field input[type='checkbox']")).not.toBeInTheDocument();

    const toggle = screen.getByRole("switch", { name: "Enabled" });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    await userEvent.click(toggle);

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

    expect(screen.getByLabelText("System prompt").closest(".schema-field")).toHaveClass("schema-field--wide");

    unmount();
    renderWithConsoleProviders(
      <SchemaField
        field={{ ...field, path: "extensions", type: "object", label: "Extensions", control: "object" }}
        value={{}}
        onChange={() => undefined}
      />
    );

    expect(screen.getByRole("button", { name: /Extensions.*0 keys/ }).closest(".schema-field")).toHaveClass("schema-field--wide");
  });
});
