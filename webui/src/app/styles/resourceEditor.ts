export const resourceEditorStyles = `  .resource-editor-card {
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

`;
