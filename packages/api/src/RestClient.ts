import { EventEmitter } from "@spall/utils";
import {
  API_VERSION,
  BASE_URL,
  DEFAULT_REST_OFFSET,
  DEFAULT_REST_TIMEOUT,
  DEFAULT_USER_AGENT,
  APIError,
} from "@spall/constants";
import { RateLimitBucket } from "./RateLimitBucket.ts";
import type {
  HttpMethod,
  RateLimitData,
  RequestOptions,
  RestClientOptions,
  RestEvents,
} from "./types.ts";

export class RestClient extends EventEmitter<RestEvents> {
  private token: string;
  private api_version: number;
  private user_agent: string;
  private rest_timeout: number;
  private rest_offset: number;
  private buckets = new Map<string, RateLimitBucket>();
  private global_reset = -1;

  constructor(options: RestClientOptions) {
    super();
    this.token = options.token;
    this.api_version = options.api_version ?? API_VERSION;
    this.user_agent = options.user_agent ?? DEFAULT_USER_AGENT;
    this.rest_timeout = options.rest_timeout ?? DEFAULT_REST_TIMEOUT;
    this.rest_offset = options.rest_offset ?? DEFAULT_REST_OFFSET;
  }

  /**
   * Makes a GET request.
   */
  get = async <T = unknown>(
    path: string,
    options?: RequestOptions,
  ): Promise<T> => this.request<T>("GET", path, options);

  /**
   * Makes a POST request.
   */
  post = async <T = unknown>(
    path: string,
    options?: RequestOptions,
  ): Promise<T> => this.request<T>("POST", path, options);

  /**
   * Makes a PUT request.
   */
  put = async <T = unknown>(
    path: string,
    options?: RequestOptions,
  ): Promise<T> => this.request<T>("PUT", path, options);

  /**
   * Makes a PATCH request.
   */
  patch = async <T = unknown>(
    path: string,
    options?: RequestOptions,
  ): Promise<T> => this.request<T>("PATCH", path, options);

  /**
   * Makes a DELETE request.
   */
  delete = async <T = unknown>(
    path: string,
    options?: RequestOptions,
  ): Promise<T> => this.request<T>("DELETE", path, options);

  /**
   * Makes a request to the Discord API.
   */
  private request = async <T = unknown>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> => {
    const url = this.buildUrl(path, options.query);
    const bucket = this.getBucket(path, method);

    return new Promise<T>((resolve, reject) => {
      bucket.push<T>({
        request: async () => {
          if (Date.now() < this.global_reset) {
            const wait = this.global_reset - Date.now();
            await new Promise((r) => setTimeout(r, wait));
          }

          const headers = this.buildHeaders(options);
          const body = await this.buildBody(options);

          this.emit("REQUEST", path, { method, headers, body });

          const response = await fetch(url, {
            method,
            headers,
            body,
            signal: AbortSignal.timeout(this.rest_timeout),
          });

          this.emit("RESPONSE", response);

          return this.handleResponse<T>(response, bucket, method, path, options, url);
        },
        resolve,
        reject,
      });

      bucket.process();
    });
  };

  /**
   * Handles the API response.
   */
  private handleResponse = async <T>(
    response: Response,
    bucket: RateLimitBucket,
    method: HttpMethod,
    path: string,
    options: RequestOptions,
    url: string,
  ): Promise<T> => {
    bucket.updateFromHeaders(response.headers);

    this.handleGlobalRateLimit(response.headers);

    if (response.status === 429) {
      return this.handle429<T>(response, bucket, method, path, options, url);
    }

    if (!response.ok) {
      const error_data = await response.json().catch(() => ({})) as { code?: number; message?: string };
      const error = error_data.code
        ? new APIError(error_data.code, error_data.message)
        : new APIError(response.status, response.statusText);

      this.emit("REQUEST_ERROR", error);
      throw error;
    }

    return this.parseResponse<T>(response);
  };

