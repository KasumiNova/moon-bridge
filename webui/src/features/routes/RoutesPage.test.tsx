import { act, fireEvent, screen, within } from "@testing-library/react";
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
    expect(screen.getByLabelText("Web Search")).toBeInTheDocument();
    expect(screen.getByLabelText("Extensions")).toBeInTheDocument();
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
});

async function advanceAutosave() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(450);
    await Promise.resolve();
  });
}
