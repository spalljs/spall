import type { APIOverwrite, Snowflake, OverwriteType } from "discord-api-types/v10";
import { Permission, type PermissionResolvable } from "./Permission.ts";

/**
 * Represents a permission overwrite for a role or member in a channel.
 */
export class PermissionOverwrite {
  private data: APIOverwrite;

  constructor(data: APIOverwrite) {
    this.data = data;
  }

  /**
   * The role or user ID this overwrite is for
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * The type of overwrite (0 = role, 1 = member)
   */
  get type(): OverwriteType {
    return this.data.type;
  }

  /**
   * Permission bits that are explicitly allowed
   */
  get allow(): Permission {
    return new Permission(this.data.allow);
  }

  /**
   * Permission bits that are explicitly denied
   */
  get deny(): Permission {
    return new Permission(this.data.deny);
  }

  /**
   * Check if a permission is allowed.
   */
  isAllowed = (permission: PermissionResolvable): boolean => {
    return this.allow.has(permission);
  };

  /**
   * Check if a permission is denied.
   */
  isDenied = (permission: PermissionResolvable): boolean => {
    return this.deny.has(permission);
  };

  /**
   * Check if a permission is neutral (neither allowed nor denied).
   */
  isNeutral = (permission: PermissionResolvable): boolean => {
    const resolved = Permission.resolve(permission);
    return !this.allow.has(resolved) && !this.deny.has(resolved);
  };

  /**
   * Set a permission to allowed.
   */
  setAllow = (permission: PermissionResolvable): this => {
    const resolved = Permission.resolve(permission);

    // Add to allow
    this.data.allow = (BigInt(this.data.allow) | resolved).toString();

    // Remove from deny if present
    this.data.deny = (BigInt(this.data.deny) & ~resolved).toString();

    return this;
  };

  /**
   * Set a permission to denied.
   */
  setDeny = (permission: PermissionResolvable): this => {
    const resolved = Permission.resolve(permission);

    // Add to deny
    this.data.deny = (BigInt(this.data.deny) | resolved).toString();

    // Remove from allow if present
    this.data.allow = (BigInt(this.data.allow) & ~resolved).toString();

    return this;
  };

  /**
   * Set a permission to neutral (remove from both allow and deny).
   */
  setNeutral = (permission: PermissionResolvable): this => {
    const resolved = Permission.resolve(permission);

    // Remove from both
    this.data.allow = (BigInt(this.data.allow) & ~resolved).toString();
    this.data.deny = (BigInt(this.data.deny) & ~resolved).toString();

    return this;
  };

  /**
   * Get the raw API data.
   */
  toJSON = (): APIOverwrite => {
    return this.data;
  };

  /**
   * Create a PermissionOverwrite from a role or member ID.
   */
  static forRole = (role_id: Snowflake, allow?: PermissionResolvable, deny?: PermissionResolvable): PermissionOverwrite => {
    const allowBits = allow ? Permission.resolve(allow).toString() : "0";
    const denyBits = deny ? Permission.resolve(deny).toString() : "0";

    return new PermissionOverwrite({
      id: role_id,
      type: 0, // Role
      allow: allowBits,
      deny: denyBits,
    });
  };

  /**
   * Create a PermissionOverwrite from a member ID.
   */
  static forMember = (user_id: Snowflake, allow?: PermissionResolvable, deny?: PermissionResolvable): PermissionOverwrite => {
    const allowBits = allow ? Permission.resolve(allow).toString() : "0";
    const denyBits = deny ? Permission.resolve(deny).toString() : "0";

    return new PermissionOverwrite({
      id: user_id,
      type: 1, // Member
      allow: allowBits,
      deny: denyBits,
    });
  };
}
