import type { APIChannel } from "discord-api-types/v10";
import { BaseManager } from "./BaseManager.ts";
import { createChannel, type BaseChannel } from "@/structures/channels/index.ts";
import type { Client } from "@/Client.ts";

/**
 * Manager for handling Channel structures with caching.
 */
export class ChannelManager extends BaseManager<string, BaseChannel> {
  constructor(client: Client, max_size?: number, predicate?: (value: BaseChannel) => boolean) {
    super(client, max_size, predicate);
  }

  /**
   * Fetch a channel from the API by ID.
   * @param channel_id - The ID of the channel to fetch
   */
  fetch = async (channel_id: string): Promise<BaseChannel> => {
    const existing = this.cache.get(channel_id);
    if (existing) return existing;

    const data = await this.client.rest.get<APIChannel>(`/channels/${channel_id}`);
    const channel = createChannel(this.client, data);
    this._add(channel_id, channel);
    return channel;
  };

  /**
   * Add a channel to the cache from raw API data.
   */
  _addFromData = (data: APIChannel): BaseChannel => {
    const channel = createChannel(this.client, data);
    this._add(data.id, channel);
    return channel;
  };
}
