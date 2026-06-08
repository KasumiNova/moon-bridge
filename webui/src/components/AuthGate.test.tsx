import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithConsoleProviders } from "../test/renderWithConsoleProviders";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  REMEMBER_TOKEN_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  ApiError
} from "../rpc/http";
import { AuthGate } from "./AuthGate";

describe("AuthGate", () => {
  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test("renders children when there is no auth error", () => {
    renderWithConsoleProviders(<AuthGate>Console content</AuthGate>);

    expect(screen.getByText("Console content")).toBeInTheDocument();
  });

  test("saves token to session storage by default", async () => {
    const onTokenSaved = vi.fn();

    renderWithConsoleProviders(
      <AuthGate
        error={new ApiError(401, "invalid_auth", "missing token")}
        onTokenSaved={onTokenSaved}
      >
        Console content
      </AuthGate>
    );

    const tokenField = getMaterialTextField(document, "Token");
    const submitButton = getMaterialButton(document, "Save token");
    expect(tokenField.type).toBe("password");
    expect(tokenField).toHaveClass("material-text-field--single-line");
    expect(document.querySelector(".auth-field input")).not.toBeInTheDocument();
    expect(document.querySelector(".auth-card__submit")).not.toBeInTheDocument();
    expect(submitButton.type).toBe("submit");

    setMaterialTextFieldValue(tokenField, "secret-token");
    await submitAuthForm(submitButton);

    expect(submitButton).toBeInTheDocument();
    await waitFor(() => expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe("secret-token"));
    expect(localStorage.getItem(REMEMBER_TOKEN_STORAGE_KEY)).toBeNull();
    expect(onTokenSaved).toHaveBeenCalledTimes(1);
  });

  test("saves remembered token to local storage", async () => {
    renderWithConsoleProviders(
      <AuthGate error={new ApiError(401, "invalid_auth", "missing token")}>
        Console content
      </AuthGate>
    );

    const tokenField = getMaterialTextField(document, "Token");
    const rememberCheckbox = getMaterialCheckbox(document, "Remember on this device");
    expect(document.querySelector(".mb-checkbox-input")).not.toBeInTheDocument();
    expect(document.querySelector(".mb-checkbox-box")).not.toBeInTheDocument();

    setMaterialTextFieldValue(tokenField, "remembered-token");
    setMaterialCheckboxChecked(rememberCheckbox, true);
    await submitAuthForm(getMaterialButton(document, "Save token"));

    await waitFor(() => expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBe("remembered-token"));
    expect(localStorage.getItem(REMEMBER_TOKEN_STORAGE_KEY)).toBe(
      "remembered-token"
    );
  });
});

function getMaterialTextField(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-filled-text-field")).find(
    (textField) => (textField as HTMLElement & { label: string }).label === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web text field labelled "${label}".`);
  }
  return element as HTMLElement & { label: string; type: string; value: string };
}

function getMaterialCheckbox(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-checkbox")).find(
    (checkbox) => checkbox.getAttribute("aria-label") === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web checkbox labelled "${label}".`);
  }
  return element as HTMLElement & { checked: boolean };
}

function getMaterialButton(container: ParentNode, label: string) {
  const element = Array.from(container.querySelectorAll("md-filled-button")).find(
    (button) => button.textContent?.trim() === label
  );
  if (!element) {
    throw new Error(`Expected a Material Web filled button labelled "${label}".`);
  }
  return element as HTMLElement & { type: string };
}

function setMaterialTextFieldValue(element: HTMLElement & { value: string }, value: string) {
  act(() => {
    element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function setMaterialCheckboxChecked(element: HTMLElement & { checked: boolean }, checked: boolean) {
  act(() => {
    element.checked = checked;
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function submitAuthForm(button: HTMLElement) {
  const form = button.closest("form");
  if (!form) {
    throw new Error("Expected Material Web submit button inside AuthGate form.");
  }
  let clicked = false;
  let submitted = false;
  button.addEventListener("click", () => {
    clicked = true;
  }, { once: true });
  form.addEventListener("submit", () => {
    submitted = true;
  }, { once: true });
  await userEvent.click(button);
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(clicked).toBe(true);
  if (!submitted) {
    await act(async () => {
      form.requestSubmit();
      await Promise.resolve();
    });
  }
}
