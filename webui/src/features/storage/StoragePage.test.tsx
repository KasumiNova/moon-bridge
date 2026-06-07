import { screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import * as configGraph from "../../rpc/configGraph";
import { configGraphFixture } from "../../test/configGraphFixtures";
import { StoragePage } from "./StoragePage";

describe("StoragePage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders cache and persistence resources with runtime storage errors", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(
      configGraphFixture({
        runtime: {
          status: "runtimeRejected",
          errors: [
            {
              resourceKind: "persistence",
              resourceId: "main",
              field: "active_provider",
              code: "databaseUnavailable",
              message: "database unavailable"
            }
          ]
        }
      })
    );

    renderWithConsoleProviders(<StoragePage />);

    expect(await screen.findByRole("heading", { level: 2, name: "Cache" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Persistence" })).toBeInTheDocument();
    expect(screen.getByLabelText("Mode")).toHaveValue("memory");
    expect(screen.getByLabelText("Active Provider")).toHaveValue("db_sqlite");
    expect(screen.getByText("database unavailable")).toBeInTheDocument();
  });
});
