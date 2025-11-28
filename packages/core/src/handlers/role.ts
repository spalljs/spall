import type { GatewayGuildRoleCreateDispatchData, GatewayGuildRoleUpdateDispatchData, GatewayGuildRoleDeleteDispatchData } from "discord-api-types/v10";
import type { DispatchHandler } from "./types.ts";

export const GUILD_ROLE_CREATE: DispatchHandler<GatewayGuildRoleCreateDispatchData> = (client, data) => {
  if (data.guild_id && data.role) {
    const guild = client.guilds.get(data.guild_id);
    if (guild) {
      const role = guild.roles._addFromData(data.role);
      client.emit("GUILD_ROLE_CREATE", role);
    }
  }
};

export const GUILD_ROLE_UPDATE: DispatchHandler<GatewayGuildRoleUpdateDispatchData> = (client, data) => {
  if (data.guild_id && data.role) {
    const guild = client.guilds.get(data.guild_id);
    if (guild) {
      const oldRole = guild.roles.get(data.role.id);
      const newRole = guild.roles._addFromData(data.role);
      client.emit("GUILD_ROLE_UPDATE", oldRole, newRole);
    }
  }
};

export const GUILD_ROLE_DELETE: DispatchHandler<GatewayGuildRoleDeleteDispatchData> = (client, data) => {
  if (data.guild_id && data.role_id) {
    const guild = client.guilds.get(data.guild_id);
    if (guild) {
      const role = guild.roles.get(data.role_id);
      guild.roles._remove(data.role_id);
      client.emit("GUILD_ROLE_DELETE", role, data.guild_id);
    }
  }
};
