# Moon Bridge Console UI/UX Depth Design

Date: 2026-06-07

## Purpose

This document extends the config graph console redesign with a dedicated UI/UX quality target. The existing implementation proves realtime graph editing, but several surfaces still feel like raw forms placed inside panels. The next iteration should keep the current Material Web / MD3 Expressive direction and color palette while making configuration work easier to scan, safer to edit, and more pleasant to use.

The goal is not to add decorative chrome. Every visual and motion change should help one of these workflows:

- understand runtime and save state quickly;
- edit long resource forms without losing context;
- see which provider/model/offer relationship is being edited;
- inspect logs with filtering and follow controls without losing original log text;
- use the console comfortably on narrow screens.

## Product Principles

- Keep the approved navigation: Overview, Models & Providers, Routes, Defaults, Search & Tools, Storage, Security, Logs.
- Keep Providers above Models in `Models & Providers`.
- Do not reintroduce YAML, config file paths, global Apply, pending change drawers, or Diagnostics.
- Preserve backend log raw text. The UI may add metadata columns, filters, and status chrome, but copied/downloaded log content must still use original raw lines.
- Prefer Material Web components for controls and actions when they improve quality. Avoid replacing useful controls with cosmetic wrappers that reduce accessibility.
- Motion must be subtle and functional: focus, save-state transitions, page enter, row append, active navigation, and collapsible form sections.
- Do not introduce a new design system dependency.

## Target Experience

### App Shell

The shell should feel like a dense operational console rather than a landing page. The top app bar remains restrained, but it should expose current context better:

- compact brand and console title;
- same-origin/runtime API chips kept as status metadata;
- icon-first theme action;
- language select that does not dominate the header.

Navigation should remain stable in size. Active state should have clear shape, color, and motion. On mobile, navigation becomes a horizontal rail under the top bar with fixed item width and no layout shift.

### Resource Editing

Each editable resource should appear as a resource editor with a meaningful header, not just a bare `h3` above fields.

Resource editor header content:

- icon or kind chip;
- resource ID;
- status pill (`Saved`, `Restart required`, `Needs attention`);
- runtime impact label when critical;
- field count or summary where useful.

Long resource editors should be visually grouped:

- first row: identity/reference fields;
- second row and below: advanced or object fields;
- object/array textareas are wider and use monospace formatting;
- secret fields clearly show replacement behavior without exposing current secrets.

### Field Controls

Schema-driven fields should feel like first-class controls:

- text, number, select, textarea, checkbox/switch, object editor;
- stable height and width;
- focus ring and hover state;
- save state chip at field level;
- invalid JSON shown inline and through `aria-invalid`;
- dirty/saving/saved/error status transitions with no layout jump.

The implementation can keep native inputs for reliability, but styling must bring them in line with the MD3 surface and state model. Where Material Web components are already practical, prefer them for actions and icon buttons.

### Models & Providers

The merged page should read as a graph:

- Providers section first;
- Provider Offers second, visually tied to providers;
- Models section last;
- each section has count metadata;
- resource cards use consistent headers and field grouping;
- empty states are explicit and calm.

This page should not become a two-column dashboard. The approved layout is vertical scrolling; improvements should make that scroll more legible.

### Logs

The Logs page should become a working log inspection surface:

- live follow/pause segmented behavior;
- text search;
- level filter (`All`, `Debug`, `Info`, `Warn`, `Error`);
- visible entry count;
- raw log lines shown in original order;
- row-level level styling without rewriting raw text;
- copy and download act on currently visible raw lines;
- stream failure is logged and surfaced as a non-blocking inline state.

The page should append streamed lines with subtle motion and keep the log viewport usable for long lines.

### Motion

Use motion for state change clarity, not decoration:

- page enter fade/translate already exists and can be retained;
- resource cards can animate into view with small stagger;
- field status chips can animate color/opacity;
- log rows can animate on append;
- respect reduced motion where feasible through CSS media queries.

## Testing Strategy

Tests must verify behavior and structure through rendered DOM and interactions:

- `Models & Providers` shows section counts and resource cards with status/critical labels.
- Field controls expose stable accessible labels and inline status.
- Logs can filter by level and search text.
- Copy/download use only visible raw lines.
- Navigation still omits YAML, Config, Apply, Changes, and Diagnostics.
- Build and e2e still pass after style and component changes.

Visual checks should include at least a desktop and narrow mobile viewport when a dev server can run. If the sandbox blocks listening sockets, record that limitation and rely on component/e2e tests plus build output.

## Acceptance Criteria

- The primary pages no longer read as raw form dumps.
- Realtime field save state is visually clear and stable.
- `Models & Providers` remains vertical and shows Providers, Provider Offers, Models in that order with resource-card quality.
- Logs supports search, level filtering, follow/pause, copy, download, and original raw line preservation.
- Mobile layout keeps navigation and controls usable without overlapping text.
- `webui/dist/` remains ignored and untracked.
- Embedded `internal/service/webui/dist/` is rebuilt only when implementation changes require it.
