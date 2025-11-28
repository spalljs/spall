/**
 * Node in a doubly linked list for LRU tracking.
 */
class LRUNode<K> {
  constructor(
    public key: K,
    public prev: LRUNode<K> | null = null,
    public next: LRUNode<K> | null = null
  ) {}
}

/**
 * A Map-like collection with LRU (Least Recently Used) eviction and utility methods.
 */
export class Collection<K, V> extends Map<K, V> {
  private max_size: number;
  private predicate?: (value: V) => boolean;
  private lru_head: LRUNode<K> | null = null;
  private lru_tail: LRUNode<K> | null = null;
  private lru_map: Map<K, LRUNode<K>> = new Map();

  /**
   * Creates a new Collection.
   * @param max_size - Maximum number of items. When exceeded, least recently used items are evicted.
   * @param entries - Initial entries to populate the collection.
   * @param predicate - Optional predicate function to filter which values should be cached.
   */
  constructor(max_size?: number, entries?: readonly (readonly [K, V])[] | null, predicate?: (value: V) => boolean) {
    super();
    this.max_size = max_size ?? Infinity;
    this.predicate = predicate;

    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value);
      }
    }
  }

  /**
   * Sets a value in the collection and manages LRU eviction.
   */
  override set(key: K, value: V): this {
    // Check predicate if defined
    if (this.predicate && !this.predicate(value)) {
      return this;
    }

    const existed = this.has(key);

    if (existed) {
      this.moveToEnd(key);
    } else {
      const node = new LRUNode(key);
      this.addToEnd(node);
      this.lru_map.set(key, node);

      if (this.size >= this.max_size) {
        const oldest = this.lru_head;
        if (oldest) {
          this.removeNode(oldest);
          this.lru_map.delete(oldest.key);
          super.delete(oldest.key);
        }
      }
    }

    super.set(key, value);
    return this;
  }

  /**
   * Gets a value from the collection and updates access order for LRU.
   */
  override get(key: K): V | undefined {
    const value = super.get(key);
    if (value !== undefined) {
      this.moveToEnd(key);
    }
    return value;
  }

  /**
   * Deletes a key from the collection and access order.
   */
  override delete(key: K): boolean {
    const deleted = super.delete(key);
    if (deleted) {
      const node = this.lru_map.get(key);
      if (node) {
        this.removeNode(node);
        this.lru_map.delete(key);
      }
    }
    return deleted;
  }

  /**
   * Clears the collection and access order.
   */
  override clear(): void {
    super.clear();
    this.lru_head = null;
    this.lru_tail = null;
    this.lru_map.clear();
  }

  /**
   * Removes a node from the doubly linked list.
   */
  private removeNode(node: LRUNode<K>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.lru_head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.lru_tail = node.prev;
    }
  }

  /**
   * Adds a node to the end of the doubly linked list.
   */
  private addToEnd(node: LRUNode<K>): void {
    if (!this.lru_tail) {
      this.lru_head = node;
      this.lru_tail = node;
    } else {
      this.lru_tail.next = node;
      node.prev = this.lru_tail;
      this.lru_tail = node;
    }
  }

  /**
   * Moves a key to the end of the access order (marks as recently used).
   */
  private moveToEnd(key: K): void {
    const node = this.lru_map.get(key);
    if (node) {
      this.removeNode(node);
      this.addToEnd(node);
    }
  }

  /**
   * Converts the collection to an array of values.
   */
  toArray(): V[] {
    return Array.from(this.values());
  }

  /**
   * Converts the collection to an array of keys.
   */
  keyArray(): K[] {
    return Array.from(this.keys());
  }

  /**
   * Returns the first value in the collection.
   */
  first(): V | undefined;
  first(count: number): V[];
  first(count?: number): V | V[] | undefined {
    if (count === undefined) {
      return this.values().next().value;
    }

    const values: V[] = [];
    const iterator = this.values();

    for (let i = 0; i < count; i++) {
      const { value, done } = iterator.next();
      if (done) break;
      values.push(value);
    }

    return values;
  }

  /**
   * Returns the first key in the collection.
   */
  firstKey(): K | undefined;
  firstKey(count: number): K[];
  firstKey(count?: number): K | K[] | undefined {
    if (count === undefined) {
      return this.keys().next().value;
    }

    const keys: K[] = [];
    const iterator = this.keys();

    for (let i = 0; i < count; i++) {
      const { value, done } = iterator.next();
      if (done) break;
      keys.push(value);
    }

    return keys;
  }

  /**
   * Returns the last value in the collection.
   */
  last(): V | undefined;
  last(count: number): V[];
  last(count?: number): V | V[] | undefined {
    const arr = this.toArray();

    if (count === undefined) {
      return arr[arr.length - 1];
    }

    return arr.slice(-count);
  }

  /**
   * Returns the last key in the collection.
   */
  lastKey(): K | undefined;
  lastKey(count: number): K[];
  lastKey(count?: number): K | K[] | undefined {
    const arr = this.keyArray();

    if (count === undefined) {
      return arr[arr.length - 1];
    }

    return arr.slice(-count);
  }

  /**
   * Returns a random value from the collection.
   */
  random(): V | undefined;
  random(count: number): V[];
  random(count?: number): V | V[] | undefined {
    const arr = this.toArray();

    if (arr.length === 0) {
      return count === undefined ? undefined : [];
    }

    if (count === undefined) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    const shuffled = arr.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Returns a random key from the collection.
   */
  randomKey(): K | undefined;
  randomKey(count: number): K[];
  randomKey(count?: number): K | K[] | undefined {
    const arr = this.keyArray();

    if (arr.length === 0) {
      return count === undefined ? undefined : [];
    }

    if (count === undefined) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    const shuffled = arr.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Finds the first value that satisfies the predicate.
   */
  find(predicate: (value: V, key: K, collection: this) => boolean): V | undefined {
    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Finds the first key that satisfies the predicate.
   */
  findKey(predicate: (value: V, key: K, collection: this) => boolean): K | undefined {
    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        return key;
      }
    }
    return undefined;
  }

  /**
   * Filters the collection to a new collection based on a predicate.
   */
  filter(predicate: (value: V, key: K, collection: this) => boolean): Collection<K, V> {
    const filtered = new Collection<K, V>(this.max_size);
    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        filtered.set(key, value);
      }
    }
    return filtered;
  }

  /**
   * Maps the collection to a new collection.
   */
  map<T>(mapper: (value: V, key: K, collection: this) => T): T[] {
    const results: T[] = [];
    for (const [key, value] of this) {
      results.push(mapper(value, key, this));
    }
    return results;
  }

  /**
   * Checks if some value satisfies the predicate.
   */
  some(predicate: (value: V, key: K, collection: this) => boolean): boolean {
    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if every value satisfies the predicate.
   */
  every(predicate: (value: V, key: K, collection: this) => boolean): boolean {
    for (const [key, value] of this) {
      if (!predicate(value, key, this)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Reduces the collection to a single value.
   */
  reduce<T>(reducer: (accumulator: T, value: V, key: K, collection: this) => T, initial: T): T {
    let accumulator = initial;
    for (const [key, value] of this) {
      accumulator = reducer(accumulator, value, key, this);
    }
    return accumulator;
  }

  /**
   * Partitions the collection into two collections based on a predicate.
   */
  partition(predicate: (value: V, key: K, collection: this) => boolean): [Collection<K, V>, Collection<K, V>] {
    const truthy = new Collection<K, V>(this.max_size);
    const falsy = new Collection<K, V>(this.max_size);

    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        truthy.set(key, value);
      } else {
        falsy.set(key, value);
      }
    }

    return [truthy, falsy];
  }

  /**
   * Sweeps the collection, removing entries that match the predicate.
   * @returns Number of entries removed.
   */
  sweep(predicate: (value: V, key: K, collection: this) => boolean): number {
    let removed = 0;
    for (const [key, value] of this) {
      if (predicate(value, key, this)) {
        this.delete(key);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Clones the collection.
   */
  clone(): Collection<K, V> {
    return new Collection<K, V>(this.max_size, Array.from(this.entries()));
  }

  /**
   * Concatenates multiple collections into this one.
   */
  concat(...collections: Collection<K, V>[]): Collection<K, V> {
    const merged = this.clone();
    for (const collection of collections) {
      for (const [key, value] of collection) {
        merged.set(key, value);
      }
    }
    return merged;
  }

  /**
   * Checks if the collection is equal to another collection.
   */
  equals(other: Collection<K, V>): boolean {
    if (this.size !== other.size) return false;

    for (const [key, value] of this) {
      if (!other.has(key) || other.get(key) !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sorts the collection by values and returns a new sorted collection.
   */
  sort(compareFn?: (a: V, b: V, aKey: K, bKey: K) => number): Collection<K, V> {
    const entries = Array.from(this.entries());
    entries.sort((a, b) => compareFn ? compareFn(a[1], b[1], a[0], b[0]) : 0);
    return new Collection<K, V>(this.max_size, entries);
  }

  /**
   * Returns a JSON representation of the collection.
   */
  toJSON(): Record<string, V> {
    const obj: Record<string, V> = {};
    for (const [key, value] of this) {
      obj[String(key)] = value;
    }
    return obj;
  }
}
