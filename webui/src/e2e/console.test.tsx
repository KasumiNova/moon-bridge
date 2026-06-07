import { fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";
import { AppShell } from "../app/App";
import { DefaultsPage } from "../features/defaults/DefaultsPage";
import { LogsPage } from "../features/logs/LogsPage";
import { OverviewPage } from "../features/overview/OverviewPage";
import { SecurityPage } from "../features/security/SecurityPage";
import { CONSOLE_THEME_STORAGE_KEY } from "../theme/ThemeProvider";
import { configGraphFixture } from "../test/configGraphFixtures";
import { renderWithConsoleProviders } from "../test/renderWithConsoleProviders";
import type { ConfigGraph, FieldError, PatchResponse } from "../rpc/types";

type FetchCall = {
  url: string;
  init?: RequestInit;
  body?: unknown;
};

describe("config graph console smoke flow", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  test("primary navigation has no config file or apply entry points", () => {
    renderWithConsoleProviders(
      <MemoryRouter>
        <AppShell content={<div>Console content</div>} />
      </MemoryRouter>
    );

    const nav = screen.getByRole("navigation", { name: /console sections/i });
    expect(nav).toHaveTextContent("Overview");
    expect(nav).toHaveTextContent("Models & Providers");
    expect(nav).toHaveTextContent("Search & Tools");
    expect(nav).toHaveTextContent("Logs");
    expect(nav).not.toHaveTextContent("Config");
    expect(nav).not.toHaveTextContent("YAML");
    expect(screen.queryByRole("button", { name: /^apply$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /apply changes/i })).not.toBeInTheDocument();
  });

  test("overview loads runtime state from the config graph", async () => {
    mockFetch({
      graph: configGraphFixture()
    });

    renderWithConsoleProviders(<OverviewPage />);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(CONSOLE_THEME_STORAGE_KEY)).toBe("dark");
    expect(await screen.findByText("Transform")).toBeInTheDocument();
    expect(screen.getAllByText("Valid").length).toBeGreaterThan(0);
    expect(screen.getByText("rev-1")).toBeInTheDocument();
  });

  test("editing a field patches the config graph directly", async () => {
    const graph = configGraphFixture();
    const { calls } = mockFetch({
      graph,
      patch: {
        result: "committed",
        revision: "rev-2",
        graph: configGraphFixture({ revision: "rev-2" })
      }
    });

    renderWithConsoleProviders(<DefaultsPage />);

    fireEvent.change(await screen.findByLabelText("Model"), {
      target: { value: "gpt-4o" }
    });

    await waitFor(() => {
      expect(findPatch(calls)?.body).toEqual({
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
  });

  test("draft rejection keeps the edited value and shows the field error", async () => {
    const error = fieldError("defaults", "main", "model", "draftRejected", "Model is invalid");
    mockFetch({
      graph: configGraphFixture(),
      patch: {
        result: "draftRejected",
        revision: "rev-1",
        errors: [error]
      }
    });

    renderWithConsoleProviders(<DefaultsPage />);

    const model = await screen.findByLabelText("Model");
    fireEvent.change(model, { target: { value: "invalid-model" } });

    expect(model).toHaveValue("invalid-model");
    expect(await screen.findByRole("alert")).toHaveTextContent("Model is invalid");
  });

  test("runtime rejection rolls back a critical field", async () => {
    const error = fieldError("server", "main", "addr", "runtimeRejected", "Runtime rejected");
    mockFetch({
      graph: configGraphFixture(),
      patch: {
        result: "runtimeRejected",
        revision: "rev-1",
        errors: [error],
        rollbackValue: ":38440"
      }
    });

    renderWithConsoleProviders(<SecurityPage />);

    const address = await screen.findByLabelText("Address");
    fireEvent.change(address, { target: { value: ":9999" } });

    await waitFor(() => {
      expect(address).toHaveValue(":38440");
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("Runtime rejected");
  });

  test("logs page renders recent backend log lines", async () => {
    mockFetch({
      graph: configGraphFixture(),
      logs: [
        {
          timestamp: "2026-06-07T00:00:00Z",
          level: "INFO",
          message: "server started",
          raw: "time=2026-06-07T00:00:00Z level=INFO msg=server-started"
        }
      ]
    });

    renderWithConsoleProviders(<LogsPage />);

    expect(await screen.findByText(/server-started/)).toBeInTheDocument();
  });
});

function mockFetch({
  graph,
  patch,
  logs = []
}: {
  graph: ConfigGraph;
  patch?: PatchResponse;
  logs?: unknown[];
}) {
  const calls: FetchCall[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    const body = parseBody(init?.body);
    calls.push({ url, init, body });

    if (url === "/api/v1/config/graph" && method === "GET") {
      return jsonResponse(graph);
    }
    if (url === "/api/v1/config/graph" && method === "PATCH") {
      if (!patch) {
        throw new Error("Unexpected config graph patch");
      }
      return jsonResponse(patch);
    }
    if (url.startsWith("/api/v1/logs/recent")) {
      return jsonResponse(logs);
    }
    if (url === "/api/v1/logs/stream") {
      return new Response(new ReadableStream<Uint8Array>(), { status: 200 });
    }
    throw new Error(`Unexpected fetch: ${method} ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  return { calls, fetchMock };
}

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

function parseBody(body: BodyInit | null | undefined) {
  return typeof body === "string" ? JSON.parse(body) as unknown : undefined;
}

function findPatch(calls: FetchCall[]) {
  return calls.find((call) => call.url === "/api/v1/config/graph" && call.init?.method === "PATCH");
}

function fieldError(
  resourceKind: FieldError["resourceKind"],
  resourceId: string,
  field: string,
  code: string,
  message: string
): FieldError {
  return { resourceKind, resourceId, field, code, message };
}
