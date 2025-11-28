import Errors from "./errors.ts";

/**
 * Base error class for all Spall errors.
 */
export class SpallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Error thrown when the Discord API returns an error.
 */
export class APIError extends SpallError {
  code: number;
  error_message: string;
  human_readable?: string;

  constructor(code: number, additional_context?: string) {
    const error_info = Errors[code as keyof typeof Errors];
    const error_message = typeof error_info === "string" ? error_info : error_info?.error ?? "Unknown Error";
    const human_readable = typeof error_info === "object" ? error_info.humanReadable : undefined;

    const message = additional_context
      ? `[${code}] ${error_message}: ${additional_context}`
      : `[${code}] ${error_message}`;

    super(message);
    this.code = code;
    this.error_message = error_message;
    this.human_readable = human_readable;
  }
}

/**
 * Error thrown when session start limit is critical.
 */
export class SessionLimitError extends SpallError {
  remaining: number;
  total: number;
  reset_at: Date;

  constructor(remaining: number, total: number, reset_after: number) {
    const reset_at = new Date(Date.now() + reset_after);
    const reset_time_readable = reset_at.toLocaleString();
    const minutes_until_reset = Math.ceil(reset_after / 1000 / 60);

    const message =
      `Session start limit critical: Only ${remaining} session(s) remaining out of ${total}. ` +
      `Limit will reset at ${reset_time_readable} (in ${minutes_until_reset} minutes). ` +
      `Please wait before connecting to avoid hitting the rate limit.`;

    super(message);
    this.remaining = remaining;
    this.total = total;
    this.reset_at = reset_at;
  }
}

/**
 * Error thrown when a rate limit is hit.
 */
export class RateLimitError extends SpallError {
  retry_after: number;
  global: boolean;

  constructor(retry_after: number, global: boolean, scope?: string) {
    const scope_text = scope ? ` (${scope})` : "";
    const message = global
      ? `Global rate limit hit${scope_text}. Retry after ${retry_after}ms.`
      : `Rate limit hit${scope_text}. Retry after ${retry_after}ms.`;

    super(message);
    this.retry_after = retry_after;
    this.global = global;
  }
}

/**
 * Error thrown when a WebSocket error occurs.
 */
export class WebSocketError extends SpallError {
  code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }
}
