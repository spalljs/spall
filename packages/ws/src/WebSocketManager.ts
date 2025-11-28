import { EventEmitter } from "@spall/utils";
import {
  GATEWAY_URL,
  GATEWAY_VERSION,
  GatewayOpcodes,
  SessionLimitError,
  WebSocketError,
} from "@spall/constants";
import type {
  GatewayReceivePayload,
  GatewaySendPayload,
  GatewayDispatchPayload,
} from "discord-api-types/v10";
import type { RestClient } from "@spall/api";
import type { WebSocketManagerOptions, WebSocketEvents } from "./types.ts";
import { CompressionHandler } from "./handlers/compression.ts";
import { HeartbeatHandler } from "./handlers/heartbeat.ts";
import { OpcodeHandler } from "./handlers/opcodes.ts";
import { ConnectionHandler } from "./handlers/connection.ts";

interface GatewayBotResponse {
  url: string;
  shards: number;
  session_start_limit: {
    total: number;
    remaining: number;
    reset_after: number;
    max_concurrency: number;
  };
}

/**
 * Manages WebSocket connections to the Discord Gateway.
 * Handles connection lifecycle, heartbeats, reconnection, and event dispatching.
 */
export class WebSocketManager extends EventEmitter<WebSocketEvents> {
  private token: string;
  private intents: number;
  private api_version: number;
  private rest: RestClient;
  private ws: WebSocket | null = null;
  private sequence: number | null = null;
  private session_id: string | null = null;
  private resuming = false;
  private gateway_url: string | null = null;
  private last_heartbeat: number | null = null;
  private last_heartbeat_ack: number | null = null;

  private compression: CompressionHandler;
  private heartbeat: HeartbeatHandler;
  private opcodes: OpcodeHandler;
  private connection: ConnectionHandler;

  constructor(options: WebSocketManagerOptions) {
    super();
    this.token = options.token;
    this.intents = options.intents;
    this.api_version = options.api_version ?? GATEWAY_VERSION;
    this.rest = options.rest;

    this.compression = new CompressionHandler(
      (data) => this.parseAndProcessPayload(data),
      (error) => this.emit("DEBUG", `Inflate error: ${error}`)
    );

    this.heartbeat = new HeartbeatHandler(
      (payload) => this.send(payload),
      () => this.sequence,
      (message) => this.emit("DEBUG", message)
    );

    this.opcodes = new OpcodeHandler(
      (interval) => this.handleHello(interval),
      () => this.handleHeartbeatAck(),
      (payload) => this.handleDispatch(payload),
      () => this.handleReconnect(),
      (resumable) => this.handleInvalidSession(resumable),
      (message) => this.emit("DEBUG", message)
    );

    this.connection = new ConnectionHandler(
      () => {
        this.resuming = true;
        setTimeout(() => this.connect(), 1000);
      },
      () => {
        this.resuming = false;
        this.session_id = null;
        this.sequence = null;
        setTimeout(() => this.connect(), 1000);
      },
      () => {},
      (message) => this.emit("DEBUG", message)
    );
  }

  /**
   * Connects to the Discord Gateway.
   * Fetches the Gateway URL from Discord's API before connecting.
   */
  connect = async (): Promise<void> => {
    await this.fetchGatewayUrl();

    const url = `${this.gateway_url}/?v=${this.api_version}&encoding=json&compress=zlib-stream`;
    this.emit("DEBUG", `Connecting to ${url}`);

    this.ws = new WebSocket(url);
    this.ws.onopen = this.handleOpen;
    this.ws.onmessage = this.handleMessage;
    this.ws.onerror = this.handleError;
    this.ws.onclose = this.handleClose;
  };

  /**
   * Fetches the Gateway URL and connection info from Discord's API.
   * Checks session start limits and throws an error if only 1 session remains.
   */
  private fetchGatewayUrl = async (): Promise<void> => {
    try {
      const data = await this.rest.get<GatewayBotResponse>("/gateway/bot");
      this.gateway_url = data.url;

      const { remaining, total, reset_after, max_concurrency } = data.session_start_limit;
      const reset_date = new Date(Date.now() + reset_after);

      this.emit("DEBUG", `Gateway URL fetched: ${this.gateway_url}`);
      this.emit("DEBUG", `Session start limit: ${remaining}/${total} (resets at ${reset_date.toISOString()})`);
      this.emit("DEBUG", `Recommended shards: ${data.shards}, Max concurrency: ${max_concurrency}`);

      if (remaining <= 1) {
        throw new SessionLimitError(remaining, total, reset_after);
      }
    } catch (error) {
      if (error instanceof SessionLimitError) {
        throw error;
      }

      this.emit("DEBUG", `Failed to fetch gateway URL: ${error}`);
      this.emit("DEBUG", `Falling back to hardcoded gateway URL: ${GATEWAY_URL}`);
      this.gateway_url = GATEWAY_URL;
    }
  };

  /**
   * Sends a payload to the Discord Gateway.
   * @param payload - The Gateway payload to send
   */
  send = (payload: GatewaySendPayload): void => {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.emit("DEBUG", "Cannot send, WebSocket not open");
      return;
    }

