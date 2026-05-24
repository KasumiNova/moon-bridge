import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as management from "../../rpc/management";
import { ConfigPage } from "./ConfigPage";



describe("ConfigPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("generates YAML and validates it", async () => {
    vi.spyOn(management, "getEffectiveConfig").mockResolvedValue({});
    vi.spyOn(management, "exportConfig").mockResolvedValue("mode: Transform\n");
    const validate = vi
      .spyOn(management, "validateConfig")
      .mockResolvedValue({ valid: true });
    vi.spyOn(management, "importConfig").mockResolvedValue({
      changes: [],
      count: 0,
      message: "imported"
    });

    renderWithConsoleProviders(<ConfigPage />);

    await userEvent.clear(await screen.findByLabelText(/provider key/i));
    await userEvent.type(screen.getByLabelText(/provider key/i), "preview");
    await userEvent.click(screen.getByRole("button", { name: /generate yaml/i }));
    expect(screen.getByDisplayValue(/providers:/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^validate$/i }));

    expect(validate).toHaveBeenCalledWith(expect.stringContaining("preview:"));
    expect(await screen.findByText(/valid config/i)).toBeInTheDocument();
  });

  test("imports raw YAML and exports with secret confirmation", async () => {
    vi.spyOn(management, "getEffectiveConfig").mockResolvedValue({});
    const exportConfig = vi
      .spyOn(management, "exportConfig")
      .mockResolvedValue("mode: Transform\n");
    vi.spyOn(management, "validateConfig").mockResolvedValue({ valid: true });
    const importConfig = vi.spyOn(management, "importConfig").mockResolvedValue({
      changes: [{ change_id: 1, resource: "model", target: "claude-sonnet" }],
      count: 1,
      message: "staged"
    });

    renderWithConsoleProviders(<ConfigPage />);

    await userEvent.clear(await screen.findByLabelText(/yaml editor/i));
    await userEvent.type(screen.getByLabelText(/yaml editor/i), "mode: Transform");
    await userEvent.click(screen.getByRole("button", { name: /import/i }));

    expect(importConfig).toHaveBeenCalledWith("mode: Transform");
    expect(await screen.findByText("staged")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(/include secrets/i));
    await userEvent.click(screen.getByRole("button", { name: /export/i }));

    expect(exportConfig).toHaveBeenLastCalledWith({ includeSecrets: true });
  });

  test("stages defaults and web search settings", async () => {
    vi.spyOn(management, "getEffectiveConfig").mockResolvedValue({});
    vi.spyOn(management, "exportConfig").mockResolvedValue("mode: Transform\n");
    vi.spyOn(management, "getDefaults").mockResolvedValue({
      model: "moonbridge",
      max_tokens: 4096,
      system_prompt: ""
    });
    vi.spyOn(management, "getWebSearch").mockResolvedValue({
      support: "auto",
      max_uses: 4,
      tavily_api_key: "****",
      firecrawl_api_key: "****",
      search_max_rounds: 2
    });
    const putDefaults = vi
      .spyOn(management, "putDefaults")
      .mockResolvedValue({ change_id: 31, status: "pending" });
    const putWebSearch = vi
      .spyOn(management, "putWebSearch")
      .mockResolvedValue({ change_id: 32, status: "pending" });
    vi.spyOn(management, "validateConfig").mockResolvedValue({ valid: true });
    vi.spyOn(management, "importConfig").mockResolvedValue({
      changes: [],
      count: 0,
      message: "staged"
    });

    renderWithConsoleProviders(<ConfigPage />);

    const defaultModel = await screen.findByLabelText(/default model/i);
    await waitFor(() => expect(defaultModel).toHaveValue("moonbridge"));
    await userEvent.clear(defaultModel);
    await userEvent.type(defaultModel, "claude-sonnet");
    await userEvent.click(screen.getByRole("button", { name: /stage defaults/i }));
    expect(putDefaults).toHaveBeenCalledWith(expect.objectContaining({
      model: "claude-sonnet"
    }));

    await userEvent.selectOptions(screen.getByLabelText(/web search support/i), "enabled");
    await userEvent.click(screen.getByRole("button", { name: /stage web search/i }));
    expect(putWebSearch).toHaveBeenCalledWith(expect.objectContaining({
      support: "enabled"
    }));
  });
});
