import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppShell } from "../../app/App";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import { field, resource } from "../../test/configGraphFixtures";
import {
  expectPanelElementToBeFlat,
  expectPanelRuleToAvoidEdges,
  expectPanelStateRuleToStayFlat
} from "../../test/panelStyleAssertions";
import * as configGraph from "../../rpc/configGraph";
import { ResourceEditorCard } from "./ResourceEditorCard";

describe("ResourceEditorCard", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

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
    expect(getMaterialTextField(document, "Upstream base URL")).toBeInTheDocument();
    expect(getMaterialTextField(document, "Upstream API key")).toHaveProperty("type", "password");
  });

  test("keeps editor background panels tonal without borders, glow, or hover lift", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const model = resource("model", "claude-sonnet", "Claude Sonnet", {
      supports_reasoning: true,
      default_reasoning_level: "medium",
      default_reasoning_summary: "auto",
      supported_reasoning_levels: [
        { effort: "low", description: "Fast responses" },
        { effort: "medium", description: "Balanced" }
      ],
      web_search: { support: "auto" },
      extensions: {}
    }, [
      field("supports_reasoning", "Supports Reasoning", "boolean", "switch"),
      field("default_reasoning_level", "Default Reasoning Level"),
      field("supported_reasoning_levels", "Supported Reasoning Levels", "array", "array"),
      field("default_reasoning_summary", "Default Reasoning Summary"),
      field("web_search", "Web Search", "object", "object"),
      field("extensions", "Extensions", "object", "object")
    ]);

    const { container } = renderWithConsoleProviders(
      <MemoryRouter>
        <AppShell content={<ResourceEditorCard resource={model} revision="rev-1" title="Model" />} />
      </MemoryRouter>
    );

    const editorCard = container.querySelector(".resource-editor-card");
    const advancedPanels = container.querySelectorAll(".resource-field-group--advanced");
    expect(editorCard).toBeInTheDocument();
    expect(advancedPanels.length).toBeGreaterThan(0);
    expectPanelElementToBeFlat(editorCard!);
    for (const panel of advancedPanels) {
      expectPanelElementToBeFlat(panel);
    }
    expectPanelRuleToAvoidEdges(".resource-editor-card");
    expectPanelStateRuleToStayFlat(".resource-editor-card:hover");
    expectPanelStateRuleToStayFlat(".resource-editor-card:focus-within");
    expectPanelRuleToAvoidEdges(".resource-field-group--advanced");
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

  test("renders status metadata pills with uniform icon structure and spacing", () => {
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
        <AppShell content={<ResourceEditorCard resource={server} revision="rev-1" />} />
      </MemoryRouter>
    );

    const metadataPills = Array.from(
      container.querySelectorAll(".resource-editor-card__facts .resource-meta-pill")
    );
    const facts = container.querySelector(".resource-editor-card__facts");
    const statusGroup = container.querySelector(".resource-editor-card__status-group");
    expect(metadataPills).toHaveLength(4);
    expect(metadataPills.map((pill) => pill.textContent?.trim())).toEqual([
      "restart_altRestart required",
      "priority_highCritical",
      "list_alt1 field",
      "restart_altRestart on change"
    ]);
    expect(getComputedStyle(statusGroup!).columnGap).toBe(getComputedStyle(facts!).columnGap);
    for (const pill of metadataPills) {
      expect(pill.querySelectorAll(".material-symbol[aria-hidden=\"true\"]")).toHaveLength(1);
      expect(getComputedStyle(pill).padding).toBe("0px 12px");
    }
  });

  test("uses low-emphasis error color for critical metadata pills in dark theme", () => {
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
        <AppShell content={<ResourceEditorCard resource={server} revision="rev-1" />} />
      </MemoryRouter>
    );

    const criticalPill = container.querySelector(".status-pill--critical");
    expect(getComputedStyle(criticalPill!).getPropertyValue("--mb-status-danger-container").trim())
      .toBe("color-mix(in srgb, var(--mb-color-error) 16%, var(--mb-color-surface-container-highest))");
    expect(getComputedStyle(criticalPill!).getPropertyValue("--mb-status-danger-label").trim())
      .toBe("color-mix(in srgb, var(--mb-color-error) 72%, var(--mb-color-on-surface))");
    expect(getComputedStyle(criticalPill!).getPropertyValue("--mb-status-danger-container").trim())
      .not.toBe("var(--mb-color-error-container)");
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
    expect(within(screen.getByLabelText("main 状态")).getByText("需要重启")).toBeInTheDocument();
  });

  test("merges object fields into basic without a raw JSON editor group", () => {
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
    const standardGroup = screen.getByRole("group", { name: "Basic" });

    expect(getMaterialTextField(identityGroup, "Offer model")).toBeInTheDocument();
    expect(getMaterialTextField(identityGroup, "Upstream model name")).toBeInTheDocument();
    expect(getMaterialTextField(standardGroup, "Offer priority")).toBeInTheDocument();
    expect(getStructuredObject(standardGroup, "Pricing")).not.toHaveTextContent("Structured editor");
    expect(getMaterialTextField(standardGroup, "input_price")).toBeInTheDocument();
    expect(getStructuredObject(standardGroup, "Offer overrides")).toHaveTextContent("No configured entries.");
    expect(queryMaterialOutlinedButton(standardGroup, /Pricing.*1 key/)).not.toBeInTheDocument();
    expect(queryMaterialTextField(standardGroup, "Pricing JSON")).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Advanced JSON" })).not.toBeInTheDocument();
  });

  test("keeps plain long text fields in basic without a raw JSON editor group", () => {
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

    const settingsGroup = screen.getByRole("group", { name: "Basic" });
    expect(getMaterialTextField(settingsGroup, "Model description")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Advanced JSON" })).not.toBeInTheDocument();
  });

  test("uses a compact four-column identity layout for route target fields", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const route = resource("route", "primary", "Primary Route", {
      to: "primary",
      model: "claude-sonnet",
      provider: "anthropic",
      display_name: "Primary Route"
    }, [
      field("to", "Route Target"),
      field("model", "Model"),
      field("provider", "Provider"),
      field("display_name", "Display Name")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={route} revision="rev-1" title="Route" />
    );

    const identityGroup = screen.getByRole("group", { name: "Identity" });
    expect(identityGroup).toHaveClass("resource-field-group--route-identity");
    const identityGrid = identityGroup.querySelector(".form-grid");
    expect(identityGrid).toHaveClass("form-grid--route-identity");
    expect([
      getMaterialTextField(identityGroup, "Route target"),
      getMaterialTextField(identityGroup, "Route model"),
      getMaterialTextField(identityGroup, "Route provider"),
      getMaterialTextField(identityGroup, "Route display name")
    ].map((fieldElement) => fieldElement.closest(".form-grid"))).toEqual([
      identityGrid,
      identityGrid,
      identityGrid,
      identityGrid
    ]);
  });

  test("groups model settings into basic, multimodal, advanced features, and reasoning panels", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const model = resource("model", "claude-sonnet", "Claude Sonnet", {
      display_name: "Claude Sonnet",
      context_window: 200000,
      max_output_tokens: 8192,
      supports_reasoning: true,
      default_reasoning_level: "medium",
      default_reasoning_summary: "auto",
      description: "Balanced model",
      base_instructions: "Stay concise.",
      supported_reasoning_levels: [
        { effort: "low", description: "Fast responses with lighter reasoning" },
        { effort: "medium", description: "Balances speed and reasoning depth" },
        { effort: "high", description: "Greater reasoning depth" }
      ],
      input_modalities: ["text", "image"],
      supports_image_detail_original: true,
      web_search: { support: "auto", max_uses: 4 },
      extensions: {
        visual: { enabled: true }
      }
    }, [
      field("display_name", "Display Name"),
      field("context_window", "Context Window", "number", "number"),
      field("max_output_tokens", "Max Output Tokens", "number", "number"),
      field("supports_reasoning", "Supports Reasoning", "boolean", "switch"),
      field("default_reasoning_level", "Default Reasoning Level"),
      field("supported_reasoning_levels", "Supported Reasoning Levels", "array", "array"),
      field("default_reasoning_summary", "Default Reasoning Summary"),
      field("description", "Description", "string", "textarea"),
      field("base_instructions", "Base Instructions", "string", "textarea"),
      field("input_modalities", "Input Modalities", "array", "array"),
      field("supports_image_detail_original", "Supports Image Detail Original", "boolean", "switch"),
      field("web_search", "Web Search", "object", "object"),
      field("extensions", "Extensions", "object", "object")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={model} revision="rev-1" title="Model" />
    );

    const reasoningPanel = screen.getByRole("group", { name: "Reasoning" });
    const basicPanel = screen.getByRole("group", { name: "Basic" });
    const multimodalPanel = screen.getByRole("group", { name: "Multimodal" });
    const advancedPanel = screen.getByRole("group", { name: "Advanced Features" });
    expect(basicPanel).toContainElement(getMaterialTextField(document, "Context window"));
    expect(basicPanel).toContainElement(getMaterialTextField(document, "Max output tokens"));
    expect(basicPanel).toContainElement(getMaterialTextField(document, "Model description"));
    expect(basicPanel).toContainElement(getMaterialTextField(document, "Base instructions"));
    expect(multimodalPanel).toHaveClass("resource-field-group--multimodal");
    expect(getEditableList(multimodalPanel, "Input modalities")).toBeInTheDocument();
    expect(getMaterialSwitch(multimodalPanel, "Supports original image detail")).toBeInTheDocument();
    expect(advancedPanel).toHaveClass("resource-field-group--advanced");
    expect(getMaterialSelect(advancedPanel, "Model web search mode")).toBeInTheDocument();
    expect(getMaterialTextField(advancedPanel, "Model web search max uses")).toBeInTheDocument();
    expect(getExtensionFeatureRow(advancedPanel, "visual")).toBeInTheDocument();
    expect(getMaterialSwitch(advancedPanel, "Enable visual extension")).toBeInTheDocument();
    expect(queryMaterialTextField(document, "Model web search JSON")).not.toBeInTheDocument();
    expect(queryMaterialTextField(document, "Model extensions JSON")).not.toBeInTheDocument();
    expect(reasoningPanel).toHaveClass("resource-field-group--reasoning");
    const reasoningSwitch = getMaterialSwitch(reasoningPanel, "Supports reasoning");
    expect(reasoningSwitch.selected).toBe(true);
    expect(within(reasoningPanel).queryByText("4 fields")).not.toBeInTheDocument();
    const defaultLevelCell = getMaterialSelect(reasoningPanel, "Default reasoning level").closest(".form-grid__compact");
    const defaultSummaryCell = getMaterialTextField(document, "Default reasoning summary").closest(".form-grid__compact");
    expect(defaultLevelCell).toBeInTheDocument();
    expect(defaultSummaryCell).toBeInTheDocument();
    expect(defaultLevelCell?.parentElement).toBe(defaultSummaryCell?.parentElement);
    expect(defaultLevelCell?.nextElementSibling).toBe(defaultSummaryCell);
    const reasoningDefaultsRow = getMaterialSelect(document, "Default reasoning level")
      .closest(".form-grid__reasoning-defaults");
    expect(reasoningDefaultsRow).toBeInTheDocument();
    expect(reasoningDefaultsRow).toHaveClass("form-grid__wide");
    expect(reasoningDefaultsRow).toContainElement(getMaterialTextField(document, "Default reasoning summary"));
    expect(Array.from(reasoningDefaultsRow!.children).map((child) => child.className)).toEqual([
      "form-grid__compact",
      "form-grid__compact"
    ]);
    expect(getMaterialSelectOptions(getMaterialSelect(document, "Default reasoning level")).map((option) => option.value))
      .toEqual(["low", "medium", "high"]);
    expect(queryMaterialTextField(document, "Default reasoning level")).not.toBeInTheDocument();
    expect(getMaterialTextField(document, "Model display name").closest(".form-grid__medium")).toBeInTheDocument();
    expect(getMaterialTextField(document, "Context window").closest(".form-grid__compact")).toBeInTheDocument();
    expect(getMaterialTextField(document, "Model description").closest(".form-grid__wide")).toBeInTheDocument();
    expect(getEditableList(reasoningPanel, "Supported reasoning levels")).toBeInTheDocument();
    expect(getEditableList(multimodalPanel, "Input modalities")).toBeInTheDocument();
    expect(getEditableListItems(document, "Supported reasoning levels")).toEqual(["low", "medium", "high"]);
    expect(getEditableListItems(document, "Input modalities")).toEqual(["text", "image"]);
    expect(getEditableList(document, "Supported reasoning levels").querySelector("md-chip-set")).toBeInTheDocument();
    expect(getEditableList(document, "Supported reasoning levels").querySelectorAll("md-input-chip")).toHaveLength(3);
    expect(getMaterialTextField(getEditableList(document, "Supported reasoning levels"), "Add Supported reasoning levels"))
      .toHaveAttribute("spellcheck", "false");
    expect(getMaterialButton(getEditableList(document, "Supported reasoning levels"), "Add Supported reasoning levels item", "filled"))
      .toBeInTheDocument();
    expect(queryMaterialTextField(document, "Supported reasoning levels JSON")).not.toBeInTheDocument();
    expect(queryMaterialTextField(document, "Input modalities JSON")).not.toBeInTheDocument();
    expect(queryMaterialOutlinedButton(document, /Supported reasoning levels.*3 items/)).not.toBeInTheDocument();
    expect(queryMaterialOutlinedButton(document, /Input modalities.*2 items/)).not.toBeInTheDocument();
    expect(queryMaterialOutlinedButton(document, /Model web search.*1 key/)).not.toBeInTheDocument();
    expect(queryMaterialOutlinedButton(document, /Model extensions.*1 key/)).not.toBeInTheDocument();
  });

  test("autosaves model web search through structured Material controls while preserving existing keys", async () => {
    const patch = vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const model = resource("model", "claude-sonnet", "Claude Sonnet", {
      web_search: {
        support: "auto",
        max_uses: 4,
        search_max_rounds: 2,
        tavily_api_key: "******",
        custom_flag: "keep"
      }
    }, [
      field("web_search", "Web Search", "object", "object")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={model} revision="rev-1" title="Model" />
    );

    const advancedPanel = screen.getByRole("group", { name: "Advanced Features" });
    const supportSelect = getMaterialSelect(advancedPanel, "Model web search mode");
    expect(getMaterialSelectOptions(supportSelect).map((option) => option.value)).toEqual([
      "auto",
      "enabled",
      "disabled",
      "injected"
    ]);
    expect(getMaterialTextField(advancedPanel, "Model web search max uses")).toHaveAttribute("spellcheck", "false");
    expect(getMaterialTextField(advancedPanel, "Model web search Tavily API key")).toHaveProperty("type", "password");
    expect(getMaterialTextField(advancedPanel, "Model web search Firecrawl API key")).toHaveProperty("type", "password");
    expect(queryMaterialTextField(advancedPanel, "Model web search JSON")).not.toBeInTheDocument();

    fireEvent.blur(getMaterialTextField(advancedPanel, "Model web search Tavily API key"));
    expect(patch).not.toHaveBeenCalled();

    setMaterialSelectValueBySelectedOption(supportSelect, "disabled");

    await waitFor(() =>
      expect(patch).toHaveBeenCalledWith({
        baseRevision: "rev-1",
        changes: [
          {
            kind: "model",
            id: "claude-sonnet",
            field: "web_search",
            value: {
              support: "disabled",
              max_uses: 4,
              search_max_rounds: 2,
              tavily_api_key: "******",
              custom_flag: "keep"
            }
          }
        ]
      })
    );
  });

  test("autosaves provider and route web search through structured Material controls", async () => {
    const patch = vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const provider = resource("provider", "anthropic", "Anthropic", {
      web_search: {
        support: "injected",
        tavily_api_key: "******",
        firecrawl_api_key: "******",
        search_max_rounds: 2
      }
    }, [
      field("web_search", "Web Search", "object", "object")
    ]);
    const { unmount } = renderWithConsoleProviders(
      <ResourceEditorCard resource={provider} revision="rev-1" title="Provider" />
    );

    setMaterialTextFieldValue(getMaterialTextField(document, "Provider web search Tavily API key"), "tv-new");
    fireEvent.blur(getMaterialTextField(document, "Provider web search Tavily API key"));

    await waitFor(() =>
      expect(patch).toHaveBeenCalledWith({
        baseRevision: "rev-1",
        changes: [
          {
            kind: "provider",
            id: "anthropic",
            field: "web_search",
            value: {
              support: "injected",
              tavily_api_key: "tv-new",
              firecrawl_api_key: "******",
              search_max_rounds: 2
            }
          }
        ]
      })
    );

    unmount();
    patch.mockClear();
    const route = resource("route", "primary", "Primary", {
      web_search: {
        support: "auto",
        max_uses: 3
      }
    }, [
      field("web_search", "Web Search", "object", "object")
    ]);
    renderWithConsoleProviders(
      <ResourceEditorCard resource={route} revision="rev-1" title="Route" />
    );

    setMaterialSelectValueBySelectedOption(getMaterialSelect(document, "Route web search mode"), "enabled");

    await waitFor(() =>
      expect(patch).toHaveBeenCalledWith({
        baseRevision: "rev-1",
        changes: [
          {
            kind: "route",
            id: "primary",
            field: "web_search",
            value: {
              support: "enabled",
              max_uses: 3
            }
          }
        ]
      })
    );
  });

  test("autosaves model extensions through structured Material controls while preserving extension config", async () => {
    const patch = vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const model = resource("model", "claude-sonnet", "Claude Sonnet", {
      extensions: {
        visual: {
          enabled: true,
          config: { provider: "openai", model: "gpt-4.1" },
          custom_flag: "keep"
        }
      }
    }, [
      field("extensions", "Extensions", "object", "object")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={model} revision="rev-1" title="Model" />
    );

    const advancedPanel = screen.getByRole("group", { name: "Advanced Features" });
    expect(getExtensionFeatureRow(advancedPanel, "visual")).toBeInTheDocument();
    expect(queryMaterialTextField(advancedPanel, "Model extensions JSON")).not.toBeInTheDocument();
    expect(getMaterialTextField(advancedPanel, "visual provider")).toHaveAttribute("spellcheck", "false");
    expect(getMaterialTextField(advancedPanel, "visual model")).toHaveAttribute("spellcheck", "false");

    setMaterialSwitchSelected(getMaterialSwitch(advancedPanel, "Enable visual extension"), false);

    await waitFor(() =>
      expect(patch).toHaveBeenCalledWith({
        baseRevision: "rev-1",
        changes: [
          {
            kind: "model",
            id: "claude-sonnet",
            field: "extensions",
            value: {
              visual: {
                enabled: false,
                config: { provider: "openai", model: "gpt-4.1" },
                custom_flag: "keep"
              }
            }
          }
        ]
      })
    );

    patch.mockClear();
    setMaterialTextFieldValue(getMaterialTextField(advancedPanel, "visual model"), "gpt-4.2");
    fireEvent.blur(getMaterialTextField(advancedPanel, "visual model"));

    await waitFor(() =>
      expect(patch).toHaveBeenCalledWith({
        baseRevision: "rev-1",
        changes: [
          {
            kind: "model",
            id: "claude-sonnet",
            field: "extensions",
            value: {
              visual: {
                enabled: false,
                config: { provider: "openai", model: "gpt-4.2" },
                custom_flag: "keep"
              }
            }
          }
        ]
      })
    );
  });

  test("hides model reasoning options when the model does not support reasoning", async () => {
    const patch = vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const model = resource("model", "plain-model", "Plain Model", {
      supports_reasoning: false,
      default_reasoning_level: "medium",
      default_reasoning_summary: "auto",
      supported_reasoning_levels: [
        { effort: "low", description: "Fast responses" },
        { effort: "medium", description: "Balanced" }
      ]
    }, [
      field("supports_reasoning", "Supports Reasoning", "boolean", "switch"),
      field("default_reasoning_level", "Default Reasoning Level"),
      field("supported_reasoning_levels", "Supported Reasoning Levels", "array", "array"),
      field("supports_reasoning_summaries", "Supports Reasoning Summaries", "boolean", "switch"),
      field("default_reasoning_summary", "Default Reasoning Summary")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={model} revision="rev-1" title="Model" />
    );

    const reasoningPanel = screen.getByRole("group", { name: "Reasoning" });
    expect(reasoningPanel).toHaveClass("resource-field-group--reasoning");
    const reasoningSwitch = getMaterialSwitch(reasoningPanel, "Supports reasoning");
    expect(reasoningSwitch.selected).toBe(false);
    expect(queryMaterialTextField(reasoningPanel, "Default reasoning summary")).not.toBeInTheDocument();
    expect(queryMaterialTextField(reasoningPanel, "Supported reasoning levels JSON")).not.toBeInTheDocument();
    expect(queryMaterialTextField(reasoningPanel, "Default reasoning level")).not.toBeInTheDocument();
    expect(reasoningPanel.querySelector(".editable-list-field")).not.toBeInTheDocument();
    expect(reasoningPanel.querySelectorAll("md-switch")).toHaveLength(1);

    setMaterialSwitchSelected(reasoningSwitch, true);

    await waitFor(() =>
      expect(patch).toHaveBeenCalledWith({
        baseRevision: "rev-1",
        changes: [
          {
            kind: "model",
            id: "plain-model",
            field: "supports_reasoning",
            value: true
          }
        ]
      })
    );
  });

  test("skips model reasoning controls when the support switch is absent from schema", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const model = resource("model", "legacy-model", "Legacy Model", {
      default_reasoning_level: "medium",
      default_reasoning_summary: "auto",
      supported_reasoning_levels: [
        { effort: "low", description: "Fast responses" },
        { effort: "medium", description: "Balanced" }
      ],
      display_name: "Legacy Model"
    }, [
      field("default_reasoning_level", "Default Reasoning Level"),
      field("supported_reasoning_levels", "Supported Reasoning Levels", "array", "array"),
      field("default_reasoning_summary", "Default Reasoning Summary"),
      field("display_name", "Display Name")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={model} revision="rev-1" title="Model" />
    );

    expect(screen.getByRole("heading", { name: "legacy-model" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Reasoning" })).not.toBeInTheDocument();
    expect(document.querySelector("md-switch[aria-label=\"Supports reasoning\"]")).not.toBeInTheDocument();
    expect(queryMaterialTextField(document, "Default reasoning summary")).not.toBeInTheDocument();
    expect(queryMaterialTextField(document, "Default reasoning level")).not.toBeInTheDocument();
    expect(document.querySelector(".editable-list-field[aria-label=\"Supported reasoning levels\"]")).not.toBeInTheDocument();
    expect(getMaterialTextField(document, "Model display name")).toBeInTheDocument();
  });

  test("autosaves editable model array lists through graph patches", async () => {
    const patch = vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const model = resource("model", "claude-sonnet", "Claude Sonnet", {
      supports_reasoning: true,
      supported_reasoning_levels: [
        { effort: "low", description: "Fast responses with lighter reasoning" },
        { effort: "medium", description: "Balances speed and reasoning depth" }
      ],
      extensions: {}
    }, [
      field("supports_reasoning", "Supports Reasoning", "boolean", "switch"),
      field("supported_reasoning_levels", "Supported Reasoning Levels", "array", "array"),
      field("extensions", "Extensions", "object", "object")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={model} revision="rev-1" title="Model" />
    );

    setMaterialTextFieldValue(getMaterialTextField(document, "Add Supported reasoning levels"), "high");
    await userEvent.click(getMaterialButton(document, "Add Supported reasoning levels item", "filled"));

    expect(patch).toHaveBeenCalledWith({
      baseRevision: "rev-1",
      changes: [
        {
          kind: "model",
          id: "claude-sonnet",
          field: "supported_reasoning_levels",
          value: [
            { effort: "low", description: "Fast responses with lighter reasoning" },
            { effort: "medium", description: "Balances speed and reasoning depth" },
            { effort: "high" }
          ]
        }
      ]
    });

    await waitFor(() =>
      expect(getMaterialInputChip(document, "Remove high from Supported reasoning levels")).toBeInTheDocument()
    );
    act(() => {
      getMaterialInputChip(document, "Remove high from Supported reasoning levels")
        .dispatchEvent(new Event("remove"));
    });

    await waitFor(() => expect(patch).toHaveBeenCalledTimes(2));
    expect(patch).toHaveBeenLastCalledWith({
      baseRevision: "rev-1",
      changes: [
        {
          kind: "model",
          id: "claude-sonnet",
          field: "supported_reasoning_levels",
          value: [
            { effort: "low", description: "Fast responses with lighter reasoning" },
            { effort: "medium", description: "Balances speed and reasoning depth" }
          ]
        }
      ]
    });
  });

  test("selects the default reasoning level from supported reasoning levels", async () => {
    const patch = vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const model = resource("model", "claude-sonnet", "Claude Sonnet", {
      supports_reasoning: true,
      default_reasoning_level: "medium",
      default_reasoning_summary: "auto",
      supported_reasoning_levels: [
        { effort: "low", description: "Fast responses with lighter reasoning" },
        { effort: "medium", description: "Balances speed and reasoning depth" },
        { effort: "high", description: "Greater reasoning depth" }
      ]
    }, [
      field("supports_reasoning", "Supports Reasoning", "boolean", "switch"),
      field("default_reasoning_level", "Default Reasoning Level"),
      field("supported_reasoning_levels", "Supported Reasoning Levels", "array", "array"),
      field("default_reasoning_summary", "Default Reasoning Summary")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={model} revision="rev-1" title="Model" />
    );

    const defaultLevel = getMaterialSelect(document, "Default reasoning level");
    await waitFor(() => expect(defaultLevel.value).toBe("medium"));
    expect(getMaterialSelectOptions(defaultLevel).map((option) => option.value)).toEqual([
      "low",
      "medium",
      "high"
    ]);
    expect(queryMaterialTextField(document, "Default reasoning level")).not.toBeInTheDocument();

    setMaterialTextFieldValue(getMaterialTextField(document, "Add Supported reasoning levels"), "xhigh");
    await userEvent.click(getMaterialButton(document, "Add Supported reasoning levels item", "filled"));
    await waitFor(() =>
      expect(getMaterialSelectOptions(defaultLevel).map((option) => option.value)).toEqual([
        "low",
        "medium",
        "high",
        "xhigh"
      ])
    );
    await waitFor(() => {
      expect(defaultLevel.options?.map((option) => option.value)).toContain("xhigh");
    });

    setMaterialSelectValue(defaultLevel, "xhigh");

    await waitFor(() =>
      expect(patch).toHaveBeenLastCalledWith({
        baseRevision: "rev-1",
        changes: [
          {
            kind: "model",
            id: "claude-sonnet",
            field: "default_reasoning_level",
            value: "xhigh"
          }
        ]
      })
    );
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

function queryMaterialTextField(container: ParentNode, label: string) {
  return Array.from(container.querySelectorAll("md-outlined-text-field")).find(
    (textField) => materialElementLabel(textField as HTMLElement & { label?: string }) === label
  ) ?? null;
}

function getEditableList(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll<HTMLElement>(".editable-list-field")).find(
    (candidate) => candidate.getAttribute("aria-label") === label
  );
  if (!element) {
    throw new Error(`Missing editable list: ${label}`);
  }
  return element;
}

function getEditableListItems(container: ParentNode, label: string) {
  return Array.from(getEditableList(container, label).querySelectorAll("md-input-chip"))
    .map((item) => item.textContent?.trim() ?? "");
}

function getExtensionFeatureRow(container: ParentNode, name: string) {
  const element = Array.from(container.querySelectorAll<HTMLElement>(".extension-feature-row")).find(
    (candidate) => candidate.getAttribute("data-extension-name") === name
  );
  if (!element) {
    throw new Error(`Missing extension feature row: ${name}`);
  }
  return element;
}

function getMaterialInputChip(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-input-chip")).find(
    (candidate) => candidate.getAttribute("aria-label") === label
  );
  if (!element) {
    throw new Error(`Missing md-input-chip: ${label}`);
  }
  return element;
}

function getMaterialSelect(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-outlined-select")).find(
    (selectElement) => materialElementLabel(selectElement as HTMLElement & { label?: string }) === label
  );
  if (!element) {
    throw new Error(`Missing md-outlined-select: ${label}`);
  }
  return element as HTMLElement & {
    options?: Array<{ value: string }>;
    select: (value: string) => void;
    value: string;
  };
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

function getMaterialSwitch(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-switch")).find(
    (switchElement) => switchElement.getAttribute("aria-label") === label
  );
  if (!element) {
    throw new Error(`Missing md-switch: ${label}`);
  }
  return element as HTMLElement & { selected: boolean };
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

function getMaterialIconButton(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-icon-button")).find(
    (candidate) => candidate.getAttribute("aria-label") === label
  );
  if (!element) {
    throw new Error(`Missing md-icon-button: ${label}`);
  }
  return element as HTMLElement;
}

function queryMaterialOutlinedButton(container: ParentNode, label: string | RegExp) {
  return Array.from(container.querySelectorAll("md-outlined-button")).find(
    (button) => {
      const accessibleLabel = button.getAttribute("aria-label") ?? button.textContent ?? "";
      return typeof label === "string" ? accessibleLabel.trim() === label : label.test(accessibleLabel);
    }
  ) ?? null;
}

function getStructuredObject(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll(".schema-structured-object")).find(
    (summary) => summary.getAttribute("aria-label")?.startsWith(`${label},`)
  );
  if (!element) {
    throw new Error(`Missing structured object editor: ${label}`);
  }
  return element as HTMLElement;
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

function setMaterialTextFieldValue(
  element: HTMLElement & { value: string },
  value: string
) {
  act(() => {
    element.value = value;
    element.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
  });
}

function setMaterialSelectValue(element: HTMLElement & { select: (value: string) => void; value: string }, value: string) {
  act(() => {
    element.select(value);
    element.value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function setMaterialSelectValueBySelectedOption(
  element: HTMLElement & { value: string },
  value: string
) {
  act(() => {
    for (const option of Array.from(element.querySelectorAll<MaterialSelectOptionElement>("md-select-option"))) {
      const optionValue = option.value || option.getAttribute("value") || option.displayText;
      option.selected = optionValue === value;
    }
    element.value = "";
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function setMaterialSwitchSelected(element: HTMLElement & { selected: boolean }, selected: boolean) {
  act(() => {
    element.selected = selected;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
