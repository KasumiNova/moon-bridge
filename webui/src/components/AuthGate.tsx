import { useQueryClient } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useState } from "react";
import { type ApiError, isAuthError, saveToken } from "../rpc/http";

type AuthGateProps = {
  children: ReactNode;
  error?: unknown;
  onTokenSaved?: () => void;
};

export function AuthGate({ children, error, onTokenSaved }: AuthGateProps) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState("");
  const [remember, setRemember] = useState(false);

  if (!isAuthError(error)) {
    return <>{children}</>;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = token.trim();
    if (!value) {
      return;
    }
    saveToken(value, remember);
    queryClient.invalidateQueries();
    onTokenSaved?.();
  }

  const apiError = error as ApiError;

  return (
    <main className="auth-gate" aria-labelledby="auth-title">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">Authentication required</p>
        <h1 id="auth-title">输入 Moon Bridge Token</h1>
        <p>{apiError.message}</p>
        <label>
          Token
          <input
            autoFocus
            type="password"
            value={token}
            onChange={(event) => setToken(event.currentTarget.value)}
          />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.currentTarget.checked)}
          />
          Remember on this device
        </label>
        <button type="submit">Save token</button>
      </form>
    </main>
  );
}
