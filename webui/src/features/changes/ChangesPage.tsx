import { useQuery } from "@tanstack/react-query";
import { ChangeList } from "../../components/ChangeQueueDrawer";
import { LoadingState } from "../../components/LoadingState";
import { getChanges } from "../../rpc/management";
import { queryKeys } from "../../rpc/queryKeys";
import { useI18n } from "../../i18n/I18nProvider";
import { PageHeader, QueryErrorState } from "../shared";

export function ChangesPage() {
  const { t } = useI18n();
  const query = useQuery({ queryKey: queryKeys.changes, queryFn: getChanges });

  if (query.error) {
    return <QueryErrorState error={query.error} />;
  }
  if (query.isLoading) {
    return <LoadingState label={t("changes.loading")} />;
  }

  return (
    <section className="page-stack" aria-labelledby="changes-title">
      <PageHeader eyebrow={t("pageEyebrow.review")} title={t("nav.changes")}>
        {t("changes.description")}
      </PageHeader>
      <section className="content-panel">
        <ChangeList changes={query.data ?? []} />
      </section>
    </section>
  );
}
