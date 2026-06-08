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
  { to: "/security", icon: "shield", labelKey: "nav.security" }
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
          <div className="locale-switch" role="group" aria-label={t("app.language")}>
            <span>{t("app.language")}</span>
            {(["en-US", "zh-CN"] as const).map((nextLocale) => (
              <button
                key={nextLocale}
                type="button"
                className={locale === nextLocale ? "locale-option locale-option--active" : "locale-option"}
                aria-pressed={locale === nextLocale}
                onClick={() => setLocale(nextLocale as Locale)}
              >
                {t(nextLocale === "en-US" ? "app.language.en" : "app.language.zh")}
              </button>
            ))}
          </div>
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
          aria-label={t("app.routeContent")}
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
    min-height: 68px;
    padding: 10px 24px;
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

  .top-app-bar__meta > span {
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 42%, transparent);
    border-radius: 8px;
    padding: 0 10px;
    background: var(--mb-color-surface-container);
  }

  .locale-switch {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 42%, transparent);
    border-radius: 8px;
    padding: 3px;
    background: var(--mb-color-surface-container);
  }

  .locale-switch > span {
    min-height: 30px;
    display: inline-flex;
    align-items: center;
    padding: 0 7px;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .locale-option {
    min-height: 30px;
    border-radius: 6px;
    padding: 0 9px;
    color: var(--mb-color-on-surface);
    background: transparent;
    font: inherit;
    font-size: 0.82rem;
    box-shadow: none;
  }

  .locale-option:hover,
  .locale-option:focus-visible {
    background: color-mix(in srgb, var(--mb-color-primary) 14%, transparent);
  }

  .locale-option--active {
    color: var(--mb-color-on-primary);
    background: var(--mb-color-primary);
    box-shadow: var(--mb-elevation-1);
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
      color var(--mb-motion-standard),
      transform var(--mb-motion-standard);
  }

  .nav-item::before {
    content: "";
    position: absolute;
    top: 10px;
    left: 10px;
    bottom: 10px;
    width: 3px;
    border-radius: 999px;
    background: transparent;
    transition: background var(--mb-motion-standard);
  }

  .nav-item:hover {
    color: var(--mb-color-on-surface);
    background: color-mix(in srgb, var(--mb-color-primary-container) 46%, transparent);
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

  .nav-item--active::before {
    background: var(--mb-color-primary);
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
    gap: 20px;
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

  .usage-dashboard {
    display: grid;
    gap: 16px;
  }

  .panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .panel-heading h2,
  .panel-heading p {
    margin: 0;
  }

  .panel-heading h2 {
    font-size: 1rem;
    line-height: 1.25;
  }

  .panel-heading p {
    margin-top: 5px;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.86rem;
    line-height: 1.45;
  }

  .usage-summary-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 10px;
  }

  .usage-metric {
    min-width: 0;
    display: grid;
    gap: 8px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 26%, transparent);
    border-radius: 8px;
    padding: 12px;
    background: var(--mb-color-surface-container-high);
  }

  .usage-metric span {
    color: var(--mb-color-on-surface-variant);
    font-size: 0.72rem;
    font-weight: 720;
    text-transform: uppercase;
  }

  .usage-metric strong {
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 1.05rem;
    line-height: 1.15;
  }

  .usage-chart-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .usage-chart {
    min-width: 0;
    display: grid;
    gap: 12px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 26%, transparent);
    border-radius: 8px;
    padding: 12px;
    background: color-mix(in srgb, var(--mb-color-surface-container-high) 76%, var(--mb-color-surface));
  }

  .usage-chart:focus {
    outline: 2px solid var(--mb-color-primary);
    outline-offset: 2px;
  }

  .usage-chart__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .usage-chart__header h3 {
    margin: 0;
    font-size: 0.88rem;
    line-height: 1.25;
  }

  .usage-chart__header span {
    color: var(--mb-color-on-surface-variant);
    font-size: 0.78rem;
    font-weight: 700;
  }

  .usage-chart__bar {
    overflow: hidden;
    display: flex;
    min-height: 14px;
    border-radius: 999px;
    background: var(--mb-color-surface-container);
  }

  .usage-chart__segment {
    min-inline-size: 2px;
    transition: inline-size var(--mb-motion-standard);
  }

  .usage-segment--input {
    background: var(--mb-color-primary);
  }

  .usage-segment--output {
    background: var(--mb-color-tertiary);
  }

  .usage-segment--cache-write {
    background: var(--mb-color-secondary);
  }

  .usage-segment--cache-read {
    background: var(--mb-color-primary-container);
  }

  .usage-segment--cost-1 {
    background: #7c6fdd;
  }

  .usage-segment--cost-2 {
    background: #2f8f68;
  }

  .usage-segment--cost-3 {
    background: #c26a30;
  }

  .usage-segment--cost-4 {
    background: #b84f76;
  }

  .usage-segment--cost-5 {
    background: #4f82c8;
  }

  .usage-segment--cost-6 {
    background: #8a7a24;
  }

  .usage-chart__legend {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .usage-chart__legend li {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.78rem;
  }

  .usage-chart__legend li > span:not(.usage-chart__dot) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .usage-chart__legend strong {
    color: var(--mb-color-on-surface);
    font-weight: 700;
  }

  .usage-chart__dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
  }

  .usage-table td {
    white-space: nowrap;
  }

  .usage-table td:first-child,
  .usage-table td:nth-child(2) {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .usage-empty-state {
    min-height: 180px;
    display: grid;
    place-items: center;
    border: 1px dashed color-mix(in srgb, var(--mb-color-outline) 42%, transparent);
    border-radius: 8px;
    color: var(--mb-color-on-surface-variant);
    background: color-mix(in srgb, var(--mb-color-surface-container) 48%, transparent);
    font-weight: 650;
  }

  .usage-empty-state p {
    margin: 0;
  }

  .overview-logs-anchor {
    display: grid;
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

  .status-pill--restartRequired,
  .status-pill--critical {
    color: var(--mb-color-on-error-container);
    background: var(--mb-color-error-container);
  }

  .status-pill--needsAttention {
    color: var(--mb-color-on-tertiary-container);
    background: var(--mb-color-tertiary-container);
  }

  .resource-card-list {
    display: grid;
    gap: 14px;
  }

  .resource-card-list--compact {
    gap: 10px;
  }

  .provider-resource-group {
    display: grid;
    gap: 12px;
  }

  .provider-offers {
    display: grid;
    gap: 10px;
    border-left: 3px solid color-mix(in srgb, var(--mb-color-secondary) 58%, transparent);
    padding-left: 14px;
  }

  .section-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 14px;
  }

  .section-heading h2 {
    margin: 0;
  }

  .section-heading--compact {
    margin-bottom: 0;
  }

  .section-heading--compact h3 {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.25;
  }

  .create-resource {
    display: grid;
    justify-items: end;
    gap: 12px;
  }

  .create-resource__add {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 13px;
  }

  .create-resource__panel {
    width: min(720px, 100%);
    display: grid;
    gap: 14px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 34%, transparent);
    border-radius: 8px;
    padding: 14px;
    background: color-mix(in srgb, var(--mb-color-surface-container-high) 82%, var(--mb-color-surface));
    box-shadow: var(--mb-elevation-1);
  }

  .create-resource__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .create-resource__header h3 {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.25;
  }

  .form-grid.create-resource__fields {
    width: 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-grid.create-resource__fields .form-field--create-track {
    grid-column: span 1;
  }

  .icon-button {
    width: 36px;
    min-height: 36px;
    display: inline-grid;
    place-items: center;
    padding: 0;
    color: var(--mb-color-on-surface-variant);
    background: transparent;
    box-shadow: none;
  }

  .icon-button:hover,
  .icon-button:focus-visible {
    color: var(--mb-color-primary);
    background: color-mix(in srgb, var(--mb-color-primary) 12%, transparent);
  }

  .resource-editor-card {
    position: relative;
    display: grid;
    gap: 16px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 30%, transparent);
    border-radius: 8px;
    padding: 16px;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--mb-color-primary) 4%, transparent), transparent 120px),
      var(--mb-color-surface-container-high);
    box-shadow: 0 1px 2px color-mix(in srgb, var(--mb-color-shadow) 14%, transparent);
    transition:
      border-color var(--mb-motion-standard),
      box-shadow var(--mb-motion-standard),
      transform var(--mb-motion-standard);
  }

  .resource-editor-card:hover {
    border-color: color-mix(in srgb, var(--mb-color-primary) 40%, var(--mb-color-outline));
    box-shadow: 0 8px 24px color-mix(in srgb, var(--mb-color-shadow) 18%, transparent);
    transform: translateY(-1px);
  }

  .resource-editor-card:focus-within {
    border-color: var(--mb-color-primary);
    box-shadow:
      0 0 0 2px color-mix(in srgb, var(--mb-color-primary) 28%, transparent),
      0 8px 24px color-mix(in srgb, var(--mb-color-shadow) 18%, transparent);
  }

  .resource-editor-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .resource-editor-card__identity {
    min-width: 0;
    display: grid;
    gap: 6px;
  }

  .resource-editor-card__identity h3 {
    margin: 0;
    overflow-wrap: anywhere;
    color: var(--mb-color-on-surface);
    font-size: 1rem;
    line-height: 1.25;
    font-weight: 720;
  }

  .resource-kind-chip {
    width: fit-content;
    min-height: 24px;
    display: inline-flex;
    align-items: center;
    border-radius: 8px;
    padding: 0 8px;
    color: var(--mb-color-on-secondary-container);
    background: var(--mb-color-secondary-container);
    font-size: 0.72rem;
    font-weight: 760;
    text-transform: uppercase;
  }

  .resource-editor-card__meta {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
    min-width: min(360px, 48%);
  }

  .resource-editor-card__status {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
  }

  .resource-delete-button {
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid color-mix(in srgb, var(--mb-color-error) 34%, transparent);
    padding: 0 10px;
    color: var(--mb-color-error);
    background: color-mix(in srgb, var(--mb-color-error-container) 62%, var(--mb-color-surface));
    box-shadow: none;
  }

  .resource-delete-button:hover,
  .resource-delete-button:focus-visible {
    color: var(--mb-color-on-error-container);
    background: color-mix(in srgb, var(--mb-color-error-container) 86%, var(--mb-color-surface));
    box-shadow: 0 2px 10px color-mix(in srgb, var(--mb-color-error) 18%, transparent);
  }

  .resource-delete-button .material-symbol {
    font-size: 1.05rem;
  }

  .resource-delete-confirmation {
    display: grid;
    gap: 10px;
    border: 1px solid color-mix(in srgb, var(--mb-color-error) 34%, transparent);
    border-radius: 8px;
    padding: 12px;
    color: var(--mb-color-on-error-container);
    background: color-mix(in srgb, var(--mb-color-error-container) 70%, var(--mb-color-surface));
  }

  .resource-delete-confirmation p {
    margin: 0;
    font-size: 0.82rem;
    line-height: 1.45;
    font-weight: 650;
  }

  .resource-delete-confirmation__actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .resource-delete-confirmation__confirm {
    color: var(--mb-color-on-error);
    background: var(--mb-color-error);
    box-shadow: 0 2px 10px color-mix(in srgb, var(--mb-color-error) 22%, transparent);
  }

  .resource-editor-card__summary {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.78rem;
    font-weight: 620;
  }

  .resource-editor-card__summary span {
    min-height: 24px;
    display: inline-flex;
    align-items: center;
    border-radius: 8px;
    padding: 0 8px;
    background: color-mix(in srgb, var(--mb-color-surface-container) 76%, transparent);
  }

  .resource-field-groups {
    display: grid;
    gap: 14px;
  }

  .resource-field-group {
    display: grid;
    gap: 12px;
    border-top: 1px solid color-mix(in srgb, var(--mb-color-outline) 22%, transparent);
    padding-top: 14px;
  }

  .resource-field-group:first-child {
    border-top: 0;
    padding-top: 0;
  }

  .resource-field-group__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .resource-field-group__header h4 {
    margin: 0;
    color: var(--mb-color-on-surface);
    font-size: 0.84rem;
    line-height: 1.25;
    font-weight: 760;
  }

  .resource-field-group__header span {
    min-height: 24px;
    display: inline-flex;
    align-items: center;
    border-radius: 8px;
    padding: 0 8px;
    color: var(--mb-color-on-surface-variant);
    background: color-mix(in srgb, var(--mb-color-surface-container) 72%, transparent);
    font-size: 0.74rem;
    font-weight: 650;
    white-space: nowrap;
  }

  .resource-field-group--advanced {
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 28%, transparent);
    padding: 14px;
    background: color-mix(in srgb, var(--mb-color-surface) 68%, var(--mb-color-surface-container-high));
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
    align-items: start;
  }

  .form-grid label,
  .form-field,
  .schema-field {
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

  .create-resource__compound-control {
    display: grid;
    grid-template-columns: minmax(0, auto) minmax(120px, 180px);
    align-items: center;
    gap: 10px;
  }

  .create-resource__compound-control input {
    min-width: 0;
  }

  .schema-field__topline,
  .schema-field--inline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 28px;
  }

  .schema-field__label-row {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .schema-field__label,
  .schema-field__checkbox-label {
    color: inherit;
    font: inherit;
  }

  .schema-field__label {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .schema-field__required {
    margin-left: 3px;
    color: var(--mb-color-error);
  }

  .schema-field__help-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .schema-field__help {
    width: 24px;
    min-height: 24px;
    display: inline-grid;
    place-items: center;
    border-radius: 999px;
    padding: 0;
    color: var(--mb-color-primary);
    background: color-mix(in srgb, var(--mb-color-primary) 12%, transparent);
    font-size: 0.75rem;
    font-weight: 800;
    box-shadow: none;
  }

  .schema-field__help:hover,
  .schema-field__help:focus-visible {
    background: color-mix(in srgb, var(--mb-color-primary) 22%, transparent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--mb-color-primary) 20%, transparent);
  }

  .schema-field__tooltip {
    position: absolute;
    left: 0;
    top: calc(100% + 8px);
    z-index: 5;
    width: min(320px, 72vw);
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 38%, transparent);
    border-radius: 8px;
    padding: 10px 12px;
    color: var(--mb-color-on-surface);
    background: var(--mb-color-surface-container-high);
    box-shadow: var(--mb-elevation-2);
    font-size: 0.78rem;
    font-weight: 560;
    line-height: 1.45;
  }

  .schema-field__checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .schema-field__switch-line {
    width: 100%;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .schema-switch {
    width: 50px;
    flex: 0 0 50px;
    min-height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 58%, transparent);
    border-radius: 999px;
    padding: 2px;
    background: color-mix(in srgb, var(--mb-color-surface-container-high) 86%, transparent);
    box-shadow: none;
  }

  .schema-switch span {
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    border-radius: 999px;
    background: var(--mb-color-outline);
    transition:
      transform var(--mb-motion-standard),
      background-color var(--mb-motion-standard);
  }

  .schema-switch--selected {
    justify-content: flex-start;
    border-color: var(--mb-color-primary);
    background: var(--mb-color-primary);
  }

  .schema-switch--selected span {
    transform: translateX(20px);
    background: var(--mb-color-on-primary);
  }

  .schema-option-group {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
    min-height: 38px;
  }

  .schema-option {
    min-height: 34px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 42%, transparent);
    border-radius: 8px;
    padding: 0 10px;
    color: var(--mb-color-on-surface);
    background: var(--mb-color-surface-container);
    box-shadow: none;
    font-size: 0.8rem;
    font-weight: 760;
  }

  .schema-option:hover,
  .schema-option:focus-visible {
    border-color: var(--mb-color-primary);
    background: color-mix(in srgb, var(--mb-color-primary) 12%, var(--mb-color-surface-container));
  }

  .schema-option--active {
    box-shadow: var(--mb-elevation-1);
  }

  .schema-option--openai {
    --schema-option-color: #3f8f5f;
  }

  .schema-option--anthropic {
    --schema-option-color: #c56b2c;
  }

  .schema-option--gemini {
    --schema-option-color: #7d5bd6;
  }

  .schema-option--unknown {
    --schema-option-color: var(--mb-color-outline);
  }

  .schema-option--openai,
  .schema-option--anthropic,
  .schema-option--gemini,
  .schema-option--unknown {
    border-color: color-mix(in srgb, var(--schema-option-color) 68%, transparent);
    color: color-mix(in srgb, var(--schema-option-color) 88%, var(--mb-color-on-surface));
    background: color-mix(in srgb, var(--schema-option-color) 12%, var(--mb-color-surface-container));
  }

  .schema-option--active.schema-option--openai,
  .schema-option--active.schema-option--anthropic,
  .schema-option--active.schema-option--gemini,
  .schema-option--active.schema-option--unknown {
    color: #fff;
    background: var(--schema-option-color);
  }

  .schema-json-summary {
    width: 100%;
    min-height: 44px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 10px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 35%, transparent);
    border-radius: 8px;
    padding: 8px 10px;
    color: var(--mb-color-on-surface);
    background: color-mix(in srgb, var(--mb-color-surface-container-high) 72%, transparent);
    box-shadow: none;
    text-align: left;
  }

  .schema-json-summary span:first-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .schema-json-summary strong {
    min-height: 24px;
    display: inline-flex;
    align-items: center;
    border-radius: 8px;
    padding: 0 8px;
    color: var(--mb-color-on-secondary-container);
    background: var(--mb-color-secondary-container);
    font-size: 0.76rem;
    white-space: nowrap;
  }

  .schema-field--wide {
    grid-column: 1 / -1;
  }

  .schema-field--wide textarea {
    min-height: 132px;
    font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
    line-height: 1.45;
  }

  .field-status {
    display: inline-flex;
    align-items: center;
    justify-self: end;
    gap: 6px;
    min-height: 24px;
    border-radius: 8px;
    padding: 0 8px;
    color: var(--mb-color-on-surface-variant);
    background: color-mix(in srgb, var(--mb-color-surface-container-high) 78%, transparent);
    font-size: 0.72rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .field-status__dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: currentColor;
  }

  .field-status--dirty {
    color: var(--mb-color-on-tertiary-container);
    background: var(--mb-color-tertiary-container);
  }

  .field-status--saving {
    color: var(--mb-color-on-primary-container);
    background: var(--mb-color-primary-container);
  }

  .field-status--saved,
  .field-status--idle {
    color: var(--mb-color-on-secondary-container);
    background: var(--mb-color-secondary-container);
  }

  .field-status--error {
    color: var(--mb-color-on-error-container);
    background: var(--mb-color-error-container);
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
    appearance: none;
    transition:
      border-color var(--mb-motion-standard),
      box-shadow var(--mb-motion-standard),
      background var(--mb-motion-standard);
  }

  .form-grid textarea,
  .textarea-field textarea {
    resize: vertical;
  }

  .form-grid .schema-field--wide textarea {
    min-height: 132px;
    resize: vertical;
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

  .form-grid input[aria-invalid="true"],
  .form-grid select[aria-invalid="true"],
  .form-grid textarea[aria-invalid="true"] {
    border-color: var(--mb-color-error);
    border-bottom-color: var(--mb-color-error);
    box-shadow: inset 0 -1px 0 var(--mb-color-error);
  }

  .form-grid__wide,
  .form-actions {
    grid-column: 1 / -1;
  }

  .form-grid__compact {
    grid-column: span 1;
    max-width: 280px;
  }

  .form-grid__medium {
    grid-column: span 2;
    max-width: 620px;
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

  .field-error {
    margin: 0;
    border-radius: 8px;
    padding: 8px 10px;
    color: var(--mb-color-on-error-container);
    background: var(--mb-color-error-container);
    font-size: 0.76rem;
    line-height: 1.4;
    font-weight: 650;
    overflow-wrap: anywhere;
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

  .logs-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  .logs-toolbar__actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .logs-count {
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    margin: 0;
    border-radius: 8px;
    padding: 0 10px;
    color: var(--mb-color-on-surface-variant);
    background: var(--mb-color-surface-container-high);
    font-size: 0.82rem;
    font-weight: 650;
  }

  .segmented-control,
  .log-level-filter {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .segmented-control {
    overflow: hidden;
    gap: 0;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 42%, transparent);
    border-radius: 999px;
    background: var(--mb-color-surface-container-high);
  }

  .segmented-control button {
    min-height: 38px;
    border-radius: 0;
    color: var(--mb-color-on-surface-variant);
    background: transparent;
  }

  .segmented-control button + button {
    border-left: 1px solid color-mix(in srgb, var(--mb-color-outline) 42%, transparent);
  }

  .log-level-filter {
    margin-bottom: 14px;
  }

  .log-level-filter button {
    min-height: 34px;
    padding: 0 12px;
    color: var(--mb-color-on-surface);
    background: var(--mb-color-surface-container-high);
  }

  .logs-stream-status {
    margin: 0 0 14px;
    border: 1px solid color-mix(in srgb, var(--mb-color-error) 45%, transparent);
    border-radius: 8px;
    padding: 10px 12px;
    color: var(--mb-color-on-error-container);
    background: var(--mb-color-error-container);
    font-size: 0.85rem;
    font-weight: 650;
  }

  .logs-search {
    margin-bottom: 14px;
  }

  .search-field {
    display: grid;
    gap: 8px;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.82rem;
    font-weight: 650;
  }

  .search-field__control {
    min-width: 0;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 42%, transparent);
    border-radius: 999px;
    padding: 0 8px 0 14px;
    background: var(--mb-color-surface-container-high);
  }

  .search-field__control input {
    min-width: 0;
    border: 0;
    color: var(--mb-color-on-surface);
    background: transparent;
    font: inherit;
  }

  .search-field__control input:focus {
    outline: 0;
  }

  .search-field__control:focus-within {
    border-color: var(--mb-color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--mb-color-primary) 18%, transparent);
  }

  .search-field__control button {
    width: 34px;
    min-height: 34px;
    display: inline-grid;
    place-items: center;
    padding: 0;
    color: var(--mb-color-on-surface-variant);
    background: transparent;
  }

  .search-field__control button:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .material-symbol {
    font-family: "Material Symbols Rounded", "Material Symbols Outlined", sans-serif;
    font-size: 1.15rem;
    line-height: 1;
  }

  .log-output {
    max-height: min(42vh, 560px);
    overflow: auto;
    display: grid;
    gap: 8px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline) 30%, transparent);
    border-radius: 8px;
    padding: 10px;
    background: var(--mb-color-surface);
  }

  .log-empty-state {
    min-height: 180px;
    display: grid;
    place-items: center;
    margin: 0;
    border: 1px dashed color-mix(in srgb, var(--mb-color-outline) 45%, transparent);
    border-radius: 8px;
    padding: 18px;
    color: var(--mb-color-on-surface-variant);
    background: color-mix(in srgb, var(--mb-color-surface-container) 48%, transparent);
    text-align: center;
    font-size: 0.9rem;
    font-weight: 650;
  }

  .log-row {
    display: grid;
    gap: 7px;
    border-left: 3px solid var(--mb-color-outline);
    border-radius: 6px;
    padding: 10px 12px;
    background: color-mix(in srgb, var(--mb-color-surface-container) 72%, transparent);
  }

  .log-row--error {
    border-left-color: var(--mb-color-error);
  }

  .log-row--warn {
    border-left-color: var(--mb-color-tertiary-container);
  }

  .log-row--info {
    border-left-color: var(--mb-color-primary);
  }

  .log-row--debug {
    border-left-color: var(--mb-color-secondary);
  }

  .log-row__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.74rem;
    font-weight: 680;
  }

  .log-row__meta span,
  .log-row__meta strong {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .log-row pre {
    overflow-x: auto;
    margin: 0;
    color: var(--mb-color-on-surface);
    font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
    font-size: 0.8rem;
    line-height: 1.45;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .button-list {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .active-button {
    outline: 2px solid var(--mb-color-primary);
    outline-offset: 2px;
    color: var(--mb-color-on-primary-container) !important;
    background: var(--mb-color-primary-container) !important;
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
      position: static;
      z-index: 1;
      flex-direction: row;
      align-items: stretch;
      justify-content: flex-start;
      overflow-x: auto;
      padding: 10px 12px;
      border-right: 0;
      border-bottom: 1px solid color-mix(in srgb, var(--mb-color-outline) 34%, transparent);
      scroll-snap-type: x proximity;
    }

    .nav-item {
      flex: 0 0 108px;
      scroll-snap-align: start;
    }

    .content-surface {
      padding: 16px;
    }

    .log-output {
      max-height: 360px;
    }

    .placeholder-panel {
      min-height: 440px;
      padding: 24px;
    }

    .metric-grid,
    .section-grid,
    .usage-summary-grid,
    .usage-chart-grid {
      grid-template-columns: 1fr;
    }

    .compact-list li {
      grid-template-columns: 1fr;
      gap: 4px;
    }

    .resource-table {
      min-width: 640px;
    }

    .resource-editor-card__header {
      display: grid;
    }

    .resource-editor-card__meta {
      min-width: 0;
      justify-content: flex-start;
    }

    .resource-editor-card__status {
      justify-content: flex-start;
    }

    .section-heading {
      display: grid;
    }

    .create-resource {
      justify-items: stretch;
    }

    .create-resource__add {
      justify-content: center;
      width: 100%;
    }

    .form-grid,
    .section-grid {
      grid-template-columns: 1fr;
    }

    .form-grid__compact,
    .form-grid__medium,
    .form-grid__wide,
    .form-grid.create-resource__fields .form-field--create-track {
      grid-column: 1 / -1;
      max-width: none;
    }

    .change-drawer {
      top: 12px;
      right: 12px;
      left: 12px;
      width: auto;
      max-height: calc(100vh - 24px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }

    .resource-editor-card:hover {
      transform: none;
    }
  }
`;
