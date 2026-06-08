import "@material/web/button/text-button.js";
import "@material/web/button/filled-button.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/ripple/ripple.js";
import { createElement, type ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { motion } from "motion/react";
import { type Locale, type MessageKey } from "../i18n/messages";
import { useI18n } from "../i18n/I18nProvider";
import { useConsoleTheme } from "../theme/ThemeProvider";
import { pageMotion, springs } from "../theme/motion";

const navItems = [
  { to: "/overview", icon: "dashboard", labelKey: "nav.overview" },
  { to: "/models-providers", icon: "hub", labelKey: "nav.modelsProviders" },
  { to: "/routes", icon: "alt_route", labelKey: "nav.routes" },
  { to: "/defaults", icon: "rule_settings", labelKey: "nav.defaults" },
  { to: "/search-tools", icon: "travel_explore", labelKey: "nav.searchTools" },
  { to: "/storage", icon: "database", labelKey: "nav.storage" },
  { to: "/security", icon: "shield", labelKey: "nav.security" }
] as const;

type NavItem = (typeof navItems)[number];

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
          <motion.div
            className="theme-toggle"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.9 }}
            transition={springs.spatialFast}
          >
            <motion.span
              key={themeIcon}
              style={{ display: "inline-flex" }}
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={springs.spatial}
            >
              {createElement(
                "md-icon-button",
                {
                  "aria-label": t("app.switchTheme", { theme: nextThemeLabel }),
                  role: "button",
                  onClick: toggleTheme
                },
                createElement("md-icon", null, themeIcon)
              )}
            </motion.span>
          </motion.div>
        </div>
      </header>

      <div className="workspace">
        <nav className="navigation-rail" aria-label={t("app.consoleSections")}>
          {navItems.map((item) => (
            <NavRailItem key={item.to} item={item} label={t(item.labelKey as MessageKey)} />
          ))}
        </nav>

        <motion.main
          aria-label={t("app.routeContent")}
          className="content-surface"
          initial={pageMotion.initial}
          animate={pageMotion.animate}
          transition={pageMotion.transition}
        >
          {content ?? <Outlet />}
        </motion.main>
      </div>
    </div>
  );
}

function NavRailItem({ item, label }: { item: NavItem; label: string }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => (isActive ? "nav-item nav-item--active" : "nav-item")}
    >
      {({ isActive }) => (
        <>
          <span className="nav-item__icon">
            {isActive ? (
              <motion.span
                aria-hidden="true"
                className="nav-item__indicator"
                layoutId="nav-active-indicator"
                transition={springs.spatial}
              />
            ) : null}
            {createElement("md-icon", null, item.icon)}
            {createElement("md-ripple")}
          </span>
          <span className="nav-item__label">{label}</span>
        </>
      )}
    </NavLink>
  );
}