  /**
   * Handles global rate limit headers.
   */
  private handleGlobalRateLimit = (headers: Headers): void => {
    if (headers.get("x-ratelimit-global")) {
      const retryAfter = parseFloat(headers.get("retry-after") ?? "0");
      this.global_reset = Date.now() + retryAfter * 1000;
      this.emit("GLOBAL_RATE_LIMIT", retryAfter);
    }
  };

  /**
   * Handles 429 rate limit responses.
   */
  private handle429 = async <T>(
    response: Response,
    bucket: RateLimitBucket,
    method: HttpMethod,
    path: string,
    options: RequestOptions,
    url: string,
  ): Promise<T> => {
    const data = await response.json() as { retry_after: number; global: boolean };

    const rateLimitData: RateLimitData = {
      limit: bucket.limit,
      remaining: bucket.remaining,
      reset: bucket.reset,
      reset_after: data.retry_after,
      bucket: response.headers.get("x-ratelimit-bucket") ?? "",
      global: data.global,
      scope: response.headers.get("x-ratelimit-scope") as "user" | "global" | "shared" | undefined,
    };

    this.emit("RATE_LIMITED", rateLimitData);

    // Wait for retry_after duration plus offset before retrying
    await new Promise((r) => setTimeout(r, data.retry_after * 1000 + this.rest_offset));

    // Retry the request directly to avoid bucket deadlock
    // (we're currently inside a bucket request callback)
    return this.retryRequest<T>(method, url, options, bucket, path);
  };

  /**
   * Retries a request after rate limiting.
   */
  private retryRequest = async <T>(
    method: HttpMethod,
    url: string,
    options: RequestOptions,
    bucket: RateLimitBucket,
    path: string,
  ): Promise<T> => {
    const headers = this.buildHeaders(options);
    const body = await this.buildBody(options);

    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: AbortSignal.timeout(this.rest_timeout),
    });

    return this.handleResponse<T>(response, bucket, method, path, options, url);
  };

  /**
   * Parses the response body based on content type.
   */
  private parseResponse = async <T>(response: Response): Promise<T> => {
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json() as Promise<T>;
    }

    return response.text() as Promise<T>;
  };

  /**
   * Builds the full request URL.
   */
  private buildUrl = (path: string, query?: Record<string, string>): string => {
    const baseUrl = `${BASE_URL}/v${this.api_version}${path}`;

    if (!query || Object.keys(query).length === 0) {
      return baseUrl;
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      params.append(key, value);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  /**
   * Builds request headers.
   */
  private buildHeaders = (options: RequestOptions): Record<string, string> => {
    const headers: Record<string, string> = {
      "User-Agent": this.user_agent,
      Authorization: this.token.startsWith("Bot ") ? this.token : `Bot ${this.token}`,
      ...options.headers,
    };

    if (options.reason) {
      headers["X-Audit-Log-Reason"] = encodeURIComponent(options.reason);
    }

    if (options.body && !options.files) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };

  /**
   * Builds the request body.
   */
  private buildBody = async (
    options: RequestOptions,
  ): Promise<string | FormData | undefined> => {
    if (options.files && options.files.length > 0) {
      const formData = new FormData();

      if (options.body) {
        formData.append("payload_json", JSON.stringify(options.body));
      }

      for (let i = 0; i < options.files.length; i++) {
        const file = options.files[i]!;
        formData.append(`files[${i}]`, new Blob([file.data]), file.name);
      }

      return formData;
    }

    if (options.body) {
      return JSON.stringify(options.body);
    }

    return undefined;
  };

  /**
   * Gets or creates a rate limit bucket.
   */
  private getBucket = (path: string, method: HttpMethod): RateLimitBucket => {
    const key = `${method}:${path.split("?")[0]}`;

    if (!this.buckets.has(key)) {
      this.buckets.set(key, new RateLimitBucket());
    }

    return this.buckets.get(key)!;
  };

  /**
   * Sets the authorization token.
   */
  setToken = (token: string): void => {
    this.token = token;
  };
}