export const shellLayoutStyles = `  .workspace {
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
    box-shadow: none;
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

`;
