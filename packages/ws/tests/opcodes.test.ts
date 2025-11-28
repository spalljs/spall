import { describe, test, expect, mock } from "bun:test";
import { OpcodeHandler } from "../src/handlers/opcodes.ts";
import { GatewayOpcodes } from "@spall/constants";
import type { GatewayReceivePayload } from "discord-api-types/v10";

describe("OpcodeHandler", () => {
  test("should handle HELLO opcode", () => {
    const onHello = mock(() => {});
    const handler = new OpcodeHandler(
      onHello,
      mock(() => {}),
      mock(() => {}),
      mock(() => {}),
      mock(() => {}),
      mock(() => {})
    );

    const payload: GatewayReceivePayload = {
      op: GatewayOpcodes.HELLO,
      d: { heartbeat_interval: 41250 },
      s: null,
      t: null,
    };

    handler.process(payload);
    expect(onHello).toHaveBeenCalledWith(41250);
  });

  test("should handle HEARTBEAT_ACK opcode", () => {
    const onHeartbeatAck = mock(() => {});
    const handler = new OpcodeHandler(
      mock(() => {}),
      onHeartbeatAck,
      mock(() => {}),
      mock(() => {}),
      mock(() => {}),
      mock(() => {})
    );

    const payload = {
      op: GatewayOpcodes.HEARTBEAT_ACK,
      d: null,
      s: null,
      t: null,
    } as GatewayReceivePayload;

    handler.process(payload);
    expect(onHeartbeatAck).toHaveBeenCalled();
  });

  test("should handle DISPATCH opcode", () => {
    const onDispatch = mock(() => {});
    const handler = new OpcodeHandler(
      mock(() => {}),
      mock(() => {}),
      onDispatch,
      mock(() => {}),
      mock(() => {}),
      mock(() => {})
    );

    const payload = {
      op: GatewayOpcodes.DISPATCH,
      d: { user: { id: "123" } },
      s: 1,
      t: "READY",
    } as GatewayReceivePayload;

    handler.process(payload);
    expect(onDispatch).toHaveBeenCalledWith(payload);
  });

  test("should handle RECONNECT opcode", () => {
    const onReconnect = mock(() => {});
    const handler = new OpcodeHandler(
      mock(() => {}),
      mock(() => {}),
      mock(() => {}),
      onReconnect,
      mock(() => {}),
      mock(() => {})
    );

    const payload = {
      op: GatewayOpcodes.RECONNECT,
      d: null,
      s: null,
      t: null,
    } as GatewayReceivePayload;

    handler.process(payload);
    expect(onReconnect).toHaveBeenCalled();
  });

  test("should handle INVALID_SESSION opcode", () => {
    const onInvalidSession = mock(() => {});
    const handler = new OpcodeHandler(
      mock(() => {}),
      mock(() => {}),
      mock(() => {}),
      mock(() => {}),
      onInvalidSession,
      mock(() => {})
    );

    const payload: GatewayReceivePayload = {
      op: GatewayOpcodes.INVALID_SESSION,
      d: true,
      s: null,
      t: null,
    };

    handler.process(payload);
    expect(onInvalidSession).toHaveBeenCalledWith(true);
  });

  test("should call onDebug for unknown opcode", () => {
    const onDebug = mock(() => {});
    const handler = new OpcodeHandler(
      mock(() => {}),
      mock(() => {}),
      mock(() => {}),
      mock(() => {}),
      mock(() => {}),
      onDebug
    );

    const payload = {
      op: 999 as any,
      d: null,
      s: null,
      t: null,
    } as GatewayReceivePayload;

    handler.process(payload);
    expect(onDebug).toHaveBeenCalledWith("Unknown opcode: 999");
  });
});
