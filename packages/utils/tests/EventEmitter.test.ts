import { describe, test, expect, mock } from "bun:test";
import { EventEmitter } from "../src/EventEmitter.ts";

type TestEvents = {
  test: [message: string];
  data: [value: number, flag: boolean];
  empty: [];
};

describe("EventEmitter", () => {
  test("registers and emits events", () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener = mock((message: string) => {});

    emitter.on("test", listener);
    emitter.emit("test", "hello");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("hello");
  });

  test("supports multiple listeners", () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener1 = mock(() => {});
    const listener2 = mock(() => {});

    emitter.on("test", listener1);
    emitter.on("test", listener2);
    emitter.emit("test", "hello");

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  test("supports once listeners", () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener = mock(() => {});

    emitter.once("test", listener);
    emitter.emit("test", "first");
    emitter.emit("test", "second");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("first");
  });

  test("removes listeners with off", () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener = mock(() => {});

    emitter.on("test", listener);
    emitter.emit("test", "first");
    emitter.off("test", listener);
    emitter.emit("test", "second");

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("supports multiple event types", () => {
    const emitter = new EventEmitter<TestEvents>();
    const testListener = mock(() => {});
    const dataListener = mock(() => {});

    emitter.on("test", testListener);
    emitter.on("data", dataListener);

    emitter.emit("test", "hello");
    emitter.emit("data", 42, true);

    expect(testListener).toHaveBeenCalledTimes(1);
    expect(testListener).toHaveBeenCalledWith("hello");
    expect(dataListener).toHaveBeenCalledTimes(1);
    expect(dataListener).toHaveBeenCalledWith(42, true);
  });

  test("emit returns true if listeners exist", () => {
    const emitter = new EventEmitter<TestEvents>();
    emitter.on("test", () => {});

    expect(emitter.emit("test", "hello")).toBe(true);
  });

  test("emit returns false if no listeners exist", () => {
    const emitter = new EventEmitter<TestEvents>();
    expect(emitter.emit("test", "hello")).toBe(false);
  });

  test("removeAllListeners removes all listeners for event", () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener1 = mock(() => {});
    const listener2 = mock(() => {});

    emitter.on("test", listener1);
    emitter.on("test", listener2);
    emitter.removeAllListeners("test");
    emitter.emit("test", "hello");

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });

  test("removeAllListeners removes all listeners for all events", () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener1 = mock(() => {});
    const listener2 = mock(() => {});

    emitter.on("test", listener1);
    emitter.on("data", listener2);
    emitter.removeAllListeners();
    emitter.emit("test", "hello");
    emitter.emit("data", 42, true);

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });

  test("listenerCount returns correct count", () => {
    const emitter = new EventEmitter<TestEvents>();

    expect(emitter.listenerCount("test")).toBe(0);

    emitter.on("test", () => {});
    expect(emitter.listenerCount("test")).toBe(1);

    emitter.on("test", () => {});
    expect(emitter.listenerCount("test")).toBe(2);

    emitter.removeAllListeners("test");
    expect(emitter.listenerCount("test")).toBe(0);
  });

  test("on returns this for chaining", () => {
    const emitter = new EventEmitter<TestEvents>();
    const result = emitter
      .on("test", () => {})
      .on("data", () => {})
      .on("empty", () => {});

    expect(result).toBe(emitter);
  });

  test("handles events with no arguments", () => {
    const emitter = new EventEmitter<TestEvents>();
    const listener = mock(() => {});

    emitter.on("empty", listener);
    emitter.emit("empty");

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith();
  });
});
