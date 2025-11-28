import type { APIGuild, RESTPatchAPIGuildJSONBody } from "discord-api-types/v10";
import { CDN_URL } from "@spall/constants";
import type { Client } from "@/Client.ts";
import { RoleManager } from "../managers/RoleManager.ts";
import { GuildMemberManager } from "../managers/GuildMemberManager.ts";
import { generateSnowflake } from "@spall/utils";
import type { GuildMember } from "./GuildMember.ts";

/**
 * Represents a Discord guild (server).
 */
export class Guild {
  private client: Client;
  private data: APIGuild;

  /**
   * Manager for this guild's roles
   */
  roles: RoleManager;

  /**
   * Manager for this guild's members
   */
  members: GuildMemberManager;

  constructor(client: Client, data: APIGuild) {
    this.client = client;
    this.data = data;

    this.roles = new RoleManager(client, data.id);
    this.members = new GuildMemberManager(client, data.id);

    if (data.roles) {
      for (const roleData of data.roles) {
        this.roles._addFromData(roleData);
      }
    }
  }

  /**
   * Guild id
   */
  get id() {
    return this.data.id;
  }

  /**
   * Guild name (2-100 characters, excluding trailing and leading whitespace)
   */
  get name() {
    return this.data.name;
  }

  /**
   * Icon hash
   */
  get icon() {
    return this.data.icon;
  }

  /**
   * Icon hash, returned when in the template object
   */
  get icon_hash() {
    return this.data.icon_hash;
  }

  /**
   * Splash hash
   */
  get splash() {
    return this.data.splash;
  }

  /**
   * Discovery splash hash; only present for guilds with the "DISCOVERABLE" feature
   */
  get discovery_splash() {
    return this.data.discovery_splash;
  }

  /**
   * `true` if the user is the owner of the guild
   */
  get owner() {
    return this.data.owner;
  }

  /**
   * ID of owner
   */
  get owner_id() {
    return this.data.owner_id;
  }

  /**
   * Total permissions for the user in the guild (excludes overrides)
   */
  get permissions() {
    return this.data.permissions;
  }

  /**
   * Voice region id for the guild
   * @deprecated This field has been deprecated in favor of `rtc_region` on the channel.
   */
  get region() {
    return this.data.region;
  }

  /**
   * ID of afk channel
   */
  get afk_channel_id() {
    return this.data.afk_channel_id;
  }

  /**
   * afk timeout in seconds
   */
  get afk_timeout() {
    return this.data.afk_timeout;
  }

  /**
   * `true` if the guild widget is enabled
   */
  get widget_enabled() {
    return this.data.widget_enabled;
  }

  /**
   * The channel id that the widget will generate an invite to, or `null` if set to no invite
   */
  get widget_channel_id() {
    return this.data.widget_channel_id;
  }

  /**
   * Verification level required for the guild
   */
  get verification_level() {
    return this.data.verification_level;
  }

  /**
   * Default message notifications level
   */
  get default_message_notifications() {
    return this.data.default_message_notifications;
  }

  /**
   * Explicit content filter level
   */
  get explicit_content_filter() {
    return this.data.explicit_content_filter;
  }

  /**
   * Custom guild emojis
   */
  get emojis() {
    return this.data.emojis;
  }

  /**
   * Enabled guild features
   */
  get features() {
    return this.data.features;
  }

  /**
   * Required MFA level for the guild
   */
  get mfa_level() {
    return this.data.mfa_level;
  }

  /**
   * Application id of the guild creator if it is bot-created
   */
  get application_id() {
    return this.data.application_id;
  }

  /**
   * The id of the channel where guild notices such as welcome messages and boost events are posted
   */
  get system_channel_id() {
    return this.data.system_channel_id;
  }

  /**
   * System channel flags
   */
  get system_channel_flags() {
    return this.data.system_channel_flags;
  }

  /**
   * The id of the channel where Community guilds can display rules and/or guidelines
   */
  get rules_channel_id() {
    return this.data.rules_channel_id;
  }

  /**
   * The maximum number of presences for the guild
   */
  get max_presences() {
    return this.data.max_presences;
  }

  /**
   * The maximum number of members for the guild
   */
  get max_members() {
    return this.data.max_members;
  }

  /**
   * The vanity url code for the guild
   */
  get vanity_url_code() {
    return this.data.vanity_url_code;
  }

  /**
   * The description for the guild
   */
  get description() {
    return this.data.description;
  }

  /**
   * Banner hash
   */
  get banner() {
    return this.data.banner;
  }

  /**
   * Premium tier (Server Boost level)
   */
  get premium_tier() {
    return this.data.premium_tier;
  }

  /**
   * The number of boosts this guild currently has
   */
  get premium_subscription_count() {
    return this.data.premium_subscription_count;
  }

  /**
   * The preferred locale of a Community guild
   */
  get preferred_locale() {
    return this.data.preferred_locale;
  }

  /**
   * The id of the channel where admins and moderators of Community guilds receive notices from Discord
   */
  get public_updates_channel_id() {
    return this.data.public_updates_channel_id;
  }

  /**
   * The maximum amount of users in a video channel
   */
  get max_video_channel_users() {
    return this.data.max_video_channel_users;
  }

