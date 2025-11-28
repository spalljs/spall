import type { APIUser } from "discord-api-types/v10";
import { CDN_URL } from "@spall/constants";
import type { Client } from "@/Client.ts";

/**
 * Represents a Discord user.
 */
export class User {
  private client: Client;
  private data: APIUser;

  constructor(client: Client, data: APIUser) {
    this.client = client;
    this.data = data;
  }

  /**
   * The user's id
   */
  get id() {
    return this.data.id;
  }

  /**
   * The user's username, not unique across the platform
   */
  get username() {
    return this.data.username;
  }

  /**
   * The user's Discord-tag
   */
  get discriminator() {
    return this.data.discriminator;
  }

  /**
   * The user's display name, if it is set. For bots, this is the application name
   */
  get global_name() {
    return this.data.global_name;
  }

  /**
   * The user's avatar hash
   */
  get avatar() {
    return this.data.avatar;
  }

  /**
   * Whether the user belongs to an OAuth2 application
   */
  get bot() {
    return this.data.bot;
  }

  /**
   * Whether the user is an Official Discord System user (part of the urgent message system)
   */
  get system() {
    return this.data.system;
  }

  /**
   * Whether the user has two factor enabled on their account
   */
  get mfa_enabled() {
    return this.data.mfa_enabled;
  }

  /**
   * The user's banner hash
   */
  get banner() {
    return this.data.banner;
  }

  /**
   * The user's banner color encoded as an integer representation of hexadecimal color code
   */
  get accent_color() {
    return this.data.accent_color;
  }

  /**
   * The user's chosen language option
   */
  get locale() {
    return this.data.locale;
  }

  /**
   * Whether the email on this account has been verified
   */
  get verified() {
    return this.data.verified;
  }

  /**
   * The user's email
   */
  get email() {
    return this.data.email;
  }

  /**
   * The flags on a user's account
   */
  get flags() {
    return this.data.flags;
  }

  /**
   * The type of Nitro subscription on a user's account
   */
  get premium_type() {
    return this.data.premium_type;
  }

  /**
   * The public flags on a user's account
   */
  get public_flags() {
    return this.data.public_flags;
  }

  /**
   * The data for the user's avatar decoration
   */
  get avatar_decoration_data() {
    return this.data.avatar_decoration_data;
  }

  /**
   * The data for the user's collectibles
   */
  get collectibles() {
    return this.data.collectibles;
  }

  /**
   * The user's primary guild
   */
  get primary_guild() {
    return this.data.primary_guild;
  }

  /**
   * Get the user's avatar URL.
   */
  avatarURL = (options?: { size?: number; format?: "png" | "jpg" | "webp" | "gif"; }): string | null => {
    if (!this.data.avatar) return null;

    const format = options?.format ?? (this.data.avatar.startsWith("a_") ? "gif" : "png");
    const size = options?.size ?? 128;

    return `${CDN_URL}/avatars/${this.data.id}/${this.data.avatar}.${format}?size=${size}`;
  };

  /**
   * Get the user's banner URL.
   */
  bannerURL = (options?: { size?: number; format?: "png" | "jpg" | "webp" | "gif"; }): string | null => {
    if (!this.data.banner) return null;

    const format = options?.format ?? (this.data.banner.startsWith("a_") ? "gif" : "png");
    const size = options?.size ?? 128;

    return `${CDN_URL}/banners/${this.data.id}/${this.data.banner}.${format}?size=${size}`;
  };

  /**
   * Get the user's default avatar URL (for users without custom avatars).
   */
  defaultAvatarURL = (): string => {
    const index = this.data.discriminator === "0"
      ? Number(BigInt(this.data.id) >> 22n) % 6
      : parseInt(this.data.discriminator) % 5;

    return `${CDN_URL}/embed/avatars/${index}.png`;
  };

  /**
   * Get the display avatar URL (custom avatar or default).
   */
  displayAvatarURL = (options?: { size?: number; format?: "png" | "jpg" | "webp" | "gif"; }): string => {
    return this.avatarURL(options) ?? this.defaultAvatarURL();
  };

  /**
   * Returns the user mention string.
   */
  toString = (): string => {
    return `<@${this.data.id}>`;
  };

  /**
   * Get the raw API data.
   */
  toJSON = (): APIUser => {
    return this.data;
  };
}
