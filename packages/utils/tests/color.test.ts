import { describe, test, expect } from "bun:test";
import {
  Colors,
  hexToInt,
  intToHex,
  rgbToInt,
  intToRgb,
  rgbToHex,
  hexToRgb,
  resolveColor,
} from "../src/color.ts";

describe("color utilities", () => {
  test("Colors contains common Discord colors", () => {
    expect(Colors.Blurple).toBe(0x5865f2);
    expect(Colors.Green).toBe(0x57f287);
    expect(Colors.Red).toBe(0xed4245);
    expect(Colors.White).toBe(0xffffff);
    expect(Colors.Default).toBe(0x000000);
  });

  test("hexToInt converts hex string to integer", () => {
    expect(hexToInt("#FF0000")).toBe(0xff0000);
    expect(hexToInt("FF0000")).toBe(0xff0000);
    expect(hexToInt("#5865F2")).toBe(0x5865f2);
    expect(hexToInt("5865F2")).toBe(0x5865f2);
  });

  test("hexToInt handles lowercase", () => {
    expect(hexToInt("#ff0000")).toBe(0xff0000);
    expect(hexToInt("ff0000")).toBe(0xff0000);
  });

  test("intToHex converts integer to hex string", () => {
    expect(intToHex(0xff0000)).toBe("#FF0000");
    expect(intToHex(0x5865f2)).toBe("#5865F2");
    expect(intToHex(0x000000)).toBe("#000000");
    expect(intToHex(0xffffff)).toBe("#FFFFFF");
  });

  test("rgbToInt converts RGB to integer", () => {
    expect(rgbToInt(255, 0, 0)).toBe(0xff0000);
    expect(rgbToInt(0, 255, 0)).toBe(0x00ff00);
    expect(rgbToInt(0, 0, 255)).toBe(0x0000ff);
    expect(rgbToInt(88, 101, 242)).toBe(0x5865f2);
  });

  test("intToRgb converts integer to RGB", () => {
    expect(intToRgb(0xff0000)).toEqual({ r: 255, g: 0, b: 0 });
    expect(intToRgb(0x00ff00)).toEqual({ r: 0, g: 255, b: 0 });
    expect(intToRgb(0x0000ff)).toEqual({ r: 0, g: 0, b: 255 });
    expect(intToRgb(0x5865f2)).toEqual({ r: 88, g: 101, b: 242 });
  });

  test("rgbToHex converts RGB to hex string", () => {
    expect(rgbToHex(255, 0, 0)).toBe("#FF0000");
    expect(rgbToHex(0, 255, 0)).toBe("#00FF00");
    expect(rgbToHex(0, 0, 255)).toBe("#0000FF");
    expect(rgbToHex(88, 101, 242)).toBe("#5865F2");
  });

  test("hexToRgb converts hex string to RGB", () => {
    expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#00FF00")).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb("#0000FF")).toEqual({ r: 0, g: 0, b: 255 });
    expect(hexToRgb("5865F2")).toEqual({ r: 88, g: 101, b: 242 });
  });

  test("resolveColor handles hex string", () => {
    expect(resolveColor("#FF0000")).toBe(0xff0000);
    expect(resolveColor("FF0000")).toBe(0xff0000);
  });

  test("resolveColor handles integer", () => {
    expect(resolveColor(0xff0000)).toBe(0xff0000);
    expect(resolveColor(Colors.Blurple)).toBe(Colors.Blurple);
  });

  test("resolveColor handles RGB array", () => {
    expect(resolveColor([255, 0, 0])).toBe(0xff0000);
    expect(resolveColor([88, 101, 242])).toBe(0x5865f2);
  });

  test("hex to int to hex roundtrip", () => {
    const original = "#5865F2";
    const int = hexToInt(original);
    const result = intToHex(int);
    expect(result).toBe(original);
  });

  test("rgb to int to rgb roundtrip", () => {
    const original = { r: 88, g: 101, b: 242 };
    const int = rgbToInt(original.r, original.g, original.b);
    const result = intToRgb(int);
    expect(result).toEqual(original);
  });

  test("rgb to hex to rgb roundtrip", () => {
    const original = { r: 88, g: 101, b: 242 };
    const hex = rgbToHex(original.r, original.g, original.b);
    const result = hexToRgb(hex);
    expect(result).toEqual(original);
  });

  test("edge case: black color", () => {
    expect(hexToInt("#000000")).toBe(0x000000);
    expect(intToHex(0x000000)).toBe("#000000");
    expect(rgbToInt(0, 0, 0)).toBe(0x000000);
    expect(intToRgb(0x000000)).toEqual({ r: 0, g: 0, b: 0 });
  });

  test("edge case: white color", () => {
    expect(hexToInt("#FFFFFF")).toBe(0xffffff);
    expect(intToHex(0xffffff)).toBe("#FFFFFF");
    expect(rgbToInt(255, 255, 255)).toBe(0xffffff);
    expect(intToRgb(0xffffff)).toEqual({ r: 255, g: 255, b: 255 });
  });
});
