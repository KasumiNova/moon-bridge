import { afterEach, describe, expect, test, vi } from "vitest";
import {
  exportConfig,
  importConfig,
  listProviders,
  validateConfig
} from "./management";

function response(body: unknown, init?: ResponseInit) {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    headers: {
      "Content-Type":
        typeof body === "string" ? "application/x-yaml" : "application/json"
    },
    ...init
  });
}

describe("management RPC client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  test("listProviders encodes pagination query params", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      response({
        data: [],
        total: 0,
        limit: 10,
        offset: 20
      })
    );

    await listProviders({ limit: 10, offset: 20 });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/v1/providers?limit=10&offset=20"
    );
  });

  test("validateConfig posts config payload", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(response({ valid: true }));

    await validateConfig("providers: {}");

    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/config/validate");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ config: "providers: {}" })
    });
  });

  test("importConfig posts yaml payload", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(response({ changes: [], count: 0 }));

    await importConfig("providers: {}");

    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/config/import");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ yaml: "providers: {}" })
    });
  });

  test("exportConfig adds include_secrets query and confirmation header", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(response("providers: {}\n"));

    await exportConfig({ includeSecrets: true });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/v1/config/export?include_secrets=true"
    );
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      "X-Confirm-Secrets": "true"
    });
  });
});
