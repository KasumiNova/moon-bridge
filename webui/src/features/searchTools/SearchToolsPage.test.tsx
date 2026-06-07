import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import * as configGraph from "../../rpc/configGraph";
import { configGraphFixture } from "../../test/configGraphFixtures";
import { SearchToolsPage } from "./SearchToolsPage";

describe("SearchToolsPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders web search, extensions, and proxy graph resources without YAML controls", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    renderWithConsoleProviders(<SearchToolsPage />);

    expect(await screen.findByRole("heading", { level: 2, name: "Web Search" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Extensions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Proxy" })).toBeInTheDocument();

    const webSearch = screen.getByLabelText("Web Search");
    expect(within(webSearch).getByRole("heading", { level: 3, name: "main" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("Web Search main status")).getByText("Saved")).toBeInTheDocument();
    expect(within(screen.getByLabelText("Extension db_sqlite status")).getByText("Saved")).toBeInTheDocument();
    expect(within(screen.getByLabelText("Proxy main status")).getByText("Critical")).toBeInTheDocument();

    expect(screen.getByLabelText("Support")).toHaveValue("auto");
    expect(screen.getByText("db_sqlite")).toBeInTheDocument();
    expect(screen.getByLabelText("Response Proxy")).toBeInTheDocument();
    expect(screen.queryByLabelText(/yaml/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/yaml/i)).not.toBeInTheDocument();
  });
});
