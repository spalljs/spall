import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { HeartbeatHandler } from "../src/handlers/heartbeat.ts";

describe("HeartbeatHandler", () => {
  beforeEach(() => {});
  afterEach(() => {});

  test("should send initial heartbeat immediately", () => {
    const send = mock(() => {});
    const getSequence = mock(() => null);
    const onDebug = mock(() => {});

    const handler = new HeartbeatHandler(send, getSequence, onDebug);
    handler.start(1000);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ op: 1, d: null });

    handler.stop();
  });

  test("should send heartbeats at the specified interval", async () => {
    const send = mock(() => {});
    const getSequence = mock(() => 5);
    const onDebug = mock(() => {});

    const handler = new HeartbeatHandler(send, getSequence, onDebug);
    handler.start(100);

    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(send.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(send).toHaveBeenCalledWith({ op: 1, d: 5 });

    handler.stop();
  });

  test("should stop sending heartbeats when stopped", async () => {
    const send = mock(() => {});
    const getSequence = mock(() => null);
    const onDebug = mock(() => {});

    const handler = new HeartbeatHandler(send, getSequence, onDebug);
    handler.start(100);

    await new Promise((resolve) => setTimeout(resolve, 150));
    handler.stop();

    const callsBeforeStop = send.mock.calls.length;
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(send.mock.calls.length).toBe(callsBeforeStop);
  });

  test("should clear previous timer when restarted", async () => {
    const send = mock(() => {});
    const getSequence = mock(() => null);
    const onDebug = mock(() => {});

    const handler = new HeartbeatHandler(send, getSequence, onDebug);
    handler.start(1000);
    handler.start(100);

    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(send.mock.calls.length).toBeGreaterThanOrEqual(2);

    handler.stop();
  });
});
