import { ChannelType, type APIChannel, type APIDMChannel, type APIGroupDMChannel, type APIGuildCategoryChannel, type APIGuildForumChannel, type APIGuildMediaChannel, type APIGuildVoiceChannel, type APITextChannel, type APIThreadChannel } from "discord-api-types/v10";
import type { Client } from "@/Client.ts";

export * from "./BaseChannel.ts";
export * from "./TextBasedChannel.ts";
export * from "./TextChannel.ts";
export * from "./VoiceChannel.ts";
export * from "./CategoryChannel.ts";
export * from "./DMChannel.ts";
export * from "./GroupDMChannel.ts";
export * from "./ThreadChannel.ts";
export * from "./ForumChannel.ts";
export * from "./MediaChannel.ts";

import { BaseChannel } from "./BaseChannel.ts";
import { TextChannel } from "./TextChannel.ts";
import { VoiceChannel } from "./VoiceChannel.ts";
import { CategoryChannel } from "./CategoryChannel.ts";
import { DMChannel } from "./DMChannel.ts";
import { GroupDMChannel } from "./GroupDMChannel.ts";
import { ThreadChannel } from "./ThreadChannel.ts";
import { ForumChannel } from "./ForumChannel.ts";
import { MediaChannel } from "./MediaChannel.ts";

/**
 * Factory function to create the appropriate channel type from API data.
 */
export const createChannel = (client: Client, data: APIChannel) => {
  switch (data.type) {
    case ChannelType.GuildText:
    case ChannelType.GuildAnnouncement:
      return new TextChannel(client, data as APITextChannel);
    case ChannelType.GuildVoice:
    case ChannelType.GuildStageVoice:
      return new VoiceChannel(client, data as APIGuildVoiceChannel);
    case ChannelType.GuildCategory:
      return new CategoryChannel(client, data as APIGuildCategoryChannel);
    case ChannelType.DM:
      return new DMChannel(client, data as APIDMChannel);
    case ChannelType.GroupDM:
      return new GroupDMChannel(client, data as APIGroupDMChannel);
    case ChannelType.PublicThread:
    case ChannelType.PrivateThread:
    case ChannelType.AnnouncementThread:
      return new ThreadChannel(client, data as APIThreadChannel);
    case ChannelType.GuildForum:
      return new ForumChannel(client, data as APIGuildForumChannel);
    case ChannelType.GuildMedia:
      return new MediaChannel(client, data as APIGuildMediaChannel);
    default:
      return new BaseChannel(client, data);
  }
};
