import { describe, test, expect } from "bun:test";
import {
  deconstructSnowflake,
  getSnowflakeTimestamp,
  timestampToSnowflake,
  compareSnowflakes,
} from "../src/snowflake.ts";

describe("snowflake utilities", () => {
  const realSnowflakes = [
    "1422862274980220991",
    "1397697938943115285",
    "1397697914737922189",
    "1397573573237014641",
    "1361093684094832822",
    "1323772033720516628",
    "1323772006637768815",
    "1323759012696690750",
    "1323758029040255057",
    "1323300808518926428",
  ];

  const testSnowflake = realSnowflakes[0]!;
  const olderSnowflake = realSnowflakes[9]!;
  const newerSnowflake = realSnowflakes[0]!;
  const testTimestamp = 1672531200000;

  test("deconstructSnowflake returns correct components", () => {
    const result = deconstructSnowflake(testSnowflake);

    expect(result).toHaveProperty("timestamp");
    expect(result).toHaveProperty("worker_id");
    expect(result).toHaveProperty("process_id");
    expect(result).toHaveProperty("increment");
    expect(result).toHaveProperty("date");
    expect(result.date).toBeInstanceOf(Date);
  });

  test("deconstructSnowflake works with bigint", () => {
    const result = deconstructSnowflake(BigInt(testSnowflake));

    expect(result.timestamp).toBeNumber();
    expect(result.worker_id).toBeNumber();
    expect(result.process_id).toBeNumber();
    expect(result.increment).toBeNumber();
  });

  test("getSnowflakeTimestamp extracts timestamp", () => {
    const timestamp = getSnowflakeTimestamp(testSnowflake);
    expect(timestamp).toBeNumber();
    expect(timestamp).toBeGreaterThan(1420070400000);
  });

  test("getSnowflakeTimestamp works with multiple real snowflakes", () => {
    for (const snowflake of realSnowflakes) {
      const timestamp = getSnowflakeTimestamp(snowflake);
      expect(timestamp).toBeNumber();
      expect(timestamp).toBeGreaterThan(1420070400000);
    }
  });

  test("timestampToSnowflake creates valid snowflake", () => {
    const snowflake = timestampToSnowflake(testTimestamp);
    expect(snowflake).toBeString();
    expect(BigInt(snowflake)).toBeGreaterThan(0n);
  });

  test("timestampToSnowflake roundtrip", () => {
    const snowflake = timestampToSnowflake(testTimestamp);
    const extractedTimestamp = getSnowflakeTimestamp(snowflake);
    expect(extractedTimestamp).toBe(testTimestamp);
  });

  test("compareSnowflakes returns correct ordering with real snowflakes", () => {
    expect(compareSnowflakes(olderSnowflake, newerSnowflake)).toBeLessThan(0);
    expect(compareSnowflakes(newerSnowflake, olderSnowflake)).toBeGreaterThan(0);
    expect(compareSnowflakes(testSnowflake, testSnowflake)).toBe(0);
  });

  test("compareSnowflakes works with bigint", () => {
    const a = BigInt(olderSnowflake);
    const b = BigInt(newerSnowflake);

    expect(compareSnowflakes(a, b)).toBeLessThan(0);
    expect(compareSnowflakes(b, a)).toBeGreaterThan(0);
    expect(compareSnowflakes(a, a)).toBe(0);
  });

  test("real snowflakes are in chronological order", () => {
    const timestamps = realSnowflakes.map(getSnowflakeTimestamp);

    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i - 1]).toBeGreaterThanOrEqual(timestamps[i]!);
    }
  });
});
