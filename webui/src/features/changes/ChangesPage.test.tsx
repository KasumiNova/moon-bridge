import { screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import * as management from "../../rpc/management";
import { ChangesPage } from "./ChangesPage";



describe("ChangesPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders pending changes with before and after summaries", async () => {
    vi.spyOn(management, "getChanges").mockResolvedValue([
      {
        ID: 9,
        Action: "create",
        Resource: "route",
        TargetKey: "moonbridge",
        Before: "",
        After: "{\"model\":\"claude-sonnet\"}",
        CreatedAt: "2026-05-24T00:00:00Z"
      }
    ]);

    renderWithConsoleProviders(<ChangesPage />);

    expect(await screen.findByText("moonbridge")).toBeInTheDocument();
    expect(screen.getByText("route")).toBeInTheDocument();
    expect(screen.getByText("create")).toBeInTheDocument();
    expect(screen.getByText(/claude-sonnet/)).toBeInTheDocument();
  });
});
