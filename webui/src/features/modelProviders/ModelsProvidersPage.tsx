import { LoadingState } from "../../components/LoadingState";
import { useI18n } from "../../i18n/I18nProvider";
import type { ConfigResource, ResourceKind } from "../../rpc/types";
import { ResourceEditorCard } from "../configGraph/ResourceEditorCard";
import { useConfigGraph } from "../configGraph/useConfigGraph";
import { PageHeader, QueryErrorState } from "../shared";

export function ModelsProvidersPage() {
  const { t } = useI18n();
  const graph = useConfigGraph();

  if (graph.error) {
    return <QueryErrorState error={graph.error} />;
  }
  if (graph.isLoading || !graph.data) {
    return <LoadingState label={t("loading.providers")} />;
  }

  const providers = resourcesByKind(graph.data.resources, "provider");
  const offers = resourcesByKind(graph.data.resources, "provider_offer");
  const models = resourcesByKind(graph.data.resources, "model");

  return (
    <section className="page-stack" aria-labelledby="models-providers-title">
      <PageHeader eyebrow={t("pageEyebrow.upstream")} title={t("nav.modelsProviders")}>
        {t("modelsProviders.description")}
      </PageHeader>

      <section className="content-panel" aria-labelledby="providers-heading">
        <h2 id="providers-heading">Providers ({providers.length})</h2>
        <div className="resource-card-list">
          {providers.map((provider) => (
            <ResourceEditorCard
              key={provider.id}
              resource={provider}
              revision={graph.data.revision}
              title="Provider"
            />
          ))}
        </div>
      </section>

      <section className="content-panel" aria-labelledby="offers-heading">
        <h2 id="offers-heading">Provider Offers ({offers.length})</h2>
        <div className="resource-card-list">
          {offers.map((offer) => (
            <ResourceEditorCard
              key={offer.id}
              resource={offer}
              revision={graph.data.revision}
              title="Offer"
            />
          ))}
        </div>
      </section>

      <section className="content-panel" aria-labelledby="models-heading">
        <h2 id="models-heading">Models ({models.length})</h2>
        <div className="resource-card-list">
          {models.map((model) => (
            <ResourceEditorCard
              key={model.id}
              resource={model}
              revision={graph.data.revision}
              title="Model"
            />
          ))}
        </div>
      </section>
    </section>
  );
}

function resourcesByKind(resources: ConfigResource[], kind: ResourceKind) {
  return resources.filter((resource) => resource.kind === kind);
}
