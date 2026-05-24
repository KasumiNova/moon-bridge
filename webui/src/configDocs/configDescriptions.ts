import type { Locale } from "../i18n/messages";

export type ConfigDocEntry = {
  path: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  type: string;
  defaultValue?: string;
  sensitive?: boolean;
  apply: Record<Locale, string>;
};

export const requiredConfigPaths = [
  "mode",
  "server.addr",
  "server.auth_token",
  "persistence.active_provider",
  "cache.mode",
  "defaults.model",
  "defaults.max_tokens",
  "defaults.system_prompt",
  "models.<slug>.context_window",
  "models.<slug>.max_output_tokens",
  "models.<slug>.slug",
  "providers.<key>.key",
  "providers.<key>.base_url",
  "providers.<key>.api_key",
  "providers.<key>.protocol",
  "providers.<key>.version",
  "providers.<key>.user_agent",
  "providers.<key>.offers[].model",
  "providers.<key>.offers[].upstream_name",
  "providers.<key>.offers[].pricing",
  "routes.<alias>.alias",
  "routes.<alias>.model",
  "routes.<alias>.provider",
  "web_search.support",
  "web_search.max_uses",
  "web_search.tavily_api_key",
  "web_search.firecrawl_api_key",
  "web_search.search_max_rounds",
  "extensions.<name>.enabled",
  "extensions.<name>.config",
  "proxy.response",
  "proxy.anthropic"
] as const;

export type ConfigPath = (typeof requiredConfigPaths)[number];

