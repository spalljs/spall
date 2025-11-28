import type { DispatchHandler } from "./types.ts";
import { GUILD_CREATE, GUILD_UPDATE, GUILD_DELETE } from "./guild.ts";
import { CHANNEL_CREATE, CHANNEL_UPDATE, CHANNEL_DELETE } from "./channel.ts";
import { MESSAGE_CREATE, MESSAGE_UPDATE, MESSAGE_DELETE, MESSAGE_DELETE_BULK } from "./message.ts";
import { USER_UPDATE } from "./user.ts";
import { GUILD_MEMBER_ADD, GUILD_MEMBER_UPDATE, GUILD_MEMBER_REMOVE } from "./guildMember.ts";
import { GUILD_MEMBERS_CHUNK } from "./guildMembersChunk.ts";
import { GUILD_ROLE_CREATE, GUILD_ROLE_UPDATE, GUILD_ROLE_DELETE } from "./role.ts";
import { READY } from "./ready.ts";

export const handlers: Record<string, DispatchHandler<any>> = {
  GUILD_CREATE,
  GUILD_UPDATE,
  GUILD_DELETE,
  CHANNEL_CREATE,
  CHANNEL_UPDATE,
  CHANNEL_DELETE,
  MESSAGE_CREATE,
  MESSAGE_UPDATE,
  MESSAGE_DELETE,
  MESSAGE_DELETE_BULK,
  USER_UPDATE,
  GUILD_MEMBER_ADD,
  GUILD_MEMBER_UPDATE,
  GUILD_MEMBER_REMOVE,
  GUILD_MEMBERS_CHUNK,
  GUILD_ROLE_CREATE,
  GUILD_ROLE_UPDATE,
  GUILD_ROLE_DELETE,
  READY,
};

export * from "./types.ts";
