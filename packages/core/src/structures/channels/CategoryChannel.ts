import type { Client } from "@/Client.ts";
import { BaseChannel } from "./BaseChannel.ts";
import type { APIGuildCategoryChannel } from "discord-api-types/v10";

/**
 * Represents a guild category channel.
 */
export class CategoryChannel extends BaseChannel {
  protected declare data: APIGuildCategoryChannel;

  constructor(client: Client, data: APIGuildCategoryChannel) {
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
}
