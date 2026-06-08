import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import * as configGraph from "../../rpc/configGraph";
import * as management from "../../rpc/management";
import { configGraphFixture } from "../../test/configGraphFixtures";
import { SearchToolsPage } from "./SearchToolsPage";

describe("SearchToolsPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders web search, extensions, and proxy graph resources without YAML controls", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    renderWithConsoleProviders(<SearchToolsPage />);

    expect(await screen.findByRole("heading", { level: 2, name: "Web Search" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Extensions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Proxy" })).toBeInTheDocument();

    const webSearch = screen.getByLabelText("Web Search");
    expect(within(webSearch).getByRole("heading", { level: 3, name: "main" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("Web Search main status")).getByText("Saved")).toBeInTheDocument();
    expect(within(screen.getByLabelText("Extension db_sqlite status")).getByText("Saved")).toBeInTheDocument();
    expect(within(screen.getByLabelText("Proxy main status")).getByText("Critical")).toBeInTheDocument();

    expect(getMaterialSelect(document, "Support").value).toBe("auto");
    expect(screen.getByText("db_sqlite")).toBeInTheDocument();
    expect(screen.getByLabelText("Response Proxy")).toBeInTheDocument();
    expect(screen.queryByLabelText(/yaml/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/yaml/i)).not.toBeInTheDocument();
  });

  test("localizes page chrome in Chinese locale", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    renderWithConsoleProviders(<SearchToolsPage />, { locale: "zh-CN" });

    expect(await screen.findByRole("heading", { level: 2, name: "联网搜索" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "扩展" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "代理" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("代理 main status")).getByText("关键运行时")).toBeInTheDocument();
  });

  test("creates an extension from the extensions section", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    vi.spyOn(management, "listExtensions").mockResolvedValue(["db_sqlite", "metrics"]);
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<SearchToolsPage />);

    await waitFor(() => expect(getMaterialButton(document, "Add Extension")).toBeInTheDocument());
    await userEvent.click(getMaterialButton(document, "Add Extension"));
    const form = screen.getByRole("form", { name: "Create Extension" });
    expect(within(form).queryByRole("textbox", { name: "Extension ID" })).not.toBeInTheDocument();
    expect(getMaterialSelect(form, "Extension ID")).toBeInTheDocument();
    setMaterialSelectValue(getMaterialSelect(form, "Extension ID"), "metrics");
    submitMaterialForm(form, "Create Extension");

    await waitFor(() => expect(create).toHaveBeenCalledWith("extension", {
      baseRevision: "rev-1",
      id: "metrics",
      value: {
        enabled: true
      }
    }));
  });

  test("lets users disable a new extension and read create field help", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    vi.spyOn(management, "listExtensions").mockResolvedValue(["db_sqlite", "metrics"]);
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<SearchToolsPage />);

    await waitFor(() => expect(getMaterialButton(document, "Add Extension")).toBeInTheDocument());
    await userEvent.click(getMaterialButton(document, "Add Extension"));
    const form = screen.getByRole("form", { name: "Create Extension" });
    const enabledSwitch = getMaterialSwitch(form, "Enabled");
    expect(form.querySelector(".schema-switch")).not.toBeInTheDocument();
    expect(enabledSwitch.closest(".schema-field__switch-line")).toBeInTheDocument();
    expect(enabledSwitch.closest(".schema-field")).toBeInTheDocument();
    expect(enabledSwitch.selected).toBe(true);
    expect(getMaterialSelect(form, "Extension ID")).toBeInTheDocument();
    await userEvent.click(getMaterialIconButton(form, "Help for Enabled"));
    expect(within(form).getByRole("tooltip")).toHaveTextContent("Enables model-level or global extensions");
    setMaterialSelectValue(getMaterialSelect(form, "Extension ID"), "metrics");
    setMaterialSwitchSelected(enabledSwitch, false);
    submitMaterialForm(form, "Create Extension");

    await waitFor(() => expect(create).toHaveBeenCalledWith("extension", {
      baseRevision: "rev-1",
      id: "metrics",
      value: {
        enabled: false
      }
    }));
  });

  test("deletes extensions but not singleton search or proxy resources", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const remove = vi.spyOn(configGraph, "deleteConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({
        revision: "rev-2",
        resources: configGraphFixture().resources.filter((resource) => resource.id !== "db_sqlite")
      })
    });

    renderWithConsoleProviders(<SearchToolsPage />);

    expect(await screen.findByRole("heading", { level: 2, name: "Web Search" })).toBeInTheDocument();
    expect(queryMaterialButton(document, "Delete Web Search main")).not.toBeInTheDocument();
    expect(queryMaterialButton(document, "Delete Proxy main")).not.toBeInTheDocument();

    const extensionPanel = screen.getByText("db_sqlite").closest("section")!;
    await userEvent.click(getMaterialButton(extensionPanel, "Delete Extension db_sqlite"));
    await userEvent.click(getMaterialButton(extensionPanel, "Confirm delete db_sqlite"));

    expect(remove).toHaveBeenCalledWith("extension", "db_sqlite", "rev-1");
    expect(screen.queryByText("db_sqlite")).not.toBeInTheDocument();
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

type MaterialSelectElement = HTMLElement & {
  label: string;
  value: string;
};

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

function getMaterialIconButton(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-icon-button")).find(
    (candidate) => candidate.getAttribute("aria-label") === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web icon button labelled "${label}".`);
  }
  return element as HTMLElement;
}

function getMaterialButton(container: ParentNode, label: string) {
  const element = queryMaterialButton(container, label);
  if (!element) {
    throw new Error(`Expected a Material Web filled button labelled "${label}".`);
  }
  return element as HTMLElement;
}

function queryMaterialButton(container: ParentNode, label: string) {
  return Array.from(container.querySelectorAll("md-filled-button")).find((candidate) => {
    const accessibleLabel = candidate.getAttribute("aria-label") ?? candidate.textContent ?? "";
    return accessibleLabel.includes(label);
  }) ?? null;
}

function setMaterialSelectValue(element: MaterialSelectElement, value: string) {
  act(() => {
    element.value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function setMaterialSwitchSelected(element: HTMLElement & { selected: boolean }, selected: boolean) {
  act(() => {
    element.selected = selected;
    element.dispatchEvent(new Event("change", { bubbles: true }));
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
