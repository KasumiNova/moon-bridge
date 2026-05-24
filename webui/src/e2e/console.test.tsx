import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { ConfigPage } from "../features/config/ConfigPage";
import { OverviewPage } from "../features/overview/OverviewPage";
import * as management from "../rpc/management";
import { CONSOLE_THEME_STORAGE_KEY, ThemeProvider } from "../theme/ThemeProvider";

function renderWithProviders(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>
  );
}

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

    renderWithProviders(<OverviewPage />);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(CONSOLE_THEME_STORAGE_KEY)).toBe("dark");
    expect(await screen.findByText("Transform")).toBeInTheDocument();
    expect(screen.getByText("0 pending")).toBeInTheDocument();
  });

  test("config generator creates YAML and import stages changes", async () => {
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
      message: "staged"
    });
    vi.spyOn(management, "exportConfig").mockResolvedValue("mode: Transform\n");

    renderWithProviders(<ConfigPage />);

    await userEvent.click(await screen.findByRole("button", { name: /generate yaml/i }));
    expect(screen.getByDisplayValue(/providers:/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /import/i }));

    expect(importConfig).toHaveBeenCalledWith(expect.stringContaining("routes:"));
    expect(await screen.findByText("staged")).toBeInTheDocument();
  });
});
