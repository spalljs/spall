import type { APIGuildVoiceChannel, RESTPostAPIChannelMessageJSONBody, APIMessage } from "discord-api-types/v10";
import type { Client } from "@/Client.ts";
import { BaseChannel } from "./BaseChannel.ts";
import { TextBasedChannel } from "./TextBasedChannel.ts";

/**
 * Represents a guild voice channel.
 */
export class VoiceChannel extends TextBasedChannel {
  protected declare data: APIGuildVoiceChannel;

  constructor(client: Client, data: APIGuildVoiceChannel) {
    super(client, data);
  }

  /**
   * The name of the channel
   */
  get name() {
    return this.data.name;
  }

  /**
   * The id of the guild
   */
  override get guild_id() {
    return this.data.guild_id;
  }

  /**
   * Sorting position of the channel
   */
  get position() {
    return this.data.position;
  }

  /**
   * Explicit permission overwrites for members and roles
   */
  get permission_overwrites() {
    return this.data.permission_overwrites;
  }

  /**
   * ID of the parent category for a channel
   */
  get parent_id() {
    return this.data.parent_id;
  }

  /**
   * Whether the channel is nsfw
   */
  get nsfw() {
    return this.data.nsfw;
  }

  /**
   * The bitrate (in bits) of the voice channel
   */
  get bitrate() {
    return this.data.bitrate;
  }

  /**
   * The user limit of the voice channel
   */
  get user_limit() {
    return this.data.user_limit;
  }

  /**
   * Voice region id for the voice channel
   */
  get rtc_region() {
    return this.data.rtc_region;
  }

  /**
   * The camera video quality mode of the voice channel
   */
  get video_quality_mode() {
    return this.data.video_quality_mode;
  }

  /**
   * Amount of seconds a user has to wait before sending another message
   */
  get rate_limit_per_user() {
    return this.data.rate_limit_per_user;
  }

  /**
   * The id of the last message sent in this channel
   */
  get last_message_id() {
    return this.data.last_message_id;
  }
}
