---
name: moonbridge-webui-design
description: Moon Bridge webui design and component rules. Use whenever changing files under webui/src that affect UI structure, controls, styling, theme tokens, layouts, or interaction behavior.
---

# Moon Bridge Webui Design

## Core Rule

Prefer official Material Web components from `@material/web` for all common controls.

Do not hand-roll controls such as switches, buttons, icon buttons, checkboxes, radio buttons, menus, tabs, dialogs, sliders, text fields, or progress indicators unless the user explicitly approves a custom control for that specific case. If a custom control is approved, document why Material Web is insufficient and keep the custom surface isolated.

Before changing webui UI, read `docs/webui/material-component-debt.md` when it exists. Treat it as the ordered migration backlog for known violations.

## Existing Stack

- React renders Material Web custom elements with `createElement(...)` or a small typed wrapper component.
- Material Web imports belong near the component/wrapper that uses the element, for example `@material/web/switch/switch.js`.
- Theme integration should use Material Web public CSS custom properties such as `--md-switch-selected-track-color`; do not style internal shadow DOM classes.
- Project theme tokens live under `webui/src/theme/` and app CSS chunks live under `webui/src/app/styles/`.

## Component Practice

- Use a wrapper when React needs to bridge custom-element properties or events, especially boolean properties such as `selected` and events such as `change`.
- Wrapper components must fail fast for impossible setup states. Do not add fallback markup that recreates the control.
- Keep wrappers narrow: map props to the official element and expose only app-needed behavior.
- Remove obsolete handcrafted CSS selectors when replacing custom controls.

## Verification

For UI control changes:

1. Add or update tests that render the actual UI and assert the official element is used.
2. Cover the interaction path that changes app state.
3. Run targeted tests first, then `npm run build`, `npm test`, and `git diff --check` from `webui` or repo root as appropriate.
4. For visual changes, use browser or screenshot verification when the risk is layout/spacing drift.

Visual verification is required for migrated controls. Use browser-rendered screenshots or an equivalent visual inspection path for each touched page/state. Passing tests alone is not enough when control geometry, density, or popover behavior changed. Treat major visual drift as a failed task.

## Reviewer Agent Requirements

When acting as a reviewer agent for Moon Bridge webui changes, enforce this skill strictly:

- Block approval if a common control is still hand-rolled and there is no explicit user-approved exception recorded in code or in `docs/webui/material-component-debt.md`.
- Block approval if a Material Web replacement includes fallback markup that recreates the old custom control.
- Block approval if code styles Material Web shadow DOM internals or private classes instead of public CSS custom properties.
- Block approval if tests do not assert that the migrated official Material Web element is rendered.
- Block approval if interaction tests do not cover the migrated control's state-change path.
- Block approval if visual verification is missing for changed pages or if screenshots show major layout, density, alignment, or overflow drift.
- Check staged files and diffs directly. Do not rely on implementer summaries.
