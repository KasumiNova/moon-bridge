import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import * as configGraph from "../../rpc/configGraph";
import { configGraphFixture } from "../../test/configGraphFixtures";
import { SecurityPage } from "./SecurityPage";

describe("SecurityPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders server security fields with write-only auth token", async () => {
    vi.spyOn(configGraph, "getConfigGraph").mockResolvedValue(configGraphFixture());

    renderWithConsoleProviders(<SecurityPage />);

    expect(await screen.findByRole("heading", { level: 2, name: "Server" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("Server")).getByRole("heading", { level: 3, name: "main" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("Server main status")).getByText("Restart required")).toBeInTheDocument();
    expect(within(screen.getByLabelText("Server main status")).getByText("Critical")).toBeInTheDocument();
    expect(screen.getByLabelText("Address")).toHaveValue(":38440");
    expect(screen.getByLabelText("Max Sessions")).toHaveValue(64);
    expect(screen.getByLabelText("Session TTL")).toHaveValue("24h");
    expect(screen.getByLabelText("Auth Token")).toHaveValue("");
    expect(screen.queryByDisplayValue("******")).not.toBeInTheDocument();
    expect(screen.getByText("Restart required")).toBeInTheDocument();
  });
});
