import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface Env {
  DB: D1Database;
  ICONS: R2Bucket;
  SESSION_SECRET?: string;
}

/**
 * Returns the Cloudflare bindings (D1 database, R2 bucket, env vars) for the
 * current request. Only works inside route handlers / server components
 * running on the Cloudflare Workers runtime (via the OpenNext adapter).
 */
export function cf(): Env {
  return getCloudflareContext().env as unknown as Env;
}
