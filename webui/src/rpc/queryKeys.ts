export const queryKeys = {
  status: ["status"] as const,
  providers: (page: { limit: number; offset: number }) => ["providers", page] as const,
  models: (page: { limit: number; offset: number }) => ["models", page] as const,
  routes: (page: { limit: number; offset: number }) => ["routes", page] as const,
  changes: ["changes"] as const,
  statsSummary: ["stats", "summary"] as const,
  sessions: ["sessions"] as const
};
