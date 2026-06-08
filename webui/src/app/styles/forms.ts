export const formStyles = `  .form-grid {
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

`;
