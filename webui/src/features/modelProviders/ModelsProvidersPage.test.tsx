import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppShell } from "../../app/App";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import * as configGraph from "../../rpc/configGraph";
import { configGraphFixture } from "../../test/configGraphFixtures";
import { ModelsProvidersPage } from "./ModelsProvidersPage";

describe("ModelsProvidersPage", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function expandOffers(providerPanel: HTMLElement) {
    const toggle = getProviderOffersToggle(providerPanel);
    if (toggle.getAttribute("aria-expanded") !== "true") {
      await userEvent.click(toggle);
    }
  }

  function getProviderOffersToggle(providerPanel: HTMLElement) {
    const toggle = providerPanel.querySelector(".provider-offers__toggle");
    if (!(toggle instanceof HTMLElement)) {
      throw new Error("Provider offers toggle was not rendered.");
    }
    return toggle;
  }

  test("uses a Material Web icon button for provider offer disclosure", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    renderWithConsoleProviders(<ModelsProvidersPage />);

    const providerPanel = await screen.findByLabelText("Provider anthropic");
    const toggle = getProviderOffersToggle(providerPanel);

    expect(toggle.tagName.toLowerCase()).toBe("md-icon-button");
    expect(toggle).toHaveAttribute("aria-label", "Provider Offers (1)");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(within(providerPanel).queryByText("anthropic/claude-sonnet")).not.toBeInTheDocument();

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(within(providerPanel).getByText("anthropic/claude-sonnet")).toBeInTheDocument();

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(within(providerPanel).queryByText("anthropic/claude-sonnet")).not.toBeInTheDocument();
  });

  test("places Providers above Models and omits enabled toggles", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    const providers = await screen.findByRole("heading", { name: "Providers (1)" });
    const models = screen.getByRole("heading", { name: "Models (1)" });
    const providerPanel = screen.getByLabelText("Provider anthropic");
    const offerHeading = within(providerPanel).getByRole("heading", { name: "Provider Offers (1)" });

    expect(providers.compareDocumentPosition(offerHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(providers.compareDocumentPosition(models) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(screen.getByLabelText("anthropic status")).getByText("Saved")).toBeInTheDocument();
    await expandOffers(providerPanel);
    expect(within(providerPanel).getByText("anthropic/claude-sonnet")).toBeInTheDocument();
    expect(screen.queryByLabelText(/^enabled$/i)).not.toBeInTheDocument();
  });

  test("localizes section headings and resource metadata in Chinese locale", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });

    renderWithConsoleProviders(<ModelsProvidersPage />, { locale: "zh-CN" });

    expect(await screen.findByRole("heading", { name: "提供商 (1)" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("提供商 anthropic")).getByRole("heading", { name: "提供商能力 (1)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "模型 (1)" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("anthropic 状态")).getByText("已保存")).toBeInTheDocument();
    expect(getMaterialTextField(document, "上游 Base URL")).toBeInTheDocument();
    expect(screen.queryByLabelText("Base URL")).not.toBeInTheDocument();
  });

  test("localizes create model help and validation in Chinese locale", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />, { locale: "zh-CN" });

    await waitForMaterialButton(document, "添加模型");
    await userEvent.click(getMaterialButton(document, "添加模型", "filled"));
    const form = screen.getByRole("form", { name: "创建模型" });
    await userEvent.click(getMaterialIconButton(form, "显示名称 帮助"));

    expect(within(form).getByRole("tooltip")).toHaveTextContent("控制台中展示的人类可读名称。");

    setMaterialTextFieldValue(getMaterialTextField(form, "上下文窗口"), "0");
    setMaterialTextFieldValue(getMaterialTextField(form, "模型 ID"), "zero-window");
    await submitMaterialForm(form, "创建模型");

    expect(await within(form).findByRole("alert")).toHaveTextContent("上下文窗口 必须大于 0。");
    expect(create).not.toHaveBeenCalled();
  });

  test("localizes create provider protocol and context presets in Chinese locale", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    renderWithConsoleProviders(<ModelsProvidersPage />, { locale: "zh-CN" });

    await waitForMaterialButton(document, "添加提供商");
    await userEvent.click(getMaterialButton(document, "添加提供商", "filled"));
    const providerForm = screen.getByRole("form", { name: "创建提供商" });
    expect(getMaterialFilterChip(providerForm, "OpenAI Responses")).toBeInTheDocument();
    expect(getMaterialFilterChip(providerForm, "Gemini")).toBeInTheDocument();

    await userEvent.click(getMaterialButton(providerForm, "取消", "outlined"));
    await waitForMaterialButton(document, "添加模型");
    await userEvent.click(getMaterialButton(document, "添加模型", "filled"));
    const modelForm = screen.getByRole("form", { name: "创建模型" });
    expect(getMaterialFilterChip(modelForm, "128K")).toBeInTheDocument();
    expect(getMaterialFilterChip(modelForm, "400K")).toBeInTheDocument();
    expect(getMaterialFilterChip(modelForm, "100 万")).toBeInTheDocument();
  });

  test("autosaves provider fields and offer priority through graph patches", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const patch = vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    const providerPanel = (await screen.findByRole("heading", { level: 3, name: "anthropic" }))
      .closest("section")!;
    vi.useFakeTimers();
    const baseUrlField = getMaterialTextField(providerPanel, "Upstream base URL");
    setMaterialTextFieldValue(baseUrlField, "https://api.anthropic.test");
    fireEvent.blur(baseUrlField);

    await advanceAutosave();

    expect(patch).toHaveBeenCalledWith({
      baseRevision: "rev-1",
      changes: [
        {
          kind: "provider",
          id: "anthropic",
          field: "base_url",
          value: "https://api.anthropic.test"
        }
      ]
    });

    vi.useRealTimers();
    await expandOffers(screen.getByLabelText("Provider anthropic"));
    const offerPanel = screen.getByText("anthropic/claude-sonnet").closest("section")!;
    vi.useFakeTimers();
    const priorityField = getMaterialTextField(offerPanel, "Offer priority");
    setMaterialTextFieldValue(priorityField, "5");
    fireEvent.blur(priorityField);

    await advanceAutosave();

    expect(patch).toHaveBeenLastCalledWith({
      baseRevision: "rev-1",
      changes: [
        {
          kind: "provider_offer",
          id: "anthropic/claude-sonnet",
          field: "priority",
          value: 5
        }
      ]
    });
  });

  test("creates a provider with default OpenAI Responses protocol", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await waitForMaterialButton(document, "Add Provider");
    await userEvent.click(getMaterialButton(document, "Add Provider", "filled"));
    const form = screen.getByRole("form", { name: "Create Provider" });
    const providerIdField = getMaterialTextField(form, "Provider ID");
    const baseUrlField = getMaterialTextField(form, "Base URL");
    const apiKeyField = getMaterialTextField(form, "API key");
    expect(apiKeyField.type).toBe("password");
    expect(getMaterialButton(form, "Create Provider", "filled")).toHaveProperty("type", "submit");
    expect(form.querySelectorAll("input")).toHaveLength(0);

    setMaterialTextFieldValue(providerIdField, "openai");
    setMaterialTextFieldValue(baseUrlField, "https://api.openai.com/v1");
    setMaterialTextFieldValue(apiKeyField, "sk-test");
    await submitMaterialForm(form, "Create Provider");

    await waitFor(() => expect(create).toHaveBeenCalledWith("provider", {
      baseRevision: "rev-1",
      id: "openai",
      value: {
        base_url: "https://api.openai.com/v1",
        api_key: "sk-test",
        protocol: "openai-response"
      }
    }));
  });

  test("keeps add resource button icon colors aligned with secondary-container labels", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    const { container } = renderWithConsoleProviders(
      <MemoryRouter>
        <AppShell content={<ModelsProvidersPage />} />
      </MemoryRouter>
    );

    await waitFor(() => expect(getMaterialButton(container, "Add Provider", "filled")).toBeInTheDocument());
    const addProviderButton = getMaterialButton(container, "Add Provider", "filled");
    expectMaterialFilledButtonContentColors(addProviderButton, "var(--mb-color-on-secondary-container)");
  });

  test("lets users choose provider protocol and read create field help", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await waitForMaterialButton(document, "Add Provider");
    await userEvent.click(getMaterialButton(document, "Add Provider", "filled"));
    const form = screen.getByRole("form", { name: "Create Provider" });
    const helpButton = getMaterialIconButton(form, "Help for Protocol");
    expect(helpButton.tagName.toLowerCase()).toBe("md-icon-button");
    await userEvent.click(helpButton);
    expect(within(form).getByRole("tooltip")).toHaveTextContent("Selects the upstream API format");

    setMaterialTextFieldValue(getMaterialTextField(form, "Provider ID"), "gemini");
    setMaterialTextFieldValue(getMaterialTextField(form, "Base URL"), "https://generativelanguage.googleapis.com");
    setMaterialTextFieldValue(getMaterialTextField(form, "API key"), "gemini-key");
    const geminiChip = getMaterialFilterChip(form, "Gemini");
    expect(geminiChip.selected).toBe(false);
    await userEvent.click(geminiChip);
    expect(geminiChip.selected).toBe(true);
    await submitMaterialForm(form, "Create Provider");

    await waitFor(() => expect(create).toHaveBeenCalledWith("provider", {
      baseRevision: "rev-1",
      id: "gemini",
      value: {
        base_url: "https://generativelanguage.googleapis.com",
        api_key: "gemini-key",
        protocol: "google-genai"
      }
    }));
  });

  test("uses wider create panel field tracks than dense resource editors", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await waitForMaterialButton(document, "Add Provider");
    await userEvent.click(getMaterialButton(document, "Add Provider", "filled"));
    const form = screen.getByRole("form", { name: "Create Provider" });

    expect(getMaterialTextField(form, "Provider ID").closest(".form-field--create-track")).toBeInTheDocument();
    expect(getMaterialTextField(form, "Base URL").closest(".form-field--create-track")).toBeInTheDocument();
    expect(getMaterialChipSet(form, "Protocol").closest(".form-field--create-track")).toBeInTheDocument();
  });

  test("renders create text fields with official Material labels and trailing help slots", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await waitForMaterialButton(document, "Add Provider");
    await userEvent.click(getMaterialButton(document, "Add Provider", "filled"));
    const providerForm = screen.getByRole("form", { name: "Create Provider" });
    const providerIdField = getMaterialTextField(providerForm, "Provider ID");
    expect(providerIdField.label).toBe("Provider ID");
    expect(providerIdField).not.toHaveAttribute("aria-labelledby");
    expect(providerIdField).toHaveAttribute("spellcheck", "false");
    expect(providerIdField.closest(".form-field--create-track")?.querySelector(".schema-field__label")).not.toBeInTheDocument();
    expect(getMaterialTrailingIconButton(providerIdField, "Help for Provider ID")).toBeInTheDocument();

    await userEvent.click(getMaterialButton(providerForm, "Cancel", "outlined"));
    await waitForMaterialButton(document, "Add Model");
    await userEvent.click(getMaterialButton(document, "Add Model", "filled"));
    const modelForm = screen.getByRole("form", { name: "Create Model" });
    const contextWindowField = getMaterialTextField(modelForm, "Context window");
    expect(contextWindowField.label).toBe("Context window");
    expect(contextWindowField).toHaveAttribute("spellcheck", "false");
    expect(contextWindowField.closest(".form-field--create-track")?.querySelector(".schema-field__label")).not.toBeInTheDocument();
    expect(getMaterialTrailingIconButton(contextWindowField, "Help for Context window")).toBeInTheDocument();
  });

  test("keeps create subpanel controls aligned with resource editor field styling", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await waitForMaterialButton(document, "Add Provider");
    await userEvent.click(getMaterialButton(document, "Add Provider", "filled"));
    const providerForm = screen.getByRole("form", { name: "Create Provider" });
    const baseUrlField = getMaterialTextField(providerForm, "Base URL");
    const apiKeyField = getMaterialTextField(providerForm, "API key");
    const protocolGroup = getMaterialChipSet(providerForm, "Protocol");

    expect(getMaterialLeadingIcon(baseUrlField, "link")).toBeInTheDocument();
    expect(getMaterialLeadingIcon(apiKeyField, "key")).toBeInTheDocument();
    expect(protocolGroup.closest(".schema-field")).toBeInTheDocument();

    await userEvent.click(getMaterialButton(providerForm, "Cancel", "outlined"));
    const providerPanel = await screen.findByLabelText("Provider anthropic");
    await userEvent.click(getMaterialButton(providerPanel, "Add Offer", "filled"));
    const offerForm = within(providerPanel).getByRole("form", { name: "Create Offer" });
    expect(offerForm.querySelector(".material-static-chip")).not.toBeInTheDocument();
    expect(getMaterialAssistChip(offerForm, "anthropic").closest(".schema-field")).toBeInTheDocument();
  });

  test("creates a model with a 128k default context window", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await waitForMaterialButton(document, "Add Model");
    await userEvent.click(getMaterialButton(document, "Add Model", "filled"));
    const form = screen.getByRole("form", { name: "Create Model" });
    setMaterialTextFieldValue(getMaterialTextField(form, "Model ID"), "gpt-4o");
    setMaterialTextFieldValue(getMaterialTextField(form, "Display name"), "GPT-4o");
    await submitMaterialForm(form, "Create Model");

    await waitFor(() => expect(create).toHaveBeenCalledWith("model", {
      baseRevision: "rev-1",
      id: "gpt-4o",
      value: {
        display_name: "GPT-4o",
        context_window: 128000
      }
    }));
  });

  test("lets users edit model context window through presets or custom input", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await waitForMaterialButton(document, "Add Model");
    await userEvent.click(getMaterialButton(document, "Add Model", "filled"));
    const form = screen.getByRole("form", { name: "Create Model" });
    await userEvent.click(getMaterialIconButton(form, "Help for Context window"));
    expect(within(form).getByRole("tooltip")).toHaveTextContent("Maximum context tokens");
    const presetChip = getMaterialFilterChip(form, "400k");
    await userEvent.click(presetChip);
    expect(getMaterialTextField(form, "Context window").value).toBe("400000");

    setMaterialTextFieldValue(getMaterialTextField(form, "Context window"), "640000");
    setMaterialTextFieldValue(getMaterialTextField(form, "Model ID"), "gpt-large");
    setMaterialTextFieldValue(getMaterialTextField(form, "Display name"), "GPT Large");
    await submitMaterialForm(form, "Create Model");

    await waitFor(() => expect(create).toHaveBeenCalledWith("model", {
      baseRevision: "rev-1",
      id: "gpt-large",
      value: {
        display_name: "GPT Large",
        context_window: 640000
      }
    }));
  });

  test("rejects non-positive custom model context windows", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await waitForMaterialButton(document, "Add Model");
    await userEvent.click(getMaterialButton(document, "Add Model", "filled"));
    const form = screen.getByRole("form", { name: "Create Model" });
    setMaterialTextFieldValue(getMaterialTextField(form, "Context window"), "0");
    setMaterialTextFieldValue(getMaterialTextField(form, "Model ID"), "zero-window");
    await submitMaterialForm(form, "Create Model");

    expect(await within(form).findByRole("alert")).toHaveTextContent(
      "Context window must be greater than zero."
    );
    expect(create).not.toHaveBeenCalled();
    expect(getMaterialTextField(form, "Context window").value).toBe("0");
  });

  test("creates a provider offer inside the selected provider section", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    const providerPanel = await screen.findByLabelText("Provider anthropic");
    await userEvent.click(getMaterialButton(providerPanel, "Add Offer", "filled"));
    const form = within(providerPanel).getByRole("form", { name: "Create Offer" });
    expect(getMaterialSelect(form, "Model").value).toBe("claude-sonnet");
    setMaterialTextFieldValue(getMaterialTextField(form, "Upstream name"), "claude-3-5-sonnet-latest");
    await submitMaterialForm(form, "Create Offer");

    await waitFor(() => expect(create).toHaveBeenCalledWith("provider_offer", {
      baseRevision: "rev-1",
      id: "anthropic/claude-sonnet",
      value: {
        model: "claude-sonnet",
        upstream_name: "claude-3-5-sonnet-latest",
        priority: 1,
        pricing: {
          input_price: 0,
          output_price: 0,
          cache_write_price: 0,
          cache_read_price: 0
        }
      }
    }));
  });

  test("rejects invalid provider offer numbers without submitting the create request", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    const providerPanel = await screen.findByLabelText("Provider anthropic");
    await userEvent.click(getMaterialButton(providerPanel, "Add Offer", "filled"));
    const form = within(providerPanel).getByRole("form", { name: "Create Offer" });
    setMaterialTextFieldValue(getMaterialTextField(form, "Priority"), "fast");
    setMaterialTextFieldValue(getMaterialTextField(form, "Upstream name"), "claude-3-5-sonnet-latest");
    await submitMaterialForm(form, "Create Offer");

    expect(screen.getByRole("alert")).toHaveTextContent("Priority must be a valid number.");
    expect(getMaterialTextField(form, "Priority").value).toBe("fast");
    expect(create).not.toHaveBeenCalled();
  });

  test("keeps create dialog input values when backend rejects duplicate ids", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    vi.spyOn(configGraph, "createConfigResource").mockRejectedValue(
      Object.assign(new Error("Request failed"), {
        raw: {
          errors: [
            {
              message: 'provider "anthropic" already exists'
            }
          ]
        }
      })
    );

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await waitForMaterialButton(document, "Add Provider");
    await userEvent.click(getMaterialButton(document, "Add Provider", "filled"));
    const form = screen.getByRole("form", { name: "Create Provider" });
    setMaterialTextFieldValue(getMaterialTextField(form, "Provider ID"), "anthropic");
    setMaterialTextFieldValue(getMaterialTextField(form, "Base URL"), "https://api.anthropic.com");
    setMaterialTextFieldValue(getMaterialTextField(form, "API key"), "sk-ant");
    await submitMaterialForm(form, "Create Provider");

    expect(await screen.findByRole("alert")).toHaveTextContent('provider "anthropic" already exists');
    expect(getMaterialTextField(form, "Provider ID").value).toBe("anthropic");
    expect(getMaterialTextField(form, "Base URL").value).toBe("https://api.anthropic.com");
  });

  test("deletes provider resources only after inline confirmation", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const graphAfterDelete = configGraphFixture({
      revision: "rev-2",
      resources: configGraphFixture().resources.filter((resource) => resource.id !== "anthropic")
    });
    const remove = vi.spyOn(configGraph, "deleteConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: graphAfterDelete
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    const providerPanel = await screen.findByLabelText("Provider anthropic");
    await userEvent.click(getMaterialButton(providerPanel, "Delete Provider anthropic", "filled"));

    expect(remove).not.toHaveBeenCalled();
    await userEvent.click(getMaterialButton(providerPanel, "Confirm delete anthropic", "filled"));

    expect(remove).toHaveBeenCalledWith("provider", "anthropic", "rev-1");
    expect(screen.queryByLabelText("Provider anthropic")).not.toBeInTheDocument();
  });

  test("deletes provider offers and keeps slash identifiers intact", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const graphAfterDelete = configGraphFixture({
      revision: "rev-2",
      resources: configGraphFixture().resources.filter((resource) => resource.id !== "anthropic/claude-sonnet")
    });
    const remove = vi.spyOn(configGraph, "deleteConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: graphAfterDelete
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await expandOffers(await screen.findByLabelText("Provider anthropic"));
    const offerPanel = (await screen.findByText("anthropic/claude-sonnet")).closest("section")!;
    await userEvent.click(getMaterialButton(offerPanel, "Delete Offer anthropic/claude-sonnet", "filled"));
    await userEvent.click(getMaterialButton(offerPanel, "Confirm delete anthropic/claude-sonnet", "filled"));

    expect(remove).toHaveBeenCalledWith("provider_offer", "anthropic/claude-sonnet", "rev-1");
    expect(screen.queryByText("anthropic/claude-sonnet")).not.toBeInTheDocument();
  });

  test("surfaces delete errors without removing the model card", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    vi.spyOn(configGraph, "deleteConfigResource").mockRejectedValue(
      Object.assign(new Error("Request failed"), {
        raw: {
          errors: [
            {
              message: 'model "claude-sonnet" is still referenced'
            }
          ]
        }
      })
    );

    renderWithConsoleProviders(<ModelsProvidersPage />);

    const modelPanel = (await screen.findByRole("heading", { level: 3, name: "claude-sonnet" }))
      .closest("section")!;
    await userEvent.click(getMaterialButton(modelPanel, "Delete Model claude-sonnet", "filled"));
    await userEvent.click(getMaterialButton(modelPanel, "Confirm delete claude-sonnet", "filled"));

    expect(await within(modelPanel).findByRole("alert")).toHaveTextContent(
      'model "claude-sonnet" is still referenced'
    );
    expect(within(modelPanel).getByRole("heading", { level: 3, name: "claude-sonnet" })).toBeInTheDocument();
  });
});

