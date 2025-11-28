import { describe, test, expect } from "bun:test";
import {
  TimestampStyle,
  formatTimestamp,
  shortTime,
  longTime,
  shortDate,
  longDate,
  shortDateTime,
  longDateTime,
  relativeTime,
} from "../src/timestamp.ts";

describe("timestamp utilities", () => {
  const testTimestamp = 1672531200;
  const testDate = new Date(testTimestamp * 1000);
  const testTimestampMs = testTimestamp * 1000;

  test("formatTimestamp with seconds", () => {
    const result = formatTimestamp(testTimestamp, TimestampStyle.ShortTime);
    expect(result).toBe(`<t:${testTimestamp}:t>`);
  });

  test("formatTimestamp with milliseconds", () => {
    const result = formatTimestamp(testTimestampMs, TimestampStyle.ShortTime);
    expect(result).toBe(`<t:${testTimestamp}:t>`);
  });

  test("formatTimestamp with Date object", () => {
    const result = formatTimestamp(testDate, TimestampStyle.ShortTime);
    expect(result).toBe(`<t:${testTimestamp}:t>`);
  });

  test("formatTimestamp defaults to RelativeTime", () => {
    const result = formatTimestamp(testTimestamp);
    expect(result).toBe(`<t:${testTimestamp}:R>`);
  });

  test("shortTime formats correctly", () => {
    const result = shortTime(testTimestamp);
    expect(result).toBe(`<t:${testTimestamp}:t>`);
  });

  test("longTime formats correctly", () => {
    const result = longTime(testTimestamp);
    expect(result).toBe(`<t:${testTimestamp}:T>`);
  });

  test("shortDate formats correctly", () => {
    const result = shortDate(testTimestamp);
    expect(result).toBe(`<t:${testTimestamp}:d>`);
  });

  test("longDate formats correctly", () => {
    const result = longDate(testTimestamp);
    expect(result).toBe(`<t:${testTimestamp}:D>`);
  });

  test("shortDateTime formats correctly", () => {
    const result = shortDateTime(testTimestamp);
    expect(result).toBe(`<t:${testTimestamp}:f>`);
  });

  test("longDateTime formats correctly", () => {
    const result = longDateTime(testTimestamp);
    expect(result).toBe(`<t:${testTimestamp}:F>`);
  });

  test("relativeTime formats correctly", () => {
    const result = relativeTime(testTimestamp);
    expect(result).toBe(`<t:${testTimestamp}:R>`);
  });

  test("all helper functions work with Date objects", () => {
    expect(shortTime(testDate)).toBe(`<t:${testTimestamp}:t>`);
    expect(longTime(testDate)).toBe(`<t:${testTimestamp}:T>`);
    expect(shortDate(testDate)).toBe(`<t:${testTimestamp}:d>`);
    expect(longDate(testDate)).toBe(`<t:${testTimestamp}:D>`);
    expect(shortDateTime(testDate)).toBe(`<t:${testTimestamp}:f>`);
    expect(longDateTime(testDate)).toBe(`<t:${testTimestamp}:F>`);
    expect(relativeTime(testDate)).toBe(`<t:${testTimestamp}:R>`);
  });

  test("all helper functions work with milliseconds", () => {
    expect(shortTime(testTimestampMs)).toBe(`<t:${testTimestamp}:t>`);
    expect(longTime(testTimestampMs)).toBe(`<t:${testTimestamp}:T>`);
    expect(shortDate(testTimestampMs)).toBe(`<t:${testTimestamp}:d>`);
    expect(longDate(testTimestampMs)).toBe(`<t:${testTimestamp}:D>`);
    expect(shortDateTime(testTimestampMs)).toBe(`<t:${testTimestamp}:f>`);
    expect(longDateTime(testTimestampMs)).toBe(`<t:${testTimestamp}:F>`);
    expect(relativeTime(testTimestampMs)).toBe(`<t:${testTimestamp}:R>`);
  });

  test("current timestamp", () => {
    const now = Math.floor(Date.now() / 1000);
    const result = relativeTime(now);
    expect(result).toContain(`<t:${now}:R>`);
  });
});
