/* eslint-disable */
// Generated type file for Cloudflare Workers bindings (NEX-48)

import type { KVNamespace, ExecutionContext } from "@cloudflare/workers-types";

declare global {
  interface Env {
    CONTACT_RATE_LIMIT_KV?: KVNamespace;
    CONTACT_ANTIBOT_ENABLED?: string;
    CONTACT_RATE_LIMIT_ENABLED?: string;
    RATE_LIMIT_MAX?: string;
    RATE_LIMIT_WINDOW_SECONDS?: string;
    TURNSTILE_SECRET_KEY?: string;
    CONTACT_IP_HASH_KEY?: string;
    POSTMARK_SERVER_TOKEN?: string;
    POSTMARK_MESSAGE_STREAM?: string;
    EMAIL_FROM?: string;
    EMAIL_TO?: string;
    EMAIL_HEADERS_TIMEOUT_MS?: string;
    EMAIL_TOTAL_TIMEOUT_MS?: string;
    TURNSTILE_VERIFY_TIMEOUT_MS?: string;
  }
}

export {};
