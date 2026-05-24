import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { renderWithConsoleProviders } from "../test/renderWithConsoleProviders";
import * as management from "../rpc/management";
import { AppShell } from "./App";
import { ConfigPage } from "../features/config/ConfigPage";

describe("AppShell", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("shows a global apply action and omits the changes navigation entry", async () => {
    vi.spyOn(management, "getChanges").mockResolvedValue([]);
    vi.spyOn(management, "applyChanges").mockResolvedValue({ status: "success", message: "applied" });
    vi.spyOn(management, "discardChanges").mockResolvedValue({ status: "success", message: "discarded" });

    renderWithConsoleProviders(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /^apply$/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /changes/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^apply$/i }));

    expect(await screen.findByRole("dialog", { name: /apply changes/i })).toBeInTheDocument();
  });

  test("global apply submits current config edits before opening the preview", async () => {
    vi.spyOn(management, "getEffectiveConfig").mockResolvedValue({});
    vi.spyOn(management, "getDefaults").mockResolvedValue({
      model: "moonbridge",
      max_tokens: 4096,
      system_prompt: ""
    });
    vi.spyOn(management, "getWebSearch").mockResolvedValue({
      support: "auto",
      max_uses: 4,
      tavily_api_key: "******",
      firecrawl_api_key: "******",
      search_max_rounds: 2
    });
    vi.spyOn(management, "exportConfig").mockResolvedValue("mode: Transform\n");
    vi.spyOn(management, "validateConfig").mockResolvedValue({ valid: true });
    vi.spyOn(management, "importConfig").mockResolvedValue({ changes: [], count: 0, message: "" });
    const putDefaults = vi
      .spyOn(management, "putDefaults")
      .mockResolvedValue({ change_id: 41, status: "pending" });
    const putWebSearch = vi
      .spyOn(management, "putWebSearch")
      .mockResolvedValue({ change_id: 42, status: "pending" });
    vi.spyOn(management, "getChanges").mockResolvedValue([
      { change_id: 41, resource: "setting", target: "defaults" },
      { change_id: 42, resource: "setting", target: "web_search" }
    ]);
    vi.spyOn(management, "applyChanges").mockResolvedValue({ status: "success", message: "applied" });
    vi.spyOn(management, "discardChanges").mockResolvedValue({ status: "success", message: "discarded" });

    renderWithConsoleProviders(
      <MemoryRouter>
        <AppShell content={<ConfigPage />} />
      </MemoryRouter>
    );

    const defaultModel = await screen.findByLabelText(/default model/i);
    await waitFor(() => expect(defaultModel).toHaveValue("moonbridge"));
    await userEvent.clear(defaultModel);
    await userEvent.type(defaultModel, "claude-sonnet");
    await userEvent.selectOptions(screen.getByLabelText(/web search support/i), "enabled");

    await userEvent.click(screen.getByRole("button", { name: /^apply$/i }));

    expect(putDefaults).toHaveBeenCalledWith(expect.objectContaining({ model: "claude-sonnet" }));
    expect(putWebSearch).toHaveBeenCalledWith(expect.objectContaining({ support: "enabled" }));
    expect(await screen.findByRole("dialog", { name: /apply changes/i })).toBeInTheDocument();
  });
});
