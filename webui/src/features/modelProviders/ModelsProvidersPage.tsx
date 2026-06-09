import { useState } from "react";
import { LoadingState } from "../../components/LoadingState";
import { MaterialIconButton } from "../../components/MaterialButton";
import { useI18n } from "../../i18n/I18nProvider";
import type { ConfigGraph, ConfigResource, ResourceKind } from "../../rpc/types";
import { CreateResourcePanel } from "../configGraph/CreateResourcePanel";
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
  const offersByProvider = groupOffersByProvider(offers);
  const unmatchedOffers = offers.filter((offer) => !providers.some((provider) => provider.id === providerIdForOffer(offer)));

  return (
    <section className="page-stack" aria-labelledby="models-providers-title">
      <PageHeader eyebrow={t("pageEyebrow.upstream")} title={t("nav.modelsProviders")}>
        {t("modelsProviders.description")}
      </PageHeader>

      <section className="content-panel" aria-labelledby="providers-heading">
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
              <ProviderOffers
                graph={graph.data}
                provider={provider}
                offers={offersByProvider.get(provider.id) ?? []}
              />
            </section>
          ))}
        </div>
      </section>

      {unmatchedOffers.length > 0 ? (
        <section className="content-panel" aria-labelledby="offers-heading">
          <h2 id="offers-heading">{t("modelsProviders.offers", { count: unmatchedOffers.length })}</h2>
          <div className="resource-card-list">
            {unmatchedOffers.map((offer) => (
              <ResourceEditorCard
                key={offer.id}
                resource={offer}
                revision={graph.data.revision}
                title={t("resource.kind.offer")}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="content-panel" aria-labelledby="models-heading">
        <div className="section-heading">
          <h2 id="models-heading">{t("modelsProviders.models", { count: models.length })}</h2>
          <CreateResourcePanel graph={graph.data} kind="model" />
        </div>
        <div className="resource-card-list">
          {models.map((model) => (
            <ResourceEditorCard
              key={model.id}
              resource={model}
              revision={graph.data.revision}
              title={t("resource.kind.model")}
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
function groupOffersByProvider(offers: ConfigResource[]) {
  const groups = new Map<string, ConfigResource[]>();
  for (const offer of offers) {
    const providerId = providerIdForOffer(offer);
    const group = groups.get(providerId) ?? [];
    group.push(offer);
    groups.set(providerId, group);
  }
  return groups;
}

function providerIdForOffer(offer: ConfigResource) {
  return offer.id.split("/", 1)[0] ?? "";
}

function ProviderOffers({
  graph,
  provider,
  offers
}: {
  graph: ConfigGraph;
  provider: ConfigResource;
  offers: ConfigResource[];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const headingId = `provider-${provider.id}-offers-heading`;
  const bodyId = `provider-${provider.id}-offers-body`;
  const offersLabel = t("modelsProviders.offers", { count: offers.length });
  return (
    <section className="provider-offers" aria-labelledby={headingId} data-open={open ? "true" : undefined}>
      <div className="provider-offers__bar">
        <div className="provider-offers__summary">
          <MaterialIconButton
            ariaExpanded={open}
            className="provider-offers__toggle"
            controls={bodyId}
            icon="chevron_right"
            label={offersLabel}
            onClick={() => setOpen((value) => !value)}
          />
          <span className="material-symbol provider-offers__icon" aria-hidden="true">
            smart_toy
          </span>
          <h3 id={headingId}>{offersLabel}</h3>
        </div>
        <CreateResourcePanel graph={graph} kind="provider_offer" providerId={provider.id} />
      </div>
      {open ? (
        <div className="resource-card-list resource-card-list--compact" id={bodyId}>
          {offers.map((offer) => (
            <ResourceEditorCard
              key={offer.id}
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
