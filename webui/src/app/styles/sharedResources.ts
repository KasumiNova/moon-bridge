export const sharedResourceStyles = `  .metric-card,
  .content-panel,
  .state-panel {
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 60%, transparent);
    border-radius: var(--mb-shape-xl);
    background: var(--mb-color-surface-container);
    box-shadow: none;
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

  .provider-offers__summary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--mb-color-on-surface);
  }

  .provider-offers__toggle {
    --md-icon-button-icon-size: 20px;
    --md-icon-button-icon-color: var(--mb-color-on-surface-variant);
    --md-icon-button-hover-icon-color: var(--mb-color-on-surface-variant);
    --md-icon-button-pressed-icon-color: var(--mb-color-primary);
    flex: 0 0 auto;
    transition: transform var(--mb-duration-medium) var(--mb-ease-spring);
  }

  .provider-offers__toggle[aria-expanded="true"] {
    --md-icon-button-icon-color: var(--mb-color-primary);
    transform: rotate(90deg);
  }

  .provider-offers__summary h3 {
    margin: 0;
    font-size: 0.86rem;
    font-weight: 680;
    line-height: 1.2;
  }

  .provider-offers__icon {
    font-size: 18px;
    color: var(--mb-color-on-surface-variant);
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
    --md-filled-button-container-color: var(--mb-color-secondary-container);
    --md-filled-button-label-text-color: var(--mb-color-on-secondary-container);
    --md-filled-button-hover-label-text-color: var(--mb-color-on-secondary-container);
    --md-filled-button-focus-label-text-color: var(--mb-color-on-secondary-container);
    --md-filled-button-pressed-label-text-color: var(--mb-color-on-secondary-container);
    --md-filled-button-icon-color: var(--mb-color-on-secondary-container);
    --md-filled-button-hover-icon-color: var(--mb-color-on-secondary-container);
    --md-filled-button-focus-icon-color: var(--mb-color-on-secondary-container);
    --md-filled-button-pressed-icon-color: var(--mb-color-on-secondary-container);
    --md-filled-button-hover-state-layer-color: var(--mb-color-secondary);
  }

  .create-resource__panel {
    width: min(760px, 100%);
    display: grid;
    gap: 14px;
    border: 1px solid color-mix(in srgb, var(--mb-color-outline-variant) 60%, transparent);
    border-radius: var(--mb-shape-xl);
    padding: 18px 20px;
    background: var(--mb-color-surface-container-high);
    box-shadow: none;
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
    --md-icon-button-state-layer-width: 36px;
    --md-icon-button-state-layer-height: 36px;
    --md-icon-button-icon-size: 20px;
    --md-icon-button-icon-color: var(--mb-color-on-surface-variant);
    --md-icon-button-hover-icon-color: var(--mb-color-primary);
    --md-icon-button-focus-icon-color: var(--mb-color-primary);
    --md-icon-button-pressed-icon-color: var(--mb-color-primary);
    --md-icon-button-hover-state-layer-color: var(--mb-color-primary);
    --md-icon-button-focus-state-layer-color: var(--mb-color-primary);
    --md-icon-button-pressed-state-layer-color: var(--mb-color-primary);
    --md-icon-button-hover-state-layer-opacity: 0.12;
    --md-icon-button-focus-state-layer-opacity: 0.12;
  }

`;
