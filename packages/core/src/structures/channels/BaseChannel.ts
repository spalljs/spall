import { type APIChannel, type RESTPatchAPIChannelJSONBody, ChannelType } from "discord-api-types/v10";
import type { Client } from "@/Client.ts";
import type { TextChannel } from "./TextChannel.ts";
import type { DMChannel } from "./DMChannel.ts";
import type { VoiceChannel } from "./VoiceChannel.ts";
import type { GroupDMChannel } from "./GroupDMChannel.ts";
import type { CategoryChannel } from "./CategoryChannel.ts";
import type { ThreadChannel } from "./ThreadChannel.ts";
import type { ForumChannel } from "./ForumChannel.ts";
import type { MediaChannel } from "./MediaChannel.ts";
import type { TextBasedChannel } from "./TextBasedChannel.ts";

/**
 * Base class for all channel types.
 */
export class BaseChannel {
  readonly client: Client;
  protected data: APIChannel;

  constructor(client: Client, data: APIChannel) {
    this.client = client;
    this.data = data;
  }

  /**
   * The id of the channel
   */
  get id() {
    return this.data.id;
  }

  /**
   * The type of the channel
   */
  get type() {
    return this.data.type;
  }

  /**
   * Channel flags
   */
  get flags() {
    return this.data.flags;
  }

  /**
   * The ID of the guild this channel belongs to (if a guild channel)
   */
  get guild_id() {
    return "guild_id" in this.data ? this.data.guild_id : undefined;
  }

  /**
   * Check if this is a text channel.
   */
  isTextChannel = (): this is TextChannel => {
    return this.data.type === ChannelType.GuildText;
  };

  /**
   * Check if this is a DM channel.
   */
  isDMChannel = (): this is DMChannel => {
    return this.data.type === ChannelType.DM;
  };

  /**
   * Check if this is a voice channel.
   */
  isVoiceChannel = (): this is VoiceChannel => {
    return this.data.type === ChannelType.GuildVoice;
  };

  /**
   * Check if this is a group DM channel.
   */
  isGroupDMChannel = (): this is GroupDMChannel => {
    return this.data.type === ChannelType.GroupDM;
  };

  /**
   * Check if this is a category channel.
   */
  isCategoryChannel = (): this is CategoryChannel => {
    return this.data.type === ChannelType.GuildCategory;
  };

  /**
   * Check if this is an announcement channel.
   */
  isAnnouncementChannel = (): this is TextChannel => {
    return this.data.type === ChannelType.GuildAnnouncement;
  };

  /**
   * Check if this is a stage voice channel.
   */
  isStageVoiceChannel = (): this is VoiceChannel => {
    return this.data.type === ChannelType.GuildStageVoice;
  };

  /**
   * Check if this is a thread channel.
   */
  isThreadChannel = (): this is ThreadChannel => {
    return this.data.type === ChannelType.PublicThread || this.data.type === ChannelType.PrivateThread || this.data.type === ChannelType.AnnouncementThread;
  };

  /**
   * Check if this is a forum channel.
   */
  isForumChannel = (): this is ForumChannel => {
    return this.data.type === ChannelType.GuildForum;
  };

  /**
   * Check if this is a media channel.
   */
  isMediaChannel = (): this is MediaChannel => {
    return this.data.type === ChannelType.GuildMedia;
  };

  /**
   * Check if this is a text-based channel (can send messages).
   */
  isTextBased = (): this is TextBasedChannel => {
    return this.isTextChannel() || this.isDMChannel() || this.isGroupDMChannel() ||
      this.isThreadChannel() || this.isVoiceChannel() || this.isAnnouncementChannel();
  };

  /**
   * Check if this is a guild channel.
   */
  isGuildChannel = (): boolean => {
    return !this.isDMChannel() && !this.isGroupDMChannel();
  };

  /**
   * Edit the channel.
   * @param data - The data to update the channel with
   * @param reason - The reason for editing the channel (for audit log)
   */
  edit = async (data: RESTPatchAPIChannelJSONBody, reason?: string): Promise<this> => {
    const updated = await this.client.rest.patch<APIChannel>(`/channels/${this.data.id}`, {
      body: data,
      reason,
    });
    this.data = updated;
    return this;
  };

  /**
   * Delete/close the channel.
   * @param reason - The reason for deleting the channel (for audit log)
   */
  delete = async (reason?: string): Promise<void> => {
    await this.client.rest.delete(`/channels/${this.data.id}`, { reason });
  };

  /**
   * Fetch the guild this channel belongs to.
   * Returns null if this is not a guild channel.
   */
  fetchGuild = async () => {
    if (!this.guild_id) return null;
    return this.client.guilds.fetch(this.guild_id);
  };

  /**
   * Get the guild from cache if available.
   * Returns null if not cached or not a guild channel.
   */
  get guild() {
    if (!this.guild_id) return null;
    return this.client.guilds.get(this.guild_id) ?? null;
  }

  /**
   * Get the raw API data.
   */
  toJSON = (): APIChannel => {
    return this.data;
  };
}
