import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as management from "../../rpc/management";
import { ProvidersPage } from "./ProvidersPage";



describe("ProvidersPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders provider rows and labels anthropic-only test action", async () => {
    vi.spyOn(management, "listProviders").mockResolvedValue({
      data: [
        {
          key: "anthropic",
          protocol: "anthropic",
          offer_count: 2,
          base_url: "https://api.anthropic.com",
          health_status: "unknown"
        },
        {
          key: "openai",
          protocol: "openai",
          offer_count: 1,
          base_url: "https://api.openai.com",
          health_status: "unknown"
        }
      ],
      total: 2,
      limit: 20,
      offset: 0
    });

    renderWithConsoleProviders(<ProvidersPage />);

    const table = await screen.findByRole("table");
    expect(within(table).getAllByText("anthropic")).toHaveLength(2);
    expect(screen.getByText("https://api.anthropic.com")).toBeInTheDocument();
    expect(screen.getByText("Anthropic probe")).toBeInTheDocument();
    expect(screen.getByText("Not available")).toBeInTheDocument();
  });

  test("saves a provider definition and offer for Apply", async () => {
    vi.spyOn(management, "listProviders").mockResolvedValue({
      data: [],
      total: 0,
      limit: 20,
      offset: 0
    });
    const putProvider = vi
      .spyOn(management, "putProvider")
      .mockResolvedValue({ change_id: 12, status: "pending" });
    const createOffer = vi
      .spyOn(management, "createOffer")
      .mockResolvedValue({ change_id: 13, status: "pending" });

    renderWithConsoleProviders(<ProvidersPage />);

    const providerForm = (await screen.findByRole("heading", { name: /save provider/i }))
      .closest("section")!;
    const providerArea = within(providerForm);

    await userEvent.type(await providerArea.findByLabelText(/^key$/i), "preview");
    await userEvent.type(providerArea.getByLabelText(/^base url$/i), "https://provider.test");
    await userEvent.type(providerArea.getByLabelText(/^api key$/i), "secret");
    await userEvent.selectOptions(providerArea.getByLabelText(/^protocol$/i), "anthropic");
    await userEvent.click(screen.getByRole("button", { name: /save provider/i }));

    expect(putProvider).toHaveBeenCalledWith("preview", {
      base_url: "https://provider.test",
      api_key: "secret",
      protocol: "anthropic",
      version: "",
      user_agent: ""
    });

    const offerForm = screen.getByRole("heading", { name: /save offer/i })
      .closest("section")!;
    const offerArea = within(offerForm);

    await userEvent.type(offerArea.getByLabelText(/^offer model$/i), "claude-sonnet");
    await userEvent.type(offerArea.getByLabelText(/^upstream name$/i), "claude-3-5-sonnet");
    await userEvent.click(screen.getByRole("button", { name: /save offer/i }));

    expect(createOffer).toHaveBeenCalledWith("preview", expect.objectContaining({
      model: "claude-sonnet",
      upstream_name: "claude-3-5-sonnet"
    }));
    expect(await screen.findByText(/edit #13 ready to apply/i)).toBeInTheDocument();
  });
});
