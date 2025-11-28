import type { GatewayReadyDispatchData } from "discord-api-types/v10";
import type { DispatchHandler } from "./types.ts";

export const READY: DispatchHandler<GatewayReadyDispatchData> = (client, data) => {
  if (data.user) {
    const user = client.users._addFromData(data.user);

    client.user = user;
  }

  client.emit("READY", data);

  client._handleClientReady(data.guilds.length);
};
