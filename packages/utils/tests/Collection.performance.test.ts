import { describe, test, expect } from "bun:test";
import { Collection } from "../src/Collection.ts";

describe("Collection Performance", () => {
  test("should handle 50k items with frequent access", () => {
    const start = performance.now();

    // Create collection with 50k max size
    const collection = new Collection<number, string>(50000);

    // Add 50k items
    for (let i = 0; i < 50000; i++) {
      collection.set(i, `value-${i}`);
    }

    const insertTime = performance.now() - start;
    console.log(`  Inserted 50k items in ${insertTime.toFixed(2)}ms`);

    // Access random items frequently
    const accessStart = performance.now();
    for (let i = 0; i < 10000; i++) {
      const key = Math.floor(Math.random() * 50000);
      collection.get(key);
    }
    const accessTime = performance.now() - accessStart;
    console.log(`  10k random accesses in ${accessTime.toFixed(2)}ms`);

    expect(collection.size).toBe(50000);
    expect(insertTime).toBeLessThan(1000); // Should be under 1 second
    expect(accessTime).toBeLessThan(500); // Should be under 0.5 seconds
  });

  test("should efficiently evict when max size is exceeded", () => {
    const start = performance.now();

    // Collection with 10k max, but insert 50k items
    const collection = new Collection<number, string>(10000);

    for (let i = 0; i < 50000; i++) {
      collection.set(i, `value-${i}`);
    }

    const totalTime = performance.now() - start;
    console.log(`  Inserted 50k items (max 10k) with eviction in ${totalTime.toFixed(2)}ms`);

    expect(collection.size).toBe(10000);
    // Should still be reasonably fast even with evictions
    expect(totalTime).toBeLessThan(2000); // Should be under 2 seconds

    // Verify it kept the most recent items
    expect(collection.has(49999)).toBe(true);
    expect(collection.has(0)).toBe(false);
  });

  test("should handle bulk operations on large collections", () => {
    const collection = new Collection<number, number>(50000);

    for (let i = 0; i < 50000; i++) {
      collection.set(i, i);
    }

    // Test filter performance
    const filterStart = performance.now();
    const filtered = collection.filter((v) => v % 2 === 0);
    const filterTime = performance.now() - filterStart;
    console.log(`  Filtered 50k items in ${filterTime.toFixed(2)}ms`);

    expect(filtered.size).toBe(25000);
    expect(filterTime).toBeLessThan(100);

    // Test map performance
    const mapStart = performance.now();
    const mapped = collection.map((v) => v * 2);
    const mapTime = performance.now() - mapStart;
    console.log(`  Mapped 50k items in ${mapTime.toFixed(2)}ms`);

    expect(mapped.length).toBe(50000);
    expect(mapTime).toBeLessThan(100);

    // Test reduce performance
    const reduceStart = performance.now();
    const sum = collection.reduce((acc, v) => acc + v, 0);
    const reduceTime = performance.now() - reduceStart;
    console.log(`  Reduced 50k items in ${reduceTime.toFixed(2)}ms`);

    expect(sum).toBe((49999 * 50000) / 2); // Sum of 0 to 49999
    expect(reduceTime).toBeLessThan(50);
  });

  test("should maintain access order efficiently", () => {
    const collection = new Collection<number, string>(10000);

    // Fill collection
    for (let i = 0; i < 10000; i++) {
      collection.set(i, `value-${i}`);
    }

    // Access first 1000 items repeatedly
    const start = performance.now();
    for (let round = 0; round < 100; round++) {
      for (let i = 0; i < 1000; i++) {
        collection.get(i);
      }
    }
    const accessTime = performance.now() - start;
    console.log(`  100k accesses on 10k collection in ${accessTime.toFixed(2)}ms`);

    // Add new items to trigger eviction
    for (let i = 10000; i < 11000; i++) {
      collection.set(i, `value-${i}`);
    }

    // Items 0-999 should still exist (frequently accessed)
    expect(collection.has(0)).toBe(true);
    expect(collection.has(500)).toBe(true);
    expect(collection.has(999)).toBe(true);

    // Items 1000-1999 should be evicted (least recently used)
    expect(collection.has(1000)).toBe(false);
    expect(collection.has(1500)).toBe(false);

    expect(accessTime).toBeLessThan(500);
  });

  test("memory efficiency - access_order array performance", () => {
    const sizes = [1000, 5000, 10000, 25000, 50000];

    for (const size of sizes) {
      const collection = new Collection<number, string>(size);

      const start = performance.now();
      for (let i = 0; i < size; i++) {
        collection.set(i, `value-${i}`);
      }
      const time = performance.now() - start;

      console.log(`  ${size} items: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(size / 10); // Should scale linearly
    }
  });
});
