import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import * as configGraph from "../../rpc/configGraph";
import { configGraphFixture } from "../../test/configGraphFixtures";
import { ModelsProvidersPage } from "./ModelsProvidersPage";

describe("ModelsProvidersPage", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
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
    expect(within(screen.getByLabelText("Provider anthropic")).getByRole("heading", { name: "提供商能力 (1)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "模型 (1)" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("anthropic status")).getByText("已保存")).toBeInTheDocument();
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
    fireEvent.change(within(providerPanel).getByLabelText("Base URL"), {
      target: { value: "https://api.anthropic.test" }
    });
    fireEvent.blur(within(providerPanel).getByLabelText("Base URL"));

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

    const offerPanel = screen.getByText("anthropic/claude-sonnet").closest("section")!;
    fireEvent.change(within(offerPanel).getByLabelText("Priority"), {
      target: { value: "5" }
    });
    fireEvent.blur(within(offerPanel).getByLabelText("Priority"));

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

    await userEvent.click(await screen.findByRole("button", { name: "Add Provider" }));
    const form = screen.getByRole("form", { name: "Create Provider" });
    await userEvent.type(within(form).getByLabelText("Provider ID"), "openai");
    await userEvent.type(within(form).getByLabelText("Base URL"), "https://api.openai.com/v1");
    await userEvent.type(within(form).getByLabelText("API key"), "sk-test");
    await userEvent.click(within(form).getByRole("button", { name: "Create Provider" }));

    expect(create).toHaveBeenCalledWith("provider", {
      baseRevision: "rev-1",
      id: "openai",
      value: {
        base_url: "https://api.openai.com/v1",
        api_key: "sk-test",
        protocol: "openai-response"
      }
    });
  });

  test("lets users choose provider protocol and read create field help", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Add Provider" }));
    const form = screen.getByRole("form", { name: "Create Provider" });
    await userEvent.click(within(form).getByRole("button", { name: "Help for Protocol" }));
    expect(within(form).getByRole("tooltip")).toHaveTextContent("Selects the upstream API format");

    await userEvent.type(within(form).getByLabelText("Provider ID"), "gemini");
    await userEvent.type(within(form).getByLabelText("Base URL"), "https://generativelanguage.googleapis.com");
    await userEvent.type(within(form).getByLabelText("API key"), "gemini-key");
    await userEvent.click(within(form).getByRole("button", { name: "Gemini" }));
    await userEvent.click(within(form).getByRole("button", { name: "Create Provider" }));

    expect(create).toHaveBeenCalledWith("provider", {
      baseRevision: "rev-1",
      id: "gemini",
      value: {
        base_url: "https://generativelanguage.googleapis.com",
        api_key: "gemini-key",
        protocol: "google-genai"
      }
    });
  });

  test("uses wider create panel field tracks than dense resource editors", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Add Provider" }));
    const form = screen.getByRole("form", { name: "Create Provider" });

    expect(within(form).getByLabelText("Provider ID").parentElement).toHaveClass("form-field--create-track");
    expect(within(form).getByLabelText("Base URL").parentElement).toHaveClass("form-field--create-track");
    expect(within(form).getByRole("group", { name: "Protocol" }).parentElement).toHaveClass("form-field--create-track");
  });

  test("creates a model with a 128k default context window", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Add Model" }));
    const form = screen.getByRole("form", { name: "Create Model" });
    await userEvent.type(within(form).getByLabelText("Model ID"), "gpt-4o");
    await userEvent.type(within(form).getByLabelText("Display name"), "GPT-4o");
    await userEvent.click(within(form).getByRole("button", { name: "Create Model" }));

    expect(create).toHaveBeenCalledWith("model", {
      baseRevision: "rev-1",
      id: "gpt-4o",
      value: {
        display_name: "GPT-4o",
        context_window: 128000
      }
    });
  });

  test("lets users edit model context window through presets or custom input", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Add Model" }));
    const form = screen.getByRole("form", { name: "Create Model" });
    await userEvent.click(within(form).getByRole("button", { name: "Help for Context window" }));
    expect(within(form).getByRole("tooltip")).toHaveTextContent("Maximum context tokens");
    await userEvent.click(within(form).getByRole("button", { name: "400k" }));
    expect(within(form).getByLabelText("Context window")).toHaveValue("400000");

    await userEvent.clear(within(form).getByLabelText("Context window"));
    await userEvent.type(within(form).getByLabelText("Context window"), "640000");
    await userEvent.type(within(form).getByLabelText("Model ID"), "gpt-large");
    await userEvent.type(within(form).getByLabelText("Display name"), "GPT Large");
    await userEvent.click(within(form).getByRole("button", { name: "Create Model" }));

    expect(create).toHaveBeenCalledWith("model", {
      baseRevision: "rev-1",
      id: "gpt-large",
      value: {
        display_name: "GPT Large",
        context_window: 640000
      }
    });
  });

  test("rejects non-positive custom model context windows", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const create = vi.spyOn(configGraph, "createConfigResource").mockResolvedValue({
      result: "committed",
      revision: "rev-2",
      graph: configGraphFixture({ revision: "rev-2" })
    });

    renderWithConsoleProviders(<ModelsProvidersPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Add Model" }));
    const form = screen.getByRole("form", { name: "Create Model" });
    await userEvent.clear(within(form).getByLabelText("Context window"));
    await userEvent.type(within(form).getByLabelText("Context window"), "0");
    await userEvent.type(within(form).getByLabelText("Model ID"), "zero-window");
    await userEvent.click(within(form).getByRole("button", { name: "Create Model" }));

    expect(await within(form).findByRole("alert")).toHaveTextContent(
      "Context window must be greater than zero."
    );
    expect(create).not.toHaveBeenCalled();
    expect(within(form).getByLabelText("Context window")).toHaveValue("0");
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
    await userEvent.click(within(providerPanel).getByRole("button", { name: "Add Offer" }));
    const form = within(providerPanel).getByRole("form", { name: "Create Offer" });
    await userEvent.type(within(form).getByLabelText("Upstream name"), "claude-3-5-sonnet-latest");
    await userEvent.click(within(form).getByRole("button", { name: "Create Offer" }));

    expect(create).toHaveBeenCalledWith("provider_offer", {
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
    });
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
    await userEvent.click(within(providerPanel).getByRole("button", { name: "Add Offer" }));
    const form = within(providerPanel).getByRole("form", { name: "Create Offer" });
    await userEvent.clear(within(form).getByLabelText("Priority"));
    await userEvent.type(within(form).getByLabelText("Priority"), "fast");
    await userEvent.type(within(form).getByLabelText("Upstream name"), "claude-3-5-sonnet-latest");
    await userEvent.click(within(form).getByRole("button", { name: "Create Offer" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Priority must be a valid number.");
    expect(within(form).getByLabelText("Priority")).toHaveValue("fast");
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

    await userEvent.click(await screen.findByRole("button", { name: "Add Provider" }));
    const form = screen.getByRole("form", { name: "Create Provider" });
    await userEvent.type(within(form).getByLabelText("Provider ID"), "anthropic");
    await userEvent.type(within(form).getByLabelText("Base URL"), "https://api.anthropic.com");
    await userEvent.type(within(form).getByLabelText("API key"), "sk-ant");
    await userEvent.click(within(form).getByRole("button", { name: "Create Provider" }));

    expect(await screen.findByRole("alert")).toHaveTextContent('provider "anthropic" already exists');
    expect(within(form).getByLabelText("Provider ID")).toHaveValue("anthropic");
    expect(within(form).getByLabelText("Base URL")).toHaveValue("https://api.anthropic.com");
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
    await userEvent.click(within(providerPanel).getByRole("button", { name: "Delete Provider anthropic" }));

    expect(remove).not.toHaveBeenCalled();
    await userEvent.click(within(providerPanel).getByRole("button", { name: "Confirm delete anthropic" }));

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

    const offerPanel = (await screen.findByText("anthropic/claude-sonnet")).closest("section")!;
    await userEvent.click(within(offerPanel).getByRole("button", {
      name: "Delete Offer anthropic/claude-sonnet"
    }));
    await userEvent.click(within(offerPanel).getByRole("button", {
      name: "Confirm delete anthropic/claude-sonnet"
    }));

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
    await userEvent.click(within(modelPanel).getByRole("button", { name: "Delete Model claude-sonnet" }));
    await userEvent.click(within(modelPanel).getByRole("button", { name: "Confirm delete claude-sonnet" }));

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
