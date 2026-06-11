import { useState } from "react";
import { LoadingState } from "../../components/LoadingState";
import { MaterialIconButton } from "../../components/MaterialButton";
import { useI18n } from "../../i18n/I18nProvider";
import type { ConfigGraph, ConfigResource, ResourceKind } from "../../rpc/types";
import { CreateResourcePanel } from "../configGraph/CreateResourcePanel";
import { modelDisplayNamesById } from "../configGraph/modelProviderIcons";
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
  const modelDisplayNames = modelDisplayNamesById(graph.data.resources);
  const offersByModel = groupOffersByModel(offers);
  const unmatchedOffers = offers.filter((offer) => !models.some((model) => model.id === modelIdForOffer(offer)));

  return (
    <section className="page-stack" aria-labelledby="models-providers-title">
      <PageHeader eyebrow={t("pageEyebrow.upstream")} title={t("nav.modelsProviders")}>
        {t("modelsProviders.description")}
      </PageHeader>

      <section className="resource-section" aria-labelledby="providers-heading">
        <div className="section-heading">
          <h2 id="providers-heading">{t("modelsProviders.providers", { count: providers.length })}</h2>
          <CreateResourcePanel graph={graph.data} kind="provider" />
        </div>
        <div className="resource-card-list">
          {providers.map((provider) => (
            <section
              className="provider-resource-group"
              aria-label={t("modelsProviders.providerRegion", { id: provider.id })}
              key={provider.id}
            >
              <ResourceEditorCard
                resource={provider}
                revision={graph.data.revision}
                title={t("resource.kind.provider")}
              />
            </section>
          ))}
        </div>
      </section>

      {unmatchedOffers.length > 0 ? (
        <section className="resource-section" aria-labelledby="offers-heading">
          <h2 id="offers-heading">{t("modelsProviders.unmatchedSupplies", { count: unmatchedOffers.length })}</h2>
          <div className="resource-card-list">
            {unmatchedOffers.map((offer) => (
              <ResourceEditorCard
                key={offer.id}
                modelDisplayNames={modelDisplayNames}
                resource={offer}
                revision={graph.data.revision}
                title={t("resource.kind.offer")}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="resource-section" aria-labelledby="models-heading">
        <div className="section-heading">
          <h2 id="models-heading">{t("modelsProviders.models", { count: models.length })}</h2>
          <CreateResourcePanel graph={graph.data} kind="model" />
        </div>
        <div className="resource-card-list">
          {models.map((model) => (
            <section
              className="model-resource-group"
              aria-label={t("modelsProviders.modelRegion", { id: model.id })}
              key={model.id}
            >
              <ResourceEditorCard
                modelDisplayNames={modelDisplayNames}
                resource={model}
                revision={graph.data.revision}
                title={t("resource.kind.model")}
              >
                <ModelProviderBindings
                  graph={graph.data}
                  modelDisplayNames={modelDisplayNames}
                  modelId={model.id}
                  offers={offersByModel.get(model.id) ?? []}
                />
              </ResourceEditorCard>
            </section>
          ))}
        </div>
      </section>
    </section>
  );
}

function resourcesByKind(resources: ConfigResource[], kind: ResourceKind) {
  return resources.filter((resource) => resource.kind === kind);
}
function groupOffersByModel(offers: ConfigResource[]) {
  const groups = new Map<string, ConfigResource[]>();
  for (const offer of offers) {
    const modelId = modelIdForOffer(offer);
    const group = groups.get(modelId) ?? [];
    group.push(offer);
    groups.set(modelId, group);
  }
  return groups;
}

function modelIdForOffer(offer: ConfigResource) {
  const valueModel = offer.value.model;
  if (typeof valueModel === "string" && valueModel.trim()) {
    return valueModel;
  }
  const slash = offer.id.indexOf("/");
  return slash >= 0 ? offer.id.slice(slash + 1) : "";
}

function ModelProviderBindings({
  graph,
  modelDisplayNames,
  modelId,
  offers
}: {
  graph: ConfigGraph;
  modelDisplayNames: Record<string, string>;
  modelId: string;
  offers: ConfigResource[];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const headingId = `model-${modelId}-providers-heading`;
  const bodyId = `model-${modelId}-providers-body`.replace(/[^a-zA-Z0-9_-]/g, "-");
  const offersLabel = t("modelsProviders.modelProviders", { count: offers.length });
  return (
    <section
      className={`resource-field-group resource-field-group--advanced model-provider-bindings${open ? "" : " resource-field-group--collapsed"}`}
      aria-labelledby={headingId}
      aria-label={offersLabel}
    >
      <div className="resource-field-group__header">
        <h4 id={headingId}>
          <span className="material-symbol" aria-hidden="true">cloud_sync</span>
          {offersLabel}
        </h4>
        <div className="resource-field-group__header-actions">
          <CreateResourcePanel graph={graph} kind="provider_offer" modelId={modelId} />
          <MaterialIconButton
            ariaExpanded={open}
            className="resource-field-group__toggle"
            controls={bodyId}
            icon="chevron_right"
            label={t("resource.group.toggle", { label: t("modelsProviders.modelProvidersToggle") })}
            onClick={() => setOpen((current) => !current)}
          />
        </div>
      </div>
      {open ? (
        <div className="resource-card-list resource-card-list--compact resource-field-group__body" id={bodyId}>
          {offers.map((offer) => (
            <ResourceEditorCard
              key={offer.id}
              modelDisplayNames={modelDisplayNames}
              resource={offer}
              revision={graph.revision}
              title={t("resource.kind.offer")}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
