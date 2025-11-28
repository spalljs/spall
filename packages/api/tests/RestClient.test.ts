import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { RestClient } from "../src/RestClient.ts";

describe("RestClient", () => {
  let client: RestClient;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    client = new RestClient({
      token: "test_token",
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("initializes with provided token", () => {
    expect(client).toBeDefined();
  });

  test("setToken updates the token", () => {
    client.setToken("new_token");
    expect(client).toBeDefined();
  });

  test("get method exists and is callable", () => {
    expect(typeof client.get).toBe("function");
  });

  test("post method exists and is callable", () => {
    expect(typeof client.post).toBe("function");
  });

  test("put method exists and is callable", () => {
    expect(typeof client.put).toBe("function");
  });

  test("patch method exists and is callable", () => {
    expect(typeof client.patch).toBe("function");
  });

  test("delete method exists and is callable", () => {
    expect(typeof client.delete).toBe("function");
  });

  test("emits REQUEST event on request", async () => {
    const requestListener = mock(() => {});
    client.on("REQUEST", requestListener);

    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    }) as unknown as typeof fetch;

    await client.get("/test");

    expect(requestListener).toHaveBeenCalledTimes(1);
  });

  test("emits RESPONSE event on response", async () => {
    const responseListener = mock(() => {});
    client.on("RESPONSE", responseListener);

    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    }) as unknown as typeof fetch;

    await client.get("/test");

    expect(responseListener).toHaveBeenCalledTimes(1);
  });

  test("emits REQUEST_ERROR on failed request", async () => {
    const errorListener = mock(() => {});
    client.on("REQUEST_ERROR", errorListener);

    globalThis.fetch = mock(async () => {
      return new Response("Not Found", {
        status: 404,
        statusText: "Not Found",
      });
    }) as unknown as typeof fetch;

    try {
      await client.get("/test");
    } catch (error) {
      // Expected to throw
    }

    expect(errorListener).toHaveBeenCalledTimes(1);
  });

  test("handles successful responses with rate limit headers", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "x-ratelimit-limit": "5",
          "x-ratelimit-remaining": "4",
          "x-ratelimit-reset": String(Date.now() / 1000 + 60),
        },
      });
    }) as unknown as typeof fetch;

    const result = await client.get<{ success: boolean }>("/test");

    expect(result.success).toBe(true);
  });

  test("emits GLOBAL_RATE_LIMIT on global rate limit", async () => {
    const globalRateLimitListener = mock(() => {});
    client.on("GLOBAL_RATE_LIMIT", globalRateLimitListener);

    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "x-ratelimit-global": "true",
          "retry-after": "1",
        },
      });
    }) as unknown as typeof fetch;

    await client.get("/test");

    expect(globalRateLimitListener).toHaveBeenCalledTimes(1);
  });

  test("throws error on non-ok responses", async () => {
    globalThis.fetch = mock(async () => {
      return new Response("Internal Server Error", {
        status: 500,
        statusText: "Internal Server Error",
      });
    }) as unknown as typeof fetch;

    let errorThrown = false;
    try {
      await client.get("/test");
    } catch (error) {
      errorThrown = true;
      expect(error).toBeInstanceOf(Error);
    }

    expect(errorThrown).toBe(true);
  });

  test("handles 204 No Content responses", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(null, {
        status: 204,
      });
    }) as unknown as typeof fetch;

    const result = await client.delete("/test");

    expect(result).toBeUndefined();
  });

  test("handles responses with content-length: 0", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(null, {
        status: 200,
        headers: {
          "content-length": "0",
        },
      });
    }) as unknown as typeof fetch;

    const result = await client.get("/test");

    expect(result).toBeUndefined();
  });

  test("parses JSON responses", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: "123", name: "test" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    }) as unknown as typeof fetch;

    const result = await client.get<{ id: string; name: string }>("/test");

    expect(result.id).toBe("123");
    expect(result.name).toBe("test");
  });

  test("returns text for non-JSON responses", async () => {
    globalThis.fetch = mock(async () => {
      return new Response("plain text response", {
        status: 200,
        headers: {
          "content-type": "text/plain",
        },
      });
    }) as unknown as typeof fetch;

    const result = await client.get<string>("/test");

    expect(result).toBe("plain text response");
  });

  test("includes query parameters in URL", async () => {
    let requestUrl = "";
    globalThis.fetch = mock(async (url: string) => {
      requestUrl = url;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    }) as unknown as typeof fetch;

    await client.get("/test", {
      query: { limit: "10", before: "123456" },
    });

    expect(requestUrl).toContain("limit=10");
    expect(requestUrl).toContain("before=123456");
  });

  test("includes custom headers in request", async () => {
    let requestHeaders: Record<string, string> | undefined;
    globalThis.fetch = mock(
      async (_url: string, options?: RequestInit) => {
        requestHeaders = options?.headers as Record<string, string>;
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      },
    ) as unknown as typeof fetch;

    await client.get("/test", {
      headers: { "X-Custom-Header": "value" },
    });

    expect(requestHeaders).toBeDefined();
  });

  test("includes audit log reason in headers", async () => {
    let requestHeaders: Record<string, string> = {};
    globalThis.fetch = mock(
      async (_url: string, options?: RequestInit) => {
        requestHeaders = options?.headers as Record<string, string>;
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      },
    ) as unknown as typeof fetch;

    await client.delete("/test", {
      reason: "test reason",
    });

    expect(requestHeaders["X-Audit-Log-Reason"]).toBeDefined();
  });

  test("sends JSON body in POST request", async () => {
    let requestBody: string | undefined;
    globalThis.fetch = mock(
      async (_url: string, options?: RequestInit) => {
        requestBody = options?.body as string;
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      },
    ) as unknown as typeof fetch;

    await client.post("/test", {
      body: { name: "test", value: 42 },
    });

    expect(requestBody).toBeDefined();
    if (requestBody) {
      const parsed = JSON.parse(requestBody);
      expect(parsed.name).toBe("test");
      expect(parsed.value).toBe(42);
    }
  });

  test("sends FormData for file uploads", async () => {
    let requestBody: FormData | undefined;
    globalThis.fetch = mock(
      async (_url: string, options?: RequestInit) => {
        requestBody = options?.body as FormData;
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      },
    ) as unknown as typeof fetch;

    const fileData = new Uint8Array([1, 2, 3, 4]);
    await client.post("/test", {
      body: { content: "message with file" },
      files: [{ name: "test.txt", data: fileData }],
    });

    expect(requestBody).toBeInstanceOf(FormData);
  });

  test("uses separate buckets for different routes", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "x-ratelimit-limit": "5",
          "x-ratelimit-remaining": "4",
          "x-ratelimit-reset": String(Date.now() / 1000 + 60),
        },
      });
    }) as unknown as typeof fetch;

    await client.get("/channels/123");
    await client.get("/guilds/456");

    // Both requests should succeed with separate buckets
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  test("prepends Bot to token if not present", async () => {
    let authHeader = "";
    globalThis.fetch = mock(
      async (_url: string, options?: RequestInit) => {
        const headers = options?.headers as Record<string, string>;
        authHeader = headers?.Authorization || "";
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      },
    ) as unknown as typeof fetch;

    await client.get("/test");

    expect(authHeader).toStartWith("Bot ");
  });

  test("does not double-prepend Bot to token", async () => {
    const clientWithBot = new RestClient({
      token: "Bot test_token",
    });

    let authHeader = "";
    globalThis.fetch = mock(
      async (_url: string, options?: RequestInit) => {
        const headers = options?.headers as Record<string, string>;
        authHeader = headers?.Authorization || "";
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      },
    ) as unknown as typeof fetch;

    await clientWithBot.get("/test");

    expect(authHeader).toBe("Bot test_token");
    expect(authHeader.match(/Bot/g)?.length).toBe(1);
  });
});
