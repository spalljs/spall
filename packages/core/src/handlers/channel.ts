import type { GatewayChannelCreateDispatchData, GatewayChannelUpdateDispatchData, GatewayChannelDeleteDispatchData } from "discord-api-types/v10";
import type { DispatchHandler } from "./types.ts";

export const CHANNEL_CREATE: DispatchHandler<GatewayChannelCreateDispatchData> = (client, data) => {
  const channel = client.channels._addFromData(data);
  client.emit("CHANNEL_CREATE", channel);
};

export const CHANNEL_UPDATE: DispatchHandler<GatewayChannelUpdateDispatchData> = (client, data) => {
  const oldChannel = client.channels.get(data.id);
  const newChannel = client.channels._addFromData(data);
  client.emit("CHANNEL_UPDATE", oldChannel, newChannel);
};

export const CHANNEL_DELETE: DispatchHandler<GatewayChannelDeleteDispatchData> = (client, data) => {
  const channel = client.channels.get(data.id);
  client.channels._remove(data.id);
  client.emit("CHANNEL_DELETE", channel ?? client.channels._addFromData(data));
};
