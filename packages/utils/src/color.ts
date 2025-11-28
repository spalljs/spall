/**
 * Common Discord colors as integers.
 */
export const Colors = {
  Default: 0x000000,
  White: 0xffffff,
  Aqua: 0x1abc9c,
  Green: 0x57f287,
  Blue: 0x3498db,
  Yellow: 0xfee75c,
  Purple: 0x9b59b6,
  LuminousVividPink: 0xe91e63,
  Fuchsia: 0xeb459e,
  Gold: 0xf1c40f,
  Orange: 0xe67e22,
  Red: 0xed4245,
  Grey: 0x95a5a6,
  Navy: 0x34495e,
  DarkAqua: 0x11806a,
  DarkGreen: 0x1f8b4c,
  DarkBlue: 0x206694,
  DarkPurple: 0x71368a,
  DarkVividPink: 0xad1457,
  DarkGold: 0xc27c0e,
  DarkOrange: 0xa84300,
  DarkRed: 0x992d22,
  DarkGrey: 0x979c9f,
  DarkerGrey: 0x7f8c8d,
  LightGrey: 0xbcc0c0,
  DarkNavy: 0x2c3e50,
  Blurple: 0x5865f2,
  Greyple: 0x99aab5,
  DarkButNotBlack: 0x2c2f33,
  NotQuiteBlack: 0x23272a,
} as const;

/**
 * Converts a hex color string to an integer.
 * @param hex - Hex color string (e.g., "#FF0000" or "FF0000")
 * @returns Color as an integer
 */
export const hexToInt = (hex: string): number =>
  parseInt(hex.replace("#", ""), 16);

/**
 * Converts a color integer to a hex string.
 * @param color - Color as an integer
 * @returns Hex color string (e.g., "#FF0000")
 */
export const intToHex = (color: number): string =>
  `#${color.toString(16).padStart(6, "0").toUpperCase()}`;

/**
 * Converts RGB values to a color integer.
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Color as an integer
 */
export const rgbToInt = (r: number, g: number, b: number): number =>
  (r << 16) | (g << 8) | b;

/**
 * Converts a color integer to RGB values.
 * @param color - Color as an integer
 * @returns Object with r, g, b values (0-255)
 */
export const intToRgb = (color: number): { r: number; g: number; b: number } => ({
  r: (color >> 16) & 0xff,
  g: (color >> 8) & 0xff,
  b: color & 0xff,
});

/**
 * Converts RGB values to a hex string.
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string (e.g., "#FF0000")
 */
export const rgbToHex = (r: number, g: number, b: number): string =>
  intToHex(rgbToInt(r, g, b));

/**
 * Converts a hex color string to RGB values.
 * @param hex - Hex color string (e.g., "#FF0000" or "FF0000")
 * @returns Object with r, g, b values (0-255)
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } =>
  intToRgb(hexToInt(hex));

/**
 * Resolves a color input to an integer.
 * @param color - Color as hex string, integer, or RGB array
 * @returns Color as an integer
 */
export const resolveColor = (
  color: string | number | [number, number, number],
): number => {
  if (typeof color === "string") {
    return hexToInt(color);
  }
  if (Array.isArray(color)) {
    return rgbToInt(color[0], color[1], color[2]);
  }
  return color;
};
