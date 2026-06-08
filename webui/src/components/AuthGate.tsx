import { useQueryClient } from "@tanstack/react-query";
import { createElement, type FormEvent, type ReactNode, useState } from "react";
import { motion } from "motion/react";
import { type ApiError, isAuthError, saveToken } from "../rpc/http";
import { useI18n } from "../i18n/I18nProvider";
import { springs, surfaceMotion } from "../theme/motion";

type AuthGateProps = {
  children: ReactNode;
  error?: unknown;
  onTokenSaved?: () => void;
};

export function AuthGate({ children, error, onTokenSaved }: AuthGateProps) {
  const { t } = useI18n();
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
      <motion.form
        className="auth-card"
        onSubmit={submit}
        initial={surfaceMotion.initial}
        animate={surfaceMotion.animate}
        transition={surfaceMotion.transition}
      >
        <motion.span
          className="auth-card__badge"
          aria-hidden="true"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={springs.spatial}
        >
          {createElement("md-icon", null, "shield_lock")}
        </motion.span>
        <p className="eyebrow">{t("auth.eyebrow")}</p>
        <h1 id="auth-title">{t("auth.title")}</h1>
        <p className="auth-card__message">{apiError.message}</p>
        <label className="auth-field">
          <span className="auth-field__label">Token</span>
          <input
            autoFocus
            type="password"
            value={token}
            onChange={(event) => setToken(event.currentTarget.value)}
          />
        </label>
        <label className="mb-checkbox-field">
          <input
            className="mb-checkbox-input"
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.currentTarget.checked)}
          />
          <span className="mb-checkbox-box" aria-hidden="true">
            {createElement("md-icon", null, "check")}
          </span>
          <span>{t("auth.remember")}</span>
        </label>
        <button type="submit" className="auth-card__submit">
          {t("action.saveToken")}
        </button>
      </motion.form>
    </main>
  );
}

