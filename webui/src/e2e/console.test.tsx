import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithConsoleProviders } from "../test/renderWithConsoleProviders";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ConfigPage } from "../features/config/ConfigPage";
import { OverviewPage } from "../features/overview/OverviewPage";
import * as management from "../rpc/management";
import { CONSOLE_THEME_STORAGE_KEY } from "../theme/ThemeProvider";



describe("console smoke flow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  test("defaults to dark theme and renders overview runtime cards", async () => {
    vi.spyOn(management, "getStatus").mockResolvedValue({
      uptime: "N/A",
      version: "dev",
      mode: "Transform",
      provider_count: 1,
      route_count: 1,
      addr: "127.0.0.1:38441",
      timestamp: "2026-05-24T00:00:00Z"
    });
    vi.spyOn(management, "getStatsSummary").mockResolvedValue({
      requests: 0,
      input_tokens: 0,
      output_tokens: 0,
      cache_hit_rate: 0,
      total_cost: 0,
      duration: "0s"
    });
    vi.spyOn(management, "getSessions").mockResolvedValue([]);
    vi.spyOn(management, "getChanges").mockResolvedValue([]);

    renderWithConsoleProviders(<OverviewPage />);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(CONSOLE_THEME_STORAGE_KEY)).toBe("dark");
    expect(await screen.findByText("Transform")).toBeInTheDocument();
    expect(screen.getByText("0 pending")).toBeInTheDocument();
  });

  test("config imports raw YAML as edits ready to apply", async () => {
    vi.spyOn(management, "getEffectiveConfig").mockResolvedValue({});
    vi.spyOn(management, "getDefaults").mockResolvedValue({
      model: "moonbridge",
      max_tokens: 4096,
      system_prompt: ""
    });
    vi.spyOn(management, "getWebSearch").mockResolvedValue({
      support: "auto",
      max_uses: 8,
      tavily_api_key: "****",
      firecrawl_api_key: "****",
      search_max_rounds: 5
    });
    vi.spyOn(management, "validateConfig").mockResolvedValue({ valid: true });
    const importConfig = vi.spyOn(management, "importConfig").mockResolvedValue({
      changes: [{ change_id: 1, resource: "route", target: "moonbridge" }],
      count: 1,
      message: ""
    });
    vi.spyOn(management, "exportConfig").mockResolvedValue("mode: Transform\n");

    renderWithConsoleProviders(<ConfigPage />);

    expect(screen.queryByRole("button", { name: /generate yaml/i })).not.toBeInTheDocument();
    await userEvent.clear(await screen.findByLabelText(/yaml editor/i));
    await userEvent.type(screen.getByLabelText(/yaml editor/i), "mode: Transform");
    await userEvent.click(screen.getByRole("button", { name: /import/i }));

    expect(importConfig).toHaveBeenCalledWith("mode: Transform");
    expect(await screen.findByText(/1 edits ready to apply/i)).toBeInTheDocument();
  });
});
