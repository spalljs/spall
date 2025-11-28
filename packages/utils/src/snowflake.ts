const DISCORD_EPOCH = 1420070400000n;

/**
 * Deconstructs a Discord snowflake ID into its component parts.
 * @param snowflake - The snowflake ID to deconstruct
 * @returns Object containing the timestamp, worker_id, process_id, and increment
 */
export const deconstructSnowflake = (snowflake: string | bigint) => {
  const id = BigInt(snowflake);
  const timestamp = Number((id >> 22n) + DISCORD_EPOCH);
  const worker_id = Number((id & 0x3e0000n) >> 17n);
  const process_id = Number((id & 0x1f000n) >> 12n);
  const increment = Number(id & 0xfffn);

  return {
    timestamp,
    worker_id,
    process_id,
    increment,
    date: new Date(timestamp),
  };
};

/**
 * Extracts the timestamp from a Discord snowflake ID.
 * @param snowflake - The snowflake ID
 * @returns Unix timestamp in milliseconds
 */
export const getSnowflakeTimestamp = (snowflake: string | bigint): number =>
  Number((BigInt(snowflake) >> 22n) + DISCORD_EPOCH);

/**
 * Converts a timestamp to a Discord snowflake ID.
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Snowflake ID as a string
 */
export const timestampToSnowflake = (timestamp: number): string =>
  ((BigInt(timestamp) - DISCORD_EPOCH) << 22n).toString();

/**
 * Compares two snowflake IDs to determine chronological order.
 * @param a - First snowflake ID
 * @param b - Second snowflake ID
 * @returns Negative if a < b, positive if a > b, zero if equal
 */
export const compareSnowflakes = (
  a: string | bigint,
  b: string | bigint,
): number => {
  const diff = BigInt(a) - BigInt(b);
  return diff < 0n ? -1 : diff > 0n ? 1 : 0;
};

/**
 * Options for generating a Discord-style snowflake ID.
 */
export interface SnowflakeGeneratorOptions {
  /** Optional unix timestamp in milliseconds; defaults to current time. */
  timestamp?: number | bigint;
  /** 5-bit worker identifier (0..31). */
  workerId?: number;
  /** 5-bit process identifier (0..31). */
  processId?: number;
}

const MAX_SEQUENCE = 0xfffn; // 12 bits
let lastTimestamp: bigint = 0n;
let sequence: bigint = 0n;

/**
 * Generates a Discord-style snowflake ID.
 * Layout: [timestamp << 22] | [workerId << 17] | [processId << 12] | [sequence]
 * - timestamp: milliseconds since Discord epoch (2015-01-01) (BigInt)
 * - workerId: 5 bits (0..31)
 * - processId: 5 bits (0..31)
 * - sequence: 12 bits (0..4095), resets each millisecond
 */
export const generateSnowflake = (
  options: SnowflakeGeneratorOptions = {},
): string => {
  const nowMs: bigint =
    options.timestamp !== undefined ? BigInt(options.timestamp) : BigInt(Date.now());

  if (nowMs === lastTimestamp) {
    sequence = (sequence + 1n) & MAX_SEQUENCE;
    if (sequence === 0n) {
      // Sequence overflow within the same millisecond; advance to the next millisecond
      let next = BigInt(Date.now());
      while (next <= nowMs) {
        next = BigInt(Date.now());
      }
      lastTimestamp = next;
    }
  } else {
    sequence = 0n;
    lastTimestamp = nowMs;
  }

  const timestampPart = lastTimestamp - DISCORD_EPOCH;
  const worker = BigInt((options.workerId ?? 0) & 0x1f);
  const process = BigInt((options.processId ?? 0) & 0x1f);

  const id = (timestampPart << 22n) | (worker << 17n) | (process << 12n) | sequence;
  return id.toString();
};