type EventListener<T extends unknown[]> = (...args: T) => void;

export class EventEmitter<Events extends Record<string, unknown[]>> {
  private listeners = new Map<keyof Events, Set<EventListener<unknown[]>>>();

  /**
   * Registers an event listener.
   */
  on = <K extends keyof Events>(
    event: K,
    listener: EventListener<Events[K]>,
  ): this => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(listener as EventListener<unknown[]>);
    return this;
  };

  /**
   * Registers a one-time event listener.
   */
  once = <K extends keyof Events>(
    event: K,
    listener: EventListener<Events[K]>,
  ): this => {
    const wrappedListener = ((...args: Events[K]) => {
      this.off(event, wrappedListener as EventListener<Events[K]>);
      listener(...args);
    }) as EventListener<Events[K]>;

    return this.on(event, wrappedListener);
  };

  /**
   * Removes an event listener.
   */
  off = <K extends keyof Events>(
    event: K,
    listener: EventListener<Events[K]>,
  ): this => {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener as EventListener<unknown[]>);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
    return this;
  };

  /**
   * Emits an event to all registered listeners.
   */
  emit = <K extends keyof Events>(event: K, ...args: Events[K]): boolean => {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) {
      return false;
    }

    for (const listener of eventListeners) {
      listener(...args);
    }

    return true;
  };

  /**
   * Removes all listeners for a specific event or all events.
   */
  removeAllListeners = (event?: keyof Events): this => {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  };

  /**
   * Returns the number of listeners for a specific event.
   */
  listenerCount = (event: keyof Events): number =>
    this.listeners.get(event)?.size ?? 0;
}
