import { act, fireEvent, screen, within } from "@testing-library/react";
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
    const offers = screen.getByRole("heading", { name: "Provider Offers (1)" });
    const models = screen.getByRole("heading", { name: "Models (1)" });

    expect(providers.compareDocumentPosition(offers) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(providers.compareDocumentPosition(models) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(screen.getByLabelText("anthropic status")).getByText("Saved")).toBeInTheDocument();
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
    expect(screen.getByRole("heading", { name: "提供商能力 (1)" })).toBeInTheDocument();
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
});

async function advanceAutosave() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(450);
    await Promise.resolve();
  });
}