const shellStyles = `
  :root {
    color-scheme: dark;
    font-family:
      "Roboto Flex", Inter, ui-sans-serif, system-ui, -apple-system,
      BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-optical-sizing: auto;
    background: var(--mb-color-surface);
    color: var(--mb-color-on-surface);
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;

    /* ---- M3 Expressive shape scale ---- */
    --mb-shape-xs: 8px;
    --mb-shape-sm: 12px;
    --mb-shape-md: 16px;
    --mb-shape-lg: 20px;
    --mb-shape-xl: 28px;
    --mb-shape-2xl: 36px;
    --mb-shape-full: 999px;

    /* ---- Code/mono font ---- */
    --mb-font-mono: "Roboto Mono", "JetBrains Mono", "SFMono-Regular", Consolas, monospace;

    /* ---- M3 Expressive type scale ---- */
    --mb-type-display: 700 clamp(2rem, 1.4rem + 2.4vw, 2.9rem)/1.06 "Roboto Flex", Inter, system-ui, sans-serif;
    --mb-tracking-display: -0.015em;

    /* ---- M3 motion easings + durations ---- */
    --mb-ease-standard: cubic-bezier(0.2, 0, 0, 1);
    --mb-ease-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
    --mb-ease-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
    --mb-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    --mb-duration-short: 140ms;
    --mb-duration-medium: 240ms;
    --mb-duration-long: 420ms;
    --mb-motion-standard: var(--mb-duration-medium) var(--mb-ease-standard);
    --mb-motion-emphasized: var(--mb-duration-long) var(--mb-ease-decelerate);

    /* ---- State-layer opacities (M3) ---- */
    --mb-state-hover: 0.08;
    --mb-state-focus: 0.10;
    --mb-state-press: 0.12;

    /* ---- Tonal elevation shadows ---- */
    --mb-elevation-1:
      0 1px 2px color-mix(in srgb, var(--mb-color-shadow) 30%, transparent),
      0 1px 3px 1px color-mix(in srgb, var(--mb-color-shadow) 15%, transparent);
    --mb-elevation-2:
      0 1px 2px color-mix(in srgb, var(--mb-color-shadow) 30%, transparent),
      0 2px 6px 2px color-mix(in srgb, var(--mb-color-shadow) 15%, transparent);
    --mb-elevation-3:
      0 4px 8px 3px color-mix(in srgb, var(--mb-color-shadow) 15%, transparent),
      0 1px 3px color-mix(in srgb, var(--mb-color-shadow) 30%, transparent);
    --mb-elevation-4:
      0 6px 10px 4px color-mix(in srgb, var(--mb-color-shadow) 15%, transparent),
      0 2px 3px color-mix(in srgb, var(--mb-color-shadow) 30%, transparent);
    --mb-elevation-5:
      0 8px 12px 6px color-mix(in srgb, var(--mb-color-shadow) 15%, transparent),
      0 4px 4px color-mix(in srgb, var(--mb-color-shadow) 30%, transparent);

    /* Material Symbols default to an outlined, unfilled glyph. */
    --md-icon-font: "Material Symbols Rounded";
    --md-icon-size: 24px;
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

  md-icon,
  .material-symbol {
    font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
    transition: font-variation-settings var(--mb-duration-medium) var(--mb-ease-standard);
  }

  /* Filled icon variant for active/selected expressive states. */
  .nav-item--active md-icon,
  .icon--filled,
  .schema-switch--selected md-icon {
    font-variation-settings: "FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24;
  }

  ::selection {
    background: color-mix(in srgb, var(--mb-color-primary) 32%, transparent);
    color: var(--mb-color-on-surface);
  }

  :focus-visible {
    outline: none;
  }

  /* Themed, slim scrollbars to avoid heavy native chrome. */
  * {
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--mb-color-outline) 55%, transparent) transparent;
  }
  *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  *::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: var(--mb-shape-full);
    background: color-mix(in srgb, var(--mb-color-outline) 50%, transparent);
    background-clip: padding-box;
  }
  *::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--mb-color-outline) 80%, transparent);
    background-clip: padding-box;
  }
  *::-webkit-scrollbar-corner {
    background: transparent;
  }

  @keyframes mb-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes mb-shimmer {
    0% { background-position: -480px 0; }
    100% { background-position: 480px 0; }
  }
  @keyframes mb-pulse-ring {
    0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--mb-color-primary) 45%, transparent); }
    70% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--mb-color-primary) 0%, transparent); }
    100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--mb-color-primary) 0%, transparent); }
  }
  @keyframes mb-pop-in {
    0% { opacity: 0; transform: scale(0.8); }
    60% { opacity: 1; transform: scale(1.06); }
    100% { opacity: 1; transform: scale(1); }
  }

  .app-shell {
    min-height: 100vh;
    background:
      radial-gradient(1200px 420px at 12% -8%, color-mix(in srgb, var(--mb-color-primary) 14%, transparent), transparent 70%),
      radial-gradient(900px 360px at 100% -4%, color-mix(in srgb, var(--mb-color-tertiary) 10%, transparent), transparent 72%),
      var(--mb-color-surface);
  }

  .auth-gate {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background:
      radial-gradient(900px 500px at 50% -12%, color-mix(in srgb, var(--mb-color-primary) 20%, transparent), transparent 70%),
      var(--mb-color-surface);
  }

  .auth-card {
    width: min(420px, 100%);
    display: grid;
    gap: 14px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 60%, transparent);
    border-radius: var(--mb-shape-2xl);
    padding: 32px;
    background: var(--mb-color-surface-container);
    box-shadow: var(--mb-elevation-3);
  }

  .auth-card__badge {
    width: 56px;
    height: 56px;
    display: grid;
    place-items: center;
    border-radius: var(--mb-shape-lg);
    color: var(--mb-color-on-primary-container);
    background: var(--mb-color-primary-container);
    --md-icon-size: 30px;
  }

  .auth-card h1 {
    margin: 0;
    font-size: 1.6rem;
    line-height: 1.15;
  }

  .auth-card__message {
    margin: 0;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .auth-field {
    display: grid;
    gap: 8px;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.82rem;
    font-weight: 650;
  }

  .auth-field input {
    width: 100%;
    min-height: 48px;
    border: 0;
    border-bottom: 1px solid var(--mb-color-outline);
    border-radius: var(--mb-shape-sm) var(--mb-shape-sm) 0 0;
    padding: 12px 14px;
    color: var(--mb-color-on-surface);
    background: var(--mb-color-surface-container-highest);
    font: inherit;
    transition:
      border-color var(--mb-duration-medium) var(--mb-ease-standard),
      box-shadow var(--mb-duration-medium) var(--mb-ease-standard);
  }

  .auth-field input:focus {
    outline: 0;
    border-bottom-color: var(--mb-color-primary);
    box-shadow: inset 0 -2px 0 0 var(--mb-color-primary);
  }

  .auth-card__submit {
    margin-top: 4px;
    width: 100%;
    min-height: 48px;
  }

  /* MD3 custom checkbox — accessible native input is visually hidden. */
  .mb-checkbox-field {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--mb-color-on-surface);
    font-size: 0.9rem;
    cursor: pointer;
    user-select: none;
  }

  .mb-checkbox-input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .mb-checkbox-box {
    flex: 0 0 20px;
    width: 20px;
    height: 20px;
    display: grid;
    place-items: center;
    border: 2px solid var(--mb-color-outline);
    border-radius: 7px;
    color: transparent;
    background: transparent;
    --md-icon-size: 18px;
    transition:
      background-color var(--mb-duration-short) var(--mb-ease-standard),
      border-color var(--mb-duration-short) var(--mb-ease-standard),
      color var(--mb-duration-short) var(--mb-ease-standard);
  }

  .mb-checkbox-box md-icon {
    transform: scale(0.5);
    transition: transform var(--mb-duration-medium) var(--mb-ease-spring);
  }

  .mb-checkbox-input:checked + .mb-checkbox-box {
    border-color: var(--mb-color-primary);
    color: var(--mb-color-on-primary);
    background: var(--mb-color-primary);
  }

  .mb-checkbox-input:checked + .mb-checkbox-box md-icon {
    transform: scale(1);
  }

  .mb-checkbox-input:focus-visible + .mb-checkbox-box {
    outline: 2px solid var(--mb-color-primary);
    outline-offset: 2px;
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
    gap: 6px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 60%, transparent);
    border-radius: var(--mb-shape-full);
    padding: 0 12px;
    color: var(--mb-color-on-surface-variant);
    background: var(--mb-color-surface-container);
    font-size: 0.78rem;
    font-weight: 600;
  }

  .locale-switch {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 60%, transparent);
    border-radius: var(--mb-shape-full);
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
    border-radius: var(--mb-shape-full);
    padding: 0 14px;
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
    position: relative;
    isolation: isolate;
    overflow: hidden;
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 0;
    border-radius: var(--mb-shape-full); /* MD3 Pill */
    padding: 0 22px;
    color: var(--mb-color-on-primary);
    background: var(--mb-color-primary);
    font: inherit;
    font-weight: 600;
    letter-spacing: 0.1px;
    white-space: nowrap;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition:
      background-color var(--mb-duration-medium) var(--mb-ease-standard),
      box-shadow var(--mb-duration-medium) var(--mb-ease-standard),
      color var(--mb-duration-medium) var(--mb-ease-standard),
      transform var(--mb-duration-short) var(--mb-ease-spring);
  }

  /* MD3 state layer — tints with the button's own on-color. */
  .top-action-button::before,
  button::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: currentColor;
    opacity: 0;
    transition: opacity var(--mb-duration-short) var(--mb-ease-standard);
  }

  button:hover::before {
    opacity: var(--mb-state-hover);
  }

  button:active::before {
    opacity: var(--mb-state-press);
  }

  button:active {
    transform: scale(0.96);
  }

  button:focus-visible {
    outline: 2px solid var(--mb-color-primary);
    outline-offset: 2px;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
  }

  button:disabled::before {
    opacity: 0;
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
    grid-template-columns: 96px minmax(0, 1fr);
    min-height: calc(100vh - 69px);
  }

  .navigation-rail {
    position: sticky;
    top: 69px;
    align-self: start;
    height: calc(100vh - 69px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 14px 8px;
    background: transparent;
  }

  .nav-item {
    position: relative;
    width: 100%;
    min-height: 58px;
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 5px;
    padding: 6px 2px;
    border-radius: var(--mb-shape-md);
    color: var(--mb-color-on-surface-variant);
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
    transition: color var(--mb-duration-medium) var(--mb-ease-standard);
  }

  .nav-item__icon {
    position: relative;
    display: grid;
    place-items: center;
    width: 56px;
    height: 32px;
    border-radius: var(--mb-shape-full);
    overflow: hidden;
    isolation: isolate;
    --md-ripple-hover-color: var(--mb-color-on-surface);
    --md-ripple-pressed-color: var(--mb-color-primary);
    --md-icon-size: 24px;
  }

  .nav-item__icon md-icon {
    position: relative;
    z-index: 1;
    transition: transform var(--mb-duration-medium) var(--mb-ease-spring);
  }

  .nav-item__indicator {
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: var(--mb-shape-full);
    background: var(--mb-color-secondary-container);
  }

  .nav-item__icon::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: inherit;
    background: transparent;
    transition: background var(--mb-duration-short) var(--mb-ease-standard);
  }

  .nav-item:hover .nav-item__icon::after {
    background: color-mix(in srgb, var(--mb-color-on-surface) 8%, transparent);
  }

  .nav-item__label {
    max-width: 90px;
    font-size: 0.6875rem;
    line-height: 1.15;
    font-weight: 600;
    letter-spacing: 0.01em;
    text-align: center;
    white-space: normal;
    transition: color var(--mb-duration-medium) var(--mb-ease-standard);
  }

  .nav-item:hover {
    color: var(--mb-color-on-surface);
  }

  .nav-item:hover .nav-item__icon md-icon {
    transform: translateY(-1px) scale(1.08);
  }

  .nav-item--active {
    color: var(--mb-color-on-surface);
  }

  .nav-item--active .nav-item__icon {
    color: var(--mb-color-on-secondary-container);
  }

  .nav-item--active .nav-item__label {
    color: var(--mb-color-on-surface);
    font-weight: 700;
  }

  .nav-item:focus-visible {
    outline: none;
  }

  .nav-item:focus-visible .nav-item__icon {
    outline: 2px solid var(--mb-color-primary);
    outline-offset: 3px;
  }

  .content-surface {
    min-width: 0;
    padding: 24px;
  }

  .placeholder-panel {
    min-height: calc(100vh - 120px);
    display: flex;
    align-items: center;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 60%, transparent);
    border-radius: var(--mb-shape-xl);
    padding: 32px;
    background: var(--mb-color-surface-container);
    box-shadow: var(--mb-elevation-1);
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
    font: var(--mb-type-display);
    letter-spacing: var(--mb-tracking-display);
  }

  .page-header p:last-child {
    margin: 12px 0 0;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.95rem;
    line-height: 1.55;
  }

  .metric-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

  .usage-heading-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  .segmented-control.usage-range button {
    min-height: 34px;
    padding: 0 14px;
    font-size: 0.8rem;
    font-weight: 640;
  }

  .usage-summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(168px, 1fr));
    gap: 12px;
  }

  .usage-metric {
    position: relative;
    min-width: 0;
    display: grid;
    gap: 8px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 50%, transparent);
    border-radius: var(--mb-shape-lg);
    padding: 14px 16px;
    background: var(--mb-color-surface-container-high);
    transition:
      transform var(--mb-duration-medium) var(--mb-ease-spring),
      border-color var(--mb-duration-medium) var(--mb-ease-standard),
      box-shadow var(--mb-duration-medium) var(--mb-ease-standard);
  }

  .usage-metric:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--mb-color-primary) 40%, transparent);
    box-shadow: var(--mb-elevation-2);
  }

  .usage-metric__icon {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: var(--mb-shape-md);
    color: var(--mb-color-on-primary-container);
    background: var(--mb-color-primary-container);
  }

  .usage-metric__icon.material-symbol {
    font-size: 20px;
  }

  .usage-metric--tertiary .usage-metric__icon {
    color: var(--mb-color-on-tertiary-container);
    background: var(--mb-color-tertiary-container);
  }

  .usage-metric--secondary .usage-metric__icon {
    color: var(--mb-color-on-secondary-container);
    background: var(--mb-color-secondary-container);
  }

  .usage-metric__label {
    padding-right: 44px;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .usage-metric strong {
    min-width: 0;
    padding-right: 44px;
    overflow-wrap: anywhere;
    font-size: 1.32rem;
    line-height: 1.12;
    font-weight: 650;
  }

  .usage-chart-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(248px, 1fr));
    gap: 12px;
  }

  .usage-chart {
    min-width: 0;
    display: grid;
    gap: 12px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 50%, transparent);
    border-radius: var(--mb-shape-lg);
    padding: 16px;
    background: color-mix(in srgb, var(--mb-color-surface-container-high) 76%, var(--mb-color-surface));
  }

  .usage-chart:focus-visible {
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
    gap: 3px;
    min-height: 20px;
    border-radius: var(--mb-shape-full);
    background: var(--mb-color-surface-container);
  }

  .usage-chart__segment {
    min-inline-size: 6px;
    border-radius: var(--mb-shape-full);
    transition: inline-size var(--mb-duration-long) var(--mb-ease-decelerate);
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
    width: 10px;
    height: 10px;
    border-radius: var(--mb-shape-full);
  }

  .usage-table td {
    white-space: nowrap;
  }

  .usage-table td:first-child,
  .usage-table td:nth-child(2) {
    max-width: 260px;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .usage-empty-state {
    min-height: 180px;
    display: grid;
    place-items: center;
    border: 1px dashed color-mix(in srgb, var(--mb-color-outline) 42%, transparent);
    border-radius: var(--mb-shape-lg);
    color: var(--mb-color-on-surface-variant);
    background: color-mix(in srgb, var(--mb-color-surface-container) 48%, transparent);
    font-weight: 650;
  }

  .usage-empty-state p {
    margin: 0;
  }

  .overview-logs {
    display: grid;
    gap: 16px;
  }

  .metric-card,
  .content-panel,
  .state-panel {
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 60%, transparent);
    border-radius: var(--mb-shape-xl);
    background: var(--mb-color-surface-container);
    box-shadow: var(--mb-elevation-1);
  }

  .metric-card {
    min-height: 112px;
    display: grid;
    align-content: space-between;
    gap: 18px;
    padding: 20px;
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
    padding: 24px;
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
    gap: 5px;
    min-height: 30px;
    border-radius: var(--mb-shape-full);
    padding: 0 12px;
    color: var(--mb-color-on-primary-container);
    background: var(--mb-color-primary-container);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.01em;
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
    gap: 10px;
  }

  .provider-offers {
    display: grid;
    gap: 10px;
    margin-left: 20px;
  }

  .provider-offers__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .provider-offers__toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 0;
    border-radius: var(--mb-shape-md);
    padding: 6px 14px 6px 6px;
    color: var(--mb-color-on-surface);
    background: transparent;
    box-shadow: none;
    cursor: pointer;
    transition: background var(--mb-duration-short) var(--mb-ease-standard);
  }

  .provider-offers__toggle:hover {
    background: color-mix(in srgb, var(--mb-color-on-surface) 6%, transparent);
  }

  .provider-offers__toggle h3 {
    margin: 0;
    font-size: 0.86rem;
    font-weight: 680;
    line-height: 1.2;
  }

  .provider-offers__icon {
    font-size: 18px;
    color: var(--mb-color-on-surface-variant);
  }

  .provider-offers__chevron {
    font-size: 20px;
    color: var(--mb-color-on-surface-variant);
    transition: transform var(--mb-duration-medium) var(--mb-ease-spring);
  }

  .provider-offers[data-open="true"] .provider-offers__chevron {
    transform: rotate(90deg);
    color: var(--mb-color-primary);
  }

  .provider-offers .resource-card-list--compact {
    margin-left: 6px;
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
    min-height: 40px;
    padding: 0 20px;
    color: var(--mb-color-on-secondary-container);
    background: var(--mb-color-secondary-container);
  }

  .create-resource__panel {
    width: min(760px, 100%);
    display: grid;
    gap: 14px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 60%, transparent);
    border-radius: var(--mb-shape-xl);
    padding: 18px 20px;
    background: var(--mb-color-surface-container-high);
    box-shadow: var(--mb-elevation-2);
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
    gap: 14px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 55%, transparent);
    border-radius: var(--mb-shape-xl);
    padding: 16px 18px;
    background: var(--mb-color-surface-container);
    box-shadow: var(--mb-elevation-1);
    transition:
      border-color var(--mb-duration-medium) var(--mb-ease-standard),
      box-shadow var(--mb-duration-medium) var(--mb-ease-standard),
      transform var(--mb-duration-medium) var(--mb-ease-spring);
  }

  .resource-editor-card:hover {
    border-color: color-mix(in srgb, var(--mb-color-primary) 40%, var(--mb-color-outline));
    box-shadow: var(--mb-elevation-3);
    transform: translateY(-2px);
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
    gap: 8px;
  }

  .resource-editor-card__identity-line {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .resource-editor-card__identity h3 {
    margin: 0;
    overflow-wrap: anywhere;
    color: var(--mb-color-on-surface);
    font-size: 1rem;
    line-height: 1.2;
    font-weight: 720;
  }

  .resource-editor-card__facts {
    display: flex;
    align-items: center;
    gap: 8px 12px;
    flex-wrap: wrap;
  }

  .resource-fact {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 28px;
    border-radius: var(--mb-shape-full);
    padding: 0 11px;
    color: var(--mb-color-on-surface-variant);
    background: color-mix(in srgb, var(--mb-color-surface-container-highest) 68%, transparent);
    font-size: 0.72rem;
    font-weight: 640;
    white-space: nowrap;
  }

  .resource-fact .material-symbol {
    font-size: 1rem;
    color: var(--mb-color-on-surface-variant);
  }

  .resource-fact--hot .material-symbol {
    color: var(--mb-color-primary);
  }

  .resource-fact--restart .material-symbol {
    color: var(--mb-color-tertiary);
  }

  .resource-kind-icon {
    flex: 0 0 auto;
    display: inline-grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: var(--mb-shape-md);
    color: var(--mb-color-on-secondary-container);
    background: var(--mb-color-secondary-container);
    font-size: 18px;
  }

  .resource-editor-card__status-group {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .resource-editor-card__meta {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
    flex: 0 0 auto;
  }

  .editor-live-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 30px;
    border-radius: var(--mb-shape-full);
    padding: 0 12px;
    font-size: 0.74rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .editor-live-status .material-symbol {
    font-size: 1.05rem;
  }

  .editor-live-status--saving {
    color: var(--mb-color-on-primary-container);
    background: var(--mb-color-primary-container);
  }

  .editor-live-status--saving .material-symbol {
    animation: mb-spin 0.9s linear infinite;
  }

  .editor-live-status--dirty {
    color: var(--mb-color-on-tertiary-container);
    background: var(--mb-color-tertiary-container);
  }

  .editor-live-status--error {
    color: var(--mb-color-on-error-container);
    background: var(--mb-color-error-container);
  }

  @keyframes mb-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .fab-button {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 0;
    border-radius: 16px;
    padding: 0 18px 0 16px;
    color: var(--mb-color-on-primary-container);
    background: var(--mb-color-primary-container);
    box-shadow: var(--mb-elevation-1);
    font-size: 0.82rem;
    font-weight: 680;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background var(--mb-duration-short) var(--mb-ease-standard),
      box-shadow var(--mb-duration-short) var(--mb-ease-standard),
      transform var(--mb-duration-short) var(--mb-ease-spring);
  }

  .fab-button:hover {
    box-shadow: var(--mb-elevation-2);
    transform: translateY(-1px);
  }

  .fab-button:active {
    transform: translateY(0);
    box-shadow: var(--mb-elevation-1);
  }

  .fab-button .material-symbol {
    font-size: 20px;
  }

  .fab-button--danger {
    color: var(--mb-color-on-error-container);
    background: var(--mb-color-error-container);
  }

  .fab-button--danger:hover {
    background: color-mix(in srgb, var(--mb-color-error-container) 78%, var(--mb-color-error));
  }

  .switch-bank {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(248px, 1fr));
    gap: 8px 14px;
    align-items: start;
  }

  .resource-delete-confirmation {
    display: grid;
    gap: 10px;
    border: 1px solid color-mix(in srgb, var(--mb-color-error) 34%, transparent);
    border-radius: var(--mb-shape-md);
    padding: 14px 16px;
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
    display: none;
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
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--mb-color-on-surface);
    font-size: 0.84rem;
    line-height: 1.25;
    font-weight: 760;
  }

  .resource-field-group__header h4 .material-symbol {
    font-size: 1.1rem;
    color: var(--mb-color-primary);
  }

  .resource-field-group__header span {
    min-height: 24px;
    display: inline-flex;
    align-items: center;
    border-radius: var(--mb-shape-full);
    padding: 2px 11px;
    color: var(--mb-color-on-surface-variant);
    background: color-mix(in srgb, var(--mb-color-surface-container) 72%, transparent);
    font-size: 0.74rem;
    font-weight: 650;
    white-space: nowrap;
  }

  .resource-field-group--advanced {
    border-radius: var(--mb-shape-md);
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 55%, transparent);
    padding: 16px;
    background: color-mix(in srgb, var(--mb-color-surface) 68%, var(--mb-color-surface-container-high));
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px 18px;
    align-items: start;
  }

  .form-grid label,
  .form-field,
  .schema-field {
    display: grid;
    gap: 6px;
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

  .schema-field__topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 26px;
  }

  .schema-field--inline {
    gap: 6px;
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
    width: 20px;
    height: 20px;
    min-height: 0;
    display: inline-grid;
    place-items: center;
    border-radius: 999px;
    padding: 0;
    border: 0;
    color: var(--mb-color-on-surface-variant);
    background: transparent;
    cursor: help;
    box-shadow: none;
    transition:
      color var(--mb-duration-short) var(--mb-ease-standard),
      background var(--mb-duration-short) var(--mb-ease-standard);
  }

  .schema-field__help .material-symbol {
    font-size: 16px;
  }

  .schema-field__help:hover,
  .schema-field__help:focus-visible {
    color: var(--mb-color-primary);
    background: color-mix(in srgb, var(--mb-color-primary) 14%, transparent);
    box-shadow: none;
  }

  .mb-field__control > .schema-field__help-wrap {
    position: absolute;
    top: 0;
    right: 8px;
    transform: translateY(-50%);
    align-items: center;
    padding: 0 2px;
    background: var(--mb-color-surface-container);
    z-index: 3;
  }

  .rich-tooltip {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    z-index: 40;
    width: max-content;
    max-width: min(320px, 78vw);
    display: grid;
    gap: 6px;
    border-radius: var(--mb-shape-md);
    padding: 12px 16px 8px;
    color: var(--mb-color-on-surface-variant);
    background: var(--mb-color-surface-container-high);
    box-shadow: var(--mb-elevation-3);
    text-align: left;
    pointer-events: none;
  }

  .rich-tooltip__subhead {
    color: var(--mb-color-on-surface);
    font-size: 0.82rem;
    font-weight: 720;
    line-height: 1.3;
  }

  .rich-tooltip__body {
    font-size: 0.8rem;
    font-weight: 460;
    line-height: 1.5;
  }

  .rich-tooltip__metas {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
  }

  .rich-tooltip__chip {
    display: inline-flex;
    align-items: center;
    border-radius: var(--mb-shape-full);
    padding: 2px 9px;
    background: color-mix(in srgb, var(--mb-color-primary) 14%, transparent);
    color: var(--mb-color-on-surface);
    font-size: 0.7rem;
    font-weight: 640;
    white-space: nowrap;
  }

  .schema-field__checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .schema-field__switch-line {
    width: 100%;
    min-width: 0;
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 70%, transparent);
    border-radius: var(--mb-shape-sm);
    padding: 4px 6px 4px 14px;
    background: color-mix(in srgb, var(--mb-color-surface-container-high) 60%, transparent);
  }

  .schema-switch {
    width: 52px;
    flex: 0 0 52px;
    height: 32px;
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    border: 2px solid var(--mb-color-outline);
    border-radius: var(--mb-shape-full);
    padding: 0 6px;
    background: var(--mb-color-surface-container-highest);
    box-shadow: none;
    overflow: visible;
    transition:
      background-color var(--mb-duration-medium) var(--mb-ease-standard),
      border-color var(--mb-duration-medium) var(--mb-ease-standard);
  }

  .schema-switch span {
    flex: 0 0 16px;
    width: 16px;
    height: 16px;
    border-radius: var(--mb-shape-full);
    background: var(--mb-color-outline);
    transition:
      transform var(--mb-duration-medium) var(--mb-ease-spring),
      width var(--mb-duration-medium) var(--mb-ease-spring),
      height var(--mb-duration-medium) var(--mb-ease-spring),
      flex-basis var(--mb-duration-medium) var(--mb-ease-spring),
      background-color var(--mb-duration-medium) var(--mb-ease-standard);
  }

  .schema-switch:active span {
    flex-basis: 26px;
    width: 26px;
  }

  .schema-switch--selected {
    justify-content: flex-start;
    border-color: var(--mb-color-primary);
    background: var(--mb-color-primary);
  }

  .schema-switch--selected span {
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    transform: translateX(12px);
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
    min-height: 36px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 80%, transparent);
    border-radius: var(--mb-shape-full);
    padding: 0 16px;
    color: var(--mb-color-on-surface);
    background: var(--mb-color-surface-container);
    box-shadow: none;
    font-size: 0.82rem;
    font-weight: 600;
  }

  .schema-option:hover,
  .schema-option:focus-visible {
    border-color: var(--mb-color-primary);
    background: color-mix(in srgb, var(--mb-color-primary) 12%, var(--mb-color-surface-container));
  }

  .schema-option--active {
    border-color: transparent;
    box-shadow: var(--mb-elevation-1);
    font-weight: 700;
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

  .select-menu {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  .select-menu__trigger {
    width: 100%;
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--mb-color-outline);
    border-radius: var(--mb-shape-sm);
    padding: 0 12px;
    color: var(--mb-color-on-surface);
    background: color-mix(in srgb, var(--mb-color-surface-container-highest) 72%, var(--mb-color-surface-container));
    box-shadow: none;
    font: inherit;
    font-weight: 640;
    text-align: left;
    cursor: pointer;
    transition:
      border-color var(--mb-duration-short) var(--mb-ease-standard),
      background var(--mb-duration-short) var(--mb-ease-standard),
      box-shadow var(--mb-duration-short) var(--mb-ease-standard);
  }

  .select-menu__trigger:hover {
    border-color: var(--mb-color-on-surface);
    background: color-mix(in srgb, var(--mb-color-on-surface) 5%, var(--mb-color-surface-container-high));
  }

  .select-menu__trigger:focus-visible {
    outline: 0;
    border-color: var(--mb-color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--mb-color-primary) 30%, transparent);
  }

  .select-menu[data-open="true"] .select-menu__trigger {
    border-color: var(--mb-color-primary);
    box-shadow: inset 0 -2px 0 0 var(--mb-color-primary);
  }

  .select-menu__value {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .select-menu__value[data-placeholder="true"] {
    color: var(--mb-color-on-surface-variant);
    font-weight: 560;
  }

  .select-menu__chevron {
    flex: 0 0 auto;
    font-size: 1.2rem;
    color: var(--mb-color-on-surface-variant);
    transition: transform var(--mb-duration-medium) var(--mb-ease-spring);
  }

  .select-menu[data-open="true"] .select-menu__chevron {
    transform: rotate(180deg);
    color: var(--mb-color-primary);
  }

  .select-menu__dot {
    flex: 0 0 auto;
    width: 10px;
    height: 10px;
    border-radius: var(--mb-shape-full);
    background: var(--mb-color-outline);
  }

  .select-menu__dot--openai {
    background: #3f8f5f;
  }

  .select-menu__dot--anthropic {
    background: #c56b2c;
  }

  .select-menu__dot--gemini {
    background: #7d5bd6;
  }

  .select-menu__dot--unknown {
    background: var(--mb-color-outline);
  }

  .select-menu__list {
    position: absolute;
    z-index: 20;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    margin: 0;
    padding: 6px;
    list-style: none;
    display: grid;
    gap: 2px;
    max-height: 280px;
    overflow-y: auto;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 70%, transparent);
    border-radius: var(--mb-shape-md);
    background: var(--mb-color-surface-container-high);
    box-shadow: var(--mb-elevation-2);
  }

  .select-menu__option {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 38px;
    border-radius: var(--mb-shape-sm);
    padding: 0 12px;
    color: var(--mb-color-on-surface);
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
  }

  .select-menu__option-label {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .select-menu__option--active {
    background: color-mix(in srgb, var(--mb-color-primary) 14%, transparent);
  }

  .select-menu__option--selected {
    color: var(--mb-color-primary);
    font-weight: 720;
  }

  .select-menu__check {
    flex: 0 0 auto;
    font-size: 1.1rem;
    color: var(--mb-color-primary);
  }

  .schema-json-summary {
    width: 100%;
    min-height: 44px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 10px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 70%, transparent);
    border-radius: var(--mb-shape-sm);
    padding: 8px 12px;
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
    border-radius: var(--mb-shape-full);
    padding: 2px 11px;
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
    font-family: var(--mb-font-mono);
    line-height: 1.45;
  }

  .field-status {
    display: inline-flex;
    align-items: center;
    justify-self: end;
    gap: 6px;
    min-height: 24px;
    border-radius: var(--mb-shape-full);
    padding: 2px 11px;
    color: var(--mb-color-on-surface-variant);
    background: color-mix(in srgb, var(--mb-color-surface-container-high) 78%, transparent);
    font-size: 0.72rem;
    font-weight: 700;
    white-space: nowrap;
  }

  @keyframes mb-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }

  .field-status--saving .field-status__dot {
    animation: mb-blink 1s var(--mb-ease-standard) infinite;
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
    color: var(--mb-color-on-surface-variant);
    background: transparent;
    font-weight: 600;
  }

  .field-status--saved .field-status__dot,
  .field-status--idle .field-status__dot {
    color: var(--mb-color-success);
  }

  .field-status--error {
    color: var(--mb-color-on-error-container);
    background: var(--mb-color-error-container);
  }

  .form-grid input,
  .form-grid textarea,
  .textarea-field textarea {
    width: 100%;
    min-height: 40px;
    border: 1px solid var(--mb-color-outline);
    border-radius: var(--mb-shape-sm);
    padding: 9px 12px;
    color: var(--mb-color-on-surface);
    background: transparent;
    font: inherit;
    appearance: none;
    transition:
      border-color var(--mb-duration-short) var(--mb-ease-standard),
      box-shadow var(--mb-duration-short) var(--mb-ease-standard);
  }

  .form-grid textarea,
  .textarea-field textarea {
    resize: vertical;
    line-height: 1.5;
  }

  .form-grid input:hover,
  .form-grid textarea:hover,
  .textarea-field textarea:hover {
    border-color: var(--mb-color-on-surface);
  }

  .form-grid input:focus,
  .form-grid textarea:focus,
  .textarea-field textarea:focus {
    outline: 0;
    border-color: var(--mb-color-primary);
    box-shadow: inset 0 0 0 1px var(--mb-color-primary);
  }

  .form-grid input[aria-invalid="true"],
  .form-grid textarea[aria-invalid="true"] {
    border-color: var(--mb-color-error);
    box-shadow: inset 0 0 0 1px var(--mb-color-error);
  }

  /* Outlined MD3 field: floating label rides the notched top border. */
  .mb-field {
    position: relative;
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .mb-field__control {
    position: relative;
    display: flex;
    align-items: stretch;
    min-width: 0;
  }

  .mb-field__control input,
  .mb-field__control textarea {
    width: 100%;
  }

  .mb-field[data-leading="true"] .mb-field__control input {
    padding-left: 42px;
  }

  .mb-field__leading {
    position: absolute;
    left: 12px;
    top: 0;
    height: 40px;
    display: inline-flex;
    align-items: center;
    color: var(--mb-color-on-surface-variant);
    font-size: 20px;
    pointer-events: none;
  }

  .mb-field__label {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    max-width: calc(100% - 52px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.9rem;
    font-weight: 540;
    line-height: 1;
    pointer-events: none;
    transition:
      top var(--mb-duration-short) var(--mb-ease-emphasized),
      left var(--mb-duration-short) var(--mb-ease-emphasized),
      transform var(--mb-duration-short) var(--mb-ease-emphasized),
      color var(--mb-duration-short) var(--mb-ease-standard);
  }

  .mb-field[data-leading="true"] .mb-field__label {
    left: 42px;
  }

  .mb-field:focus-within .mb-field__label,
  .mb-field[data-filled="true"] .mb-field__label,
  .mb-field[data-variant="select"] .mb-field__label {
    top: 0;
    left: 10px;
    transform: translateY(-50%) scale(0.82);
    max-width: calc(100% - 26px);
    padding: 0 5px;
    background: var(--mb-color-surface-container);
    font-weight: 620;
  }

  .mb-field:focus-within .mb-field__label {
    color: var(--mb-color-primary);
  }

  .mb-field[data-invalid="true"] .mb-field__label {
    color: var(--mb-color-error);
  }

  .mb-field__required {
    margin-left: 2px;
    color: var(--mb-color-error);
  }

  .mb-field[data-variant="textarea"] .mb-field__label {
    top: 20px;
  }

  .mb-field[data-variant="textarea"]:focus-within .mb-field__label,
  .mb-field[data-variant="textarea"][data-filled="true"] .mb-field__label {
    top: 0;
  }

  .mb-field[data-variant="textarea"] textarea {
    padding-top: 11px;
    resize: none;
    overflow-y: auto;
  }

  .mb-field[data-variant="select"] .select-menu__trigger {
    min-height: 40px;
  }

  .form-grid .mb-field--wide,
  .mb-field--wide {
    min-width: 0;
  }

  .form-grid__wide,
  .form-actions {
    grid-column: 1 / -1;
  }

  .form-grid__compact {
    grid-column: span 1;
  }

  .form-grid__medium {
    grid-column: span 1;
  }

  @media (max-width: 1080px) {
    .form-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 680px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
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
    border-radius: var(--mb-shape-md);
    padding: 14px 16px;
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
    font-family: var(--mb-font-mono);
    line-height: 1.45;
  }

  .field-hint {
    display: block;
    color: var(--mb-color-on-surface-variant);
    font-size: 0.76rem;
    line-height: 1.45;
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  .field-hint span {
    display: inline-block;
  }

  .field-error {
    margin: 0;
    border-radius: var(--mb-shape-sm);
    padding: 8px 12px;
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
    border-radius: var(--mb-shape-md);
    padding: 16px;
    color: var(--mb-color-on-surface);
    background: var(--mb-color-surface-container-lowest);
    font-family: var(--mb-font-mono);
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
    border-radius: var(--mb-shape-full);
    padding: 0 14px;
    color: var(--mb-color-on-surface-variant);
    background: var(--mb-color-surface-container-high);
    font-size: 0.82rem;
    font-weight: 650;
  }

  .segmented-control {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .log-level-filter {
    display: inline-flex;
    gap: 2px;
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
    min-height: 36px;
    padding: 0 16px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 80%, transparent);
    border-radius: 6px;
    color: var(--mb-color-on-surface-variant);
    background: var(--mb-color-surface-container-high);
    font-weight: 640;
    box-shadow: none;
    transition:
      background var(--mb-duration-short) var(--mb-ease-standard),
      color var(--mb-duration-short) var(--mb-ease-standard),
      border-color var(--mb-duration-short) var(--mb-ease-standard);
  }

  .log-level-filter button:first-child {
    border-top-left-radius: 18px;
    border-bottom-left-radius: 18px;
  }

  .log-level-filter button:last-child {
    border-top-right-radius: 18px;
    border-bottom-right-radius: 18px;
  }

  .log-level-filter button:hover {
    background: color-mix(in srgb, var(--mb-color-on-surface) 8%, var(--mb-color-surface-container-high));
    color: var(--mb-color-on-surface);
  }

  .log-level-filter button[aria-pressed="true"],
  .log-level-filter button.active-button {
    border-color: var(--mb-color-primary);
    color: var(--mb-color-on-primary);
    background: var(--mb-color-primary);
  }

  .logs-stream-status {
    margin: 0 0 14px;
    border: 1px solid color-mix(in srgb, var(--mb-color-error) 45%, transparent);
    border-radius: var(--mb-shape-md);
    padding: 12px 14px;
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
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 55%, transparent);
    border-radius: var(--mb-shape-md);
    padding: 12px;
    background: var(--mb-color-surface-container-lowest);
  }

  .log-empty-state {
    min-height: 180px;
    display: grid;
    place-items: center;
    margin: 0;
    border: 1px dashed color-mix(in srgb, var(--mb-color-outline) 45%, transparent);
    border-radius: var(--mb-shape-lg);
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
    border-radius: var(--mb-shape-sm);
    padding: 10px 14px;
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
    font-family: var(--mb-font-mono);
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
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 60%, transparent);
    border-radius: var(--mb-shape-xl);
    padding: 20px;
    background: var(--mb-color-surface-container-high);
    box-shadow: var(--mb-elevation-5);
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
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 55%, transparent);
    border-radius: var(--mb-shape-md);
    padding: 14px;
    background: var(--mb-color-surface-container-lowest);
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

    .resource-editor-card:hover,
    .usage-metric:hover,
    button:active,
    .nav-item:hover .nav-item__icon md-icon {
      transform: none !important;
    }
  }
`;
