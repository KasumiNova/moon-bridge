import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as responses from "../../rpc/responses";
import { RpcTestPage } from "./RpcTestPage";

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={client}>
      <RpcTestPage />
    </QueryClientProvider>
  );
}

describe("RpcTestPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("sends a responses smoke test and shows latency/result", async () => {
    vi.spyOn(responses, "listResponseModels").mockResolvedValue({
      models: [{ slug: "moonbridge", name: "Moon Bridge", provider: "route" }]
    });
    const createResponse = vi.spyOn(responses, "createResponse").mockResolvedValue({
      id: "resp_1",
      status: "completed",
      model: "moonbridge",
      output: [],
      output_text: "pong"
    });

    renderPage();

    await screen.findByRole("option", { name: "moonbridge" });
    await userEvent.selectOptions(screen.getByLabelText(/model/i), "moonbridge");
    await userEvent.clear(screen.getByLabelText(/input/i));
    await userEvent.type(screen.getByLabelText(/input/i), "ping");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(createResponse).toHaveBeenCalledWith(expect.objectContaining({
      model: "moonbridge",
      input: "ping"
    }));
    expect(await screen.findByText(/pong/)).toBeInTheDocument();
    expect(screen.getByText(/latency/i)).toBeInTheDocument();
  });
});
