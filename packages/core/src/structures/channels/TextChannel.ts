import type { APITextChannel, RESTPostAPIChannelMessageJSONBody, APIMessage } from "discord-api-types/v10";
import type { Client } from "@/Client.ts";
import { BaseChannel } from "./BaseChannel.ts";
import { TextBasedChannel } from "./TextBasedChannel.ts";

/**
 * Represents a guild text channel.
 */
export class TextChannel extends TextBasedChannel {
  protected declare data: APITextChannel;

  constructor(client: Client, data: APITextChannel) {
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
   * The channel topic (0-1024 characters)
   */
  get topic() {
    return this.data.topic;
  }

  /**
   * The id of the last message sent in this channel
   */
  get last_message_id() {
    return this.data.last_message_id;
  }

  /**
   * When the last pinned message was pinned
   */
  get last_pin_timestamp() {
    return this.data.last_pin_timestamp;
  }

  /**
   * Amount of seconds a user has to wait before sending another message
   */
  get rate_limit_per_user() {
    return this.data.rate_limit_per_user;
  }

  /**
   * Default duration for newly created threads to automatically archive
   */
  get default_auto_archive_duration() {
    return this.data.default_auto_archive_duration;
  }

  /**
   * The initial rate_limit_per_user to set on newly created threads
   */
  get default_thread_rate_limit_per_user() {
    return this.data.default_thread_rate_limit_per_user;
  }
}