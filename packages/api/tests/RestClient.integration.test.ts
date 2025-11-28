import { describe, test, expect, beforeAll } from "bun:test";
import { RestClient } from "../src/RestClient.ts";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const USER_ID = process.env.USER_ID;
const ROLE_ID = process.env.ROLE_ID;
const MESSAGE_ID = process.env.MESSAGE_ID;

const skipIfNoToken = DISCORD_TOKEN ? test : test.skip;

describe("RestClient Integration Tests", () => {
  let client: RestClient;

  beforeAll(() => {
    if (DISCORD_TOKEN) {
      client = new RestClient({ token: DISCORD_TOKEN });
    }
  });

  skipIfNoToken("fetches current user", async () => {
    const user = await client.get<{ id: string; username: string }>("/users/@me");

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.username).toBeDefined();
  });

  skipIfNoToken("fetches guild", async () => {
    if (!GUILD_ID) return;

    const guild = await client.get<{ id: string; name: string }>(`/guilds/${GUILD_ID}`);

    expect(guild).toBeDefined();
    expect(guild.id).toBe(GUILD_ID);
    expect(guild.name).toBeDefined();
  });

  skipIfNoToken("fetches channel", async () => {
    if (!CHANNEL_ID) return;

    const channel = await client.get<{ id: string; type: number }>(`/channels/${CHANNEL_ID}`);

    expect(channel).toBeDefined();
    expect(channel.id).toBe(CHANNEL_ID);
    expect(channel.type).toBeDefined();
  });

  skipIfNoToken("fetches guild channels", async () => {
    if (!GUILD_ID) return;

    const channels = await client.get<Array<{ id: string; type: number }>>(`/guilds/${GUILD_ID}/channels`);

    expect(channels).toBeArray();
    expect(channels.length).toBeGreaterThan(0);
  });

  skipIfNoToken("fetches guild roles", async () => {
    if (!GUILD_ID) return;

    const roles = await client.get<Array<{ id: string; name: string }>>(`/guilds/${GUILD_ID}/roles`);

    expect(roles).toBeArray();
    expect(roles.length).toBeGreaterThan(0);
  });

  skipIfNoToken("fetches specific role", async () => {
    if (!GUILD_ID || !ROLE_ID) return;

    const roles = await client.get<Array<{ id: string; name: string }>>(`/guilds/${GUILD_ID}/roles`);
    const role = roles.find((r) => r.id === ROLE_ID);

    expect(role).toBeDefined();
    expect(role?.id).toBe(ROLE_ID);
  });

  skipIfNoToken("fetches guild member", async () => {
    if (!GUILD_ID || !USER_ID) return;

    const member = await client.get<{ user: { id: string }; roles: string[] }>(
      `/guilds/${GUILD_ID}/members/${USER_ID}`
    );

    expect(member).toBeDefined();
    expect(member.user.id).toBe(USER_ID);
    expect(member.roles).toBeArray();
  });

  skipIfNoToken("fetches channel messages", async () => {
    if (!CHANNEL_ID) return;

    const messages = await client.get<Array<{ id: string; content: string }>>(
      `/channels/${CHANNEL_ID}/messages`,
      { query: { limit: "5" } }
    );

    expect(messages).toBeArray();
  });

  skipIfNoToken("fetches specific message", async () => {
    if (!CHANNEL_ID || !MESSAGE_ID) return;

    const message = await client.get<{ id: string; channel_id: string }>(
      `/channels/${CHANNEL_ID}/messages/${MESSAGE_ID}`
    );

    expect(message).toBeDefined();
    expect(message.id).toBe(MESSAGE_ID);
    expect(message.channel_id).toBe(CHANNEL_ID);
  });

  skipIfNoToken("creates and deletes a message", async () => {
    if (!CHANNEL_ID) return;

    const message = await client.post<{ id: string; content: string }>(
      `/channels/${CHANNEL_ID}/messages`,
      {
        body: {
          content: "Test message from Spall integration tests",
        },
      }
    );

    expect(message).toBeDefined();
    expect(message.content).toBe("Test message from Spall integration tests");

    await client.delete(`/channels/${CHANNEL_ID}/messages/${message.id}`);
  });

  skipIfNoToken("creates, edits, and deletes a message", async () => {
    if (!CHANNEL_ID) return;

    const message = await client.post<{ id: string; content: string }>(
      `/channels/${CHANNEL_ID}/messages`,
      {
        body: {
          content: "Original message",
        },
      }
    );

    expect(message.content).toBe("Original message");

    const edited = await client.patch<{ id: string; content: string }>(
      `/channels/${CHANNEL_ID}/messages/${message.id}`,
      {
        body: {
          content: "Edited message",
        },
      }
    );

    expect(edited.content).toBe("Edited message");

    await client.delete(`/channels/${CHANNEL_ID}/messages/${message.id}`);
  });

  skipIfNoToken("handles rate limits gracefully", async () => {
    if (!CHANNEL_ID) return;

    client.on("RATE_LIMITED", (data) => {
      console.log("\n RATE LIMIT HIT!");
      console.log(`   Limit: ${data.limit}`);
      console.log(`   Remaining: ${data.remaining}`);
      console.log(`   Reset: ${new Date(data.reset).toISOString()}`);
      console.log(`   Reset After: ${data.reset_after}s`);
      console.log(`   Bucket: ${data.bucket}`);
      console.log(`   Global: ${data.global}`);
      console.log(`   Scope: ${data.scope || "N/A"}\n`);
      console.log(`   Bucket: ${data.bucket}`);
      console.log(`   Global: ${data.global}`);
      console.log(`   Scope: ${data.scope || "N/A"}\n`);
    });

    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        client.post<{ id: string }>(
          `/channels/${CHANNEL_ID}/messages`,
          {
            body: {
              content: `Bulk test message ${i}`,
            },
          }
        )
      );
    }

    const messages = await Promise.all(promises);

    expect(messages).toBeArray();
    expect(messages.length).toBe(5);

    for (const message of messages) {
      await client.delete(`/channels/${CHANNEL_ID}/messages/${message.id}`);
      await new Promise(r => setTimeout(r, 100));
    }
  }, { timeout: 15000 });

  skipIfNoToken("emits REQUEST and RESPONSE events", async () => {
    if (!CHANNEL_ID) return;

    let requestEmitted = false;
    let responseEmitted = false;

    client.on("REQUEST", () => {
      requestEmitted = true;
    });

    client.on("RESPONSE", () => {
      responseEmitted = true;
    });

    await client.get(`/channels/${CHANNEL_ID}`);

    expect(requestEmitted).toBe(true);
    expect(responseEmitted).toBe(true);
  });

  skipIfNoToken("handles audit log reason", async () => {
    if (!CHANNEL_ID) return;

    const message = await client.post<{ id: string }>(
      `/channels/${CHANNEL_ID}/messages`,
      {
        body: {
          content: "Message with audit log reason",
        },
      }
    );

    await new Promise(r => setTimeout(r, 200));

    await client.delete(`/channels/${CHANNEL_ID}/messages/${message.id}`, {
      reason: "Integration test cleanup",
    });
  }, { timeout: 10000 });

  skipIfNoToken("uploads a file with message", async () => {
    if (!CHANNEL_ID) return;

    const fileContent = "Hello from Spall file upload test!";
    const fileData = new TextEncoder().encode(fileContent);

    const message = await client.post<{ id: string; attachments: Array<{ filename: string; size: number }> }>(
      `/channels/${CHANNEL_ID}/messages`,
      {
        body: {
          content: "Message with file attachment",
        },
        files: [
          { name: "test.txt", data: fileData },
        ],
      }
    );

    expect(message).toBeDefined();
    expect(message.id).toBeDefined();
    expect(message.attachments).toBeArray();
    expect(message.attachments.length).toBe(1);
    expect(message.attachments[0]?.filename).toBe("test.txt");

    await client.delete(`/channels/${CHANNEL_ID}/messages/${message.id}`);
  });

  skipIfNoToken("triggers actual bucket rate limit and logs it", async () => {
    if (!CHANNEL_ID) return;

    let rateLimitHit = false;
    const messages: string[] = [];

    client.on("RATE_LIMITED", (data) => {
      rateLimitHit = true;
      console.log("\n BUCKET RATE LIMIT HIT!");
      console.log(`   Limit: ${data.limit}`);
      console.log(`   Remaining: ${data.remaining}`);
      console.log(`   Reset: ${new Date(data.reset).toISOString()}`);
      console.log(`   Reset After: ${data.reset_after}s`);
      console.log(`   Bucket: ${data.bucket}`);
      console.log(`   Global: ${data.global}`);
      console.log(`   Scope: ${data.scope || "N/A"}\n`);
    });

    const promises = [];
    for (let i = 0; i < 8; i++) {
      const promise = client.post<{ id: string }>(
        `/channels/${CHANNEL_ID}/messages`,
        {
          body: {
            content: `Rate limit test message ${i + 1}`,
          },
        }
      ).then(msg => {
        messages.push(msg.id);
        return msg;
      });

      promises.push(promise);
    }

    await Promise.all(promises);

    for (const id of messages) {
      try {
        await client.delete(`/channels/${CHANNEL_ID}/messages/${id}`);
        await new Promise(r => setTimeout(r, 100));
      } catch { }
    }

    console.log(`\n Rate limit test complete. Rate limited: ${rateLimitHit}\n`);
  }, { timeout: 45000 });
});
