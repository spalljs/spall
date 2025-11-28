import type { GatewayGuildMembersChunkDispatchData } from "discord-api-types/v10";
import type { DispatchHandler } from "./types.ts";

export const GUILD_MEMBERS_CHUNK: DispatchHandler<GatewayGuildMembersChunkDispatchData> = (client, data) => {
  const guild = client.guilds.get(data.guild_id);
  if (guild && data.members) {
    const members = [];
    for (const memberData of data.members) {
      if (memberData.user) {
        client.users._addFromData(memberData.user);
      }

      const member = guild.members._addFromData(memberData);
      members.push(member);
    }
    client.emit("GUILD_MEMBERS_CHUNK", members, data.chunk_index, data.chunk_count, data.nonce);
  }
};
