import "@material/web/button/text-button.js";
import "@material/web/button/filled-button.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/ripple/ripple.js";
import { createElement, type ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { motion } from "motion/react";
import { type Locale } from "../i18n/messages";
import { useI18n } from "../i18n/I18nProvider";
import { useConsoleTheme } from "../theme/ThemeProvider";

const navItems = [
  { to: "/overview", icon: "dashboard", labelKey: "nav.overview" },
  { to: "/models-providers", icon: "hub", labelKey: "nav.modelsProviders" },
  { to: "/routes", icon: "alt_route", labelKey: "nav.routes" },
  { to: "/defaults", icon: "rule_settings", labelKey: "nav.defaults" },
  { to: "/search-tools", icon: "travel_explore", labelKey: "nav.searchTools" },
  { to: "/storage", icon: "database", labelKey: "nav.storage" },
  { to: "/security", icon: "shield", labelKey: "nav.security" },
  { to: "/logs", icon: "article", labelKey: "nav.logs" }
] as const;

export function App() {
  return <AppShell content={<Outlet />} />;
}

export function AppShell({ content }: { content?: ReactNode }) {
  return <AppShellContent content={content} />;
}

function AppShellContent({ content }: { content?: ReactNode }) {
  const { theme, toggleTheme } = useConsoleTheme();
  const { locale, setLocale, t } = useI18n();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const themeIcon = theme === "dark" ? "light_mode" : "dark_mode";
  const nextThemeLabel = t(nextTheme === "dark" ? "theme.dark" : "theme.light");

  return (
    <div className="app-shell">
      <style>{shellStyles}</style>
      <header className="top-app-bar">
        <div>
          <p>Moon Bridge</p>
          <strong>{t("app.console")}</strong>
        </div>
        <div className="top-app-bar__meta">
          <span>{t("app.sameOriginApi")}</span>
          <span>{t("app.runtimeApi")}</span>
          <label className="locale-switch">
            <span>{t("app.language")}</span>
            <select
              id="console-locale"
              name="console-locale"
              value={locale}
              onChange={(event) => setLocale(event.currentTarget.value as Locale)}
            >
              <option value="zh-CN">{t("app.language.zh")}</option>
              <option value="en-US">{t("app.language.en")}</option>
            </select>
          </label>
          {createElement(
            "md-icon-button",
            {
              "aria-label": t("app.switchTheme", { theme: nextThemeLabel }),
              role: "button",
              onClick: toggleTheme
            },
            createElement("md-icon", null, themeIcon)
          )}
        </div>
      </header>

      <div className="workspace">
        <nav className="navigation-rail" aria-label={t("app.consoleSections")}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-item nav-item--active" : "nav-item"
              }
            >
              {createElement("md-icon", null, item.icon)}
              <span>{t(item.labelKey)}</span>
              {createElement("md-ripple")}
            </NavLink>
          ))}
        </nav>

        <motion.main
          className="content-surface"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          {content ?? <Outlet />}
        </motion.main>
      </div>
    </div>
  );
}

