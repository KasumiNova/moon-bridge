import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import * as configGraph from "../../rpc/configGraph";
import { configGraphFixture } from "../../test/configGraphFixtures";
import { DefaultsPage } from "./DefaultsPage";

describe("DefaultsPage", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("renders defaults, trace, and log resources", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    renderWithConsoleProviders(<DefaultsPage />);

    expect(await screen.findByRole("heading", { level: 2, name: "Defaults" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Trace" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Log" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("Defaults main status")).getByText("Saved")).toBeInTheDocument();
    expect(within(screen.getByLabelText("Trace main status")).getByText("Saved")).toBeInTheDocument();
    expect(within(screen.getByLabelText("Log main status")).getByText("Saved")).toBeInTheDocument();
    expect(screen.getAllByText("Hot reload").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Model")).toHaveValue("claude-sonnet");
    expect(within(screen.getByRole("group", { name: "Level" })).getByRole("button", { name: "info" }))
      .toHaveAttribute("aria-pressed", "true");
  });

  test("autosaves defaults through graph patches", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    const patch = vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });

    renderWithConsoleProviders(<DefaultsPage />);

    const defaultsPanel = (await screen.findByRole("heading", { level: 2, name: "Defaults" }))
      .closest("section")!;
    vi.useFakeTimers();
    fireEvent.change(within(defaultsPanel).getByLabelText("Model"), {
      target: { value: "gpt-4o" }
    });

    await advanceAutosave();

    expect(patch).toHaveBeenCalledWith({
      baseRevision: "rev-1",
      changes: [
        {
          kind: "defaults",
          id: "main",
          field: "model",
          value: "gpt-4o"
        }
      ]
    });
  });

  test("does not expose delete actions for singleton default resources", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    renderWithConsoleProviders(<DefaultsPage />);

    expect(await screen.findByRole("heading", { level: 2, name: "Defaults" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete Defaults main" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete Trace main" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete Log main" })).not.toBeInTheDocument();
  });
});

async function advanceAutosave() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(450);
    await Promise.resolve();
  });
}
