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

  test("localizes page chrome in Chinese locale", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    renderWithConsoleProviders(<SearchToolsPage />, { locale: "zh-CN" });

    expect(await screen.findByRole("heading", { level: 2, name: "联网搜索" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "扩展" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "代理" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("代理 main status")).getByText("关键运行时")).toBeInTheDocument();
  });
});
