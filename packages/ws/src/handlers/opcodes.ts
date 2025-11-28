import { GatewayOpcodes } from "@spall/constants";
import type {
  GatewayReceivePayload,
  GatewayDispatchPayload,
} from "discord-api-types/v10";

export class OpcodeHandler {
  constructor(
    private onHello: (heartbeat_interval: number) => void,
    private onHeartbeatAck: () => void,
    private onDispatch: (payload: GatewayDispatchPayload) => void,
    private onReconnect: () => void,
    private onInvalidSession: (resumable: boolean) => void,
    private onDebug: (message: string) => void
  ) {}

  process = (payload: GatewayReceivePayload): void => {
    switch (payload.op) {
      case GatewayOpcodes.HELLO: {
        this.onHello(payload.d.heartbeat_interval);
        break;
      }
      case GatewayOpcodes.HEARTBEAT_ACK: {
        this.onHeartbeatAck();
        break;
      }
      case GatewayOpcodes.DISPATCH: {
        this.onDispatch(payload as GatewayDispatchPayload);
        break;
      }
      case GatewayOpcodes.RECONNECT: {
        this.onReconnect();
        break;
      }
      case GatewayOpcodes.INVALID_SESSION: {
        this.onInvalidSession(payload.d);
        break;
      }
      default: {
        this.onDebug(`Unknown opcode: ${payload.op}`);
      }
    }
  };
}
