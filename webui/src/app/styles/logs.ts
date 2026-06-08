export const logStyles = `  .logs-panel__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 14px;
    margin-bottom: 14px;
  }

  .logs-panel__header h2 {
    margin: 0;
  }

  .logs-panel__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
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

  .logs-chip-set {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
  }

  .log-level-filter {
    margin-bottom: 14px;
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
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .logs-search__field {
    width: 100%;
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

`;
