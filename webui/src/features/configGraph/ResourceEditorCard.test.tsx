import { screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { renderWithConsoleProviders } from "../../test/renderWithConsoleProviders";
import { field, resource } from "../../test/configGraphFixtures";
import * as configGraph from "../../rpc/configGraph";
import { ResourceEditorCard } from "./ResourceEditorCard";

describe("ResourceEditorCard", () => {
  test("renders resource identity, status metadata, and editable fields", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const provider = resource("provider", "anthropic", "Anthropic", {
      base_url: "https://api.anthropic.com",
      api_key: "******",
      protocol: "anthropic"
    }, [
      field("base_url", "Base URL"),
      field("api_key", "API Key", "string", "secret", undefined, true),
      field("protocol", "Protocol", "string", "select", ["anthropic", "openai-response"])
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={provider} revision="rev-1" title="Provider" />
    );

    expect(screen.getByRole("heading", { name: "anthropic" })).toBeInTheDocument();
    expect(screen.getByText("Provider")).toBeInTheDocument();
    expect(within(screen.getByLabelText("anthropic status")).getByText("Saved")).toBeInTheDocument();
    expect(screen.getByLabelText("Base URL")).toBeInTheDocument();
    expect(screen.getByLabelText("API Key")).toHaveAttribute("type", "password");
  });

  test("surfaces restart and critical runtime metadata", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "restartRequired",
      revision: "rev-2"
    });
    const server = resource("server", "main", "Server", {
      addr: "127.0.0.1:38440"
    }, [
      field("addr", "Address")
    ], {
      hotReloadable: false,
      runtimeImpact: "critical",
      status: "restartRequired"
    });

    renderWithConsoleProviders(
      <ResourceEditorCard resource={server} revision="rev-1" />
    );

    expect(screen.getByRole("heading", { name: "main" })).toBeInTheDocument();
    expect(screen.getByText("Restart required")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });

  test("localizes resource metadata in Chinese locale", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const server = resource("server", "main", "Server", {
      addr: "127.0.0.1:38440"
    }, [
      field("addr", "Address")
    ], {
      hotReloadable: false,
      runtimeImpact: "critical",
      status: "restartRequired"
    });

    renderWithConsoleProviders(
      <ResourceEditorCard resource={server} revision="rev-1" title="Server" />,
      { locale: "zh-CN" }
    );

    expect(screen.getByText("需要重启")).toBeInTheDocument();
    expect(screen.getByText("关键运行时")).toBeInTheDocument();
    expect(screen.getAllByText("1 个字段").length).toBeGreaterThan(0);
    expect(screen.getAllByText("变更后重启").length).toBeGreaterThan(0);
  });

  test("merges object fields into settings instead of an Advanced JSON group", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const offer = resource("provider_offer", "anthropic/claude-sonnet", "Offer", {
      model: "claude-sonnet",
      upstream_name: "claude-3-5-sonnet",
      priority: 1,
      pricing: { input_price: 3 },
      overrides: {}
    }, [
      field("model", "Model"),
      field("upstream_name", "Upstream Name"),
      field("priority", "Priority", "number", "number"),
      field("pricing", "Pricing", "object", "object"),
      field("overrides", "Overrides", "object", "object")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={offer} revision="rev-1" title="Offer" />
    );

    const identityGroup = screen.getByRole("group", { name: "Identity" });
    const standardGroup = screen.getByRole("group", { name: "Settings" });

    expect(within(identityGroup).getByLabelText("Model")).toBeInTheDocument();
    expect(within(identityGroup).getByLabelText("Upstream Name")).toBeInTheDocument();
    expect(within(standardGroup).getByLabelText("Priority")).toBeInTheDocument();
    expect(within(standardGroup).getByRole("button", { name: /Pricing.*1 key/ })).toBeInTheDocument();
    expect(within(standardGroup).getByRole("button", { name: /Overrides.*0 keys/ })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Advanced JSON" })).not.toBeInTheDocument();
  });

  test("keeps plain long text fields in settings instead of advanced JSON", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const model = resource("model", "claude-sonnet", "Claude Sonnet", {
      display_name: "Claude Sonnet",
      description: "Balanced model"
    }, [
      field("display_name", "Display Name"),
      field("description", "Description", "string", "textarea")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={model} revision="rev-1" title="Model" />
    );

    const settingsGroup = screen.getByRole("group", { name: "Settings" });
    expect(within(settingsGroup).getByLabelText("Description")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Advanced JSON" })).not.toBeInTheDocument();
  });

  test("classifies field widths by expected content density", () => {
    vi.spyOn(configGraph, "patchConfigGraph").mockResolvedValue({
      result: "committed",
      revision: "rev-2"
    });
    const model = resource("model", "claude-sonnet", "Claude Sonnet", {
      display_name: "Claude Sonnet",
      context_window: 200000,
      default_reasoning_level: "medium",
      description: "Balanced model",
      extensions: {}
    }, [
      field("display_name", "Display Name"),
      field("context_window", "Context Window", "number", "number"),
      field("default_reasoning_level", "Default Reasoning Level"),
      field("description", "Description", "string", "textarea"),
      field("extensions", "Extensions", "object", "object")
    ]);

    renderWithConsoleProviders(
      <ResourceEditorCard resource={model} revision="rev-1" title="Model" />
    );

    expect(screen.getByLabelText("Display Name").closest(".form-grid__medium")).toBeInTheDocument();
    expect(screen.getByLabelText("Context Window").closest(".form-grid__compact")).toBeInTheDocument();
    expect(screen.getByLabelText("Default Reasoning Level").closest(".form-grid__compact")).toBeInTheDocument();
    expect(screen.getByLabelText("Description").closest(".form-grid__wide")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Extensions.*0 keys/ }).closest(".form-grid__wide")).toBeInTheDocument();
  });
});
