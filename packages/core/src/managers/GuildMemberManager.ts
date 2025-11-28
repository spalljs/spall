import type { APIGuildMember, RESTGetAPIGuildMembersQuery, RESTPutAPIGuildMemberJSONBody } from "discord-api-types/v10";
import { BaseManager } from "./BaseManager.ts";
import { GuildMember } from "@/structures/GuildMember.ts";
import type { Client } from "@/Client.ts";

/**
 * Manager for handling GuildMember structures with caching.
 */
export class GuildMemberManager extends BaseManager<string, GuildMember> {
  private guild_id: string;

  constructor(client: Client, guild_id: string, max_size?: number, predicate?: (value: GuildMember) => boolean) {
    super(client, max_size, predicate);
    this.guild_id = guild_id;
  }

  /**
   * Fetch a guild member from the API by user ID.
   * @param user_id - The ID of the user to fetch
   */
  fetch = async (user_id: string): Promise<GuildMember> => {
    const existing = this.cache.get(user_id);
    if (existing) return existing;

    const data = await this.client.rest.get<APIGuildMember>(`/guilds/${this.guild_id}/members/${user_id}`);
    const member = new GuildMember(this.client, data, this.guild_id);
    this._add(user_id, member);
    return member;
  };

  /**
   * Fetch multiple guild members.
   * @param options - Query options for fetching members
   */
  fetchMany = async (options?: RESTGetAPIGuildMembersQuery): Promise<GuildMember[]> => {
    const query = new URLSearchParams();
    if (options?.limit) query.set("limit", options.limit.toString());
    if (options?.after) query.set("after", options.after);

    const queryString = query.toString();
    const members = await this.client.rest.get<APIGuildMember[]>(
      `/guilds/${this.guild_id}/members${queryString ? `?${queryString}` : ""}`
    );

    const memberObjects: GuildMember[] = [];
    for (const memberData of members) {
      const member = new GuildMember(this.client, memberData, this.guild_id);
      this._add(memberData.user.id, member);
      memberObjects.push(member);
    }

    return memberObjects;
  };

  /**
   * Add a member to the guild (requires OAuth2 access token).
   * @param user_id - The ID of the user to add
   * @param data - The data for adding the member
   */
  add = async (user_id: string, data: RESTPutAPIGuildMemberJSONBody): Promise<GuildMember | null> => {
    const result = await this.client.rest.put<APIGuildMember | null>(`/guilds/${this.guild_id}/members/${user_id}`, {
      body: data,
    });

    if (!result) return null; // Member was already in the guild

    const member = new GuildMember(this.client, result, this.guild_id);
    this._add(user_id, member);
    return member;
  };

  /**
   * Add a member to the cache from raw API data.
   */
  _addFromData = (data: APIGuildMember): GuildMember => {
    const member = new GuildMember(this.client, data, this.guild_id);
    this._add(data.user.id, member);
    return member;
  };
}
