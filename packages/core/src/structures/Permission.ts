import { PermissionBits } from "@spall/constants";

export type PermissionResolvable = bigint | keyof typeof PermissionBits | (bigint | keyof typeof PermissionBits)[];

/**
 * Represents a permission bitfield.
 */
export class Permission {
  private bitfield: bigint;

  constructor(permissions: string | bigint | number = 0n) {
    this.bitfield = BigInt(permissions);
  }

  /**
   * Resolve a permission resolvable to a bigint.
   */
  static resolve(permission: PermissionResolvable): bigint {
    if (Array.isArray(permission)) {
      return permission.reduce<bigint>((acc, perm) => acc | Permission.resolve(perm), 0n);
    }

    if (typeof permission === "string") {
      const bit = PermissionBits[permission];
      if (bit === undefined) {
        throw new Error(`Invalid permission: ${permission}`);
      }
      return bit;
    }

    return permission;
  }

  /**
   * Check if this permission bitfield has a specific permission or permissions.
   * @param permission - Permission bit, name, or array of either
   */
  has = (permission: PermissionResolvable): boolean => {
    const resolved = Permission.resolve(permission);
    return (this.bitfield & resolved) === resolved;
  };

  /**
   * Check if this permission bitfield has any of the specified permissions.
   * @param permissions - Array of permission bits or names
   */
  any = (permissions: PermissionResolvable[]): boolean => {
    return permissions.some((perm) => this.has(perm));
  };

  /**
   * Add one or more permissions to this bitfield.
   * @param permission - Permission bit, name, or array of either
   */
  add = (permission: PermissionResolvable): this => {
    this.bitfield |= Permission.resolve(permission);
    return this;
  };

  /**
   * Remove one or more permissions from this bitfield.
   * @param permission - Permission bit, name, or array of either
   */
  remove = (permission: PermissionResolvable): this => {
    this.bitfield &= ~Permission.resolve(permission);
    return this;
  };

  /**
   * Get an array of permission names that are set in this bitfield.
   */
  toArray = (): (keyof typeof PermissionBits)[] => {
    const permissions: (keyof typeof PermissionBits)[] = [];
    for (const [name, bit] of Object.entries(PermissionBits)) {
      if ((this.bitfield & bit) === bit) {
        permissions.push(name as keyof typeof PermissionBits);
      }
    }
    return permissions;
  };

  /**
   * Get the raw bitfield value as a string.
   */
  toString = (): string => {
    return this.bitfield.toString();
  };

  /**
   * Get the raw bitfield value as a bigint.
   */
  toBigInt = (): bigint => {
    return this.bitfield;
  };

  /**
   * Get the raw bitfield value as a string (for JSON serialization).
   */
  toJSON = (): string => {
    return this.bitfield.toString();
  };

  /**
   * Create a new Permission instance with the same bitfield.
   */
  clone = (): Permission => {
    return new Permission(this.bitfield);
  };

  /**
   * Check if this permission bitfield equals another.
   */
  equals = (other: Permission): boolean => {
    return this.bitfield === other.bitfield;
  };

  /**
   * Create a Permission instance from a permission resolvable.
   */
  static from = (permission: PermissionResolvable): Permission => {
    return new Permission(Permission.resolve(permission));
  };

  /**
   * Get all permissions.
   */
  static all = (): Permission => {
    const all = Object.values(PermissionBits).reduce((acc, bit) => acc | bit, 0n);
    return new Permission(all);
  };
}