async function advanceAutosave() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(450);
    await Promise.resolve();
  });
}

type MaterialTextFieldElement = HTMLElement & {
  label: string;
  type: string;
  value: string;
};

type MaterialSelectElement = HTMLElement & {
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

function getMaterialButton(container: ParentNode, label: string, variant: "filled" | "outlined" = "outlined") {
  const tagName = variant === "filled" ? "md-filled-button" : "md-outlined-button";
  const element = Array.from(container.querySelectorAll(tagName)).find(
    (candidate) => {
      const accessibleLabel = candidate.getAttribute("aria-label") ?? candidate.textContent ?? "";
      return accessibleLabel.includes(label);
    }
  );
  if (!element) {
    throw new Error(`Expected a Material Web ${variant} button labelled "${label}".`);
  }
  return element as HTMLElement & { type: string };
}

function expectMaterialFilledButtonContentColors(button: HTMLElement, colorToken: string) {
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

async function waitForMaterialButton(container: ParentNode, label: string, variant: "filled" | "outlined" = "filled") {
  await screen.findByText((_, element) => (
    element?.tagName.toLowerCase() === (variant === "filled" ? "md-filled-button" : "md-outlined-button") &&
    Boolean(element.textContent?.includes(label))
  ));
  return getMaterialButton(container, label, variant);
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

function getMaterialTrailingIconButton(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-icon-button")).find(
    (candidate) => candidate.getAttribute("slot") === "trailing-icon" && candidate.getAttribute("aria-label") === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web trailing icon button labelled "${label}".`);
  }
  return element as HTMLElement;
}

function getMaterialLeadingIcon(container: ParentNode, icon: string) {
  const element = Array.from(container.querySelectorAll("md-icon")).find(
    (candidate) => candidate.getAttribute("slot") === "leading-icon" && candidate.textContent?.trim() === icon
  );
  if (!element) {
    throw new Error(`Expected a Material Web leading icon "${icon}".`);
  }
  return element as HTMLElement;
}

function getMaterialFilterChip(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-filter-chip")).find(
    (candidate) => candidate.textContent?.trim() === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web filter chip labelled "${label}".`);
  }
  return element as HTMLElement & { selected: boolean };
}

function getMaterialAssistChip(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-assist-chip")).find(
    (candidate) => candidate.textContent?.trim() === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web assist chip labelled "${label}".`);
  }
  return element as HTMLElement;
}

function getMaterialChipSet(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-chip-set")).find(
    (candidate) => candidate.getAttribute("aria-label") === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web chip set labelled "${label}".`);
  }
  return element as HTMLElement;
}

function setMaterialTextFieldValue(element: MaterialTextFieldElement, value: string) {
  act(() => {
    element.value = value;
    element.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
  });
}

async function submitMaterialForm(container: ParentNode, submitLabel: string) {
  const button = getMaterialButton(container, submitLabel, "filled");
  const form = button.closest("form");
  if (!form) {
    throw new Error("Expected Material Web submit button inside a form.");
  }
  let clicked = false;
  let submitted = false;
  button.addEventListener("click", () => {
    clicked = true;
  }, { once: true });
  form.addEventListener("submit", () => {
    submitted = true;
  }, { once: true });
  await userEvent.click(button);
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(clicked).toBe(true);
  if (!submitted) {
    await act(async () => {
      form.requestSubmit();
      await Promise.resolve();
    });
  }
}
