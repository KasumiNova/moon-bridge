import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ChangesPage } from "../features/changes/ChangesPage";
import { ConfigPage } from "../features/config/ConfigPage";
import { ExtensionsPage } from "../features/extensions/ExtensionsPage";
import { ModelsPage } from "../features/models/ModelsPage";
import { OverviewPage } from "../features/overview/OverviewPage";
import { ProvidersPage } from "../features/providers/ProvidersPage";
import { RpcTestPage } from "../features/rpcTest/RpcTestPage";
import { RoutesPage } from "../features/routes/RoutesPage";
import { PlaceholderPage } from "./PlaceholderPage";

export function RouteOutlet() {
  return <Outlet />;
}

export const routes = [
  { index: true, element: <Navigate to="/overview" replace /> },
  { path: "overview", element: <OverviewPage /> },
  { path: "models", element: <ModelsPage /> },
  { path: "providers", element: <ProvidersPage /> },
  { path: "routes", element: <RoutesPage /> },
  { path: "extensions", element: <ExtensionsPage /> },
  { path: "changes", element: <ChangesPage /> },
  { path: "config", element: <ConfigPage /> },
  { path: "rpc-test", element: <RpcTestPage /> }
];

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
