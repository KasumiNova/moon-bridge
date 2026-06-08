export const logStyles = `  .logs-toolbar {
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

`;
