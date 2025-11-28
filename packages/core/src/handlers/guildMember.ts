import type { GatewayGuildMemberAddDispatchData, GatewayGuildMemberUpdateDispatchData, GatewayGuildMemberRemoveDispatchData, APIGuildMember } from "discord-api-types/v10";
import type { DispatchHandler } from "./types.ts";

export const GUILD_MEMBER_ADD: DispatchHandler<GatewayGuildMemberAddDispatchData> = (client, data) => {
  if (data.guild_id) {
    const guild = client.guilds.get(data.guild_id);
    if (guild) {
      if (data.user) {
        client.users._addFromData(data.user);
      }

      const member = guild.members._addFromData(data);
      client.emit("GUILD_MEMBER_ADD", member);
    }
  }
};

export const GUILD_MEMBER_UPDATE: DispatchHandler<GatewayGuildMemberUpdateDispatchData> = (client, data) => {
  if (data.guild_id) {
    const guild = client.guilds.get(data.guild_id);
    if (guild) {
      if (data.user) {
        client.users._addFromData(data.user);
      }

      const oldMember = guild.members.get(data.user.id);
      const newMember = guild.members._addFromData(data as unknown as APIGuildMember);
      client.emit("GUILD_MEMBER_UPDATE", oldMember, newMember);
    }
  }
};

export const GUILD_MEMBER_REMOVE: DispatchHandler<GatewayGuildMemberRemoveDispatchData> = (client, data) => {
  if (data.guild_id && data.user) {
    const guild = client.guilds.get(data.guild_id);
    if (guild) {
      const member = guild.members.get(data.user.id);
      guild.members._remove(data.user.id);
      client.emit("GUILD_MEMBER_REMOVE", member, data.user, data.guild_id);
    }
  }
};
