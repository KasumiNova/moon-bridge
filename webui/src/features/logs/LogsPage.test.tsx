import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import * as logs from "../../rpc/logs";
import { LogsPage } from "./LogsPage";

describe("LogsPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders recent raw logs, filters visible lines, and exposes log actions", async () => {
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue([
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
    ]);
    vi.spyOn(logs, "createLogStream").mockResolvedValue(
      new Response(new ReadableStream<Uint8Array>())
    );

    renderWithConsoleProviders(<LogsPage />);

    expect(await screen.findByText(/server-started/)).toBeInTheDocument();
    expect(screen.getByText(/database-unavailable/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search logs"), {
      target: { value: "database" }
    });

    expect(screen.queryByText(/server-started/)).not.toBeInTheDocument();
    expect(screen.getByText(/database-unavailable/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Follow" })).toBeInTheDocument();
  });

  test("appends stream events without rewriting raw text", async () => {
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue([]);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            'data: {"timestamp":"2026-06-07T00:00:02Z","level":"INFO","message":"streamed","raw":"raw streamed line"}\n\n'
          )
        );
        controller.close();
      }
    });
    vi.spyOn(logs, "createLogStream").mockResolvedValue(new Response(stream));

    renderWithConsoleProviders(<LogsPage />);

    await waitFor(() => {
      expect(screen.getByText("raw streamed line")).toBeInTheDocument();
    });
  });
});
