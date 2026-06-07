import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import * as logs from "../../rpc/logs";
import type { LogEntry } from "../../rpc/types";
import { LogsPage } from "./LogsPage";

describe("LogsPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    restoreNavigatorClipboard();
    restoreURLMethods();
  });

  test("renders recent raw logs, filters visible rows, and exposes log actions", async () => {
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue(logEntries());
    vi.spyOn(logs, "createLogStream").mockResolvedValue(
      new Response(new ReadableStream<Uint8Array>())
    );

    renderWithConsoleProviders(<LogsPage />);

    expect(await screen.findByText(/server-started/)).toBeInTheDocument();
    expect(screen.getByText(/database-unavailable/)).toBeInTheDocument();
    expect(screen.getByText("3 of 3 logs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search logs"), {
      target: { value: "database" }
    });

    expect(screen.queryByText(/server-started/)).not.toBeInTheDocument();
    expect(screen.getByText(/database-unavailable/)).toBeInTheDocument();
    expect(screen.getByText("1 of 3 logs")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Follow" })).toBeInTheDocument();
  });

  test("filters by level and copies only visible raw lines", async () => {
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue(logEntries());
    vi.spyOn(logs, "createLogStream").mockResolvedValue(
      new Response(new ReadableStream<Uint8Array>())
    );
    const writeText = installClipboard();

    renderWithConsoleProviders(<LogsPage />);

    expect(await screen.findByText(/server-started/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ERROR" }));
    expect(screen.queryByText(/server-started/)).not.toBeInTheDocument();
    expect(screen.getByText(/database-unavailable/)).toBeInTheDocument();
    expect(screen.getByText("1 of 3 logs")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("time=2026-06-07T00:00:01Z level=ERROR msg=database-unavailable");
    });
  });

  test("downloads only visible raw lines", async () => {
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue(logEntries());
    vi.spyOn(logs, "createLogStream").mockResolvedValue(
      new Response(new ReadableStream<Uint8Array>())
    );
    const { createObjectURL } = installURLMethods();

    renderWithConsoleProviders(<LogsPage />);

    expect(await screen.findByText(/server-started/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "WARN" }));
    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    await expect(readBlobText(blob)).resolves.toBe("time=2026-06-07T00:00:02Z level=WARN msg=slow-request");
  });

  test("shows a non-blocking status when log streaming fails", async () => {
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue(logEntries());
    vi.spyOn(logs, "createLogStream").mockRejectedValue(new Error("stream unavailable"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    renderWithConsoleProviders(<LogsPage />);

    expect(await screen.findByText(/server-started/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Live stream disconnected");
    });
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
    },
    {
      timestamp: "2026-06-07T00:00:02Z",
      level: "WARN",
      message: "slow request",
      raw: "time=2026-06-07T00:00:02Z level=WARN msg=slow-request"
    }
  ];
}

const clipboardDescriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, "clipboard");
const createObjectURLDescriptor = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
const revokeObjectURLDescriptor = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");

function installClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText }
  });
  return writeText;
}

function restoreNavigatorClipboard() {
  if (clipboardDescriptor) {
    Object.defineProperty(Navigator.prototype, "clipboard", clipboardDescriptor);
  } else {
    delete (navigator as Partial<Navigator>).clipboard;
  }
}

function installURLMethods() {
  const createObjectURL = vi.fn(() => "blob:moonbridge-logs");
  const revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectURL
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeObjectURL
  });
  return { createObjectURL, revokeObjectURL };
}

function restoreURLMethods() {
  if (createObjectURLDescriptor) {
    Object.defineProperty(URL, "createObjectURL", createObjectURLDescriptor);
  }
  if (revokeObjectURLDescriptor) {
    Object.defineProperty(URL, "revokeObjectURL", revokeObjectURLDescriptor);
  }
}

function readBlobText(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () => reject(reader.error ?? new Error("failed to read blob")));
    reader.readAsText(blob);
  });
}
