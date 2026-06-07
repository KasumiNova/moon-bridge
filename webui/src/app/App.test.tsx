import { screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { renderWithConsoleProviders } from "../test/renderWithConsoleProviders";
import { AppShell } from "./App";

describe("AppShell", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("shows the config graph navigation surface without staged apply", () => {
    renderWithConsoleProviders(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>
    );

    const labels = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".navigation-rail a")
    ).map((link) => link.querySelector("span")?.textContent);

    expect(labels).toEqual([
      "Overview",
      "Models & Providers",
      "Routes",
      "Defaults",
      "Search & Tools",
      "Storage",
      "Security",
      "Logs"
    ]);
    expect(document.querySelector(".navigation-rail")?.textContent).not.toContain("Config");
    expect(document.querySelector(".navigation-rail")?.textContent).not.toContain("RPC Test");
    expect(document.querySelector(".navigation-rail")?.textContent).not.toContain("Extensions");
    expect(screen.queryByRole("button", { name: /^apply$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: /apply changes/i })).not.toBeInTheDocument();
  });

  test("keeps shell actions limited to locale and theme controls", () => {
    renderWithConsoleProviders(
      <MemoryRouter>
        <AppShell content={<div>Console content</div>} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /switch to/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /apply/i })).not.toBeInTheDocument();
  });
});
