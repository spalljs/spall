import type { QueuedRequest } from "./types.ts";

export class RateLimitBucket {
  limit = Infinity;
  remaining = Infinity;
  reset = -1;
  queue: QueuedRequest<unknown>[] = [];
  processing = false;

  /**
   * Adds a request to the bucket queue.
   */
  push = <T>(request: QueuedRequest<T>) => {
    this.queue.push(request as QueuedRequest<unknown>);
  };

  /**
   * Processes the next request in the queue if not rate limited.
   */
  process = async (): Promise<void> => {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.checkReset();

    if (this.remaining === 0 && Date.now() < this.reset) {
      const timeout = this.reset - Date.now();
      await new Promise((resolve) => setTimeout(resolve, timeout));
      this.checkReset();
    }

    this.processing = true;

    const item = this.queue.shift();
    if (!item) {
      this.processing = false;
      return;
    }

    try {
      const response = await item.request();
      item.resolve(response);
    } catch (error) {
      item.reject(error as Error);
    } finally {
      this.processing = false;
      this.process();
    }
  };

  /**
   * Updates rate limit information from response headers.
   */
  updateFromHeaders = (headers: Headers) => {
    const limit = headers.get("x-ratelimit-limit");
    const remaining = headers.get("x-ratelimit-remaining");
    const reset = headers.get("x-ratelimit-reset");
    const resetAfter = headers.get("x-ratelimit-reset-after");

    if (limit) this.limit = parseInt(limit, 10);
    if (remaining) this.remaining = parseInt(remaining, 10);

    if (reset) {
      this.reset = parseFloat(reset) * 1000;
    } else if (resetAfter) {
      this.reset = Date.now() + parseFloat(resetAfter) * 1000;
    }
  };

  /**
   * Resets the bucket if the rate limit has expired.
   */
  checkReset = () => {
    if (Date.now() >= this.reset) {
      this.remaining = this.limit;
    }
  };
}
