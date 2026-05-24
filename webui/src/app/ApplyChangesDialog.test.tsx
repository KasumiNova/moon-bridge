import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../test/renderWithConsoleProviders";
import * as management from "../rpc/management";
import { ApplyChangesDialog } from "./ApplyChangesDialog";

function renderDialog() {
  return renderWithConsoleProviders(<ApplyChangesDialog open onClose={() => undefined} />);
}

describe("ApplyChangesDialog", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("previews pending edits and applies them", async () => {
    vi.spyOn(management, "getChanges").mockResolvedValue([
      {
        ID: 4,
        Action: "update",
        Resource: "model",
        TargetKey: "claude-sonnet",
        Before: "{}",
        After: "{\"display_name\":\"Claude Sonnet\"}",
        CreatedAt: "2026-05-24T00:00:00Z"
      }
    ]);
    const apply = vi
      .spyOn(management, "applyChanges")
      .mockResolvedValue({ status: "success", message: "applied" });
    vi.spyOn(management, "discardChanges").mockResolvedValue({
      status: "success",
      message: "discarded"
    });

    renderDialog();

    expect(await screen.findByText("claude-sonnet")).toBeInTheDocument();
    expect(screen.queryByText(/staged/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^apply$/i }));

    expect(apply).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText("applied")).toBeInTheDocument());
  });

  test("can discard previewed edits without exposing a queue", async () => {
    vi.spyOn(management, "getChanges").mockResolvedValue([]);
    vi.spyOn(management, "applyChanges").mockResolvedValue({
      status: "success",
      message: "applied"
    });
    const discard = vi
      .spyOn(management, "discardChanges")
      .mockResolvedValue({ status: "success", message: "discarded" });

    renderDialog();

    await userEvent.click(await screen.findByRole("button", { name: /discard/i }));

    expect(discard).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("discarded")).toBeInTheDocument();
  });
});
