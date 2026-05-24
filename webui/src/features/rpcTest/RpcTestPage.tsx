import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import {
  createResponse,
  listResponseModels,
  type CreateResponseResult
} from "../../rpc/responses";
import { PageHeader, QueryErrorState } from "../shared";

export function RpcTestPage() {
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
      <PageHeader eyebrow="Smoke Test" title="RPC Test">
        Send a minimal non-streaming `/v1/responses` request through Moon Bridge.
      </PageHeader>
      <div className="section-grid">
        <section className="content-panel">
          <h2>Request</h2>
          <form className="form-grid" onSubmit={submit}>
            <label className="form-grid__wide">
              Model
              <select
                value={model}
                onChange={(event) => setModel(event.currentTarget.value)}
              >
                <option value="">Select model</option>
                {models.data?.models.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.slug}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-grid__wide">
              Input
              <textarea
                rows={6}
                value={input}
                onChange={(event) => setInput(event.currentTarget.value)}
              />
            </label>
            <label>
              Max Output Tokens
              <input
                type="number"
                value={maxTokens}
                onChange={(event) => setMaxTokens(event.currentTarget.value)}
              />
            </label>
            <label>
              Temperature
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(event) => setTemperature(event.currentTarget.value)}
              />
            </label>
            <div className="form-actions">
              <button type="submit">Send</button>
            </div>
          </form>
        </section>
        <section className="content-panel">
          <h2>Response</h2>
          {latency !== null ? <p className="feedback-inline">Latency: {latency}ms</p> : null}
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
