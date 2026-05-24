import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  REMEMBER_TOKEN_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  ApiError
} from "../rpc/http";
import { AuthGate } from "./AuthGate";

function renderWithQueryClient(ui: React.ReactElement) {
  const client = new QueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("AuthGate", () => {
  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test("renders children when there is no auth error", () => {
    renderWithQueryClient(<AuthGate>Console content</AuthGate>);

    expect(screen.getByText("Console content")).toBeInTheDocument();
  });

  test("saves token to session storage by default", async () => {
    const onTokenSaved = vi.fn();

    renderWithQueryClient(
      <AuthGate
        error={new ApiError(401, "invalid_auth", "missing token")}
        onTokenSaved={onTokenSaved}
      >
        Console content
      </AuthGate>
    );

    await userEvent.type(screen.getByLabelText(/^token$/i), "secret-token");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe("secret-token");
    expect(localStorage.getItem(REMEMBER_TOKEN_STORAGE_KEY)).toBeNull();
    expect(onTokenSaved).toHaveBeenCalledTimes(1);
  });

  test("saves remembered token to local storage", async () => {
    renderWithQueryClient(
      <AuthGate error={new ApiError(401, "invalid_auth", "missing token")}>
        Console content
      </AuthGate>
    );

    await userEvent.type(screen.getByLabelText(/^token$/i), "remembered-token");
    await userEvent.click(screen.getByLabelText(/remember/i));
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe("remembered-token");
    expect(localStorage.getItem(REMEMBER_TOKEN_STORAGE_KEY)).toBe(
      "remembered-token"
    );
  });
});
