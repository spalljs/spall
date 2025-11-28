import type { RESTPostAPIChannelMessageJSONBody, APIMessage } from "discord-api-types/v10";
import { BaseChannel } from "./BaseChannel.ts";

/**
 * Mixin interface for text-based channels that can send messages.
 */
export class TextBasedChannel extends BaseChannel {
  /**
   * Send a message to this channel.
   * @param data - The message data
   */
  send = (data: RESTPostAPIChannelMessageJSONBody): Promise<APIMessage> => {
    return this.client.rest.post<APIMessage>(`/channels/${this.id}/messages`, { body: data });
  };

  /**
   * Bulk delete messages in this channel.
   * @param message_ids - Array of message IDs to delete (2-100 messages)
   * @param reason - The reason for bulk deleting (for audit log)
   */
  bulkDelete(message_ids: string[], reason?: string): Promise<void> {
    return this.client.rest.post(`/channels/${this.id}/messages/bulk-delete`, {
      body: { messages: message_ids },
      reason,
    });
  }
}