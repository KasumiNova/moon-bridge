import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import * as configGraph from "../../rpc/configGraph";
import { configGraphFixture } from "../../test/configGraphFixtures";
import { RoutesPage } from "./RoutesPage";

describe("RoutesPage", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("renders route graph fields without priority or fallback controls", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    renderWithConsoleProviders(<RoutesPage />);

    expect(await screen.findByRole("heading", { level: 3, name: "primary" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("Route primary status")).getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("8 fields")).toBeInTheDocument();
    expect(screen.getByText("Hot reload")).toBeInTheDocument();
    expect(getMaterialTextField(document, "Route model")).toBeInTheDocument();
    expect(getMaterialTextField(document, "Route provider")).toBeInTheDocument();
    expect(getMaterialTextField(document, "Route display name")).toBeInTheDocument();
    expect(getMaterialTextField(document, "Route context window")).toBeInTheDocument();
    const advancedFeatures = screen.getByRole("group", { name: "Advanced Features" });
    expect(getMaterialTextField(advancedFeatures, "Route web search JSON")).toHaveClass("schema-json-editor--fixed");
    expect(getMaterialTextField(advancedFeatures, "Route extensions JSON")).toHaveClass("schema-json-editor--fixed");
    expect(queryMaterialOutlinedButton(advancedFeatures, /Route web search.*1 key/)).not.toBeInTheDocument();
    expect(queryMaterialOutlinedButton(advancedFeatures, /Route extensions.*0 keys/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/priority/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/fallback/i)).not.toBeInTheDocument();
  });

  test("autosaves route edits through graph patches", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const patch = vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });

    renderWithConsoleProviders(<RoutesPage />);

    const routePanel = await screen.findByLabelText("Route primary");
    vi.useFakeTimers();
    const providerField = getMaterialTextField(routePanel, "Route provider");
    setMaterialTextFieldValue(providerField, "openai");
    fireEvent.blur(providerField);

    await advanceAutosave();

    expect(patch).toHaveBeenCalledWith({
      baseRevision: "rev-1",
      changes: [
        {
          kind: "route",
          id: "primary",
          field: "provider",
          value: "openai"
        }
      ]
    });
  });

  test("creates a route from current graph model and provider options", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<RoutesPage />);

    await waitFor(() => expect(getMaterialButton(document, "Add Route")).toBeInTheDocument());
    await userEvent.click(getMaterialButton(document, "Add Route"));
    const form = screen.getByRole("form", { name: "Create Route" });
    setMaterialTextFieldValue(getMaterialTextField(form, "Route alias"), "fast");
    expect(getMaterialSelect(form, "Model").value).toBe("claude-sonnet");
    expect(getMaterialSelect(form, "Provider").value).toBe("anthropic");
    submitMaterialForm(form, "Create Route");

    await waitFor(() => expect(create).toHaveBeenCalledWith("route", {
      baseRevision: "rev-1",
      id: "fast",
      value: {
        model: "claude-sonnet",
        provider: "anthropic"
      }
    }));
  });

  test("renders create route controls with official Material field labels", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    renderWithConsoleProviders(<RoutesPage />);

    await waitFor(() => expect(getMaterialButton(document, "Add Route")).toBeInTheDocument());
    await userEvent.click(getMaterialButton(document, "Add Route"));
    const form = screen.getByRole("form", { name: "Create Route" });
    const aliasField = getMaterialTextField(form, "Route alias");
    const modelSelect = getMaterialSelect(form, "Model");

    expect(aliasField.label).toBe("Route alias");
    expect(aliasField).not.toHaveAttribute("aria-labelledby");
    expect(aliasField).toHaveAttribute("spellcheck", "false");
    expect(aliasField.closest(".form-field--create-track")?.querySelector(".schema-field__label")).not.toBeInTheDocument();
    expect(getMaterialTrailingIconButton(aliasField, "Help for Route alias")).toBeInTheDocument();
    expect(modelSelect.label).toBe("Model");
    expect(modelSelect).not.toHaveAttribute("aria-labelledby");
    expect(modelSelect.closest(".form-field--create-track")?.querySelector(".schema-field__label")).not.toBeInTheDocument();
    expect(modelSelect.supportingText).toBe("");
    expect(modelSelect.closest(".mb-field__select-shell")).not.toBeInTheDocument();
    expect(queryMaterialIconButton(form, "Help for Model")).not.toBeInTheDocument();
  });

  test("deletes a route after inline confirmation", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const remove = vi.spyOn(configGraph, "deleteConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({
        revision: "rev-2",
        resources: configGraphFixture().resources.filter((resource) => resource.kind !== "route")
      })
    });

    renderWithConsoleProviders(<RoutesPage />);

    const routePanel = await screen.findByLabelText("Route primary");
    await userEvent.click(getMaterialButton(routePanel, "Delete Route primary"));
    expect(remove).not.toHaveBeenCalled();
    await userEvent.click(getMaterialButton(routePanel, "Confirm delete primary"));

    expect(remove).toHaveBeenCalledWith("route", "primary", "rev-1");
    expect(screen.queryByLabelText("Route primary")).not.toBeInTheDocument();
  });
});

