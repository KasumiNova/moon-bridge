import { fireEvent, screen, waitFor, within } from "@testing-library/react";
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

  test("uses a segmented follow control with clear pressed state", async () => {
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue(logEntries());
    vi.spyOn(logs, "createLogStream").mockResolvedValue(
      new Response(new ReadableStream<Uint8Array>())
    );

    renderWithConsoleProviders(<LogsPage />);

    expect(await screen.findByText(/server-started/)).toBeInTheDocument();

    const followMode = screen.getByRole("group", { name: "Live follow mode" });
    expect(within(followMode).getByRole("button", { name: "Follow" })).toHaveAttribute("aria-pressed", "true");
    expect(within(followMode).getByRole("button", { name: "Pause" })).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(within(followMode).getByRole("button", { name: "Pause" }));

    expect(within(followMode).getByRole("button", { name: "Follow" })).toHaveAttribute("aria-pressed", "false");
    expect(within(followMode).getByRole("button", { name: "Pause" })).toHaveAttribute("aria-pressed", "true");
  });

  test("shows empty feedback and disables log actions when filters hide every row", async () => {
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue(logEntries());
    vi.spyOn(logs, "createLogStream").mockResolvedValue(
      new Response(new ReadableStream<Uint8Array>())
    );

    renderWithConsoleProviders(<LogsPage />);

    expect(await screen.findByText(/server-started/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search logs"), {
      target: { value: "no matching backend event" }
    });

    expect(screen.getByText("No logs match the current filters.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Download" })).toBeDisabled();
    expect(screen.getByText("0 of 3 logs")).toBeInTheDocument();
  });

  test("shows a calm empty state when no recent logs are available", async () => {
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue([]);
    vi.spyOn(logs, "createLogStream").mockResolvedValue(
      new Response(new ReadableStream<Uint8Array>())
    );

    renderWithConsoleProviders(<LogsPage />);

    expect(await screen.findByText("No log entries yet.")).toBeInTheDocument();
    expect(screen.getByText("0 of 0 logs")).toBeInTheDocument();
  });

  test("downloads only visible raw lines", async () => {
    vi.spyOn(logs, "getRecentLogs").mockResolvedValue(logEntries());
    vi.spyOn(logs, "createLogStream").mockResolvedValue(
      new Response(new ReadableStream<Uint8Array>())
    );
    const { getBlob } = installURLMethods();

    renderWithConsoleProviders(<LogsPage />);

    expect(await screen.findByText(/server-started/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "WARN" }));
    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    await expect(readBlobText(getBlob())).resolves.toBe("time=2026-06-07T00:00:02Z level=WARN msg=slow-request");
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
    Reflect.deleteProperty(navigator, "clipboard");
  }
}

function installURLMethods() {
  let blob: Blob | undefined;
  const createObjectURL = vi.fn((nextBlob: Blob) => {
    blob = nextBlob;
    return "blob:moonbridge-logs";
  });
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
  return {
    createObjectURL,
    revokeObjectURL,
    getBlob() {
      if (!blob) {
        throw new Error("download did not create a blob URL");
      }
      return blob;
    }
  };
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
