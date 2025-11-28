import type { APIGroupDMChannel, RESTPostAPIChannelMessageJSONBody, APIMessage } from "discord-api-types/v10";
import { CDN_URL } from "@spall/constants";
import type { Client } from "@/Client.ts";
import { TextBasedChannel } from "./TextBasedChannel.ts";

/**
 * Represents a group DM channel. 
 */
export class GroupDMChannel extends TextBasedChannel {
  protected declare data: APIGroupDMChannel;

  constructor(client: Client, data: APIGroupDMChannel) {
    super(client, data);
  }

  /**
   * The name of the channel
   */
  get name() {
    return this.data.name;
  }

  /**
   * The recipients of the DM
   */
  get recipients() {
    return this.data.recipients;
  }

  /**
   * Application id of the group DM creator if it is bot-created
   */
  get application_id() {
    return this.data.application_id;
  }

  /**
   * Icon hash
   */
  get icon() {
    return this.data.icon;
  }

  /**
   * ID of the DM creator
   */
  get owner_id() {
    return this.data.owner_id;
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
   * Whether the channel is managed by an OAuth2 application
   */
  get managed() {
    return this.data.managed;
  }

  /**
   * Get the group DM's icon URL.
   */
  iconURL = (options?: { size?: number; format?: "png" | "jpg" | "webp"; }): string | null => {
    if (!this.data.icon) return null;

    const format = options?.format ?? "png";
    const size = options?.size ?? 128;

    return `${CDN_URL}/channel-icons/${this.data.id}/${this.data.icon}.${format}?size=${size}`;
  };
}