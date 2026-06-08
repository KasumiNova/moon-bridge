import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import { ApiError } from "../../rpc/http";
import * as configGraph from "../../rpc/configGraph";
import * as logs from "../../rpc/logs";
import * as management from "../../rpc/management";
import type { LogEntry, UsageStats } from "../../rpc/types";
import { configGraphFixture } from "../../test/configGraphFixtures";
import { OverviewPage } from "./OverviewPage";

describe("OverviewPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    restoreNavigatorClipboard();
    restoreURLMethods();
  });

  test("renders a usage dashboard with model charts and bottom logs instead of runtime status panels", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(
      configGraphFixture({
        runtime: {
          status: "runtimeRejected",
          errors: [
            {
              resourceKind: "provider",
              resourceId: "anthropic",
              field: "base_url",
              code: "runtimeReloadRejected",
              message: "upstream rejected reload"
            }
          ]
        },
        validation: {
          valid: false,
          errors: [
            {
              resourceKind: "route",
              resourceId: "primary",
              field: "model",
              code: "missingModel",
              message: "route model missing"
            }
          ]
        }
      })
    );
    vi.spyOn(management, "getUsageStats").mockResolvedValue(usageStats());
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue(logEntries());
    vi.spyOn(logs, "createLogStream").mockResolvedValue(new Response(new ReadableStream<Uint8Array>()));

    renderWithConsoleProviders(<OverviewPage />);

    expect(await screen.findByRole("heading", { name: "Usage Analytics" })).toBeInTheDocument();
    expect(await screen.findByText("2 requests")).toBeInTheDocument();
    expect(screen.getByText("300 input")).toBeInTheDocument();
    expect(screen.getByText("80 output")).toBeInTheDocument();
    expect(screen.getByText("40% cache hit")).toBeInTheDocument();
    expect(screen.getByText("¥0.42 total")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Token split chart.*Input tokens: 300.*Output tokens: 80/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Cache split chart.*Cache write: 40.*Cache read: 120/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Cost by model chart.*claude-sonnet: 0.42/ })).toBeInTheDocument();

    const modelRow = screen.getByRole("row", { name: /claude-sonnet/i });
    expect(modelRow).toHaveTextContent("claude-3-5-sonnet");
    expect(modelRow).toHaveTextContent("¥0.42");
    expect(modelRow).toHaveTextContent("¥1,105.26/M");

    expect(screen.getByRole("region", { name: "Backend logs" })).toBeInTheDocument();
    expect(screen.getByText(/server-started/)).toBeInTheDocument();
    expect(screen.queryByText("runtimeRejected")).not.toBeInTheDocument();
    expect(screen.queryByText("upstream rejected reload")).not.toBeInTheDocument();
    expect(screen.queryByText("Validation")).not.toBeInTheDocument();
  });

  test("keeps the embedded log panel searchable and clearable", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    vi.spyOn(management, "getUsageStats").mockResolvedValue(usageStats());
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue(logEntries());
    vi.spyOn(logs, "createLogStream").mockResolvedValue(new Response(new ReadableStream<Uint8Array>()));

    renderWithConsoleProviders(<OverviewPage />);

    expect(await screen.findByText(/server-started/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search logs"), {
      target: { value: "database" }
    });

    expect(screen.queryByText(/server-started/)).not.toBeInTheDocument();
    expect(screen.getByText(/database-unavailable/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear log search" }));

    expect(screen.getByText(/server-started/)).toBeInTheDocument();
    expect(screen.getByText(/database-unavailable/)).toBeInTheDocument();
  });

  test("shows usage empty state while keeping logs available", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());
    vi.spyOn(management, "getUsageStats").mockResolvedValue({
      totals: {
        requests: 0,
        input_tokens: 0,
        output_tokens: 0,
        cache_creation: 0,
        cache_read: 0,
        cache_hit_rate: 0,
        cache_write_rate: 0,
        cache_rw_ratio: 0,
        total_cost: 0,
        duration: "0s"
      },
      by_model: []
    });
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue(logEntries());
    vi.spyOn(logs, "createLogStream").mockResolvedValue(new Response(new ReadableStream<Uint8Array>()));

    renderWithConsoleProviders(<OverviewPage />);

    expect(await screen.findByText("No usage has been recorded yet.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Token split chart/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Cache split chart/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Cost by model chart/ })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Model usage table" })).toBeInTheDocument();
    expect(screen.getByText(/server-started/)).toBeInTheDocument();
  });

  test("keeps usage dashboard and logs visible when graph API store is unavailable", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockRejectedValue(
      new ApiError(503, "store_unavailable", "配置存储不可用")
    );
    vi.spyOn(management, "getUsageStats").mockResolvedValue(usageStats());
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue([]);
    vi.spyOn(logs, "createLogStream").mockResolvedValue(new Response(new ReadableStream<Uint8Array>()));

    renderWithConsoleProviders(<OverviewPage />);

    expect(await screen.findByRole("heading", { name: "Usage Analytics" })).toBeInTheDocument();
    expect(await screen.findByText("2 requests")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Backend logs" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Configuration graph unavailable" })).toBeInTheDocument();
  });
});

function usageStats(): UsageStats {
  return {
    totals: {
      requests: 2,
      input_tokens: 300,
      output_tokens: 80,
      cache_creation: 40,
      cache_read: 120,
      cache_hit_rate: 40,
      cache_write_rate: 13.3,
      cache_rw_ratio: 3,
      total_cost: 0.42,
      duration: "1m"
    },
    by_model: [
      {
        model: "claude-sonnet",
        actual_model: "claude-3-5-sonnet",
        requests: 2,
        input_tokens: 300,
        output_tokens: 80,
        cache_creation: 40,
        cache_read: 120,
        cache_hit_rate: 40,
        cost: 0.42,
        avg_cost_per_mtoken: 1105.26
      }
    ]
  };
}

function logEntries(): LogEntry[] {
  return [
    {
      timestamp: "2026-06-07T00:00:00Z",
      level: "INFO",
      message: "server started",
      raw: "time=2026-06-07T00:00:00Z level=INFO msg=server-started"
    },
    {
      timestamp: "2026-06-07T00:00:01Z",
      level: "ERROR",
      message: "database unavailable",
      raw: "time=2026-06-07T00:00:01Z level=ERROR msg=database-unavailable"
    }
  ];
}

const clipboardDescriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, "clipboard");
const createObjectURLDescriptor = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
const revokeObjectURLDescriptor = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");

function restoreNavigatorClipboard() {
  if (clipboardDescriptor) {
    Object.defineProperty(Navigator.prototype, "clipboard", clipboardDescriptor);
  } else {
    Reflect.deleteProperty(navigator, "clipboard");
  }
}

function restoreURLMethods() {
  if (createObjectURLDescriptor) {
    Object.defineProperty(URL, "createObjectURL", createObjectURLDescriptor);
  }
  if (revokeObjectURLDescriptor) {
    Object.defineProperty(URL, "revokeObjectURL", revokeObjectURLDescriptor);
  }
}
