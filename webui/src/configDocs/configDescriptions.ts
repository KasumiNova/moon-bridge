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
  "trace.enabled",
  "log.level",
  "log.format",
  "server.addr",
  "server.auth_token",
  "server.max_sessions",
  "server.session_ttl",
  "persistence.active_provider",
  "cache.mode",
  "cache.ttl",
  "cache.prompt_caching",
  "cache.automatic_prompt_cache",
  "cache.explicit_cache_breakpoints",
  "cache.allow_retention_downgrade",
  "cache.max_breakpoints",
  "cache.min_cache_tokens",
  "cache.expected_reuse",
  "cache.minimum_value_score",
  "cache.min_breakpoint_tokens",
  "defaults.model",
  "defaults.max_tokens",
  "defaults.system_prompt",
  "models.<slug>.context_window",
  "models.<slug>.max_output_tokens",
  "models.<slug>.slug",
  "models.<slug>.display_name",
  "models.<slug>.description",
  "models.<slug>.base_instructions",
  "models.<slug>.default_reasoning_level",
  "models.<slug>.supported_reasoning_levels",
  "models.<slug>.supports_reasoning_summaries",
  "models.<slug>.default_reasoning_summary",
  "models.<slug>.input_modalities",
  "models.<slug>.supports_image_detail_original",
  "models.<slug>.web_search",
  "models.<slug>.extensions",
  "providers.<key>.key",
  "providers.<key>.base_url",
  "providers.<key>.api_key",
  "providers.<key>.protocol",
  "providers.<key>.version",
  "providers.<key>.user_agent",
  "providers.<key>.web_search",
  "providers.<key>.extensions",
  "providers.<key>.offers[].model",
  "providers.<key>.offers[].upstream_name",
  "providers.<key>.offers[].priority",
  "providers.<key>.offers[].pricing",
  "providers.<key>.offers[].overrides",
  "routes.<alias>.alias",
  "routes.<alias>.to",
  "routes.<alias>.model",
  "routes.<alias>.provider",
  "routes.<alias>.display_name",
  "routes.<alias>.description",
  "routes.<alias>.context_window",
  "routes.<alias>.web_search",
  "routes.<alias>.extensions",
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
  "trace.enabled": entry(
    "trace.enabled",
    "启用追踪",
    "Enable tracing",
    "记录请求转换和上游调用过程，便于排查路由与适配器问题。",
    "Records request conversion and upstream call flow for route and adapter diagnostics.",
    "boolean"
  ),
  "log.level": entry(
    "log.level",
    "日志级别",
    "Log level",
    "控制运行时输出的最低日志级别。",
    "Controls the minimum runtime log level.",
    "debug | info | warn | error",
    "info"
  ),
  "log.format": entry(
    "log.format",
    "日志格式",
    "Log format",
    "控制运行时日志输出为文本或 JSON。",
    "Controls whether runtime logs are emitted as text or JSON.",
    "text | json",
    "text"
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
  "server.max_sessions": entry(
    "server.max_sessions",
    "最大会话数",
    "Max sessions",
    "允许保留的最大会话数量；0 表示不限制。",
    "Maximum retained session count; 0 means unlimited.",
    "number",
    "0"
  ),
  "server.session_ttl": entry(
    "server.session_ttl",
    "会话 TTL",
    "Session TTL",
    "会话状态保留时长，例如 24h。",
    "How long session state is retained, for example 24h.",
    "string",
    "24h"
  ),
  "persistence.active_provider": entry(
    "persistence.active_provider",
    "持久化提供商",
    "Persistence provider",
    "选择配置存储后端。启用后控制台才能实时保存资源编辑。",
    "Selects the configuration store backend. The console needs it to save resource edits in realtime.",
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
  "cache.ttl": entry(
    "cache.ttl",
    "缓存 TTL",
    "Cache TTL",
    "缓存条目的保留时长，例如 1h。",
    "Retention duration for cache entries, for example 1h.",
    "string"
  ),
  "cache.prompt_caching": entry(
    "cache.prompt_caching",
    "启用 Prompt Cache",
    "Enable prompt caching",
    "允许 Moon Bridge 为支持的上游协议启用 prompt cache。",
    "Allows Moon Bridge to enable prompt caching for supported upstream protocols.",
    "boolean"
  ),
  "cache.automatic_prompt_cache": entry(
    "cache.automatic_prompt_cache",
    "自动 Prompt Cache",
    "Automatic prompt cache",
    "根据请求内容自动选择合适的缓存断点。",
    "Automatically chooses suitable cache breakpoints from request content.",
    "boolean"
  ),
  "cache.explicit_cache_breakpoints": entry(
    "cache.explicit_cache_breakpoints",
    "显式缓存断点",
    "Explicit cache breakpoints",
    "允许请求显式指定 prompt cache 断点。",
    "Allows requests to explicitly specify prompt cache breakpoints.",
    "boolean"
  ),
  "cache.allow_retention_downgrade": entry(
    "cache.allow_retention_downgrade",
    "允许降级保留策略",
    "Allow retention downgrade",
    "当上游不支持长保留策略时允许降级到可用策略。",
    "Allows downgrading to an available retention policy when the upstream does not support a longer policy.",
    "boolean"
  ),
  "cache.max_breakpoints": entry(
    "cache.max_breakpoints",
    "最大断点数",
    "Max breakpoints",
    "单次请求可插入的最大缓存断点数量。",
    "Maximum number of cache breakpoints inserted for one request.",
    "number"
  ),
  "cache.min_cache_tokens": entry(
    "cache.min_cache_tokens",
    "最小缓存 Token",
    "Min cache tokens",
    "低于该 token 数的片段不会作为缓存候选。",
    "Segments below this token count are not considered cache candidates.",
    "number"
  ),
  "cache.expected_reuse": entry(
    "cache.expected_reuse",
    "预期复用次数",
    "Expected reuse",
    "自动断点选择时用于估算收益的预期复用次数。",
    "Expected reuse count used to estimate value for automatic breakpoint selection.",
    "number"
  ),
  "cache.minimum_value_score": entry(
    "cache.minimum_value_score",
    "最小价值分",
    "Minimum value score",
    "自动断点候选必须达到的最低价值评分。",
    "Minimum value score required for automatic breakpoint candidates.",
    "number"
  ),
  "cache.min_breakpoint_tokens": entry(
    "cache.min_breakpoint_tokens",
    "最小断点 Token",
    "Min breakpoint tokens",
    "相邻缓存断点之间保留的最小 token 间隔。",
    "Minimum token distance kept between adjacent cache breakpoints.",
    "number"
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
  "models.<slug>.display_name": entry(
    "models.<slug>.display_name",
    "模型显示名称",
    "Model display name",
    "控制台中展示的人类可读模型名称。",
    "Human-readable model name shown in the console.",
    "string"
  ),
  "models.<slug>.description": entry(
    "models.<slug>.description",
    "模型描述",
    "Model description",
    "描述模型用途、能力或限制，便于控制台识别。",
    "Describes model purpose, capabilities, or limits for console readers.",
    "string"
  ),
  "models.<slug>.base_instructions": entry(
    "models.<slug>.base_instructions",
    "基础指令",
    "Base instructions",
    "追加到该模型请求中的默认行为指令。",
    "Default behavior instructions appended to requests for this model.",
    "string"
  ),
  "models.<slug>.default_reasoning_level": entry(
    "models.<slug>.default_reasoning_level",
    "默认思考深度",
    "Default reasoning level",
    "请求未指定思考深度时使用的默认 level。",
    "Default reasoning level used when a request does not specify one.",
    "string"
  ),
  "models.<slug>.supported_reasoning_levels": entry(
    "models.<slug>.supported_reasoning_levels",
    "支持的思考深度",
    "Supported reasoning levels",
    "该模型允许选择的思考深度列表。",
    "List of reasoning levels allowed for this model.",
    "array"
  ),
  "models.<slug>.supports_reasoning_summaries": entry(
    "models.<slug>.supports_reasoning_summaries",
    "支持思考摘要",
    "Supports reasoning summaries",
    "标记该模型是否支持返回思考摘要。",
    "Marks whether this model supports returning reasoning summaries.",
    "boolean"
  ),
  "models.<slug>.default_reasoning_summary": entry(
    "models.<slug>.default_reasoning_summary",
    "默认思考摘要",
    "Default reasoning summary",
    "请求未指定摘要模式时使用的默认思考摘要设置。",
    "Default reasoning summary setting used when a request does not specify one.",
    "string"
  ),
  "models.<slug>.input_modalities": entry(
    "models.<slug>.input_modalities",
    "输入模态",
    "Input modalities",
    "该模型支持的输入类型，例如 text 或 image。",
    "Input types supported by this model, such as text or image.",
    "array"
  ),
  "models.<slug>.supports_image_detail_original": entry(
    "models.<slug>.supports_image_detail_original",
    "支持原始图像细节",
    "Supports original image detail",
    "标记视觉请求是否可向该模型发送 original 图像细节。",
    "Marks whether visual requests can send original image detail to this model.",
    "boolean"
  ),
  "models.<slug>.web_search": entry(
    "models.<slug>.web_search",
    "模型联网搜索",
    "Model web search",
    "覆盖该模型的联网搜索行为。",
    "Overrides web search behavior for this model.",
    "object"
  ),
  "models.<slug>.extensions": entry(
    "models.<slug>.extensions",
    "模型扩展",
    "Model extensions",
    "覆盖该模型启用的扩展工具和配置。",
    "Overrides extension tools and config enabled for this model.",
    "object"
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
  "providers.<key>.web_search": entry(
    "providers.<key>.web_search",
    "提供商联网搜索",
    "Provider web search",
    "覆盖该 Provider 的联网搜索行为。",
    "Overrides web search behavior for this provider.",
    "object"
  ),
  "providers.<key>.extensions": entry(
    "providers.<key>.extensions",
    "提供商扩展",
    "Provider extensions",
    "覆盖该 Provider 启用的扩展工具和配置。",
    "Overrides extension tools and config enabled for this provider.",
    "object"
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
  "providers.<key>.offers[].priority": entry(
    "providers.<key>.offers[].priority",
    "Offer 优先级",
    "Offer priority",
    "同一模型存在多个 Provider 能力时的排序权重，数值越低越优先。",
    "Ordering weight when multiple provider offers serve the same model; lower values are preferred.",
    "number"
  ),
  "providers.<key>.offers[].pricing": entry(
    "providers.<key>.offers[].pricing",
    "价格",
    "Pricing",
    "输入、输出、cache write 和 cache read 的计价元数据，用于统计成本。",
    "Pricing metadata for input, output, cache write, and cache read, used for cost tracking.",
    "number"
  ),
  "providers.<key>.offers[].overrides": entry(
    "providers.<key>.offers[].overrides",
    "Offer 覆盖配置",
    "Offer overrides",
    "该 Provider 能力专用的模型能力覆盖项。",
    "Model capability overrides specific to this provider offer.",
    "object"
  ),
  "routes.<alias>.to": entry(
    "routes.<alias>.to",
    "路由目标",
    "Route target",
    "该路由指向的内部目标标识。",
    "Internal target identifier used by this route.",
    "string"
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
  "routes.<alias>.display_name": entry(
    "routes.<alias>.display_name",
    "路由显示名称",
    "Route display name",
    "控制台中展示的人类可读路由名称。",
    "Human-readable route name shown in the console.",
    "string"
  ),
  "routes.<alias>.description": entry(
    "routes.<alias>.description",
    "路由描述",
    "Route description",
    "描述该路由的用途或模型选择策略。",
    "Describes this route's purpose or model selection policy.",
    "string"
  ),
  "routes.<alias>.context_window": entry(
    "routes.<alias>.context_window",
    "路由上下文窗口",
    "Route context window",
    "该路由暴露给客户端的上下文窗口上限。",
    "Context window limit exposed to clients for this route.",
    "number"
  ),
  "routes.<alias>.web_search": entry(
    "routes.<alias>.web_search",
    "路由联网搜索",
    "Route web search",
    "覆盖该路由的联网搜索行为。",
    "Overrides web search behavior for this route.",
    "object"
  ),
  "routes.<alias>.extensions": entry(
    "routes.<alias>.extensions",
    "路由扩展",
    "Route extensions",
    "覆盖该路由启用的扩展工具和配置。",
    "Overrides extension tools and config enabled for this route.",
    "object"
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
      "zh-CN": "通过配置图实时保存；部分关键字段可能需要重启后完全生效。",
      "en-US": "Saved through the config graph; some critical fields may require restart to fully take effect."
    }
  };
}
