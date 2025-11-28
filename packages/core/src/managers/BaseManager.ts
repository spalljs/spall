import { Collection } from "@spall/utils";
import type { Client } from "@/Client.ts";

/**
 * Base manager class for handling cached entities.
 */
export abstract class BaseManager<K, V> {
  cache: Collection<K, V>;
  protected client: Client;

  constructor(client: Client, max_size?: number, predicate?: (value: V) => boolean) {
    this.client = client;
    this.cache = new Collection<K, V>(max_size, null, predicate);
  }

  /**
   * Get an item from cache by key.
   */
  get = (key: K): V | undefined => {
    return this.cache.get(key);
  };

  /**
   * Check if an item exists in cache.
   */
  has = (key: K): boolean => {
    return this.cache.has(key);
  };

  /**
   * Add or update an item in the cache.
   * @internal
   */
  _add = (key: K, value: V): V => {
    this.cache.set(key, value);
    return value;
  };

  /**
   * Remove an item from the cache.
   * @internal
   */
  _remove = (key: K): boolean => {
    return this.cache.delete(key);
  };
}
