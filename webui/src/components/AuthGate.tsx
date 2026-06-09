import { useQueryClient } from "@tanstack/react-query";
import { createElement, type FormEvent, type ReactNode, useState } from "react";
import { motion } from "motion/react";
import { MaterialFilledButton } from "./MaterialButton";
import { MaterialCheckbox } from "./MaterialCheckbox";
import { MaterialFilledTextField } from "./MaterialTextField";
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
        <MaterialFilledTextField
          autoFocus
          className="auth-token-field"
          label={t("auth.token")}
          type="password"
          value={token}
          onInput={setToken}
        />
        <label className="auth-remember">
          <MaterialCheckbox
            checked={remember}
            label={t("auth.remember")}
            onChange={setRemember}
          />
          <span>{t("auth.remember")}</span>
        </label>
        <MaterialFilledButton className="auth-submit" type="submit">
          {t("action.saveToken")}
        </MaterialFilledButton>
      </motion.form>
    </main>
  );
}
