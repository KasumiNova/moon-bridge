import type { ReactNode } from "react";
import { ApiError } from "../rpc/http";
import { ErrorState } from "../components/ErrorState";

export const defaultPage = { limit: 20, offset: 0 };

export function PageHeader({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children ? <p>{children}</p> : null}
    </header>
  );
}

export function StoreUnavailableState() {
  return (
    <ErrorState
      title="Management API unavailable"
      message="The persistence store is not available. Enable Moon Bridge persistence to use the console management API."
    />
  );
}

export function QueryErrorState({ error }: { error: unknown }) {
  if (error instanceof ApiError && (error.code === "store_unavailable" || error.status === 404)) {
    return <StoreUnavailableState />;
  }
  const message = error instanceof Error ? error.message : "Unknown request error";
  return <ErrorState message={message} />;
}

export function formatNumber(value: number | undefined) {
  return typeof value === "number" ? new Intl.NumberFormat().format(value) : "0";
}
