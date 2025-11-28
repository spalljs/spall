import type { APIChannel, RESTPatchAPIChannelJSONBody, ChannelType } from "discord-api-types/v10";
import type { Client } from "@/Client.ts";
import type { TextBasedChannel } from "packages/core/src/structures/channels/TextBasedChannel.ts";

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
  isTextChannel = (): this is import("./TextChannel.ts").TextChannel => {
    return this.data.type === 0; // ChannelType.GuildText
  };

  /**
   * Check if this is a DM channel.
   */
  isDMChannel = (): this is import("./DMChannel.ts").DMChannel => {
    return this.data.type === 1; // ChannelType.DM
  };

  /**
   * Check if this is a voice channel.
   */
  isVoiceChannel = (): this is import("./VoiceChannel.ts").VoiceChannel => {
    return this.data.type === 2; // ChannelType.GuildVoice
  };

  /**
   * Check if this is a group DM channel.
   */
  isGroupDMChannel = (): this is import("./GroupDMChannel.ts").GroupDMChannel => {
    return this.data.type === 3; // ChannelType.GroupDM
  };

  /**
   * Check if this is a category channel.
   */
  isCategoryChannel = (): this is import("./CategoryChannel.ts").CategoryChannel => {
    return this.data.type === 4; // ChannelType.GuildCategory
  };

  /**
   * Check if this is an announcement channel.
   */
  isAnnouncementChannel = (): this is import("./TextChannel.ts").TextChannel => {
    return this.data.type === 5; // ChannelType.GuildAnnouncement
  };

  /**
   * Check if this is a stage voice channel.
   */
  isStageVoiceChannel = (): this is import("./VoiceChannel.ts").VoiceChannel => {
    return this.data.type === 13; // ChannelType.GuildStageVoice
  };

  /**
   * Check if this is a thread channel.
   */
  isThreadChannel = (): this is import("./ThreadChannel.ts").ThreadChannel => {
    return this.data.type === 10 || this.data.type === 11 || this.data.type === 12; // PublicThread, PrivateThread, AnnouncementThread
  };

  /**
   * Check if this is a forum channel.
   */
  isForumChannel = (): this is import("./ForumChannel.ts").ForumChannel => {
    return this.data.type === 15; // ChannelType.GuildForum
  };

  /**
   * Check if this is a media channel.
   */
  isMediaChannel = (): this is import("./MediaChannel.ts").MediaChannel => {
    return this.data.type === 16; // ChannelType.GuildMedia
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
    return await this.client.guilds.fetch(this.guild_id);
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
