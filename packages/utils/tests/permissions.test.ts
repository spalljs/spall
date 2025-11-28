import { describe, test, expect } from "bun:test";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  addPermissions,
  removePermissions,
  toPermissionArray,
  fromPermissionArray,
} from "../src/permissions.ts";
import { PermissionBits } from "@spall/constants";

describe("permission utilities", () => {
  const testPerms = (
    PermissionBits.SEND_MESSAGES |
    PermissionBits.VIEW_CHANNEL |
    PermissionBits.EMBED_LINKS
  ).toString();

  test("PermissionBits contains all permissions", () => {
    expect(PermissionBits.SEND_MESSAGES).toBe(1n << 11n);
    expect(PermissionBits.ADMINISTRATOR).toBe(1n << 3n);
    expect(PermissionBits.PIN_MESSAGES).toBe(1n << 51n);
  });

  test("hasPermission checks single permission", () => {
    expect(hasPermission(testPerms, PermissionBits.SEND_MESSAGES)).toBe(true);
    expect(hasPermission(testPerms, PermissionBits.KICK_MEMBERS)).toBe(false);
  });

  test("hasPermission works with bigint", () => {
    const perms = BigInt(testPerms);
    expect(hasPermission(perms, PermissionBits.VIEW_CHANNEL)).toBe(true);
    expect(hasPermission(perms, PermissionBits.BAN_MEMBERS)).toBe(false);
  });

  test("hasAnyPermission checks multiple permissions", () => {
    expect(
      hasAnyPermission(testPerms, [
        PermissionBits.SEND_MESSAGES,
        PermissionBits.KICK_MEMBERS,
      ]),
    ).toBe(true);
    expect(
      hasAnyPermission(testPerms, [
        PermissionBits.KICK_MEMBERS,
        PermissionBits.BAN_MEMBERS,
      ]),
    ).toBe(false);
  });

  test("hasAllPermissions checks all permissions", () => {
    expect(
      hasAllPermissions(testPerms, [
        PermissionBits.SEND_MESSAGES,
        PermissionBits.VIEW_CHANNEL,
      ]),
    ).toBe(true);
    expect(
      hasAllPermissions(testPerms, [
        PermissionBits.SEND_MESSAGES,
        PermissionBits.KICK_MEMBERS,
      ]),
    ).toBe(false);
  });

  test("addPermissions adds new permissions", () => {
    const newPerms = addPermissions(
      testPerms,
      PermissionBits.KICK_MEMBERS,
      PermissionBits.BAN_MEMBERS,
    );

    expect(hasPermission(newPerms, PermissionBits.SEND_MESSAGES)).toBe(true);
    expect(hasPermission(newPerms, PermissionBits.KICK_MEMBERS)).toBe(true);
    expect(hasPermission(newPerms, PermissionBits.BAN_MEMBERS)).toBe(true);
  });

  test("addPermissions doesn't modify original", () => {
    const original = PermissionBits.SEND_MESSAGES.toString();
    const modified = addPermissions(original, PermissionBits.KICK_MEMBERS);

    expect(hasPermission(original, PermissionBits.KICK_MEMBERS)).toBe(false);
    expect(hasPermission(modified, PermissionBits.KICK_MEMBERS)).toBe(true);
  });

  test("removePermissions removes permissions", () => {
    const newPerms = removePermissions(
      testPerms,
      PermissionBits.SEND_MESSAGES,
      PermissionBits.EMBED_LINKS,
    );

    expect(hasPermission(newPerms, PermissionBits.VIEW_CHANNEL)).toBe(true);
    expect(hasPermission(newPerms, PermissionBits.SEND_MESSAGES)).toBe(false);
    expect(hasPermission(newPerms, PermissionBits.EMBED_LINKS)).toBe(false);
  });

  test("toPermissionArray converts to array", () => {
    const array = toPermissionArray(testPerms);

    expect(array).toBeArray();
    expect(array).toContain("SEND_MESSAGES");
    expect(array).toContain("VIEW_CHANNEL");
    expect(array).toContain("EMBED_LINKS");
    expect(array.length).toBe(3);
  });

  test("fromPermissionArray converts from array", () => {
    const perms = fromPermissionArray([
      "SEND_MESSAGES",
      "VIEW_CHANNEL",
      "KICK_MEMBERS",
    ]);

    expect(hasPermission(perms, PermissionBits.SEND_MESSAGES)).toBe(true);
    expect(hasPermission(perms, PermissionBits.VIEW_CHANNEL)).toBe(true);
    expect(hasPermission(perms, PermissionBits.KICK_MEMBERS)).toBe(true);
    expect(hasPermission(perms, PermissionBits.BAN_MEMBERS)).toBe(false);
  });

  test("fromPermissionArray ignores invalid permissions", () => {
    const perms = fromPermissionArray([
      "SEND_MESSAGES",
      "INVALID_PERMISSION",
      "VIEW_CHANNEL",
    ]);

    expect(hasPermission(perms, PermissionBits.SEND_MESSAGES)).toBe(true);
    expect(hasPermission(perms, PermissionBits.VIEW_CHANNEL)).toBe(true);
  });

  test("toPermissionArray and fromPermissionArray roundtrip", () => {
    const array = toPermissionArray(testPerms);
    const reconstructed = fromPermissionArray(array);

    expect(reconstructed).toBe(testPerms);
  });

  test("administrator permission value", () => {
    const adminPerms = PermissionBits.ADMINISTRATOR.toString();
    expect(hasPermission(adminPerms, PermissionBits.ADMINISTRATOR)).toBe(true);
  });
});
