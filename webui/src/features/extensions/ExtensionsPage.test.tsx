import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as management from "../../rpc/management";
import { ExtensionsPage } from "./ExtensionsPage";



describe("ExtensionsPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("loads extension JSON and saves edits for Apply", async () => {
    vi.spyOn(management, "listExtensions").mockResolvedValue(["deepseek_v4"]);
    vi.spyOn(management, "getExtension").mockResolvedValue({
      enabled: true,
      config: { reinforce_instructions: true }
    });
    const putExtension = vi
      .spyOn(management, "putExtension")
      .mockResolvedValue({ change_id: 22, status: "pending" });

    renderWithConsoleProviders(<ExtensionsPage />);

    await userEvent.click(await screen.findByRole("button", { name: "deepseek_v4" }));
    expect(await screen.findByDisplayValue(/reinforce_instructions/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /save extension/i }));

    expect(putExtension).toHaveBeenCalledWith("deepseek_v4", {
      enabled: true,
      config: { reinforce_instructions: true }
    });
    expect(await screen.findByText(/edit #22 ready to apply/i)).toBeInTheDocument();
  });
});
