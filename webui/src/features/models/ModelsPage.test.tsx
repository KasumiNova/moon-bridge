import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as management from "../../rpc/management";
import { ModelsPage } from "./ModelsPage";



describe("ModelsPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders model rows from the management API", async () => {
    vi.spyOn(management, "listModels").mockResolvedValue({
      data: [
        {
          slug: "claude-sonnet",
          display_name: "Claude Sonnet",
          context_window: 200000,
          providers: ["anthropic"]
        }
      ],
      total: 1,
      limit: 20,
      offset: 0
    });

    renderWithConsoleProviders(<ModelsPage />);

    expect(await screen.findByText("claude-sonnet")).toBeInTheDocument();
    expect(screen.getByText("Claude Sonnet")).toBeInTheDocument();
    expect(screen.getByText("200,000")).toBeInTheDocument();
    expect(screen.getByText("anthropic")).toBeInTheDocument();
  });

  test("stages a model definition from the visual form", async () => {
    vi.spyOn(management, "listModels").mockResolvedValue({
      data: [],
      total: 0,
      limit: 20,
      offset: 0
    });
    const putModel = vi
      .spyOn(management, "putModel")
      .mockResolvedValue({ change_id: 10, status: "pending" });

    renderWithConsoleProviders(<ModelsPage />);

    await userEvent.type(await screen.findByLabelText(/slug/i), "new-model");
    await userEvent.type(screen.getByLabelText(/display name/i), "New Model");
    await userEvent.type(screen.getByLabelText(/description/i), "Test model");
    await userEvent.clear(screen.getByLabelText(/context window/i));
    await userEvent.type(screen.getByLabelText(/context window/i), "32000");
    await userEvent.clear(screen.getByLabelText(/max output/i));
    await userEvent.type(screen.getByLabelText(/max output/i), "4096");
    await userEvent.click(screen.getByRole("button", { name: /stage model/i }));

    expect(putModel).toHaveBeenCalledWith("new-model", {
      display_name: "New Model",
      description: "Test model",
      context_window: 32000,
      max_output_tokens: 4096
    });
    expect(await screen.findByText(/staged change #10/i)).toBeInTheDocument();
  });
});
