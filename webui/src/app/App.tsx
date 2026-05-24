import "@material/web/button/text-button.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/ripple/ripple.js";
import { createElement } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { motion } from "motion/react";
import { useConsoleTheme } from "../theme/ThemeProvider";

const navItems = [
  { to: "/overview", icon: "dashboard", label: "Overview" },
  { to: "/models", icon: "view_module", label: "Models" },
  { to: "/providers", icon: "lan", label: "Providers" },
  { to: "/routes", icon: "alt_route", label: "Routes" },
  { to: "/extensions", icon: "extension", label: "Extensions" },
  { to: "/changes", icon: "pending_actions", label: "Changes" },
  { to: "/config", icon: "tune", label: "Config" },
  { to: "/rpc-test", icon: "science", label: "RPC Test" }
];

export function App() {
  const { theme, toggleTheme } = useConsoleTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";
  const themeIcon = theme === "dark" ? "light_mode" : "dark_mode";

  return (
    <div className="app-shell">
      <style>{shellStyles}</style>
      <header className="top-app-bar">
        <div>
          <p>Moon Bridge</p>
          <strong>Console</strong>
        </div>
        <div className="top-app-bar__meta">
          <span>127.0.0.1:38440</span>
          <span>Runtime API</span>
          {createElement(
            "md-icon-button",
            {
              "aria-label": `Switch to ${nextTheme} theme`,
              onClick: toggleTheme
            },
            createElement("md-icon", null, themeIcon)
          )}
        </div>
      </header>

      <div className="workspace">
        <nav className="navigation-rail" aria-label="Console sections">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-item nav-item--active" : "nav-item"
              }
            >
              {createElement("md-icon", null, item.icon)}
              <span>{item.label}</span>
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
          <Outlet />
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

  md-icon-button {
    --md-icon-button-icon-color: var(--mb-color-on-surface);
    --md-icon-button-hover-icon-color: var(--mb-color-primary);
    --md-icon-button-pressed-icon-color: var(--mb-color-primary);
  }

  .workspace {
    display: grid;
    grid-template-columns: 96px minmax(0, 1fr);
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
    width: 76px;
    min-height: 64px;
    display: grid;
    place-items: center;
    gap: 3px;
    padding: 8px 4px;
    border-radius: 8px;
    color: var(--mb-color-on-surface-variant);
    text-decoration: none;
    transition:
      background var(--mb-motion-standard),
      color var(--mb-motion-standard);
  }

  .nav-item span {
    max-width: 68px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.6875rem;
    line-height: 1.1;
    text-align: center;
    white-space: nowrap;
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
    box-shadow: 0 20px 60px color-mix(in srgb, var(--mb-color-shadow) 22%, transparent);
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
      flex: 0 0 76px;
    }

    .content-surface {
      padding: 16px;
    }

    .placeholder-panel {
      min-height: 440px;
      padding: 24px;
    }
  }
`;
