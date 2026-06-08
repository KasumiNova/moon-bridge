# Webui Material Component Debt

This document tracks webui controls that violate the workspace rule: common controls must use official Material Web components from `@material/web` unless the user explicitly approves a custom control for that specific case.

## Migration Order

1. `SelectMenu`
2. `AuthGate`
3. `SchemaField`
4. `CreateResourcePanel`
5. `LogPanel` and `OverviewPage`
6. `RpcTestPage`
7. `ModelsProvidersPage`

## Debt Inventory

| Order | Component | Location | Current custom control | Target direction | Visual verification |
| --- | --- | --- | --- | --- | --- |
| 1 | `SelectMenu` | `webui/src/features/configGraph/SelectMenu.tsx` | Handwritten combobox/listbox/option with local keyboard handling | Replace with `md-outlined-select` and `md-select-option`, or a narrow wrapper if React property/event bridging is needed | Compare config editor select fields on desktop and mobile; no major width, density, popover, or label drift |
| 2 | `AuthGate` | `webui/src/components/AuthGate.tsx` | Native password input, custom checkbox, custom submit button | Use Material text field, checkbox, and button components | Verify auth card keeps existing hierarchy and spacing; checkbox and submit button must not dominate the card |
| 3 | `SchemaField` | `webui/src/features/configGraph/SchemaField.tsx` | Custom outlined text field, textarea, JSON summary button, help icon button/tooltip | Use Material text fields and icon buttons where available; keep JSON summary behavior only if Material has no direct equivalent and document the exception | Verify resource editor fields across text, secret, number, textarea, object, array, and switch examples |
| 4 | `CreateResourcePanel` | `webui/src/features/configGraph/CreateResourcePanel.tsx` | Custom buttons, text inputs, option groups, presets, help buttons | Use Material buttons, icon buttons, text fields, select/chips/radio controls based on semantics | Verify create provider/model/route/extension forms on desktop and mobile; no major grid or density drift |
| 5 | `LogPanel` | `webui/src/features/logs/LogPanel.tsx` | Custom segmented controls, log level filter, action buttons, search field | Use Material chips/buttons/text field | Verify logs toolbar remains compact and scannable in embedded overview and logs page contexts |
| 5 | `OverviewPage` | `webui/src/features/overview/OverviewPage.tsx` | Custom usage range segmented control | Use Material chips or tabs according to final interaction semantics | Verify usage dashboard header remains balanced and does not wrap awkwardly on mobile |
| 6 | `RpcTestPage` | `webui/src/features/rpcTest/RpcTestPage.tsx` | Native select, textarea, number inputs, submit button | Use Material select, text fields, and button | Verify smoke-test form remains simple and does not regress JSON response readability |
| 7 | `ModelsProvidersPage` | `webui/src/features/modelProviders/ModelsProvidersPage.tsx` | Custom provider-offers expand button | Use Material button/icon button, or document a controlled custom disclosure exception | Verify provider offers disclosure alignment and animation do not drift |

## Review Requirements

- Tests must render actual UI and assert official Material Web elements are used for migrated controls.
- A custom control may remain only with explicit user approval and an inline or debt-document note explaining why Material Web is insufficient.
- Visual verification must include browser-rendered screenshots for pages touched by each migration. Major visual drift means the task is not complete even if tests pass.
- Do not style Material Web internals or shadow DOM classes. Use public CSS custom properties and wrapper layout only.
- Do not add fallback markup that recreates the replaced custom control.
