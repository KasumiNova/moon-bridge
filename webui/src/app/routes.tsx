import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import type { MessageKey } from "../i18n/messages";
import { useI18n } from "../i18n/I18nProvider";
import { DefaultsPage } from "../features/defaults/DefaultsPage";
import { ModelsProvidersPage } from "../features/modelProviders/ModelsProvidersPage";
import { OverviewPage } from "../features/overview/OverviewPage";
import { RoutesPage } from "../features/routes/RoutesPage";
import { PlaceholderPage } from "./PlaceholderPage";

export function RouteOutlet() {
  return <Outlet />;
}

export const routes = [
  { index: true, element: <Navigate to="/overview" replace /> },
  { path: "overview", element: <OverviewPage /> },
  { path: "models-providers", element: <ModelsProvidersPage /> },
  { path: "routes", element: <RoutesPage /> },
  { path: "defaults", element: <DefaultsPage /> },
  { path: "search-tools", element: <PlaceholderRoutePage labelKey="nav.searchTools" /> },
  { path: "storage", element: <PlaceholderRoutePage labelKey="nav.storage" /> },
  { path: "security", element: <PlaceholderRoutePage labelKey="nav.security" /> },
  { path: "logs", element: <PlaceholderRoutePage labelKey="nav.logs" /> }
];

function PlaceholderRoutePage({ labelKey }: { labelKey: MessageKey }) {
  const { t } = useI18n();
  return <PlaceholderPage title={t(labelKey)} />;
}

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: routes
    }
  ],
  { basename: "/console" }
);
