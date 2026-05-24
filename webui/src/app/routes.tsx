import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { App } from "./App";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="placeholder-panel" aria-labelledby="page-title">
      <div>
        <p className="eyebrow">Console workspace</p>
        <h1 id="page-title">{title}</h1>
        <p>
          This surface is ready for Moon Bridge API data, staged changes, and
          operational controls.
        </p>
      </div>
    </section>
  );
}

export function RouteOutlet() {
  return <Outlet />;
}

export const routes = [
  { index: true, element: <Navigate to="/overview" replace /> },
  { path: "overview", element: <PlaceholderPage title="Overview" /> },
  { path: "models", element: <PlaceholderPage title="Models" /> },
  { path: "providers", element: <PlaceholderPage title="Providers" /> },
  { path: "routes", element: <PlaceholderPage title="Routes" /> },
  { path: "extensions", element: <PlaceholderPage title="Extensions" /> },
  { path: "changes", element: <PlaceholderPage title="Changes" /> },
  { path: "config", element: <PlaceholderPage title="Config" /> },
  { path: "rpc-test", element: <PlaceholderPage title="RPC Test" /> }
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
