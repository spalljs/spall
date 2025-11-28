import { GatewayCloseCodes } from "@spall/constants";

export class ConnectionHandler {
  constructor(
    private onShouldResume: () => void,
    private onShouldReconnect: () => void,
    private onFatalClose: (code: number) => void,
    private onDebug: (message: string) => void
  ) {}

  handleClose = (code: number, reason: string): void => {
    this.onDebug(`WebSocket closed: ${code} - ${reason}`);

    switch (code) {
      case GatewayCloseCodes.INVALID_SEQ:
      case GatewayCloseCodes.SESSION_TIMED_OUT: {
        this.onDebug("Attempting to reconnect and resume...");
        this.onShouldResume();
        break;
      }

      case GatewayCloseCodes.AUTHENTICATION_FAILED:
      case GatewayCloseCodes.INVALID_INTENTS:
      case GatewayCloseCodes.DISALLOWED_INTENTS:
      case GatewayCloseCodes.SHARDING_REQUIRED: {
        this.onDebug(`Fatal close code ${code}, cannot reconnect`);
        this.onFatalClose(code);
        break;
      }

      default: {
        this.onDebug("Attempting to reconnect...");
        this.onShouldReconnect();
      }
    }
  };
}