    this.emit("DEBUG", `Sending opcode ${payload.op}: ${JSON.stringify(payload).replaceAll(this.token, this.token.slice(0, 4) + '*'.repeat(Math.max(0, this.token.length - 8)) + this.token.slice(-4))}`);
    this.ws.send(JSON.stringify(payload));
  };

  /**
   * Disconnects from the Discord Gateway.
   * Stops heartbeats and closes the WebSocket connection.
   */
  disconnect = (): void => {
    this.heartbeat.stop();

    if (this.ws) {
      this.ws.close(1000);
      this.ws = null;
    }
  };

  /**
   * Request guild members from the gateway.
   * @param guild_id - The guild ID to request members from
   * @param options - Options for the request
   */
  requestGuildMembers = (guild_id: string, options?: {
    query?: string;
    limit?: number;
    presences?: boolean;
    user_ids?: string | string[];
    nonce?: string;
  }): void => {
    this.send({
      op: 8, // REQUEST_GUILD_MEMBERS
      d: {
        guild_id,
        query: options?.query ?? "",
        limit: options?.limit ?? 0,
        presences: options?.presences,
        user_ids: options?.user_ids,
        nonce: options?.nonce,
      },
    });
  };

  private handleOpen = (): void => {
    this.emit("DEBUG", "WebSocket opened");
    this.emit("CONNECTED");
  };

  private handleMessage = async (event: MessageEvent): Promise<void> => {
    let buffer: Buffer | null = null;

    if (event.data instanceof Buffer) {
      buffer = event.data;
    } else if (event.data instanceof ArrayBuffer) {
      buffer = Buffer.from(event.data);
    } else if (event.data instanceof Blob) {
      const arrayBuffer = await event.data.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    if (buffer) {
      this.compression.handleCompressedData(buffer);
    } else {
      this.parseAndProcessPayload(event.data);
    }
  };

  private parseAndProcessPayload = (data: string): void => {
    try {
      const payload = JSON.parse(data) as GatewayReceivePayload;
      this.emit("DEBUG", `Received opcode ${payload.op}: ${JSON.stringify(payload)}`);
      this.emit("RAW", payload);

      if (payload.s !== null) {
        this.sequence = payload.s;
      }

      this.opcodes.process(payload);
    } catch (error) {
      this.emit("DEBUG", `Failed to parse payload: ${error}`);
    }
  };

  private handleHello = (heartbeat_interval: number): void => {
    this.emit("DEBUG", `Received HELLO, heartbeat interval: ${heartbeat_interval}ms`);
    this.emit("HELLO", heartbeat_interval);

    this.heartbeat.start(heartbeat_interval);
    this.last_heartbeat = Date.now();
    if (this.resuming && this.session_id && this.sequence !== null) {
      this.sendResume();
    } else {
      this.sendIdentify();
    }
  };

  private handleHeartbeatAck = (): void => {
    this.emit("DEBUG", "Heartbeat acknowledged");
    this.emit("HEARTBEAT_ACK");
    this.last_heartbeat_ack = Date.now();
  };

  private handleDispatch = (payload: GatewayDispatchPayload): void => {
    const { t: event_name, d: data, s: sequence } = payload;
    this.emit("DEBUG", `DISPATCH event: ${event_name}`);
    this.emit("DISPATCH", event_name, data, sequence);

    if (event_name === "READY") {
      this.session_id = data.session_id;
      this.emit("DEBUG", `READY - Session ID: ${this.session_id}`);
      this.emit("READY", data);
    } else if (event_name === "RESUMED") {
      this.emit("DEBUG", "Successfully resumed session");
      this.emit("RESUMED");
    }
  };

  private handleError = (event: Event): void => {
    const error = new WebSocketError(`WebSocket error: ${event}`);
    this.emit("DEBUG", `Error: ${error.message}`);
    this.emit("ERROR", error);
  };

  private handleClose = (event: CloseEvent): void => {
    this.emit("CLOSE", event.code, event.reason);
    this.heartbeat.stop();
    this.connection.handleClose(event.code, event.reason);
  };

  private handleReconnect = (): void => {
    this.emit("DEBUG", "Gateway requested reconnect");
    this.emit("RECONNECT");
    this.resuming = true;
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  };

  private handleInvalidSession = (resumable: boolean): void => {
    this.emit("DEBUG", `Invalid session, resumable: ${resumable}`);
    this.emit("INVALID_SESSION", resumable);

    if (resumable) {
      this.emit("DEBUG", "Session invalid but resumable, reconnecting...");
      this.resuming = true;
      setTimeout(() => this.connect(), 1000);
    } else {
      this.emit("DEBUG", "Session invalid and not resumable, reidentifying...");
      this.resuming = false;
      this.session_id = null;
      this.sequence = null;
      setTimeout(() => this.sendIdentify(), 1000);
    }
  };

  private sendIdentify = (): void => {
    this.emit("DEBUG", `Sending IDENTIFY with token ${this.token.slice(0, 4)}${'*'.repeat(Math.max(0, this.token.length - 8))}${this.token.slice(-4)}`);

    this.send({
      op: GatewayOpcodes.IDENTIFY,
      d: {
        token: this.token,
        intents: this.intents,
        compress: true,
        properties: {
          os: process.platform,
          browser: "spall",
          device: "spall",
        },
      },
    });
  };

  private sendResume = (): void => {
    if (!this.session_id || this.sequence === null) {
      this.emit("DEBUG", "Cannot resume without session_id and sequence");
      this.sendIdentify();
      return;
    }

    this.emit("DEBUG", `Sending RESUME with session ${this.session_id} and sequence ${this.sequence}`);

    this.send({
      op: GatewayOpcodes.RESUME,
      d: {
        token: this.token,
        session_id: this.session_id,
        seq: this.sequence,
      },
    });
  };

  get ping() {
    if (!this.last_heartbeat_ack || !this.last_heartbeat) return -1;

    return this.last_heartbeat_ack - this.last_heartbeat;
  }

}
