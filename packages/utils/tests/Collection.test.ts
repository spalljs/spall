import { describe, test, expect } from "bun:test";
import { Collection } from "../src/Collection.ts";

describe("Collection", () => {
  describe("Basic operations", () => {
    test("should set and get values", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);

      expect(collection.get("a")).toBe(1);
      expect(collection.get("b")).toBe(2);
      expect(collection.size).toBe(2);
    });

    test("should delete values", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);

      expect(collection.delete("a")).toBe(true);
      expect(collection.has("a")).toBe(false);
      expect(collection.size).toBe(1);
    });

    test("should clear collection", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);

      collection.clear();
      expect(collection.size).toBe(0);
    });
  });

  describe("LRU eviction", () => {
    test("should evict least recently used item when max size exceeded", () => {
      const collection = new Collection<string, number>(3);
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);
      collection.set("d", 4); // Should evict "a"

      expect(collection.has("a")).toBe(false);
      expect(collection.has("b")).toBe(true);
      expect(collection.has("c")).toBe(true);
      expect(collection.has("d")).toBe(true);
      expect(collection.size).toBe(3);
    });

    test("should update access order on get", () => {
      const collection = new Collection<string, number>(3);
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      collection.get("a"); // Access "a", moving it to end
      collection.set("d", 4); // Should evict "b" instead of "a"

      expect(collection.has("a")).toBe(true);
      expect(collection.has("b")).toBe(false);
      expect(collection.has("c")).toBe(true);
      expect(collection.has("d")).toBe(true);
    });

    test("should update access order on set of existing key", () => {
      const collection = new Collection<string, number>(3);
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      collection.set("a", 10); // Update "a", moving it to end
      collection.set("d", 4); // Should evict "b"

      expect(collection.has("a")).toBe(true);
      expect(collection.get("a")).toBe(10);
      expect(collection.has("b")).toBe(false);
      expect(collection.has("c")).toBe(true);
      expect(collection.has("d")).toBe(true);
    });
  });

  describe("Utility methods", () => {
    test("toArray should return array of values", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      expect(collection.toArray()).toEqual([1, 2, 3]);
    });

    test("keyArray should return array of keys", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      expect(collection.keyArray()).toEqual(["a", "b", "c"]);
    });

    test("first should return first value", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      expect(collection.first()).toBe(1);
    });

    test("first(count) should return first N values", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      expect(collection.first(2)).toEqual([1, 2]);
    });

    test("last should return last value", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      expect(collection.last()).toBe(3);
    });

    test("last(count) should return last N values", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      expect(collection.last(2)).toEqual([2, 3]);
    });

    test("random should return a random value", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      const random = collection.random()!;
      expect([1, 2, 3]).toContain(random);
    });

    test("random(count) should return N random values", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      const randoms = collection.random(2);
      expect(randoms.length).toBe(2);
    });
  });

  describe("Array-like methods", () => {
    test("find should return first matching value", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      expect(collection.find((v) => v > 1)).toBe(2);
    });

    test("findKey should return first matching key", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      expect(collection.findKey((v) => v > 1)).toBe("b");
    });

    test("filter should return filtered collection", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      const filtered = collection.filter((v) => v > 1);
      expect(filtered.size).toBe(2);
      expect(filtered.has("a")).toBe(false);
      expect(filtered.has("b")).toBe(true);
      expect(filtered.has("c")).toBe(true);
    });

    test("map should transform values", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      const mapped = collection.map((v) => v * 2);
      expect(mapped).toEqual([2, 4, 6]);
    });

    test("some should check if any value matches", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      expect(collection.some((v) => v > 2)).toBe(true);
      expect(collection.some((v) => v > 10)).toBe(false);
    });

    test("every should check if all values match", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      expect(collection.every((v) => v > 0)).toBe(true);
      expect(collection.every((v) => v > 1)).toBe(false);
    });

    test("reduce should reduce to single value", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      const sum = collection.reduce((acc, v) => acc + v, 0);
      expect(sum).toBe(6);
    });

    test("partition should split into two collections", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);
      collection.set("d", 4);

      const [evens, odds] = collection.partition((v) => v % 2 === 0);
      expect(evens.size).toBe(2);
      expect(odds.size).toBe(2);
      expect(evens.has("b")).toBe(true);
      expect(evens.has("d")).toBe(true);
      expect(odds.has("a")).toBe(true);
      expect(odds.has("c")).toBe(true);
    });

    test("sweep should remove matching entries", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);
      collection.set("c", 3);

      const removed = collection.sweep((v) => v < 3);
      expect(removed).toBe(2);
      expect(collection.size).toBe(1);
      expect(collection.has("c")).toBe(true);
    });
  });

  describe("Collection operations", () => {
    test("clone should create a copy", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);

      const cloned = collection.clone();
      expect(cloned.size).toBe(2);
      expect(cloned.get("a")).toBe(1);

      cloned.set("c", 3);
      expect(collection.has("c")).toBe(false);
    });

    test("concat should merge collections", () => {
      const col1 = new Collection<string, number>();
      col1.set("a", 1);
      col1.set("b", 2);

      const col2 = new Collection<string, number>();
      col2.set("c", 3);
      col2.set("d", 4);

      const merged = col1.concat(col2);
      expect(merged.size).toBe(4);
      expect(merged.get("a")).toBe(1);
      expect(merged.get("d")).toBe(4);
    });

    test("equals should check equality", () => {
      const col1 = new Collection<string, number>();
      col1.set("a", 1);
      col1.set("b", 2);

      const col2 = new Collection<string, number>();
      col2.set("a", 1);
      col2.set("b", 2);

      const col3 = new Collection<string, number>();
      col3.set("a", 1);
      col3.set("b", 3);

      expect(col1.equals(col2)).toBe(true);
      expect(col1.equals(col3)).toBe(false);
    });

    test("sort should return sorted collection", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 3);
      collection.set("b", 1);
      collection.set("c", 2);

      const sorted = collection.sort((a, b) => a - b);
      expect(sorted.toArray()).toEqual([1, 2, 3]);
    });

    test("toJSON should return object representation", () => {
      const collection = new Collection<string, number>();
      collection.set("a", 1);
      collection.set("b", 2);

      expect(collection.toJSON()).toEqual({ a: 1, b: 2 });
    });
  });
});
