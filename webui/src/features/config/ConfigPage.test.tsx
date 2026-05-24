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

  test("hides the visual generator by default and validates raw YAML", async () => {
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

    expect(screen.queryByRole("button", { name: /generate yaml/i })).not.toBeInTheDocument();
    const editor = await screen.findByLabelText(/yaml editor/i);
    await userEvent.clear(editor);
    await userEvent.type(editor, "mode: Transform");
    await userEvent.click(screen.getByRole("button", { name: /^validate$/i }));

    expect(validate).toHaveBeenCalledWith("mode: Transform");
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
      message: ""
    });

    renderWithConsoleProviders(<ConfigPage />);

    await userEvent.clear(await screen.findByLabelText(/yaml editor/i));
    await userEvent.type(screen.getByLabelText(/yaml editor/i), "mode: Transform");
    await userEvent.click(screen.getByRole("button", { name: /import/i }));

    expect(importConfig).toHaveBeenCalledWith("mode: Transform");
    expect(await screen.findByText(/1 edits ready to apply/i)).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(/include secrets/i));
    await userEvent.click(screen.getByRole("button", { name: /export/i }));

    expect(exportConfig).toHaveBeenLastCalledWith({ includeSecrets: true });
  });

  test("keeps edited defaults and web search local for the global apply action", async () => {
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
      message: ""
    });

    renderWithConsoleProviders(<ConfigPage />);

    const defaultModel = await screen.findByLabelText(/default model/i);
    await waitFor(() => expect(defaultModel).toHaveValue("moonbridge"));
    await userEvent.clear(defaultModel);
    await userEvent.type(defaultModel, "claude-sonnet");
    expect(putDefaults).not.toHaveBeenCalled();
    expect(screen.getByText(/unsaved edits/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /stage defaults/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /send defaults/i })).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText(/web search support/i), "enabled");
    expect(putWebSearch).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /stage web search/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/tavily api key/i)).toHaveValue("******");
  });
});
