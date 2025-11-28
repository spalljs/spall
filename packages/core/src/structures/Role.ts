import type { APIRole, RESTPatchAPIGuildRoleJSONBody } from "discord-api-types/v10";
import { CDN_URL } from "@spall/constants";
import type { Client } from "@/Client.ts";
import { Permission } from "./Permission.ts";

/**
 * Represents a Discord role.
 */
export class Role {
  private client: Client;
  private data: APIRole;
  private guild_id: string;

  constructor(client: Client, data: APIRole, guild_id: string) {
    this.client = client;
    this.data = data;
    this.guild_id = guild_id;
  }

  /**
   * Role id
   */
  get id() {
    return this.data.id;
  }

  /**
   * Role name
   */
  get name() {
    return this.data.name;
  }

  /**
   * Integer representation of hexadecimal color code
   */
  get color() {
    return this.data.color;
  }

  /**
   * The role's colors
   */
  get colors() {
    return this.data.colors;
  }

  /**
   * If this role is pinned in the user listing
   */
  get hoist() {
    return this.data.hoist;
  }

  /**
   * The role icon hash
   */
  get icon() {
    return this.data.icon;
  }

  /**
   * The role unicode emoji as a standard emoji
   */
  get unicode_emoji() {
    return this.data.unicode_emoji;
  }

  /**
   * Position of this role
   */
  get position() {
    return this.data.position;
  }

  /**
   * Permission bit set
   */
  get permissions() {
    return new Permission(this.data.permissions);
  }

  /**
   * Whether this role is managed by an integration
   */
  get managed() {
    return this.data.managed;
  }

  /**
   * Whether this role is mentionable
   */
  get mentionable() {
    return this.data.mentionable;
  }

  /**
   * The tags this role has
   */
  get tags() {
    return this.data.tags;
  }

  /**
   * Role flags combined as a bitfield
   */
  get flags() {
    return this.data.flags;
  }

  /**
   * Get the role's icon URL.
   */
  iconURL = (options?: { size?: number; format?: "png" | "jpg" | "webp"; }): string | null => {
    if (!this.data.icon) return null;

    const format = options?.format ?? "png";
    const size = options?.size ?? 128;

    return `${CDN_URL}/role-icons/${this.data.id}/${this.data.icon}.${format}?size=${size}`;
  };

  /**
   * Edit this role.
   * @param data - The data to update the role with
   * @param reason - The reason for editing the role (for audit log)
   */
  edit = async (data: RESTPatchAPIGuildRoleJSONBody, reason?: string): Promise<Role> => {
    const updated = await this.client.rest.patch<APIRole>(`/guilds/${this.guild_id}/roles/${this.data.id}`, {
      body: data,
      reason,
    });
    this.data = updated;
    return this;
  };

  /**
   * Delete this role.
   * @param reason - The reason for deleting the role (for audit log)
   */
  delete = async (reason?: string): Promise<void> => {
    await this.client.rest.delete(`/guilds/${this.guild_id}/roles/${this.data.id}`, { reason });
  };

  /**
   * Set the position of this role.
   * @param position - The new position
   * @param reason - The reason for changing the position (for audit log)
   */
  setPosition = async (position: number, reason?: string): Promise<Role> => {
    const updated = await this.client.rest.patch<APIRole[]>(`/guilds/${this.guild_id}/roles`, {
      body: [{ id: this.data.id, position }],
      reason,
    });

    const roleData = updated.find((r) => r.id === this.data.id);
    if (roleData) {
      this.data = roleData;
    }
    return this;
  };

  /**
   * Returns the role mention string.
   */
  toString = (): string => {
    return `<@&${this.data.id}>`;
  };

  /**
   * Fetch the guild this role belongs to.
   */
  fetchGuild = async () => {
    return await this.client.guilds.fetch(this.guild_id);
  };

  /**
   * Get the guild from cache if available.
   */
  get guild() {
    return this.client.guilds.get(this.guild_id);
  }

  /**
   * Get the raw API data.
   */
  toJSON = (): APIRole => {
    return this.data;
  };
}
