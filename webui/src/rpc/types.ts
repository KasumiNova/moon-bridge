export type Paginated<T> = {
  data: T[];
  total: number;
  limit: number;
  offset: number;
};

export type StatusResponse = {
  uptime: string;
  version: string;
  mode: string;
  provider_count: number;
  route_count: number;
  addr: string;
  timestamp: string;
};

export type Offer = {
  model: string;
  upstream_name?: string;
  priority: number;
  input_price: number;
  output_price: number;
  cache_write: number;
  cache_read: number;
};

export type ProviderSummary = {
  key: string;
  protocol: string;
  offer_count: number;
  base_url: string;
  health_status: string;
};

export type ProviderDetail = ProviderSummary & {
  api_key: string;
  version: string;
  user_agent: string;
  offers: Offer[];
  web_search: string;
  web_search_max_uses: number;
};

export type ProviderUpsert = {
  base_url: string;
  api_key: string;
  version?: string;
  protocol?: string;
  user_agent?: string;
};

export type ModelSummary = {
  slug: string;
  display_name?: string;
  context_window: number;
  providers: string[];
};

export type ModelDetail = ModelSummary & {
  description: string;
  max_output_tokens: number;
  input_modalities: string[];
};

export type ModelUpsert = {
  display_name?: string;
  description?: string;
  context_window?: number;
  max_output_tokens?: number;
};

export type RouteSummary = {
  alias: string;
  model: string;
  provider: string;
  display_name?: string;
};

export type RouteDetail = RouteSummary & {
  context_window: number;
};

export type RouteUpsert = {
  model: string;
  provider?: string;
  display_name?: string;
  context_window?: number;
};

export type ChangeRow = {
  id?: number;
  change_id?: number;
  action: string;
  resource: string;
  target_key?: string;
  target?: string;
  before?: string;
  after?: string;
  created_at?: string;
};

export type StatsSummary = {
  requests: number;
  input_tokens: number;
  output_tokens: number;
  cache_hit_rate: number;
  total_cost: number;
  duration: string;
};

export type SessionInfo = {
  key: string;
  model?: string;
  created_at: string;
  last_used: string;
};

export type DefaultsSettings = {
  model: string;
  max_tokens: number;
  system_prompt: string;
};

export type WebSearchSettings = {
  support: string;
  max_uses: number;
  tavily_api_key: string;
  firecrawl_api_key: string;
  search_max_rounds: number;
};

export type ValidationResult = {
  valid: boolean;
  errors?: string[];
};

export type ImportResult = {
  changes: Array<{ change_id: number; resource: string; target: string }>;
  count: number;
  message: string;
};

export type MutationAccepted = {
  change_id: number;
  status: string;
  message?: string;
};

export type ApplyResult = {
  status: string;
  message: string;
};