async function advanceAutosave() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(450);
    await Promise.resolve();
  });
}

type MaterialSelectElement = HTMLElement & {
  label: string;
  supportingText: string;
  value: string;
};

type MaterialTextFieldElement = HTMLElement & {
  label: string;
  value: string;
};

function getMaterialTextField(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll<MaterialTextFieldElement>("md-outlined-text-field")).find(
    (candidate) => materialElementLabel(candidate) === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web outlined text field labelled "${label}".`);
  }
  return element;
}

function getMaterialSelect(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll<MaterialSelectElement>("md-outlined-select")).find(
    (candidate) => materialElementLabel(candidate) === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web select labelled "${label}".`);
  }
  return element;
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

function getMaterialButton(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-filled-button")).find(
    (candidate) => {
      const accessibleLabel = candidate.getAttribute("aria-label") ?? candidate.textContent ?? "";
      return accessibleLabel.includes(label);
    }
  );
  if (!element) {
    throw new Error(`Expected a Material Web filled button labelled "${label}".`);
  }
  return element as HTMLElement;
}

function getMaterialOutlinedButton(container: ParentNode, label: RegExp) {
  const element = Array.from(container.querySelectorAll("md-outlined-button")).find(
    (candidate) => label.test(candidate.getAttribute("aria-label") ?? candidate.textContent ?? "")
  );
  if (!element) {
    throw new Error(`Expected a Material Web outlined button labelled "${label}".`);
  }
  return element as HTMLElement;
}

function queryMaterialOutlinedButton(container: ParentNode, label: RegExp) {
  return Array.from(container.querySelectorAll("md-outlined-button")).find(
    (candidate) => label.test(candidate.getAttribute("aria-label") ?? candidate.textContent ?? "")
  ) ?? null;
}

function getMaterialTrailingIconButton(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-icon-button")).find(
    (candidate) => candidate.getAttribute("slot") === "trailing-icon" && candidate.getAttribute("aria-label") === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web trailing icon button labelled "${label}".`);
  }
  return element as HTMLElement;
}

function getMaterialIconButton(container: ParentNode, label: string) {
  const element = queryMaterialIconButton(container, label);
  if (!element) {
    throw new Error(`Expected a Material Web icon button labelled "${label}".`);
  }
  return element as HTMLElement;
}

function queryMaterialIconButton(container: ParentNode, label: string) {
  return Array.from(container.querySelectorAll("md-icon-button")).find(
    (candidate) => candidate.getAttribute("aria-label") === label
  ) ?? null;
}

function setMaterialTextFieldValue(element: MaterialTextFieldElement, value: string) {
  act(() => {
    element.value = value;
    element.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
  });
}

function submitMaterialForm(container: ParentNode, submitLabel: string) {
  const button = getMaterialButton(container, submitLabel);
  const form = button.closest("form");
  if (!form) {
    throw new Error("Expected Material Web submit button inside a form.");
  }
  fireEvent.submit(form);
}
