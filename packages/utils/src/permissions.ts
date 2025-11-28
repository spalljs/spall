import { PermissionBits } from "@spall/constants";

/**
 * Checks if a permission bitfield has a specific permission.
 * @param permissions - The permission bitfield as a string
 * @param permission - The permission bit to check
 * @returns True if the permission is present
 */
export const hasPermission = (
  permissions: string | bigint,
  permission: bigint,
): boolean => {
  const perms = BigInt(permissions);
  return (perms & permission) === permission;
};

/**
 * Checks if a permission bitfield has any of the specified permissions.
 * @param permissions - The permission bitfield as a string
 * @param checks - Array of permission bits to check
 * @returns True if any permission is present
 */
export const hasAnyPermission = (
  permissions: string | bigint,
  checks: bigint[],
): boolean => {
  const perms = BigInt(permissions);
  return checks.some((check) => (perms & check) === check);
};

/**
 * Checks if a permission bitfield has all of the specified permissions.
 * @param permissions - The permission bitfield as a string
 * @param checks - Array of permission bits to check
 * @returns True if all permissions are present
 */
export const hasAllPermissions = (
  permissions: string | bigint,
  checks: bigint[],
): boolean => {
  const perms = BigInt(permissions);
  return checks.every((check) => (perms & check) === check);
};

/**
 * Adds one or more permissions to a permission bitfield.
 * @param permissions - The base permission bitfield
 * @param toAdd - Permission bits to add
 * @returns New permission bitfield as a string
 */
export const addPermissions = (
  permissions: string | bigint,
  ...toAdd: bigint[]
): string => {
  let perms = BigInt(permissions);
  for (const perm of toAdd) {
    perms |= perm;
  }
  return perms.toString();
};

/**
 * Removes one or more permissions from a permission bitfield.
 * @param permissions - The base permission bitfield
 * @param toRemove - Permission bits to remove
 * @returns New permission bitfield as a string
 */
export const removePermissions = (
  permissions: string | bigint,
  ...toRemove: bigint[]
): string => {
  let perms = BigInt(permissions);
  for (const perm of toRemove) {
    perms &= ~perm;
  }
  return perms.toString();
};

/**
 * Converts a permission bitfield to an array of permission names.
 * @param permissions - The permission bitfield
 * @returns Array of permission names
 */
export const toPermissionArray = (permissions: string | bigint): string[] => {
  const perms = BigInt(permissions);
  const result: string[] = [];

  for (const [name, bit] of Object.entries(PermissionBits)) {
    if ((perms & bit) === bit) {
      result.push(name);
    }
  }

  return result;
};

/**
 * Creates a permission bitfield from an array of permission names.
 * @param permissions - Array of permission names
 * @returns Permission bitfield as a string
 */
export const fromPermissionArray = (permissions: string[]): string => {
  let result = 0n;

  for (const perm of permissions) {
    const bit = PermissionBits[perm as keyof typeof PermissionBits];
    if (bit) {
      result |= bit;
    }
  }

  return result.toString();
};
