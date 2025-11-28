import type { APIGuildForumChannel } from "discord-api-types/v10";
import type { Client } from "@/Client.ts";
import { BaseChannel } from "./BaseChannel.ts";

/**
 * Represents a guild forum channel.
 */
export class ForumChannel extends BaseChannel {
  protected declare data: APIGuildForumChannel;

  constructor(client: Client, data: APIGuildForumChannel) {
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
   * The channel topic (0-4096 characters for forum channels)
   */
  get topic() {
    return this.data.topic;
  }

  /**
   * Default duration for newly created threads to automatically archive
   */
  get default_auto_archive_duration() {
    return this.data.default_auto_archive_duration;
  }

  /**
   * The set of tags that can be used in the forum channel
   */
  get available_tags() {
    return this.data.available_tags;
  }

  /**
   * The emoji to show in the add reaction button on a thread
   */
  get default_reaction_emoji() {
    return this.data.default_reaction_emoji;
  }

  /**
   * The initial rate_limit_per_user to set on newly created threads
   */
  get default_thread_rate_limit_per_user() {
    return this.data.default_thread_rate_limit_per_user;
  }

  /**
   * The default sort order type used to order posts
   */
  get default_sort_order() {
    return this.data.default_sort_order;
  }

  /**
   * The default forum layout view used to display posts
   */
  get default_forum_layout() {
    return this.data.default_forum_layout;
  }
}
