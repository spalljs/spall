import type { APIDMChannel, RESTPostAPIChannelMessageJSONBody, APIMessage } from "discord-api-types/v10";
import type { Client } from "@/Client.ts";
import { TextBasedChannel } from "./TextBasedChannel.ts";

/**
 * Represents a DM channel.
 */
export class DMChannel extends TextBasedChannel {
  protected declare data: APIDMChannel;

  constructor(client: Client, data: APIDMChannel) {
    super(client, data);
  }

  /**
   * The name of the channel (always null for DM channels)
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
}
