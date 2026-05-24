import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import { ApiError } from "../../rpc/http";
import * as management from "../../rpc/management";
import { OverviewPage } from "./OverviewPage";



describe("OverviewPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders status, stats, sessions, and pending changes", async () => {
    vi.spyOn(management, "getStatus").mockResolvedValue({
      uptime: "N/A",
      version: "dev",
      mode: "transform",
      provider_count: 2,
      route_count: 3,
      addr: ":38440",
      timestamp: "2026-05-24T00:00:00Z"
    });
    vi.spyOn(management, "getStatsSummary").mockResolvedValue({
      requests: 42,
      input_tokens: 1200,
      output_tokens: 340,
      cache_hit_rate: 0.25,
      total_cost: 0.37,
      duration: "1h"
    });
    vi.spyOn(management, "getSessions").mockResolvedValue([
      {
        key: "sk-****",
        model: "moonbridge",
        created_at: "2026-05-24T00:00:00Z",
        last_used: "2026-05-24T01:00:00Z"
      }
    ]);
    vi.spyOn(management, "getChanges").mockResolvedValue([
      {
        ID: 7,
        Action: "update",
        Resource: "route",
        TargetKey: "moonbridge",
        CreatedAt: "2026-05-24T01:00:00Z"
      }
    ]);

    renderWithConsoleProviders(<OverviewPage />);

    expect(await screen.findByText("transform")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1 pending")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("sk-****")).toBeInTheDocument();
  });

  test("shows setup state when the management API store is unavailable", async () => {
    vi.spyOn(management, "getStatus").mockRejectedValue(
      new ApiError(503, "store_unavailable", "配置存储不可用")
    );
    vi.spyOn(management, "getStatsSummary").mockRejectedValue(
      new ApiError(503, "store_unavailable", "配置存储不可用")
    );
    vi.spyOn(management, "getSessions").mockRejectedValue(
      new ApiError(503, "store_unavailable", "配置存储不可用")
    );
    vi.spyOn(management, "getChanges").mockRejectedValue(
      new ApiError(503, "store_unavailable", "配置存储不可用")
    );

    renderWithConsoleProviders(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText(/persistence store/i)).toBeInTheDocument();
    });
  });
});
