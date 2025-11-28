export interface RateLimitData {
  limit: number;
  remaining: number;
  reset: number;
  reset_after: number;
  bucket: string;
  global: boolean;
  scope?: "user" | "global" | "shared";
}


export interface QueuedRequest<T = unknown> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  request: () => Promise<T>;
}

export interface RestClientOptions {
  token: string;
  api_version?: number;
  user_agent?: string;
  rest_timeout?: number;
  rest_offset?: number;
}

export type RestEvents = {
  RATE_LIMITED: [data: RateLimitData];
  REQUEST: [path: string, options: RequestInit];
  RESPONSE: [response: Response];
  REQUEST_ERROR: [error: Error];
  GLOBAL_RATE_LIMIT: [retry_after: number];
  [key: string]: unknown[];
};

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  reason?: string;
  files?: File[];
  query?: Record<string, string>;
}

export interface File {
  name: string;
  data: Blob | Buffer | Uint8Array;
}
