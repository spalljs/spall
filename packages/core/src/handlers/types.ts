import type { Client } from "@/Client.ts";

export interface DispatchHandler<T = unknown> {
  (client: Client, data: T): void | Promise<void>;
}
