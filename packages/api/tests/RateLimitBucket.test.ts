import { describe, test, expect, beforeEach } from "bun:test";
import { RateLimitBucket } from "../src/RateLimitBucket.ts";

describe("RateLimitBucket", () => {
  let bucket: RateLimitBucket;

  beforeEach(() => {
    bucket = new RateLimitBucket();
  });

  test("initializes with default values", () => {
    expect(bucket.limit).toBe(Infinity);
    expect(bucket.remaining).toBe(Infinity);
    expect(bucket.reset).toBe(-1);
    expect(bucket.queue).toBeArray();
    expect(bucket.queue.length).toBe(0);
    expect(bucket.processing).toBe(false);
  });

  test("push adds request to queue", () => {
    const request = {
      resolve: () => {},
      reject: () => {},
      request: async () => "test",
    };

    bucket.push(request);
    expect(bucket.queue.length).toBe(1);
  });

  test("updateFromHeaders updates rate limit info", () => {
    const headers = new Headers({
      "x-ratelimit-limit": "10",
      "x-ratelimit-remaining": "5",
      "x-ratelimit-reset": "1672531200",
    });

    bucket.updateFromHeaders(headers);

    expect(bucket.limit).toBe(10);
    expect(bucket.remaining).toBe(5);
    expect(bucket.reset).toBe(1672531200000);
  });

  test("updateFromHeaders handles reset-after", () => {
    const now = Date.now();
    const headers = new Headers({
      "x-ratelimit-limit": "10",
      "x-ratelimit-remaining": "5",
      "x-ratelimit-reset-after": "60",
    });

    bucket.updateFromHeaders(headers);

    expect(bucket.limit).toBe(10);
    expect(bucket.remaining).toBe(5);
    expect(bucket.reset).toBeGreaterThanOrEqual(now + 60000);
    expect(bucket.reset).toBeLessThanOrEqual(now + 61000);
  });

  test("checkReset resets remaining if time expired", () => {
    bucket.limit = 10;
    bucket.remaining = 0;
    bucket.reset = Date.now() - 1000;

    bucket.checkReset();

    expect(bucket.remaining).toBe(10);
  });

  test("checkReset does not reset if time not expired", () => {
    bucket.limit = 10;
    bucket.remaining = 0;
    bucket.reset = Date.now() + 10000;

    bucket.checkReset();

    expect(bucket.remaining).toBe(0);
  });

  test("process handles successful request", async () => {
    let resolved = false;
    const request = {
      resolve: () => {
        resolved = true;
      },
      reject: () => {},
      request: async () => "success",
    };

    bucket.push(request);
    await bucket.process();

    expect(resolved).toBe(true);
    expect(bucket.queue.length).toBe(0);
  });

  test("process handles failed request", async () => {
    let rejected = false;
    const request = {
      resolve: () => {},
      reject: () => {
        rejected = true;
      },
      request: async () => {
        throw new Error("test error");
      },
    };

    bucket.push(request);
    await bucket.process();

    expect(rejected).toBe(true);
    expect(bucket.queue.length).toBe(0);
  });

  test("process waits if rate limited", async () => {
    const start = Date.now();
    bucket.remaining = 0;
    bucket.reset = Date.now() + 100;

    const request = {
      resolve: () => {},
      reject: () => {},
      request: async () => "success",
    };

    bucket.push(request);
    await bucket.process();

    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(95);
  });

  test("process handles multiple requests sequentially", async () => {
    const results: number[] = [];

    const request1 = {
      resolve: () => {},
      reject: () => {},
      request: async () => {
        results.push(1);
        return "1";
      },
    };

    const request2 = {
      resolve: () => {},
      reject: () => {},
      request: async () => {
        results.push(2);
        return "2";
      },
    };

    bucket.push(request1);
    bucket.push(request2);

    await bucket.process();
    await new Promise((r) => setTimeout(r, 10));

    expect(results).toEqual([1, 2]);
  });

  test("does not process if already processing", async () => {
    bucket.processing = true;

    const request = {
      resolve: () => {},
      reject: () => {},
      request: async () => "test",
    };

    bucket.push(request);
    await bucket.process();

    expect(bucket.queue.length).toBe(1);
  });

  test("does not process if queue is empty", async () => {
    await bucket.process();
    expect(bucket.processing).toBe(false);
  });
});
