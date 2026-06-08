import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppShell } from "../../app/App";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import { field, resource } from "../../test/configGraphFixtures";
import * as configGraph from "../../rpc/configGraph";
import { ResourceEditorCard } from "./ResourceEditorCard";

describe("ResourceEditorCard", () => {
  test("renders resource identity, status metadata, and editable fields", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const provider = resource("provider", "anthropic", "Anthropic", {
      base_url: "https://api.anthropic.com",
      api_key: "******",
      protocol: "anthropic"
    }, [
      field("base_url", "Base URL"),
      field("api_key", "API Key", "string", "secret", undefined, true),
      field("protocol", "Protocol", "string", "select", ["anthropic", "openai-response"])
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={provider} revision="rev-1" title="Provider" />
    );

    expect(screen.getByRole("heading", { name: "anthropic" })).toBeInTheDocument();
    expect(document.querySelector(".resource-kind-icon")).toBeInTheDocument();
    expect(within(screen.getByLabelText("anthropic status")).getByText("Saved")).toBeInTheDocument();
    expect(getMaterialTextField(document, "Base URL")).toBeInTheDocument();
    expect(getMaterialTextField(document, "API Key")).toHaveProperty("type", "password");
  });

  test("surfaces restart and critical runtime metadata", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "restartRequired",
      revision: "rev-2"
    });
    const server = resource("server", "main", "Server", {
      addr: "127.0.0.1:38440"
    }, [
      field("addr", "Address")
    ], {
      hotReloadable: false,
      runtimeImpact: "critical",
      status: "restartRequired"
    });

    renderWithConsoleProviders(
      <ResourceEditorCard resource={server} revision="rev-1" />
    );

    expect(screen.getByRole("heading", { name: "main" })).toBeInTheDocument();
    expect(screen.getByText("Restart required")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  test("renders status metadata pills with uniform icon structure", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "restartRequired",
      revision: "rev-2"
    });
    const server = resource("server", "main", "Server", {
      addr: "127.0.0.1:38440"
    }, [
      field("addr", "Address")
    ], {
      hotReloadable: false,
      runtimeImpact: "critical",
      status: "restartRequired"
    });

    const { container } = renderWithConsoleProviders(
      <ResourceEditorCard resource={server} revision="rev-1" />
    );

    const metadataPills = Array.from(
      container.querySelectorAll(".resource-editor-card__facts .resource-meta-pill")
    );
    expect(metadataPills).toHaveLength(4);
    expect(metadataPills.map((pill) => pill.textContent?.trim())).toEqual([
      "restart_altRestart required",
      "priority_highCritical",
      "list_alt1 field",
      "restart_altRestart on change"
    ]);
    for (const pill of metadataPills) {
      expect(pill.querySelectorAll(".material-symbol[aria-hidden=\"true\"]")).toHaveLength(1);
    }
  });

  test("scopes metadata pill geometry to resource editor facts", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "restartRequired",
      revision: "rev-2"
    });
    const server = resource("server", "main", "Server", {
      addr: "127.0.0.1:38440"
    }, [
      field("addr", "Address")
    ], {
      hotReloadable: false,
      runtimeImpact: "critical",
      status: "restartRequired"
    });

    const { container } = renderWithConsoleProviders(
      <MemoryRouter>
        <AppShell
          content={(
            <>
              <span className="resource-meta-pill" data-testid="outside-meta-pill">
                <span className="material-symbol" aria-hidden="true">info</span>
                Outside
              </span>
              <ResourceEditorCard resource={server} revision="rev-1" />
            </>
          )}
        />
      </MemoryRouter>
    );

    const outsidePill = screen.getByTestId("outside-meta-pill");
    const outsideStyle = getComputedStyle(outsidePill);
    expect(outsideStyle.minHeight).not.toBe("30px");
    expect(outsideStyle.paddingLeft).not.toBe("12px");
    expect(outsideStyle.gap).not.toBe("6px");
    expect(container.querySelectorAll(".resource-editor-card__facts .resource-meta-pill")).toHaveLength(4);
  });

  test("localizes resource metadata in Chinese locale", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const server = resource("server", "main", "Server", {
      addr: "127.0.0.1:38440"
    }, [
      field("addr", "Address")
    ], {
      hotReloadable: false,
      runtimeImpact: "critical",
      status: "restartRequired"
    });

    renderWithConsoleProviders(
      <ResourceEditorCard resource={server} revision="rev-1" title="Server" />,
      { locale: "zh-CN" }
    );

    expect(screen.getByText("需要重启")).toBeInTheDocument();
    expect(screen.getByText("关键运行时")).toBeInTheDocument();
    expect(screen.getAllByText("1 个字段").length).toBeGreaterThan(0);
    expect(screen.getAllByText("变更后重启").length).toBeGreaterThan(0);
  });

  test("merges object fields into settings instead of an Advanced JSON group", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const offer = resource("provider_offer", "anthropic/claude-sonnet", "Offer", {
      model: "claude-sonnet",
      upstream_name: "claude-3-5-sonnet",
      priority: 1,
      pricing: { input_price: 3 },
      overrides: {}
    }, [
      field("model", "Model"),
      field("upstream_name", "Upstream Name"),
      field("priority", "Priority", "number", "number"),
      field("pricing", "Pricing", "object", "object"),
      field("overrides", "Overrides", "object", "object")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={offer} revision="rev-1" title="Offer" />
    );

    const identityGroup = screen.getByRole("group", { name: "Identity" });
    const standardGroup = screen.getByRole("group", { name: "Settings" });

    expect(getMaterialTextField(identityGroup, "Model")).toBeInTheDocument();
    expect(getMaterialTextField(identityGroup, "Upstream Name")).toBeInTheDocument();
    expect(getMaterialTextField(standardGroup, "Priority")).toBeInTheDocument();
    expect(getMaterialButton(standardGroup, /Pricing.*1 key/, "outlined")).toBeInTheDocument();
    expect(getMaterialButton(standardGroup, /Overrides.*0 keys/, "outlined")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Advanced JSON" })).not.toBeInTheDocument();
  });

  test("keeps plain long text fields in settings instead of advanced JSON", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const model = resource("model", "claude-sonnet", "Claude Sonnet", {
      display_name: "Claude Sonnet",
      description: "Balanced model"
    }, [
      field("display_name", "Display Name"),
      field("description", "Description", "string", "textarea")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={model} revision="rev-1" title="Model" />
    );

    const settingsGroup = screen.getByRole("group", { name: "Settings" });
    expect(getMaterialTextField(settingsGroup, "Description")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Advanced JSON" })).not.toBeInTheDocument();
  });

  test("classifies field widths by expected content density", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const model = resource("model", "claude-sonnet", "Claude Sonnet", {
      display_name: "Claude Sonnet",
      context_window: 200000,
      default_reasoning_level: "medium",
      description: "Balanced model",
      extensions: {}
    }, [
      field("display_name", "Display Name"),
      field("context_window", "Context Window", "number", "number"),
      field("default_reasoning_level", "Default Reasoning Level"),
      field("description", "Description", "string", "textarea"),
      field("extensions", "Extensions", "object", "object")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={model} revision="rev-1" title="Model" />
    );

    expect(getMaterialTextField(document, "Display Name").closest(".form-grid__medium")).toBeInTheDocument();
    expect(getMaterialTextField(document, "Context Window").closest(".form-grid__compact")).toBeInTheDocument();
    expect(getMaterialTextField(document, "Default Reasoning Level").closest(".form-grid__compact")).toBeInTheDocument();
    expect(getMaterialTextField(document, "Description").closest(".form-grid__wide")).toBeInTheDocument();
    expect(getMaterialButton(document, /Extensions.*0 keys/, "outlined").closest(".form-grid__wide")).toBeInTheDocument();
  });

  test("uses Material Web buttons for delete confirmation state changes", async () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const remove = vi.spyOn(configGraph, "deleteConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const provider = resource("provider", "anthropic", "Anthropic", {
      base_url: "https://api.anthropic.com"
    }, [
      field("base_url", "Base URL")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={provider} revision="rev-1" title="Provider" />
    );

    const deleteButton = getMaterialButton(document, "Delete Provider anthropic", "filled");
    expect(deleteButton).toHaveTextContent("Delete");

    await userEvent.click(deleteButton);

    expect(screen.getByText("Delete anthropic? This removes the resource from the active graph after save."))
      .toBeInTheDocument();
    expect(getMaterialButton(document, "Confirm delete anthropic", "filled")).toBeInTheDocument();
    const cancelButton = getMaterialButton(document, "Cancel", "outlined");

    await userEvent.click(cancelButton);

    expect(screen.queryByText("Delete anthropic? This removes the resource from the active graph after save."))
      .not.toBeInTheDocument();
    expect(remove).not.toHaveBeenCalled();

    await userEvent.click(getMaterialButton(document, "Delete Provider anthropic", "filled"));
    await userEvent.click(getMaterialButton(document, "Confirm delete anthropic", "filled"));

    await waitFor(() => expect(remove).toHaveBeenCalledWith("provider", "anthropic", "rev-1"));
  });

  test("keeps delete button icon colors aligned with error-container labels", async () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const provider = resource("provider", "anthropic", "Anthropic", {
      base_url: "https://api.anthropic.com"
    }, [
      field("base_url", "Base URL")
    ]);

    const { container } = renderWithConsoleProviders(
      <MemoryRouter>
        <AppShell content={<ResourceEditorCard resource={provider} revision="rev-1" title="Provider" />} />
      </MemoryRouter>
    );

    const deleteButton = getMaterialButton(container, "Delete Provider anthropic", "filled");
    expectMaterialFilledButtonContentColors(deleteButton, "var(--mb-color-on-error-container)");

    await userEvent.click(deleteButton);

    const confirmButton = getMaterialButton(container, "Confirm delete anthropic", "filled");
    expectMaterialFilledButtonContentColors(confirmButton, "var(--mb-color-on-error)");
  });
});