const shellStyles = `
  :root {
    color-scheme: dark;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
    background: var(--mb-color-surface);
    color: var(--mb-color-on-surface);
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  :root[data-theme="light"] {
    color-scheme: light;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    background: var(--mb-color-surface);
  }

  .app-shell {
    min-height: 100vh;
    background:
      linear-gradient(180deg, rgba(122, 167, 162, 0.08), transparent 260px),
      var(--mb-color-surface);
  }

  .top-app-bar {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    min-height: 72px;
    padding: 12px 24px;
    border-bottom: 1px solid color-mix(in srgb, var(--mb-color-outline) 36%, transparent);
    background: color-mix(in srgb, var(--mb-color-surface) 92%, transparent);
    backdrop-filter: blur(16px);
  }

  .top-app-bar p,
  .top-app-bar strong {
    margin: 0;
  }

  .top-app-bar p {
    color: var(--mb-color-on-surface-variant);
    font-size: 0.75rem;
    line-height: 1.2;
  }

  .top-app-bar strong {
    display: block;
    font-size: 1.25rem;
    line-height: 1.2;
    font-weight: 650;
  }

  .top-app-bar__meta {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .top-app-bar__meta span {
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 42%, transparent);
    border-radius: 8px;
    padding: 0 10px;
    background: var(--mb-color-surface-container);
  }

  .locale-switch {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .locale-switch select {
    min-height: 38px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 45%, transparent);
    border-radius: 8px;
    padding: 0 8px;
    color: var(--mb-color-on-surface);
    background: var(--mb-color-surface-container);
    font: inherit;
  }

  .top-action-button,
  button {
    min-height: 40px;
    border: 0;
    border-radius: 999px; /* MD3 Pill */
    padding: 0 14px;
    color: var(--mb-color-on-primary);
    background: var(--mb-color-primary);
    font: inherit;
    font-weight: 650;
    cursor: pointer;
    transition: background-color var(--mb-motion-standard), box-shadow var(--mb-motion-standard);
  }

  button:disabled {
    cursor: progress;
    opacity: 0.7;
  }

  .secondary-button,
  .icon-text-button {
    border-radius: 999px;
    color: var(--mb-color-on-surface);
    background: var(--mb-color-surface-container-high);
  }

  md-filled-button {
    --md-filled-button-container-color: var(--mb-color-primary);
    --md-filled-button-label-text-color: var(--mb-color-on-primary);
    --md-filled-button-container-shape: 999px;
  }

  md-icon-button {
    --md-icon-button-icon-color: var(--mb-color-on-surface);
    --md-icon-button-hover-icon-color: var(--mb-color-primary);
    --md-icon-button-pressed-icon-color: var(--mb-color-primary);
  }

  .workspace {
    display: grid;
    grid-template-columns: 128px minmax(0, 1fr);
    min-height: calc(100vh - 72px);
  }

  .navigation-rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 10px;
    border-right: 1px solid color-mix(in srgb, var(--mb-color-outline) 34%, transparent);
    background: var(--mb-color-surface);
  }

  .nav-item {
    position: relative;
    overflow: hidden;
    width: 108px;
    min-height: 76px;
    display: grid;
    place-items: center;
    gap: 3px;
    padding: 8px 4px;
    border-radius: 16px; /* MD3 Nav item shape */
    color: var(--mb-color-on-surface-variant);
    text-decoration: none;
    transition:
      background var(--mb-motion-standard),
      color var(--mb-motion-standard);
  }

  .nav-item span {
    max-width: 96px;
    font-size: 0.6875rem;
    line-height: 1.1;
    text-align: center;
    white-space: normal;
  }

  .nav-item--active {
    color: var(--mb-color-on-primary-container);
    background: var(--mb-color-primary-container);
  }

  .content-surface {
    min-width: 0;
    padding: 24px;
  }

  .placeholder-panel {
    min-height: calc(100vh - 120px);
    display: flex;
    align-items: center;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 34%, transparent);
    border-radius: 8px;
    padding: 32px;
    background: var(--mb-color-surface-container);
    box-shadow: 0 4px 8px color-mix(in srgb, var(--mb-color-shadow) 15%, transparent);
  }

  .placeholder-panel > div {
    max-width: 760px;
  }

  .eyebrow {
    margin: 0 0 10px;
    color: var(--mb-color-primary);
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 3.5rem);
    line-height: 1.05;
    font-weight: 650;
  }

  .placeholder-panel p:last-child {
    margin: 18px 0 0;
    max-width: 620px;
    color: var(--mb-color-on-surface-variant);
    font-size: 1rem;
    line-height: 1.6;
  }

  .page-stack {
    display: grid;
    gap: 18px;
  }

  .page-header {
    max-width: 920px;
  }

  .page-header h1 {
    font-size: 2rem;
    line-height: 1.15;
  }

  .page-header p:last-child {
    margin: 12px 0 0;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.95rem;
    line-height: 1.55;
  }

  .metric-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .metric-card,
  .content-panel,
  .state-panel {
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 34%, transparent);
    border-radius: 8px;
    background: var(--mb-color-surface-container);
    box-shadow: 0 1px 3px color-mix(in srgb, var(--mb-color-shadow) 15%, transparent);
  }

  .metric-card {
    min-height: 112px;
    display: grid;
    align-content: space-between;
    gap: 18px;
    padding: 18px;
  }

  .metric-card span {
    color: var(--mb-color-on-surface-variant);
    font-size: 0.78rem;
    font-weight: 650;
    text-transform: uppercase;
  }

  .metric-card strong {
    overflow-wrap: anywhere;
    font-size: 1.65rem;
    line-height: 1.1;
    font-weight: 680;
  }

  .section-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
    gap: 16px;
  }

  .content-panel,
  .state-panel {
    min-width: 0;
    padding: 20px;
  }

  .state-panel {
    min-height: 280px;
    display: grid;
    align-content: center;
  }

  .content-panel h2,
  .state-panel h2 {
    margin: 0 0 14px;
    font-size: 1rem;
    line-height: 1.3;
  }

  .content-panel--subtle {
    background: color-mix(in srgb, var(--mb-color-surface-container) 74%, var(--mb-color-surface));
  }

  .state-panel p:last-child {
    margin: 0;
    color: var(--mb-color-on-surface-variant);
    line-height: 1.55;
  }

  .compact-list {
    display: grid;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .compact-list li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid color-mix(in srgb, var(--mb-color-outline) 24%, transparent);
  }

  .compact-list li:first-child {
    border-top: 0;
  }

  .compact-list strong,
  .compact-list span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .compact-list span,
  .empty-state {
    color: var(--mb-color-on-surface-variant);
  }

  .empty-state {
    margin: 0;
    line-height: 1.55;
  }

  .table-scroll {
    overflow-x: auto;
  }

  .resource-table {
    width: 100%;
    min-width: 720px;
    border-collapse: collapse;
    font-size: 0.92rem;
  }

  .resource-table th,
  .resource-table td {
    padding: 13px 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--mb-color-outline) 28%, transparent);
    text-align: left;
    vertical-align: top;
  }

  .resource-table th {
    color: var(--mb-color-on-surface-variant);
    font-size: 0.74rem;
    font-weight: 720;
    text-transform: uppercase;
  }

  .resource-table td {
    overflow-wrap: anywhere;
  }

  .resource-table tbody tr:hover {
    background: color-mix(in srgb, var(--mb-color-primary) 7%, transparent);
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    border-radius: 8px;
    padding: 0 9px;
    color: var(--mb-color-on-primary-container);
    background: var(--mb-color-primary-container);
    font-size: 0.8rem;
    font-weight: 650;
  }

  .status-pill--muted {
    color: var(--mb-color-on-surface);
    background: var(--mb-color-surface-container-high);
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 18px;
    align-items: start;
  }

  .form-grid label,
  .form-field {
    display: grid;
    gap: 8px;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.82rem;
    font-weight: 650;
    min-width: 0;
  }

  .form-field label {
    display: grid;
    gap: 6px;
    color: inherit;
    font: inherit;
  }

  .form-grid input,
  .form-grid select,
  .form-grid textarea,
  .textarea-field textarea {
    width: 100%;
    min-height: 48px;
    border: 0;
    border-bottom: 1px solid var(--mb-color-on-surface-variant);
    border-radius: 4px 4px 0 0;
    padding: 10px 12px;
    color: var(--mb-color-on-surface);
    background: var(--mb-color-surface-container-high);
    font: inherit;
    transition:
      border-color var(--mb-motion-standard),
      box-shadow var(--mb-motion-standard),
      background var(--mb-motion-standard);
  }

  .form-grid input:hover,
  .form-grid select:hover,
  .form-grid textarea:hover,
  .textarea-field textarea:hover {
    border-color: color-mix(in srgb, var(--mb-color-primary) 72%, var(--mb-color-outline));
  }

  .form-grid input:focus,
  .form-grid select:focus,
  .form-grid textarea:focus,
  .textarea-field textarea:focus {
    outline: 0;
    border-color: var(--mb-color-primary);
    border-bottom: 2px solid var(--mb-color-primary);
  }

  .form-grid__wide,
  .form-actions {
    grid-column: 1 / -1;
  }

  .form-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .feedback-inline,
  .feedback-banner {
    color: var(--mb-color-primary);
    font-weight: 650;
  }

  .edit-state-banner {
    margin: 0;
    border: 1px solid color-mix(in srgb, var(--mb-color-primary) 40%, transparent);
    border-radius: 8px;
    padding: 12px 14px;
    background: color-mix(in srgb, var(--mb-color-primary-container) 42%, var(--mb-color-surface));
  }

  .textarea-field {
    display: grid;
    gap: 8px;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.82rem;
    font-weight: 650;
  }

  .textarea-field textarea {
    min-height: 360px;
    resize: vertical;
    font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
    line-height: 1.45;
  }

  .field-hint {
    display: block;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.76rem;
    line-height: 1.45;
    font-weight: 450;
    overflow-wrap: anywhere;
  }

  .field-hint span {
    display: inline-block;
  }

  .checkbox-inline {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.9rem;
  }

  .json-block {
    max-height: 420px;
    overflow: auto;
    margin: 0;
    border-radius: 8px;
    padding: 14px;
    color: var(--mb-color-on-surface);
    background: var(--mb-color-surface);
    font-size: 0.82rem;
    line-height: 1.45;
  }

  .button-list {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .active-button {
    outline: 2px solid var(--mb-color-primary);
    outline-offset: 2px;
  }

  .change-drawer {
    position: fixed;
    top: 88px;
    right: 18px;
    z-index: 5;
    width: min(420px, calc(100vw - 36px));
    max-height: calc(100vh - 112px);
    overflow: auto;
    display: grid;
    gap: 16px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 44%, transparent);
    border-radius: 8px;
    padding: 18px;
    background: var(--mb-color-surface-container-high);
    box-shadow: 0 24px 80px color-mix(in srgb, var(--mb-color-shadow) 34%, transparent);
  }

  .dialog-scrim {
    position: fixed;
    inset: 0;
    z-index: 4;
    display: grid;
    place-items: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.42);
  }

  .apply-dialog {
    width: min(640px, 100%);
    max-height: min(720px, calc(100vh - 48px));
    overflow: auto;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 38%, transparent);
    border-radius: 28px;
    padding: 22px;
    background: var(--mb-color-surface-container);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.34);
  }

  .drawer-header,
  .drawer-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .drawer-header h2 {
    margin: 0;
    font-size: 1.1rem;
  }

  .drawer-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .change-list {
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .change-list li {
    display: grid;
    gap: 8px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 28%, transparent);
    border-radius: 8px;
    padding: 12px;
    background: var(--mb-color-surface);
  }

  .change-list li > div {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .change-list strong,
  .change-list p {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .change-list p {
    margin: 0;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.85rem;
    line-height: 1.45;
  }

  @media (max-width: 760px) {
    .top-app-bar {
      align-items: flex-start;
      flex-direction: column;
      padding: 14px 16px;
    }

    .top-app-bar__meta {
      width: 100%;
      flex-wrap: wrap;
      justify-content: flex-start;
      white-space: normal;
    }

    .workspace {
      grid-template-columns: 1fr;
    }

    .navigation-rail {
      position: sticky;
      top: 103px;
      z-index: 1;
      flex-direction: row;
      align-items: stretch;
      justify-content: flex-start;
      overflow-x: auto;
      padding: 10px 12px;
      border-right: 0;
      border-bottom: 1px solid color-mix(in srgb, var(--mb-color-outline) 34%, transparent);
    }

    .nav-item {
      flex: 0 0 108px;
    }

    .content-surface {
      padding: 16px;
    }

    .placeholder-panel {
      min-height: 440px;
      padding: 24px;
    }

    .metric-grid,
    .section-grid {
      grid-template-columns: 1fr;
    }

    .compact-list li {
      grid-template-columns: 1fr;
      gap: 4px;
    }

    .resource-table {
      min-width: 640px;
    }

    .form-grid,
    .section-grid {
      grid-template-columns: 1fr;
    }

    .change-drawer {
      top: 12px;
      right: 12px;
      left: 12px;
      width: auto;
      max-height: calc(100vh - 24px);
    }
  }
`;
