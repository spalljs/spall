/**
 * Discord timestamp formatting styles.
 */
export enum TimestampStyle {
  /** Short time (e.g., 16:20) */
  ShortTime = "t",
  /** Long time (e.g., 16:20:30) */
  LongTime = "T",
  /** Short date (e.g., 20/04/2021) */
  ShortDate = "d",
  /** Long date (e.g., 20 April 2021) */
  LongDate = "D",
  /** Short date/time (e.g., 20 April 2021 16:20) */
  ShortDateTime = "f",
  /** Long date/time (e.g., Tuesday, 20 April 2021 16:20) */
  LongDateTime = "F",
  /** Relative time (e.g., 2 months ago) */
  RelativeTime = "R",
}

/**
 * Formats a timestamp for Discord's timestamp markdown.
 * @param timestamp - Unix timestamp in seconds or milliseconds, or a Date object
 * @param style - The formatting style (default: RelativeTime)
 * @returns Formatted Discord timestamp string
 */
export const formatTimestamp = (
  timestamp: number | Date,
  style: TimestampStyle = TimestampStyle.RelativeTime,
): string => {
  const seconds =
    timestamp instanceof Date
      ? Math.floor(timestamp.getTime() / 1000)
      : timestamp > 9999999999
        ? Math.floor(timestamp / 1000)
        : timestamp;

  return `<t:${seconds}:${style}>`;
};

/**
 * Creates a short time timestamp (e.g., 16:20).
 * @param timestamp - Unix timestamp in seconds or milliseconds, or a Date object
 * @returns Formatted Discord timestamp string
 */
export const shortTime = (timestamp: number | Date): string =>
  formatTimestamp(timestamp, TimestampStyle.ShortTime);

/**
 * Creates a long time timestamp (e.g., 16:20:30).
 * @param timestamp - Unix timestamp in seconds or milliseconds, or a Date object
 * @returns Formatted Discord timestamp string
 */
export const longTime = (timestamp: number | Date): string =>
  formatTimestamp(timestamp, TimestampStyle.LongTime);

/**
 * Creates a short date timestamp (e.g., 20/04/2021).
 * @param timestamp - Unix timestamp in seconds or milliseconds, or a Date object
 * @returns Formatted Discord timestamp string
 */
export const shortDate = (timestamp: number | Date): string =>
  formatTimestamp(timestamp, TimestampStyle.ShortDate);

/**
 * Creates a long date timestamp (e.g., 20 April 2021).
 * @param timestamp - Unix timestamp in seconds or milliseconds, or a Date object
 * @returns Formatted Discord timestamp string
 */
export const longDate = (timestamp: number | Date): string =>
  formatTimestamp(timestamp, TimestampStyle.LongDate);

/**
 * Creates a short date/time timestamp (e.g., 20 April 2021 16:20).
 * @param timestamp - Unix timestamp in seconds or milliseconds, or a Date object
 * @returns Formatted Discord timestamp string
 */
export const shortDateTime = (timestamp: number | Date): string =>
  formatTimestamp(timestamp, TimestampStyle.ShortDateTime);

/**
 * Creates a long date/time timestamp (e.g., Tuesday, 20 April 2021 16:20).
 * @param timestamp - Unix timestamp in seconds or milliseconds, or a Date object
 * @returns Formatted Discord timestamp string
 */
export const longDateTime = (timestamp: number | Date): string =>
  formatTimestamp(timestamp, TimestampStyle.LongDateTime);

/**
 * Creates a relative time timestamp (e.g., 2 months ago).
 * @param timestamp - Unix timestamp in seconds or milliseconds, or a Date object
 * @returns Formatted Discord timestamp string
 */
export const relativeTime = (timestamp: number | Date): string =>
  formatTimestamp(timestamp, TimestampStyle.RelativeTime);
