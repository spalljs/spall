import { type APIGuild, type RESTPostAPIGuildsJSONBody } from "discord-api-types/v10";
import { BaseManager } from "./BaseManager.ts";
import { Guild } from "@/structures/Guild.ts";
import type { Client } from "@/Client.ts";

/**
 * Manager for handling Guild structures with caching.
 */
export class GuildManager extends BaseManager<string, Guild> {
  constructor(client: Client, max_size?: number, predicate?: (value: Guild) => boolean) {
    super(client, max_size, predicate);
  }

  /**
   * Fetch a guild from the API by ID.
   * @param guild_id - The ID of the guild to fetch
   * @param with_counts - Whether to include approximate member and presence counts
   */
  fetch = async (guild_id: string, with_counts?: boolean): Promise<Guild> => {
    const existing = this.cache.get(guild_id);
    if (existing) return existing;

    const query = with_counts ? "?with_counts=true" : "";
    const data = await this.client.rest.get<APIGuild>(`/guilds/${guild_id}${query}`);
    const guild = new Guild(this.client, data);
    this._add(guild_id, guild);
    return guild;
  };

  /**
   * Create a new guild.
   * @param data - The data for creating the Guild
   * @deprecated - Discord no longer supports creating guilds
   */
  create = async (data: RESTPostAPIGuildsJSONBody): Promise<Guild> => {
    const created = await this.client.rest.post<APIGuild>(`/guilds`, { body: data });
    const guild = new Guild(this.client, created);
    this._add(created.id, guild);
    return guild;
  };

  /**
   * Add a guild to the cache from raw API data.
   */
  _addFromData = (data: APIGuild): Guild => {
    const guild = new Guild(this.client, data);
    this._add(data.id, guild);
    return guild;
  };
}
