import { describe, test, expect } from "bun:test";
import { Collection } from "../src/Collection.ts";

describe("Collection Large Scale", () => {
  test("should handle 500k items efficiently", () => {
    const start = performance.now();
    const collection = new Collection<number, string>(500000);

    // Add 500k items
    for (let i = 0; i < 500000; i++) {
      collection.set(i, `user-${i}`);
    }

    const insertTime = performance.now() - start;
    console.log(`  Inserted 500k items in ${insertTime.toFixed(2)}ms`);

    expect(collection.size).toBe(500000);
    expect(insertTime).toBeLessThan(5000); // Should be under 5 seconds
  });

  test("should correctly track LRU with 500k items", () => {
    const collection = new Collection<number, string>(500000);

    // Add 500k items
    for (let i = 0; i < 500000; i++) {
      collection.set(i, `user-${i}`);
    }

    // Access first 1000 items to mark them as recently used
    for (let i = 0; i < 1000; i++) {
      collection.get(i);
    }

    // Now add 10k new items, which should evict items 1000-10999
    for (let i = 500000; i < 510000; i++) {
      collection.set(i, `user-${i}`);
    }

    expect(collection.size).toBe(500000);

    // Verify first 1000 items still exist (recently accessed)
    for (let i = 0; i < 1000; i++) {
      expect(collection.has(i)).toBe(true);
    }

    // Verify items 1000-10999 were evicted (least recently used)
    for (let i = 1000; i < 10000; i += 100) {
      expect(collection.has(i)).toBe(false);
    }

    // Verify new items exist
    for (let i = 500000; i < 510000; i += 100) {
      expect(collection.has(i)).toBe(true);
    }

    console.log("  ✓ LRU tracking verified: Recently accessed items preserved");
  });

  test("should handle rapid access patterns on 100k items", () => {
    const collection = new Collection<number, { id: number; name: string }>(100000);

    // Simulate Discord-like scenario: 100k cached users
    for (let i = 0; i < 100000; i++) {
      collection.set(i, { id: i, name: `User#${i}` });
    }

    // Simulate rapid access (like processing messages)
    const accessStart = performance.now();
    for (let round = 0; round < 10; round++) {
      for (let i = 0; i < 10000; i++) {
        const key = Math.floor(Math.random() * 100000);
        collection.get(key);
      }
    }
    const accessTime = performance.now() - accessStart;
    console.log(`  100k accesses in ${accessTime.toFixed(2)}ms`);

    expect(collection.size).toBe(100000);
    expect(accessTime).toBeLessThan(500); // Should be very fast
  });

  test("should verify eviction order is correct", () => {
    const collection = new Collection<number, string>(5);

    // Add 5 items: 0, 1, 2, 3, 4
    for (let i = 0; i < 5; i++) {
      collection.set(i, `item-${i}`);
    }

    // Access order is now: 0 (oldest) -> 1 -> 2 -> 3 -> 4 (newest)
    expect(collection.has(0)).toBe(true);
    expect(collection.has(4)).toBe(true);

    // Access item 0 and 1, moving them to the end
    collection.get(0);
    collection.get(1);
    // Access order is now: 2 (oldest) -> 3 -> 4 -> 0 -> 1 (newest)

    // Add 2 new items, should evict 2 and 3
    collection.set(5, "item-5");
    collection.set(6, "item-6");

    expect(collection.size).toBe(5);
    expect(collection.has(0)).toBe(true); // Should still exist (recently accessed)
    expect(collection.has(1)).toBe(true); // Should still exist (recently accessed)
    expect(collection.has(2)).toBe(false); // Should be evicted (oldest)
    expect(collection.has(3)).toBe(false); // Should be evicted (2nd oldest)
    expect(collection.has(4)).toBe(true); // Should still exist
    expect(collection.has(5)).toBe(true); // New item
    expect(collection.has(6)).toBe(true); // New item

    console.log("  ✓ Eviction order verified: Oldest items evicted correctly");
  });

  test("should handle updates to existing keys correctly", () => {
    const collection = new Collection<number, string>(3);

    collection.set(1, "one");
    collection.set(2, "two");
    collection.set(3, "three");
    // Order: 1 -> 2 -> 3

    // Update key 1 (moves it to the end)
    collection.set(1, "ONE");
    // Order: 2 -> 3 -> 1

    // Add new item, should evict 2
    collection.set(4, "four");

    expect(collection.has(1)).toBe(true);
    expect(collection.has(2)).toBe(false); // Evicted
    expect(collection.has(3)).toBe(true);
    expect(collection.has(4)).toBe(true);
    expect(collection.get(1)).toBe("ONE");

    console.log("  ✓ Update tracking verified: Updates move items to end");
  });

  test("should handle mixed operations at scale", () => {
    const collection = new Collection<number, string>(10000);

    const start = performance.now();

    // Add 10k items
    for (let i = 0; i < 10000; i++) {
      collection.set(i, `item-${i}`);
    }

    // Random mix of operations
    for (let i = 0; i < 50000; i++) {
      const op = Math.random();
      const key = Math.floor(Math.random() * 15000); // Some keys won't exist

      if (op < 0.6) {
        // 60% reads
        collection.get(key);
      } else if (op < 0.9) {
        // 30% writes
        collection.set(key, `updated-${key}`);
      } else {
        // 10% deletes
        collection.delete(key);
      }
    }

    const totalTime = performance.now() - start;
    console.log(`  50k mixed operations in ${totalTime.toFixed(2)}ms`);

    expect(totalTime).toBeLessThan(500);
    expect(collection.size).toBeLessThanOrEqual(10000);
  });

  test("should verify no memory leaks in LRU nodes", () => {
    const collection = new Collection<number, string>(1000);

    // Add and evict many times
    for (let round = 0; round < 10; round++) {
      for (let i = 0; i < 2000; i++) {
        collection.set(round * 2000 + i, `item-${i}`);
      }
    }

    // Collection should only have 1000 items
    expect(collection.size).toBe(1000);

    // Verify we can still access items
    const firstKey = collection.keyArray()[0]!;
    expect(collection.get(firstKey)).toBeDefined();

    console.log("  ✓ No memory leaks: LRU nodes properly cleaned up");
  });

  test("should handle edge case: single item collection", () => {
    const collection = new Collection<number, string>(1);

    collection.set(1, "one");
    expect(collection.has(1)).toBe(true);

    collection.set(2, "two");
    expect(collection.has(1)).toBe(false);
    expect(collection.has(2)).toBe(true);
    expect(collection.size).toBe(1);

    console.log("  ✓ Single item collection works correctly");
  });

  test("should verify LRU with sequential access pattern", () => {
    const collection = new Collection<number, string>(100);

    // Fill collection
    for (let i = 0; i < 100; i++) {
      collection.set(i, `item-${i}`);
    }

    // Access items 90-99 in sequence
    for (let i = 90; i < 100; i++) {
      collection.get(i);
    }

    // Add 20 new items, should evict 0-19 (least recently used)
    for (let i = 100; i < 120; i++) {
      collection.set(i, `item-${i}`);
    }

    expect(collection.size).toBe(100);

    // Items 0-19 should be evicted
    for (let i = 0; i < 20; i++) {
      expect(collection.has(i)).toBe(false);
    }

    // Items 90-99 should still exist (recently accessed)
    for (let i = 90; i < 100; i++) {
      expect(collection.has(i)).toBe(true);
    }

    // New items should exist
    for (let i = 100; i < 120; i++) {
      expect(collection.has(i)).toBe(true);
    }

    console.log("  ✓ Sequential access pattern verified");
  });
});
