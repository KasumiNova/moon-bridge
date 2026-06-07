import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import type { FieldSchema } from "../../rpc/types";
import { SchemaField } from "./SchemaField";

describe("SchemaField", () => {
  test("renders enum fields as selects", async () => {
    const field: FieldSchema = {
      path: "protocol",
      type: "string",
      label: "Protocol",
      control: "select",
      enum: ["anthropic", "openai-response"],
      hotReloadable: true
    };
    const onChange = vi.fn();
    render(<SchemaField field={field} value="anthropic" onChange={onChange} />);

    await userEvent.selectOptions(screen.getByLabelText("Protocol"), "openai-response");

    expect(onChange).toHaveBeenCalledWith("openai-response");
  });

  test("renders secret fields without exposing the value", () => {
    const field: FieldSchema = {
      path: "api_key",
      type: "string",
      label: "API key",
      secret: true,
      hotReloadable: true
    };

    render(<SchemaField field={field} value="sk-secret" onChange={() => undefined} />);

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

    render(<SchemaField field={field} value="sk-secret" onChange={() => undefined} />);

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
    render(<SchemaField field={field} value={1024} onChange={onChange} />);

    await userEvent.clear(screen.getByLabelText("Max tokens"));
    await userEvent.type(screen.getByLabelText("Max tokens"), "2048");

    expect(onChange).toHaveBeenLastCalledWith(2048);
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
    render(<SchemaField field={field} value={{ input_price: 3 }} onChange={onChange} />);

    await userEvent.clear(screen.getByLabelText("Pricing"));
    await userEvent.type(screen.getByLabelText("Pricing"), "{{");

    expect(screen.getByLabelText("Pricing")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid JSON");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("marks textarea and object controls as wide layout fields", () => {
    const field: FieldSchema = {
      path: "system_prompt",
      type: "string",
      label: "System prompt",
      control: "textarea",
      hotReloadable: true
    };

    const { rerender } = render(
      <SchemaField field={field} value="Be concise." onChange={() => undefined} />
    );

    expect(screen.getByLabelText("System prompt").closest(".schema-field")).toHaveClass("schema-field--wide");

    rerender(
      <SchemaField
        field={{ ...field, path: "extensions", type: "object", label: "Extensions", control: "object" }}
        value={{}}
        onChange={() => undefined}
      />
    );

    expect(screen.getByLabelText("Extensions").closest(".schema-field")).toHaveClass("schema-field--wide");
  });
});