function getMaterialTextField(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-outlined-text-field")).find(
    (textField) => materialElementLabel(textField as HTMLElement & { label?: string }) === label
  );
  if (!element) {
    throw new Error(`Missing md-outlined-text-field: ${label}`);
  }
  return element as HTMLElement & { label: string; type: string; value: string };
}

function materialElementLabel(element: HTMLElement & { label?: string }) {
  return element.label || element.getAttribute("aria-label") || element.getAttribute("label") || "";
}

function getMaterialButton(
  container: ParentNode,
  label: string | RegExp,
  variant: "filled" | "outlined"
) {
  const tagName = variant === "filled" ? "md-filled-button" : "md-outlined-button";
  const element = Array.from(container.querySelectorAll(tagName)).find(
    (button) => {
      const accessibleLabel = button.getAttribute("aria-label") ?? button.textContent ?? "";
      return typeof label === "string" ? accessibleLabel.trim() === label : label.test(accessibleLabel);
    }
  );
  if (!element) {
    throw new Error(`Missing ${tagName} button: ${label}`);
  }
  expect(element.tagName.toLowerCase()).toBe(tagName);
  return element;
}

function expectMaterialFilledButtonContentColors(button: Element, colorToken: string) {
  expect(button.tagName.toLowerCase()).toBe("md-filled-button");
  for (const property of [
    "--md-filled-button-label-text-color",
    "--md-filled-button-hover-label-text-color",
    "--md-filled-button-focus-label-text-color",
    "--md-filled-button-pressed-label-text-color",
    "--md-filled-button-icon-color",
    "--md-filled-button-hover-icon-color",
    "--md-filled-button-focus-icon-color",
    "--md-filled-button-pressed-icon-color"
  ]) {
    expect(getComputedStyle(button).getPropertyValue(property).trim()).toBe(colorToken);
  }
}
