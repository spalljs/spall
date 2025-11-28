import type { APIGuildMember, RESTPatchAPIGuildMemberJSONBody } from "discord-api-types/v10";
import { CDN_URL } from "@spall/constants";
import type { Client } from "@/Client.ts";
import type { Role } from "@/structures/Role.ts";

/**
 * Represents a Discord guild member.
 */
export class GuildMember {
  private client: Client;
  private data: APIGuildMember;
  private guild_id: string;

  constructor(client: Client, data: APIGuildMember, guild_id: string) {
    this.client = client;
    this.data = data;
    this.guild_id = guild_id;
  }

  /**
   * The user this guild member represents
   */
  get user() {
    return this.data.user;
  }

  /**
   * This user's guild nickname
   */
  get nick() {
    return this.data.nick;
  }

  /**
   * The member's guild avatar hash
   */
  get avatar() {
    return this.data.avatar;
  }

  /**
   * The member's guild banner hash
   */
  get banner() {
    return this.data.banner;
  }

  /**
   * Array of role IDs for this member
   */
  get role_ids() {
    return this.data.roles;
  }

  /**
   * Array of role structures for this member
   */
  get roles(): Role[] {
    const guild = this.client.guilds.get(this.guild_id);

    if (!guild) return [];

    return this.data.roles
      .map(role_id => guild.roles.get(role_id))
      .filter((role) => role !== undefined);
  }

  /**
   * When the user joined the guild
   */
  get joined_at() {
    return this.data.joined_at ? new Date(this.data.joined_at) : null;
  }

  /**
   * When the user started boosting the guild
   */
  get premium_since() {
    return this.data.premium_since ? new Date(this.data.premium_since) : null;
  }

  /**
   * Whether the user is deafened in voice channels
   */
  get deaf() {
    return this.data.deaf;
  }

  /**
   * Whether the user is muted in voice channels
   */
  get mute() {
    return this.data.mute;
  }

  /**
   * Guild member flags represented as a bit set
   */
  get flags() {
    return this.data.flags;
  }

  /**
   * Whether the user has not yet passed the guild's Membership Screening requirements
   */
  get pending() {
    return this.data.pending;
  }

  /**
   * Timestamp of when the time out will be removed
   */
  get communication_disabled_until() {
    return this.data.communication_disabled_until ? new Date(this.data.communication_disabled_until) : null;
  }

  /**
   * The data for the member's guild avatar decoration
   */
  get avatar_decoration_data() {
    return this.data.avatar_decoration_data;
  }

  /**
   * Get the member's guild avatar URL.
   */
  avatarURL = (options?: { size?: number; format?: "png" | "jpg" | "webp" | "gif"; }): string | null => {
    if (!this.data.avatar) return null;

    const format = options?.format ?? (this.data.avatar.startsWith("a_") ? "gif" : "png");
    const size = options?.size ?? 128;

    return `${CDN_URL}/guilds/${this.guild_id}/users/${this.data.user.id}/avatars/${this.data.avatar}.${format}?size=${size}`;
  };

  /**
   * Get the member's guild banner URL.
   */
  bannerURL = (options?: { size?: number; format?: "png" | "jpg" | "webp" | "gif"; }): string | null => {
    if (!this.data.banner) return null;

    const format = options?.format ?? (this.data.banner.startsWith("a_") ? "gif" : "png");
    const size = options?.size ?? 128;

    return `${CDN_URL}/guilds/${this.guild_id}/users/${this.data.user.id}/banners/${this.data.banner}.${format}?size=${size}`;
  };

  /**
   * Get the member's display name (nickname or username).
   */
  get displayName() {
    return this.data.nick ?? this.data.user.global_name ?? this.data.user.username;
  }

  /**
   * Edit this guild member.
   * @param data - The data to update the member with
   * @param reason - The reason for editing the member (for audit log)
   */
  edit = async (data: RESTPatchAPIGuildMemberJSONBody, reason?: string): Promise<GuildMember> => {
    const updated = await this.client.rest.patch<APIGuildMember>(`/guilds/${this.guild_id}/members/${this.data.user.id}`, {
      body: data,
      reason,
    });
    this.data = updated;
    return this;
  };

  /**
   * Kick this member from the guild.
   * @param reason - The reason for kicking the member (for audit log)
   */
  kick = async (reason?: string): Promise<void> => {
    await this.client.rest.delete(`/guilds/${this.guild_id}/members/${this.data.user.id}`, { reason });
  };

  /**
   * Ban this member from the guild.
   * @param options - Ban options
   */
  ban = async (options?: { delete_message_seconds?: number; reason?: string; }): Promise<void> => {
    await this.client.rest.put(`/guilds/${this.guild_id}/bans/${this.data.user.id}`, {
      body: { delete_message_seconds: options?.delete_message_seconds },
      reason: options?.reason,
    });
  };

  /**
   * Timeout this member.
   * @param until - ISO8601 timestamp for when the timeout expires (or null to remove)
   * @param reason - The reason for the timeout (for audit log)
   */
  timeout = async (until: string | null, reason?: string): Promise<GuildMember> => {
    return this.edit({ communication_disabled_until: until }, reason);
  };

  /**
   * Add a role to this member.
   * @param role_id - The ID of the role to add
   * @param reason - The reason for adding the role (for audit log)
   */
  addRole = async (role_id: string, reason?: string): Promise<void> => {
    await this.client.rest.put(`/guilds/${this.guild_id}/members/${this.data.user.id}/roles/${role_id}`, { reason });
  };

  /**
   * Remove a role from this member.
   * @param role_id - The ID of the role to remove
   * @param reason - The reason for removing the role (for audit log)
   */
  removeRole = async (role_id: string, reason?: string): Promise<void> => {
    await this.client.rest.delete(`/guilds/${this.guild_id}/members/${this.data.user.id}/roles/${role_id}`, { reason });
  };

  /**
   * Returns the member mention string.
   */
  toString = (): string => {
    return `<@${this.data.user.id}>`;
  };

  /**
   * Fetch the guild this member belongs to.
   */
  fetchGuild = async () => {
    return this.client.guilds.fetch(this.guild_id);
  };

  /**
   * Get the guild from cache if available.
   */
  get guild() {
    return this.client.guilds.get(this.guild_id);
  }

  /**
   * Fetch the full user object for this member from the API.
   */
  fetchUser = async () => {
    return this.client.users.fetch(this.data.user.id);
  };

  /**
   * Get the raw API data.
   */
  toJSON = (): APIGuildMember => {
    return this.data;
  };
}
