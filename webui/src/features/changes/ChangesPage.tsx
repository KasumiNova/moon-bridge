import { useQuery } from "@tanstack/react-query";
import { ChangeList } from "../../components/ChangeQueueDrawer";
import { LoadingState } from "../../components/LoadingState";
import { getChanges } from "../../rpc/management";
import { queryKeys } from "../../rpc/queryKeys";
import { PageHeader, QueryErrorState } from "../shared";

export function ChangesPage() {
  const query = useQuery({ queryKey: queryKeys.changes, queryFn: getChanges });

  if (query.error) {
    return <QueryErrorState error={query.error} />;
  }
  if (query.isLoading) {
    return <LoadingState label="Loading changes" />;
  }

  return (
    <section className="page-stack" aria-labelledby="changes-title">
      <PageHeader eyebrow="Review" title="Changes">
        Pending staged configuration changes. Apply them to reload runtime state, or discard them before they become active.
      </PageHeader>
      <section className="content-panel">
        <ChangeList changes={query.data ?? []} />
      </section>
    </section>
  );
}
