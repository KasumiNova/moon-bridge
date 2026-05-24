import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import {
  createResponse,
  listResponseModels,
  type CreateResponseResult
} from "../../rpc/responses";
import { useI18n } from "../../i18n/I18nProvider";
import { PageHeader, QueryErrorState } from "../shared";

export function RpcTestPage() {
  const { t } = useI18n();
  const models = useQuery({
    queryKey: ["responses", "models"],
    queryFn: listResponseModels
  });
  const [model, setModel] = useState("");
  const [input, setInput] = useState("ping");
  const [maxTokens, setMaxTokens] = useState("256");
  const [temperature, setTemperature] = useState("0.2");
  const [latency, setLatency] = useState<number | null>(null);
  const [result, setResult] = useState<CreateResponseResult | null>(null);
  const [error, setError] = useState<unknown>(null);

  if (models.error) {
    return <QueryErrorState error={models.error} />;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const started = performance.now();
    try {
      const response = await createResponse({
        model: model || models.data?.models[0]?.slug || "",
        input,
        max_output_tokens: Number(maxTokens),
        temperature: Number(temperature)
      });
      setLatency(Math.round(performance.now() - started));
      setResult(response);
    } catch (caught) {
      setLatency(Math.round(performance.now() - started));
      setError(caught);
    }
  }

  return (
    <section className="page-stack" aria-labelledby="rpc-test-title">
      <PageHeader eyebrow={t("pageEyebrow.smokeTest")} title={t("nav.rpcTest")}>
        {t("rpc.description")}
      </PageHeader>
      <div className="section-grid">
        <section className="content-panel">
          <h2>{t("rpc.request")}</h2>
          <form className="form-grid" onSubmit={submit}>
            <label className="form-grid__wide">
              {t("field.model")}
              <select
                value={model}
                onChange={(event) => setModel(event.currentTarget.value)}
              >
                <option value="">{t("rpc.selectModel")}</option>
                {models.data?.models.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.slug}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-grid__wide">
              {t("field.input")}
              <textarea
                rows={6}
                value={input}
                onChange={(event) => setInput(event.currentTarget.value)}
              />
            </label>
            <label>
              {t("field.maxOutputTokens")}
              <input
                type="number"
                value={maxTokens}
                onChange={(event) => setMaxTokens(event.currentTarget.value)}
              />
            </label>
            <label>
              {t("field.temperature")}
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(event) => setTemperature(event.currentTarget.value)}
              />
            </label>
            <div className="form-actions">
              <button type="submit">{t("action.send")}</button>
            </div>
          </form>
        </section>
        <section className="content-panel">
          <h2>{t("rpc.response")}</h2>
          {latency !== null ? <p className="feedback-inline">{t("feedback.latency", { latency })}</p> : null}
          {error ? (
            <pre className="json-block">{JSON.stringify(error, null, 2)}</pre>
          ) : (
            <pre className="json-block">{JSON.stringify(result ?? {}, null, 2)}</pre>
          )}
        </section>
      </div>
    </section>
  );
}
