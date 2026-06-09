export const resourceEditorStyles = `  .resource-editor-card {
    position: relative;
    display: grid;
    gap: 14px;
    border-radius: var(--mb-shape-xl);
    outline: 0;
    padding: 16px 18px;
    background: var(--mb-color-surface-container);
    transition:
      background-color var(--mb-duration-medium) var(--mb-ease-standard);
  }

  .resource-editor-card:hover {
    background: var(--mb-color-surface-container-high);
  }

  .resource-editor-card:focus-within {
    background: var(--mb-color-surface-container-high);
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
    gap: 8px var(--mb-resource-meta-gap, 12px);
    flex-wrap: wrap;
  }

  .resource-editor-card__facts .resource-meta-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 30px;
    border-radius: var(--mb-shape-full);
    padding: 0 12px;
    font-size: 0.76rem;
    font-weight: 650;
    line-height: 1;
    white-space: nowrap;
  }

  .resource-editor-card__facts .resource-meta-pill .material-symbol {
    font-size: 1rem;
    line-height: 1;
  }

  .resource-fact {
    color: var(--mb-color-on-surface-variant);
    background: color-mix(in srgb, var(--mb-color-surface-container-highest) 68%, transparent);
  }

  .resource-fact .material-symbol {
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
    gap: var(--mb-resource-meta-gap, 12px);
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
    font-weight: 700;
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
    padding: 0 18px 0 16px;
    font-size: 0.82rem;
    font-weight: 680;
    white-space: nowrap;
    --md-filled-button-container-color: var(--mb-color-primary-container);
    --md-filled-button-label-text-color: var(--mb-color-on-primary-container);
    --md-filled-button-hover-label-text-color: var(--mb-color-on-primary-container);
    --md-filled-button-focus-label-text-color: var(--mb-color-on-primary-container);
    --md-filled-button-pressed-label-text-color: var(--mb-color-on-primary-container);
    --md-filled-button-icon-color: var(--mb-color-on-primary-container);
    --md-filled-button-hover-icon-color: var(--mb-color-on-primary-container);
    --md-filled-button-focus-icon-color: var(--mb-color-on-primary-container);
    --md-filled-button-pressed-icon-color: var(--mb-color-on-primary-container);
    --md-filled-button-container-shape: 16px;
    --md-filled-button-container-elevation: 1;
    --md-filled-button-hover-container-elevation: 2;
    --md-filled-button-pressed-container-elevation: 1;
    --md-filled-button-icon-size: 20px;
    transition:
      transform var(--mb-duration-short) var(--mb-ease-spring);
  }

  .fab-button:hover {
    transform: translateY(-1px);
  }

  .fab-button:active {
    transform: translateY(0);
  }

  .fab-button--danger {
    --md-filled-button-container-color: var(--mb-color-error-container);
    --md-filled-button-label-text-color: var(--mb-color-on-error-container);
    --md-filled-button-hover-label-text-color: var(--mb-color-on-error-container);
    --md-filled-button-focus-label-text-color: var(--mb-color-on-error-container);
    --md-filled-button-pressed-label-text-color: var(--mb-color-on-error-container);
    --md-filled-button-icon-color: var(--mb-color-on-error-container);
    --md-filled-button-hover-icon-color: var(--mb-color-on-error-container);
    --md-filled-button-focus-icon-color: var(--mb-color-on-error-container);
    --md-filled-button-pressed-icon-color: var(--mb-color-on-error-container);
    --md-filled-button-hover-state-layer-color: var(--mb-color-error);
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
    --md-filled-button-container-color: var(--mb-color-error);
    --md-filled-button-label-text-color: var(--mb-color-on-error);
    --md-filled-button-hover-label-text-color: var(--mb-color-on-error);
    --md-filled-button-focus-label-text-color: var(--mb-color-on-error);
    --md-filled-button-pressed-label-text-color: var(--mb-color-on-error);
    --md-filled-button-icon-color: var(--mb-color-on-error);
    --md-filled-button-hover-icon-color: var(--mb-color-on-error);
    --md-filled-button-focus-icon-color: var(--mb-color-on-error);
    --md-filled-button-pressed-icon-color: var(--mb-color-on-error);
    --md-filled-button-hover-state-layer-color: var(--mb-color-on-error);
    --md-filled-button-container-elevation: 1;
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
    border-top: 0;
    border-radius: var(--mb-shape-md);
    outline: 0;
    padding: 16px;
    background: color-mix(in srgb, var(--mb-color-surface) 68%, var(--mb-color-surface-container-high));
  }

  .resource-field-group__switch {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 64px;
  }

  .resource-field-group__switch md-switch {
    --md-switch-selected-track-color: var(--mb-color-primary);
    --md-switch-selected-handle-color: var(--mb-color-on-primary);
    --md-switch-selected-hover-track-color: var(--mb-color-primary);
    --md-switch-selected-focus-track-color: var(--mb-color-primary);
    --md-switch-selected-pressed-track-color: var(--mb-color-primary);
  }

`;
