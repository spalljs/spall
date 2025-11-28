import { GatewayOpcodes } from "@spall/constants";
import type { GatewaySendPayload } from "discord-api-types/v10";

export class HeartbeatHandler {
  private heartbeat_interval = -1;
  private heartbeat_timer: Timer | null = null;

  constructor(
    private send: (payload: GatewaySendPayload) => void,
    private getSequence: () => number | null,
    private onDebug: (message: string) => void
  ) {}

  start = (interval: number): void => {
    if (this.heartbeat_timer) {
      clearInterval(this.heartbeat_timer);
    }

    this.heartbeat_interval = interval;

    this.heartbeat_timer = setInterval(() => {
      this.onDebug(`Sending heartbeat with sequence ${this.getSequence()}`);
      this.send({
        op: GatewayOpcodes.HEARTBEAT,
        d: this.getSequence(),
      });
    }, this.heartbeat_interval);

    this.send({
      op: GatewayOpcodes.HEARTBEAT,
      d: this.getSequence(),
    });
  };

  stop = (): void => {
    if (this.heartbeat_timer) {
      clearInterval(this.heartbeat_timer);
      this.heartbeat_timer = null;
    }
  };
}
