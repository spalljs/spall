import type { APIRole, RESTPostAPIGuildRoleJSONBody } from "discord-api-types/v10";
import { BaseManager } from "./BaseManager.ts";
import { Role } from "@/structures/Role.ts";
import type { Client } from "@/Client.ts";

/**
 * Manager for handling Role structures with caching.
 */
export class RoleManager extends BaseManager<string, Role> {
  private guild_id: string;

  constructor(client: Client, guild_id: string, max_size?: number, predicate?: (value: Role) => boolean) {
    super(client, max_size, predicate);
    this.guild_id = guild_id;
  }

  /**
   * Fetch a role from the API by ID.
   * @param role_id - The ID of the role to fetch
   */
  fetch = async (role_id: string): Promise<Role> => {
    const existing = this.cache.get(role_id);
    if (existing) return existing;

    const roles = await this.client.rest.get<APIRole[]>(`/guilds/${this.guild_id}/roles`);
    const roleData = roles.find((r) => r.id === role_id);

    if (!roleData) {
      throw new Error(`Role ${role_id} not found`);
    }

    for (const r of roles) {
      const role = new Role(this.client, r, this.guild_id);
      this._add(r.id, role);
    }

    return this.cache.get(role_id)!;
  };

  /**
   * Fetch all roles for this guild.
   */
  fetchAll = async (): Promise<Role[]> => {
    const roles = await this.client.rest.get<APIRole[]>(`/guilds/${this.guild_id}/roles`);

    const roleObjects: Role[] = [];
    for (const roleData of roles) {
      const role = new Role(this.client, roleData, this.guild_id);
      this._add(roleData.id, role);
      roleObjects.push(role);
    }

    return roleObjects;
  };

  /**
   * Create a new role in this guild.
   * @param data - The data for creating the role
   * @param reason - The reason for creating the role (for audit log)
   */
  create = async (data?: RESTPostAPIGuildRoleJSONBody, reason?: string): Promise<Role> => {
    const created = await this.client.rest.post<APIRole>(`/guilds/${this.guild_id}/roles`, {
      body: data,
      reason,
    });
    const role = new Role(this.client, created, this.guild_id);
    this._add(created.id, role);
    return role;
  };

  /**
   * Add a role to the cache from raw API data.
   */
  _addFromData = (data: APIRole): Role => {
    const role = new Role(this.client, data, this.guild_id);
    this._add(data.id, role);
    return role;
  };
}