export const configDescriptions: Record<ConfigPath, ConfigDocEntry> = {
  "mode": entry(
    "mode",
    "运行模式",
    "Run mode",
    "控制 Moon Bridge 是转换 OpenAI Responses 请求，还是作为 Capture 透明代理运行。",
    "Controls whether Moon Bridge transforms OpenAI Responses requests or runs as a transparent capture proxy.",
    "Transform | CaptureResponse | CaptureAnthropic",
    "Transform"
  ),
  "server.addr": entry(
    "server.addr",
    "监听地址",
    "Listen address",
    "HTTP 服务监听地址。控制台、/api/v1 管理接口、/v1/responses 和 /v1/models 都从这里提供。",
    "HTTP listen address. The console, /api/v1 management API, /v1/responses, and /v1/models are served here.",
    "host:port",
    "127.0.0.1:38440"
  ),
  "server.auth_token": entry(
    "server.auth_token",
    "认证 Token",
    "Auth token",
    "Bearer 认证令牌。为空时不启用认证；设置后控制台和 API 请求都需要 Authorization header。",
    "Bearer auth token. Empty disables auth; when set, console and API requests require an Authorization header.",
    "string",
    "empty",
    true
  ),
  "persistence.active_provider": entry(
    "persistence.active_provider",
    "持久化提供商",
    "Persistence provider",
    "选择配置存储后端。启用后控制台才能保存、应用和丢弃配置编辑。",
    "Selects the configuration store backend. The console needs it to save, apply, and discard config edits.",
    "db_sqlite | db_d1",
    "db_sqlite"
  ),
  "cache.mode": entry(
    "cache.mode",
    "缓存模式",
    "Cache mode",
    "控制 prompt cache 行为：off 关闭，explicit 使用显式断点，automatic 自动选择，hybrid 混合两者。",
    "Controls prompt cache behavior: off disables it, explicit uses explicit breakpoints, automatic chooses them, hybrid combines both.",
    "off | explicit | automatic | hybrid",
    "explicit"
  ),
  "defaults.model": entry(
    "defaults.model",
    "默认模型",
    "Default model",
    "客户端请求未指定模型时使用的模型别名，通常指向 routes 段里的 alias。",
    "Model alias used when the client request omits a model, usually a route alias.",
    "string",
    "moonbridge"
  ),
  "defaults.max_tokens": entry(
    "defaults.max_tokens",
    "默认最大 Token",
    "Default max tokens",
    "请求未提供 max_output_tokens 时的默认输出上限。",
    "Default output limit when a request does not provide max_output_tokens.",
    "number",
    "65536"
  ),
  "defaults.system_prompt": entry(
    "defaults.system_prompt",
    "全局系统提示词",
    "Global system prompt",
    "追加到请求中的全局 system prompt，适合放置所有模型共享的行为约束。",
    "Global system prompt appended to requests, useful for behavior rules shared by all models.",
    "string",
    "empty"
  ),
  "models.<slug>.context_window": entry(
    "models.<slug>.context_window",
    "上下文窗口",
    "Context window",
    "模型可接受的最大上下文 token 数，用于路由能力展示和请求约束。",
    "Maximum context tokens the model can accept, used for route capability display and request limits.",
    "number"
  ),
  "models.<slug>.max_output_tokens": entry(
    "models.<slug>.max_output_tokens",
    "最大输出 Token",
    "Max output tokens",
    "模型单次响应允许的最大输出 token 数。",
    "Maximum output tokens the model can emit in one response.",
    "number"
  ),
  "models.<slug>.slug": entry(
    "models.<slug>.slug",
    "模型 Slug",
    "Model slug",
    "models 段里的稳定模型标识。Provider offer 和 route 都通过这个 slug 引用模型。",
    "Stable model identifier under models. Provider offers and routes reference models by this slug.",
    "string"
  ),
  "providers.<key>.key": entry(
    "providers.<key>.key",
    "Provider Key",
    "Provider key",
    "providers 段里的稳定上游标识。routes 段通过这个 key 选择请求要发往哪个 Provider。",
    "Stable upstream identifier under providers. Routes use this key to choose the provider for a request.",
    "string"
  ),
  "providers.<key>.base_url": entry(
    "providers.<key>.base_url",
    "上游 Base URL",
    "Upstream base URL",
    "上游 Provider API 地址。不同协议会按自己的路径和请求格式转发。",
    "Upstream provider API URL. Each protocol forwards using its own paths and request format.",
    "url"
  ),
  "providers.<key>.api_key": entry(
    "providers.<key>.api_key",
    "上游 API Key",
    "Upstream API key",
    "发送到上游 Provider 的密钥。管理 API 读取时会脱敏，写入 ****** 表示保留旧值。",
    "Secret sent to the upstream provider. Management reads are masked; writing ****** keeps the old value.",
    "string",
    undefined,
    true
  ),
  "providers.<key>.protocol": entry(
    "providers.<key>.protocol",
    "上游协议",
    "Upstream protocol",
    "选择上游接口格式：Anthropic Messages、OpenAI Responses、Google GenAI 或 OpenAI Chat。",
    "Selects the upstream API format: Anthropic Messages, OpenAI Responses, Google GenAI, or OpenAI Chat.",
    "anthropic | openai-response | google-genai | openai-chat",
    "anthropic"
  ),
  "providers.<key>.version": entry(
    "providers.<key>.version",
    "协议版本",
    "Protocol version",
    "Anthropic 兼容接口常用的版本头；部分 Provider 可留空。",
    "Version header commonly used by Anthropic-compatible APIs; optional for some providers.",
    "string"
  ),
  "providers.<key>.user_agent": entry(
    "providers.<key>.user_agent",
    "User Agent",
    "User agent",
    "发往上游的 User-Agent 标识，用于审计或 Provider 侧识别。",
    "User-Agent sent upstream for audit or provider-side identification.",
    "string"
  ),
  "providers.<key>.offers[].model": entry(
    "providers.<key>.offers[].model",
    "Offer 模型",
    "Offer model",
    "声明该 Provider 可服务的本地模型 slug，必须对应 models 段定义。",
    "Declares the local model slug this provider can serve; it should match a models entry.",
    "string"
  ),
  "providers.<key>.offers[].upstream_name": entry(
    "providers.<key>.offers[].upstream_name",
    "上游模型名",
    "Upstream model name",
    "发送给 Provider 的真实模型名。为空时通常使用本地模型 slug。",
    "Actual model name sent to the provider. Empty usually means the local model slug is used.",
    "string"
  ),
  "providers.<key>.offers[].pricing": entry(
    "providers.<key>.offers[].pricing",
    "价格",
    "Pricing",
    "输入、输出、cache write 和 cache read 的计价元数据，用于统计成本。",
    "Pricing metadata for input, output, cache write, and cache read, used for cost tracking.",
    "number"
  ),
  "routes.<alias>.model": entry(
    "routes.<alias>.model",
    "路由模型",
    "Route model",
    "客户端看到的 alias 映射到的本地模型 slug。",
    "Local model slug that the client-visible alias maps to.",
    "string"
  ),
  "routes.<alias>.alias": entry(
    "routes.<alias>.alias",
    "路由别名",
    "Route alias",
    "客户端请求中使用的模型名称。Moon Bridge 会把这个 alias 解析为内部 model/provider 组合。",
    "Model name used by clients. Moon Bridge resolves this alias to an internal model/provider pair.",
    "string"
  ),
  "routes.<alias>.provider": entry(
    "routes.<alias>.provider",
    "路由提供商",
    "Route provider",
    "处理该路由的 Provider key。",
    "Provider key that handles this route.",
    "string"
  ),
  "web_search.support": entry(
    "web_search.support",
    "网页搜索模式",
    "Web search mode",
    "auto 优先使用 Provider 原生搜索并回退注入；enabled 强制原生；disabled 禁用；injected 使用 Tavily/Firecrawl 工具注入。",
    "auto prefers provider-native search and falls back to injection; enabled forces native; disabled turns it off; injected uses Tavily/Firecrawl tools.",
    "auto | enabled | disabled | injected",
    "auto"
  ),
  "web_search.max_uses": entry(
    "web_search.max_uses",
    "最大使用次数",
    "Max uses",
    "限制单次请求可使用的网页搜索次数。",
    "Limits how many web search calls one request may use.",
    "number"
  ),
  "web_search.tavily_api_key": entry(
    "web_search.tavily_api_key",
    "Tavily API Key",
    "Tavily API key",
    "注入式网页搜索使用的 Tavily 密钥。",
    "Tavily secret used by injected web search.",
    "string",
    undefined,
    true
  ),
  "web_search.firecrawl_api_key": entry(
    "web_search.firecrawl_api_key",
    "Firecrawl API Key",
    "Firecrawl API key",
    "注入式网页搜索用于抓取页面内容的 Firecrawl 密钥。",
    "Firecrawl secret used by injected web search to fetch page content.",
    "string",
    undefined,
    true
  ),
  "web_search.search_max_rounds": entry(
    "web_search.search_max_rounds",
    "最大搜索轮次",
    "Search max rounds",
    "注入式搜索编排器最多循环执行搜索工具的轮次。",
    "Maximum orchestration rounds for injected search tools.",
    "number",
    "3"
  ),
  "extensions.<name>.enabled": entry(
    "extensions.<name>.enabled",
    "启用扩展",
    "Enable extension",
    "启用模型或全局扩展，例如 deepseek_v4、visual、db_sqlite、metrics。",
    "Enables model-level or global extensions such as deepseek_v4, visual, db_sqlite, and metrics.",
    "boolean"
  ),
  "extensions.<name>.config": entry(
    "extensions.<name>.config",
    "扩展配置",
    "Extension config",
    "扩展私有配置对象。不同扩展的字段不同，控制台以 JSON 方式安全编辑。",
    "Extension-specific config object. Fields differ by extension; the console edits it safely as JSON.",
    "object"
  ),
  "proxy.response": entry(
    "proxy.response",
    "OpenAI Capture 代理",
    "OpenAI capture proxy",
    "CaptureResponse 模式下透明代理到 OpenAI Responses 上游所需的 base_url、api_key 和默认模型。",
    "Base URL, API key, and default model for transparent OpenAI Responses proxying in CaptureResponse mode.",
    "object"
  ),
  "proxy.anthropic": entry(
    "proxy.anthropic",
    "Anthropic Capture 代理",
    "Anthropic capture proxy",
    "CaptureAnthropic 模式下透明代理到 Anthropic 兼容上游所需的 base_url、api_key、version 和模型。",
    "Base URL, API key, version, and model for transparent Anthropic-compatible proxying in CaptureAnthropic mode.",
    "object"
  )
};

export function getConfigDescription(path: ConfigPath, locale: Locale) {
  const entry = configDescriptions[path];
  return {
    ...entry,
    title: entry.title[locale],
    description: entry.description[locale],
    apply: entry.apply[locale]
  };
}

function entry(
  path: ConfigPath,
  zhTitle: string,
  enTitle: string,
  zhDescription: string,
  enDescription: string,
  type: string,
  defaultValue?: string,
  sensitive = false
): ConfigDocEntry {
  return {
    path,
    title: { "zh-CN": zhTitle, "en-US": enTitle },
    description: { "zh-CN": zhDescription, "en-US": enDescription },
    type,
    defaultValue,
    sensitive,
    apply: {
      "zh-CN": "通过管理 API 保存，执行 Apply 后重新加载运行时配置。",
      "en-US": "Saved through the management API and loaded into runtime after Apply."
    }
  };
}
