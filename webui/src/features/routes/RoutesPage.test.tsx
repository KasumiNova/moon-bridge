import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as management from "../../rpc/management";
import { RoutesPage } from "./RoutesPage";



describe("RoutesPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders route rows from the management API", async () => {
    vi.spyOn(management, "listRoutes").mockResolvedValue({
      data: [
        {
          alias: "moonbridge",
          model: "claude-sonnet",
          provider: "anthropic",
          display_name: "Moon Bridge Default"
        }
      ],
      total: 1,
      limit: 20,
      offset: 0
    });

    renderWithConsoleProviders(<RoutesPage />);

    expect(await screen.findByText("moonbridge")).toBeInTheDocument();
    expect(screen.getByText("claude-sonnet")).toBeInTheDocument();
    expect(screen.getByText("anthropic")).toBeInTheDocument();
    expect(screen.getByText("Moon Bridge Default")).toBeInTheDocument();
  });

  test("stages a route alias from the visual form", async () => {
    vi.spyOn(management, "listRoutes").mockResolvedValue({
      data: [],
      total: 0,
      limit: 20,
      offset: 0
    });
    const putRoute = vi
      .spyOn(management, "putRoute")
      .mockResolvedValue({ change_id: 14, status: "pending" });

    renderWithConsoleProviders(<RoutesPage />);

    const routeForm = (await screen.findByRole("heading", { name: /stage route/i }))
      .closest("section")!;
    const routeArea = within(routeForm);

    await userEvent.type(await routeArea.findByLabelText(/^alias$/i), "moonbridge");
    await userEvent.type(routeArea.getByLabelText(/^model$/i), "claude-sonnet");
    await userEvent.type(routeArea.getByLabelText(/^provider$/i), "anthropic");
    await userEvent.type(routeArea.getByLabelText(/^display name$/i), "Default Route");
    await userEvent.clear(routeArea.getByLabelText(/^context window$/i));
    await userEvent.type(routeArea.getByLabelText(/^context window$/i), "200000");
    await userEvent.click(screen.getByRole("button", { name: /stage route/i }));

    expect(putRoute).toHaveBeenCalledWith("moonbridge", {
      model: "claude-sonnet",
      provider: "anthropic",
      display_name: "Default Route",
      context_window: 200000
    });
    expect(await screen.findByText(/staged change #14/i)).toBeInTheDocument();
  });
});
