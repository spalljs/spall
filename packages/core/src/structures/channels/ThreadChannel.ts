import type { APIThreadChannel, RESTPostAPIChannelMessageJSONBody, APIMessage } from "discord-api-types/v10";
import type { Client } from "@/Client.ts";
import { BaseChannel } from "./BaseChannel.ts";
import { TextBasedChannel } from "./TextBasedChannel.ts";

/**
 * Represents a thread channel.
 */
export class ThreadChannel extends TextBasedChannel {
  protected declare data: APIThreadChannel;

  constructor(client: Client, data: APIThreadChannel) {
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
   * ID of the parent channel for a thread
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
   * The client users member for the thread
   */
  get member() {
    return this.data.member;
  }

  /**
   * The metadata for a thread channel
   */
  get thread_metadata() {
    return this.data.thread_metadata;
  }

  /**
   * Number of messages in the thread
   */
  get message_count() {
    return this.data.message_count;
  }

  /**
   * The approximate member count of the thread
   */
  get member_count() {
    return this.data.member_count;
  }

  /**
   * ID of the thread creator
   */
  get owner_id() {
    return this.data.owner_id;
  }

  /**
   * Number of messages ever sent in the thread
   */
  get total_message_sent() {
    return this.data.total_message_sent;
  }

  /**
   * The IDs of the set of tags that have been applied to the thread
   */
  get applied_tags() {
    return this.data.applied_tags;
  }

  /**
   * Explicit permission overwrites for members and roles
   */
  get permission_overwrites() {
    return this.data.permission_overwrites;
  }

  /**
   * Join the thread.
   */
  join = async (): Promise<void> => {
    await this.client.rest.put(`/channels/${this.data.id}/thread-members/@me`);
  };

  /**
   * Leave the thread.
   */
  leave = async (): Promise<void> => {
    await this.client.rest.delete(`/channels/${this.data.id}/thread-members/@me`);
  };

  /**
   * Add a member to the thread.
   * @param user_id - The ID of the user to add
   */
  addMember = async (user_id: string): Promise<void> => {
    await this.client.rest.put(`/channels/${this.data.id}/thread-members/${user_id}`);
  };

  /**
   * Remove a member from the thread.
   * @param user_id - The ID of the user to remove
   */
  removeMember = async (user_id: string): Promise<void> => {
    await this.client.rest.delete(`/channels/${this.data.id}/thread-members/${user_id}`);
  };
}