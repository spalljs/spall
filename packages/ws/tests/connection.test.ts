import { describe, test, expect, mock } from "bun:test";
import { ConnectionHandler } from "../src/handlers/connection.ts";
import { GatewayCloseCodes } from "@spall/constants";

describe("ConnectionHandler", () => {
  test("should resume on INVALID_SEQ close code", () => {
    const onShouldResume = mock(() => {});
    const handler = new ConnectionHandler(
      onShouldResume,
      mock(() => {}),
      mock(() => {}),
      mock(() => {})
    );

    handler.handleClose(GatewayCloseCodes.INVALID_SEQ, "Invalid seq");
    expect(onShouldResume).toHaveBeenCalled();
  });

  test("should resume on SESSION_TIMED_OUT close code", () => {
    const onShouldResume = mock(() => {});
    const handler = new ConnectionHandler(
      onShouldResume,
      mock(() => {}),
      mock(() => {}),
      mock(() => {})
    );

    handler.handleClose(GatewayCloseCodes.SESSION_TIMED_OUT, "Session timed out");
    expect(onShouldResume).toHaveBeenCalled();
  });

  test("should call onFatalClose for AUTHENTICATION_FAILED", () => {
    const onFatalClose = mock(() => {});
    const handler = new ConnectionHandler(
      mock(() => {}),
      mock(() => {}),
      onFatalClose,
      mock(() => {})
    );

    handler.handleClose(GatewayCloseCodes.AUTHENTICATION_FAILED, "Auth failed");
    expect(onFatalClose).toHaveBeenCalledWith(GatewayCloseCodes.AUTHENTICATION_FAILED);
  });

  test("should call onFatalClose for INVALID_INTENTS", () => {
    const onFatalClose = mock(() => {});
    const handler = new ConnectionHandler(
      mock(() => {}),
      mock(() => {}),
      onFatalClose,
      mock(() => {})
    );

    handler.handleClose(GatewayCloseCodes.INVALID_INTENTS, "Invalid intents");
    expect(onFatalClose).toHaveBeenCalledWith(GatewayCloseCodes.INVALID_INTENTS);
  });

  test("should call onFatalClose for DISALLOWED_INTENTS", () => {
    const onFatalClose = mock(() => {});
    const handler = new ConnectionHandler(
      mock(() => {}),
      mock(() => {}),
      onFatalClose,
      mock(() => {})
    );

    handler.handleClose(GatewayCloseCodes.DISALLOWED_INTENTS, "Disallowed intents");
    expect(onFatalClose).toHaveBeenCalledWith(GatewayCloseCodes.DISALLOWED_INTENTS);
  });

  test("should call onFatalClose for SHARDING_REQUIRED", () => {
    const onFatalClose = mock(() => {});
    const handler = new ConnectionHandler(
      mock(() => {}),
      mock(() => {}),
      onFatalClose,
      mock(() => {})
    );

    handler.handleClose(GatewayCloseCodes.SHARDING_REQUIRED, "Sharding required");
    expect(onFatalClose).toHaveBeenCalledWith(GatewayCloseCodes.SHARDING_REQUIRED);
  });

  test("should reconnect for unknown close codes", () => {
    const onShouldReconnect = mock(() => {});
    const handler = new ConnectionHandler(
      mock(() => {}),
      onShouldReconnect,
      mock(() => {}),
      mock(() => {})
    );

    handler.handleClose(1000, "Normal close");
    expect(onShouldReconnect).toHaveBeenCalled();
  });

  test("should call onDebug with close information", () => {
    const onDebug = mock(() => {});
    const handler = new ConnectionHandler(
      mock(() => {}),
      mock(() => {}),
      mock(() => {}),
      onDebug
    );

    handler.handleClose(1000, "Normal close");
    expect(onDebug).toHaveBeenCalledWith("WebSocket closed: 1000 - Normal close");
  });
});