  /**
   * The maximum amount of users in a stage video channel
   */
  get max_stage_video_channel_users() {
    return this.data.max_stage_video_channel_users;
  }

  /**
   * Approximate number of members in this guild
   */
  get approximate_member_count() {
    return this.data.approximate_member_count;
  }

  /**
   * Approximate number of non-offline members in this guild
   */
  get approximate_presence_count() {
    return this.data.approximate_presence_count;
  }

  /**
   * The nsfw level of the guild
   */
  get nsfw_level() {
    return this.data.nsfw_level;
  }

  /**
   * Custom guild stickers
   */
  get stickers() {
    return this.data.stickers;
  }

  /**
   * Whether the guild has the boost progress bar enabled
   */
  get premium_progress_bar_enabled() {
    return this.data.premium_progress_bar_enabled;
  }

  /**
   * The type of Student Hub the guild is
   */
  get hub_type() {
    return this.data.hub_type;
  }

  /**
   * The id of the channel where admins and moderators of Community guilds receive safety alerts from Discord
   */
  get safety_alerts_channel_id() {
    return this.data.safety_alerts_channel_id;
  }

  /**
   * The incidents data for this guild
   */
  get incidents_data() {
    return this.data.incidents_data;
  }

  /**
   * Get the guild's icon URL.
   */
  iconURL = (options?: { size?: number; format?: "png" | "jpg" | "webp" | "gif"; }): string | null => {
    if (!this.data.icon) return null;

    const format = options?.format ?? (this.data.icon.startsWith("a_") ? "gif" : "png");
    const size = options?.size ?? 128;

    return `${CDN_URL}/icons/${this.data.id}/${this.data.icon}.${format}?size=${size}`;
  };

  /**
   * Get the guild's splash URL.
   */
  splashURL = (options?: { size?: number; format?: "png" | "jpg" | "webp"; }): string | null => {
    if (!this.data.splash) return null;

    const format = options?.format ?? "png";
    const size = options?.size ?? 128;

    return `${CDN_URL}/splashes/${this.data.id}/${this.data.splash}.${format}?size=${size}`;
  };

  /**
   * Get the guild's discovery splash URL.
   */
  discoverySplashURL = (options?: { size?: number; format?: "png" | "jpg" | "webp"; }): string | null => {
    if (!this.data.discovery_splash) return null;

    const format = options?.format ?? "png";
    const size = options?.size ?? 128;

    return `${CDN_URL}/discovery-splashes/${this.data.id}/${this.data.discovery_splash}.${format}?size=${size}`;
  };

  /**
   * Get the guild's banner URL.
   */
  bannerURL = (options?: { size?: number; format?: "png" | "jpg" | "webp" | "gif"; }): string | null => {
    if (!this.data.banner) return null;

    const format = options?.format ?? (this.data.banner.startsWith("a_") ? "gif" : "png");
    const size = options?.size ?? 128;

    return `${CDN_URL}/banners/${this.data.id}/${this.data.banner}.${format}?size=${size}`;
  };

  /**
   * Edit the guild.
   * @param data - The data to update the guild with
   * @param reason - The reason for editing the guild (for audit log)
   */
  edit = async (data: RESTPatchAPIGuildJSONBody, reason?: string): Promise<Guild> => {
    const updated = await this.client.rest.patch<APIGuild>(`/guilds/${this.data.id}`, {
      body: data,
      reason,
    });
    this.data = updated;
    return this;
  };

  /**
   * Delete the guild. Only available if you are the guild owner.
   */
  delete = async (): Promise<void> => {
    await this.client.rest.delete(`/guilds/${this.data.id}`);
  };

  /**
   * Leave the guild.
   */
  leave = async (): Promise<void> => {
    await this.client.rest.delete(`/users/@me/guilds/${this.data.id}`);
  };

  /**
   * Request guild members from the gateway (WebSocket).
   * This is useful for fetching members without using the REST API.
   * Returns a promise that resolves with all the fetched members.
   *
   * @param options - Options for the request
   */
  requestMembers = (options?: {
    query?: string;
    limit?: number;
    presences?: boolean;
    user_ids?: string | string[];
    nonce?: string;
  }): Promise<GuildMember[]> => {
    const nonce = options?.nonce ?? generateSnowflake();

    return new Promise((resolve) => {
      const allMembers: GuildMember[] = [];
      let expectedChunks: number | null = null;

      const chunkHandler = (
        members: GuildMember[],
        chunkIndex: number,
        chunkCount: number,
        receivedNonce: string | undefined
      ) => {
        if (receivedNonce !== nonce) return;

        allMembers.push(...members);

        if (expectedChunks === null) {
          expectedChunks = chunkCount;
        }

        if (chunkIndex + 1 === expectedChunks) {
          this.client.off("GUILD_MEMBERS_CHUNK", chunkHandler);

          resolve(allMembers);
        }
      };

      this.client.on("GUILD_MEMBERS_CHUNK", chunkHandler);

      this.client.ws.requestGuildMembers(this.data.id, {
        ...options,
        nonce,
      });
    });
  };

  /**
   * Get the raw API data.
   */
  toJSON = (): APIGuild => {
    return this.data;
  };
}
