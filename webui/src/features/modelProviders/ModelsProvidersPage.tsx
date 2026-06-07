import { LoadingState } from "../../components/LoadingState";
import { useI18n } from "../../i18n/I18nProvider";
import type { ConfigResource, ResourceKind } from "../../rpc/types";
import { GraphResourceField } from "../configGraph/GraphResourceField";
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
        <h2 id="providers-heading">Providers</h2>
        <div className="resource-card-list">
          {providers.map((provider) => (
            <ResourceEditor key={provider.id} resource={provider} revision={graph.data.revision} />
          ))}
        </div>
      </section>

      <section className="content-panel" aria-labelledby="offers-heading">
        <h2 id="offers-heading">Provider Offers</h2>
        <div className="resource-card-list">
          {offers.map((offer) => (
            <ResourceEditor key={offer.id} resource={offer} revision={graph.data.revision} />
          ))}
        </div>
      </section>

      <section className="content-panel" aria-labelledby="models-heading">
        <h2 id="models-heading">Models</h2>
        <div className="resource-card-list">
          {models.map((model) => (
            <ResourceEditor key={model.id} resource={model} revision={graph.data.revision} />
          ))}
        </div>
      </section>
    </section>
  );
}

function ResourceEditor({
  resource,
  revision
}: {
  resource: ConfigResource;
  revision: string;
}) {
  return (
    <section className="resource-editor" aria-label={resource.id}>
      <h3>{resource.id}</h3>
      <div className="form-grid">
        {resource.schema.fields.map((field) => (
          <GraphResourceField
            field={field}
            key={`${resource.kind}-${resource.id}-${field.path}`}
            resource={resource}
            revision={revision}
          />
        ))}
      </div>
    </section>
  );
}

function resourcesByKind(resources: ConfigResource[], kind: ResourceKind) {
  return resources.filter((resource) => resource.kind === kind);
}
