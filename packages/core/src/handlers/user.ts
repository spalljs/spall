import type { GatewayUserUpdateDispatchData } from "discord-api-types/v10";
import type { DispatchHandler } from "./types.ts";

export const USER_UPDATE: DispatchHandler<GatewayUserUpdateDispatchData> = (client, data) => {
  if (data.id) {
    const oldUser = client.users.get(data.id);
    const newUser = client.users._addFromData(data);
    client.emit("USER_UPDATE", oldUser, newUser);
  }
};
