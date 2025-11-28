import type { GatewayReceivePayload } from "discord-api-types/v10";
import type { GatewayReadyDispatchData } from "discord-api-types/v10";
import type { RestClient } from "@spall/api";

export interface WebSocketManagerOptions {
  token: string;
  intents: number;
  api_version?: number;
  rest: RestClient;
}

export type WebSocketEvents = {
  RAW: [payload: GatewayReceivePayload];
  DISPATCH: [event_name: string, data: unknown, sequence: number];
  HELLO: [heartbeat_interval: number];
  HEARTBEAT_ACK: [];
  RECONNECT: [];
  INVALID_SESSION: [resumable: boolean];
  READY: [data: GatewayReadyDispatchData];
  RESUMED: [];
  ERROR: [error: Error];
  CLOSE: [code: number, reason: string];
  CONNECTED: [];
  DEBUG: [...messages: unknown[]];
}
