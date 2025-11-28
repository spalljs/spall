import type { User } from "./structures/User.ts";
import type { Guild } from "./structures/Guild.ts";
import type { BaseChannel } from "./structures/channels/index.ts";
import type { GuildMember } from "./structures/GuildMember.ts";
import type { Role } from "./structures/Role.ts";
import type { Message } from "./structures/Message.ts";
import type { Client } from "./Client.ts";
import type {
  GatewayMessageDeleteDispatchData,
  GatewayMessageDeleteBulkDispatchData,
  GatewayReadyDispatchData,
  APIUser,
} from "discord-api-types/v10";

/**
 * Cache options for a specific resource type.
 */
export interface CacheOptions<T> {
  /**
   * Maximum number of items to cache.
   */
  max?: number;
  /**
   * Predicate function to determine if an item should be cached.
   */
  predicate?: (value: T) => boolean;
}

/**
 * Client cache configuration.
 */
export interface ClientCacheOptions {
  users?: CacheOptions<User>;
  guilds?: CacheOptions<Guild>;
  channels?: CacheOptions<BaseChannel>;
  messages?: CacheOptions<any> | false;
}

/**
 * Client options for initializing the Discord client.
 */
export interface ClientOptions {
  /**
   * The bot token.
   */
  token: string;
  /**
   * Gateway intents.
   */
  intents: number;
  /**
   * Discord API version (defaults to 10).
   */
  api_version?: number;
  /**
   * Cache configuration for different resource types.
   */
  cache?: ClientCacheOptions;
}

/**
 * Client events with their payload types.
 */
export type ClientEvents = {
  // Guild events
  GUILD_CREATE: [guild: Guild];
  GUILD_UPDATE: [oldGuild: Guild | undefined, newGuild: Guild];
  GUILD_DELETE: [guild: Guild | undefined];

  // Channel events
  CHANNEL_CREATE: [channel: BaseChannel];
  CHANNEL_UPDATE: [oldChannel: BaseChannel | undefined, newChannel: BaseChannel];
  CHANNEL_DELETE: [channel: BaseChannel];

  // Message events
  MESSAGE_CREATE: [message: Message];
  MESSAGE_UPDATE: [oldMessage: Message | undefined, newMessage: Message];
  MESSAGE_DELETE: [data: GatewayMessageDeleteDispatchData];
  MESSAGE_DELETE_BULK: [data: GatewayMessageDeleteBulkDispatchData];

  // User events
  USER_UPDATE: [oldUser: User | undefined, newUser: User];

  // Guild member events
  GUILD_MEMBER_ADD: [member: GuildMember];
  GUILD_MEMBER_UPDATE: [oldMember: GuildMember | undefined, newMember: GuildMember];
  GUILD_MEMBER_REMOVE: [member: GuildMember | undefined, user: APIUser, guildId: string];

  // Role events
  GUILD_ROLE_CREATE: [role: Role];
  GUILD_ROLE_UPDATE: [oldRole: Role | undefined, newRole: Role];
  GUILD_ROLE_DELETE: [role: Role | undefined, guildId: string];

  // Guild members chunk (from WebSocket request)
  GUILD_MEMBERS_CHUNK: [members: GuildMember[], chunkIndex: number, chunkCount: number, nonce: string | undefined];

  // Ready events
  READY: [data: GatewayReadyDispatchData];
  CLIENT_READY: [client: Client];

  // Debug
  DEBUG: [...messages: unknown[]];
};
