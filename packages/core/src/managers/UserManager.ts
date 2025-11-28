import type { APIUser } from "discord-api-types/v10";
import { BaseManager } from "./BaseManager.ts";
import { User } from "@/structures/User.ts";
import type { Client } from "@/Client.ts";

/**
 * Manager for handling User structures with caching.
 */
export class UserManager extends BaseManager<string, User> {
  constructor(client: Client, max_size?: number, predicate?: (value: User) => boolean) {
    super(client, max_size, predicate);
  }

  /**
   * Fetch a user from the API by ID.
   */
  fetch = async (user_id: string): Promise<User> => {
    const existing = this.cache.get(user_id);
    if (existing) return existing;

    const data = await this.client.rest.get<APIUser>(`/users/${user_id}`);
    const user = new User(this.client, data);
    this._add(user_id, user);
    return user;
  };

  /**
   * Add a user to the cache from raw API data.
   */
  _addFromData = (data: APIUser): User => {
    const user = new User(this.client, data);
    this._add(data.id, user);
    return user;
  };
}
