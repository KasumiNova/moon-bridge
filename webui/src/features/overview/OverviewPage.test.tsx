import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import { ApiError } from "../../rpc/http";
import * as configGraph from "../../rpc/configGraph";
import { configGraphFixture } from "../../test/configGraphFixtures";
import { OverviewPage } from "./OverviewPage";

describe("OverviewPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders config graph health without pending changes", async () => {
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
        resources: configGraphFixture().resources
      })
    );

    renderWithConsoleProviders(<OverviewPage />);

    expect(await screen.findByText("Transform")).toBeInTheDocument();
    expect(screen.getByText("runtimeRejected")).toBeInTheDocument();
    expect(screen.getAllByText("Valid").length).toBeGreaterThan(0);
    expect(screen.getByText("1 restart")).toBeInTheDocument();
    expect(screen.getByText("upstream rejected reload")).toBeInTheDocument();
    expect(screen.queryByText(/pending/i)).not.toBeInTheDocument();
  });

  test("shows setup state when graph API store is unavailable", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockRejectedValue(
      new ApiError(503, "store_unavailable", "配置存储不可用")
    );

    renderWithConsoleProviders(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText(/persistence store/i)).toBeInTheDocument();
    });
  });
});
