import { RestClient } from "@spall/api";
import { WebSocketManager } from "@spall/ws";
import { API_VERSION, WebSocketError, GatewayCloseCodes, GatewayCloseCodeMessages } from "@spall/constants";
import { EventEmitter } from "@spall/utils";
import type { ClientOptions, ClientEvents } from "./types.ts";
import { UserManager } from "./managers/UserManager.ts";
import { GuildManager } from "./managers/GuildManager.ts";
import { ChannelManager } from "./managers/ChannelManager.ts";
import { handlers } from "./handlers/index.ts";
import { User } from "@/structures/User.ts";

export class Client extends EventEmitter<ClientEvents> {
  rest: RestClient;
  ws: WebSocketManager;
  users: UserManager;
  guilds: GuildManager;
  channels: ChannelManager;
  user: User | null = null;
  private token: string;
  private intents: number;
  private expected_guilds = 0;
  private ready_timeout: Timer | null = null;

  constructor(options: ClientOptions) {
    super();
    this.token = options.token;
    this.intents = options.intents;

    this.rest = new RestClient({
      token: this.token,
      api_version: options.api_version ?? API_VERSION,
    });

    this.ws = new WebSocketManager({
      token: this.token,
      intents: this.intents,
      api_version: options.api_version ?? API_VERSION,
      rest: this.rest,
    });

    this.users = new UserManager(
      this,
      options.cache?.users?.max,
      options.cache?.users?.predicate
    );
    this.guilds = new GuildManager(
      this,
      options.cache?.guilds?.max,
      options.cache?.guilds?.predicate
    );
    this.channels = new ChannelManager(
      this,
      options.cache?.channels?.max,
      options.cache?.channels?.predicate
    );

    this.setupEventHandlers();
  }

  /**
   * Set up gateway event handlers for caching.
   */
  private setupEventHandlers = (): void => {
    this.ws.on("DISPATCH", (event_name: string, data) => {
      this.handleDispatch(event_name, data);
    });

    this.ws.on("DEBUG", (...messages) => {
      this.emit("DEBUG", ...messages);
    });

    this.ws.on("CLOSE", (code: number, reason: string) => {
      const fatalCodes: number[] = [
        GatewayCloseCodes.AUTHENTICATION_FAILED,
        GatewayCloseCodes.INVALID_SHARD,
        GatewayCloseCodes.SHARDING_REQUIRED,
        GatewayCloseCodes.INVALID_API_VERSION,
        GatewayCloseCodes.INVALID_INTENTS,
        GatewayCloseCodes.DISALLOWED_INTENTS,
      ];

      if (fatalCodes.includes(code)) {
        const errorMessage = GatewayCloseCodeMessages[code] || reason;
        const error = new WebSocketError(`WebSocket closed with fatal error (${code}): ${errorMessage}`, code);
        this.emit("DEBUG", `Fatal error: ${error.message}`);
        throw error;
      }
    });
  };

  /**
   * Handle DISPATCH events and update caches.
   */
  private handleDispatch = (event: string, data: unknown): void => {
    const handler = handlers[event];

    if (handler) {
      handler(this, data);
    }
  };

  /**
   * Handle CLIENT_READY logic - waits for all guilds to arrive.
   * @internal
   */
  _handleClientReady = (expected_guilds: number): void => {
    this.expected_guilds = expected_guilds;

    if (this.ready_timeout) {
      clearTimeout(this.ready_timeout);
    }

    const timeout = Math.max(5000, Math.ceil(expected_guilds / 15) * 1000);

    const checkReady = () => {
      if (this.guilds.cache.size >= this.expected_guilds) {
        if (this.ready_timeout) {
          clearTimeout(this.ready_timeout);
          this.ready_timeout = null;
        }
        
        this.emit("CLIENT_READY", this);
        this.off("GUILD_CREATE", checkReady);
      }
    };

    this.on("GUILD_CREATE", checkReady);

    this.ready_timeout = setTimeout(() => {
      this.ready_timeout = null;
      this.off("GUILD_CREATE", checkReady);
      this.emit("CLIENT_READY", this);
    }, timeout);

    checkReady();
  };

  /**
   * Logs the client into Discord.
   */
  login = async (): Promise<void> => {
    await this.ws.connect();
  };

  /**
   * Disconnects the client from Discord.
   */
  destroy = (): void => {
    this.ws.disconnect();
  };
}
