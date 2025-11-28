import type { GatewayGuildCreateDispatchData, GatewayGuildUpdateDispatchData, GatewayGuildDeleteDispatchData } from "discord-api-types/v10";
import type { DispatchHandler } from "./types.ts";

export const GUILD_CREATE: DispatchHandler<GatewayGuildCreateDispatchData> = (client, data) => {
  const guild = client.guilds._addFromData(data);

  if (data.channels) {
    for (const channelData of data.channels) {
      client.channels._addFromData(channelData);
    }
  }

  if (data.members) {
    for (const memberData of data.members) {
      // Cache the user from the member data
      if (memberData.user) {
        client.users._addFromData(memberData.user);
      }
      guild.members._addFromData(memberData);
    }
  }

  client.emit("GUILD_CREATE", guild);
};

export const GUILD_UPDATE: DispatchHandler<GatewayGuildUpdateDispatchData> = (client, data) => {
  const oldGuild = client.guilds.get(data.id);
  const newGuild = client.guilds._addFromData(data);
  client.emit("GUILD_UPDATE", oldGuild, newGuild);
};

export const GUILD_DELETE: DispatchHandler<GatewayGuildDeleteDispatchData> = (client, data) => {
  const guild = client.guilds.get(data.id);
  client.guilds._remove(data.id);
  client.emit("GUILD_DELETE", guild);
};
