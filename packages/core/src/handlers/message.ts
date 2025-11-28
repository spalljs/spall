import type { GatewayMessageCreateDispatchData, GatewayMessageUpdateDispatchData, GatewayMessageDeleteDispatchData, GatewayMessageDeleteBulkDispatchData } from "discord-api-types/v10";
import type { DispatchHandler } from "./types.ts";
import { Message } from "@/structures/Message.ts";

export const MESSAGE_CREATE: DispatchHandler<GatewayMessageCreateDispatchData> = async (client, data) => {
  if (!client.channels.get(data.channel_id)) {
    await client.channels.fetch(data.channel_id);
  }

  if (data.guild_id && data.member) {
    const guild = client.guilds.get(data.guild_id);

    if (guild) {
      const memberData = {
        ...data.member,
        user: data.author,
      };

      guild.members._addFromData(memberData);
    }
  }

  const message = new Message(client, data);
  client.emit("MESSAGE_CREATE", message);
};

export const MESSAGE_UPDATE: DispatchHandler<GatewayMessageUpdateDispatchData> = (client, data) => {
  let oldMessage: Message | undefined;

  const newMessage = new Message(client, data);

  client.emit("MESSAGE_UPDATE", oldMessage, newMessage);
};

export const MESSAGE_DELETE: DispatchHandler<GatewayMessageDeleteDispatchData> = (client, data) => {
  client.emit("MESSAGE_DELETE", data);
};

export const MESSAGE_DELETE_BULK: DispatchHandler<GatewayMessageDeleteBulkDispatchData> = (client, data) => {
  client.emit("MESSAGE_DELETE_BULK", data);
};
