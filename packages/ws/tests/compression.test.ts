import { describe, test, expect, mock } from "bun:test";
import { CompressionHandler } from "../src/handlers/compression.ts";
import { deflateSync } from "node:zlib";

describe("CompressionHandler", () => {
  test("should decompress zlib-compressed data", (done) => {
    const testData = JSON.stringify({ op: 10, d: { heartbeat_interval: 41250 } });
    const onData = mock((data: string) => {
      expect(data).toBe(testData);
      done();
    });
    const onError = mock(() => {});

    const handler = new CompressionHandler(onData, onError);

    const compressed = deflateSync(testData);
    const withSuffix = Buffer.concat([compressed, Buffer.from([0x00, 0x00, 0xff, 0xff])]);

    handler.handleCompressedData(withSuffix);
  });

  test("should accumulate chunks until zlib suffix is received", (done) => {
    const testData = JSON.stringify({ op: 10, d: { heartbeat_interval: 41250 } });
    let called = false;
    const onData = mock((data: string) => {
      if (!called) {
        called = true;
        expect(data).toBe(testData);
        done();
      }
    });
    const onError = mock(() => {});

    const handler = new CompressionHandler(onData, onError);

    const compressed = deflateSync(testData);
    const withSuffix = Buffer.concat([compressed, Buffer.from([0x00, 0x00, 0xff, 0xff])]);

    const chunk1 = withSuffix.subarray(0, 10);
    const chunk2 = withSuffix.subarray(10);

    handler.handleCompressedData(chunk1);
    expect(onData).not.toHaveBeenCalled();

    handler.handleCompressedData(chunk2);
  });

  test("should clear chunks after processing", (done) => {
    const testData = JSON.stringify({ op: 10, d: { heartbeat_interval: 41250 } });
    let callCount = 0;
    const onData = mock((data: string) => {
      callCount++;
      expect(data).toBe(testData);
      if (callCount === 1) done();
    });
    const onError = mock(() => {});

    const handler = new CompressionHandler(onData, onError);

    const compressed = deflateSync(testData);
    const withSuffix = Buffer.concat([compressed, Buffer.from([0x00, 0x00, 0xff, 0xff])]);

    handler.handleCompressedData(withSuffix);
  });
});
