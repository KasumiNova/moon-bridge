import { act, fireEvent, screen, within } from "@testing-library/react";
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
    expect(screen.getByLabelText("Model")).toBeInTheDocument();
    expect(screen.getByLabelText("Provider")).toBeInTheDocument();
    expect(screen.getByLabelText("Display Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Context Window")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Web Search.*1 key/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Extensions.*0 keys/ })).toBeInTheDocument();
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
    fireEvent.change(within(routePanel).getByLabelText("Provider"), {
      target: { value: "openai" }
    });
    fireEvent.blur(within(routePanel).getByLabelText("Provider"));

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

    await userEvent.click(await screen.findByRole("button", { name: "Add Route" }));
    await userEvent.type(screen.getByLabelText("Route alias"), "fast");
    await userEvent.click(screen.getByRole("button", { name: "Create Route" }));

    expect(create).toHaveBeenCalledWith("route", {
      baseRevision: "rev-1",
      id: "fast",
      value: {
        model: "claude-sonnet",
        provider: "anthropic"
      }
    });
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
    await userEvent.click(within(routePanel).getByRole("button", { name: "Delete Route primary" }));
    expect(remove).not.toHaveBeenCalled();
    await userEvent.click(within(routePanel).getByRole("button", { name: "Confirm delete primary" }));

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
