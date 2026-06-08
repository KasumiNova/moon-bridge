export const baseStyles = `
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

`;
