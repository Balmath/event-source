import type { EventsStorage } from "./types.js";

export default class MemoryEventsStorage implements EventsStorage {
  readonly #eventsMap: Map<string, unknown[]> = new Map<string, unknown[]>();

  async addEvent(eventLogKey: string, event: unknown): Promise<void> {
    const eventLog = this.#eventsMap.get(eventLogKey) ?? [];
    eventLog.push(event);
    this.#eventsMap.set(eventLogKey, eventLog);
  }

  async getEvents(eventLogKey: string): Promise<unknown[]> {
    return this.#eventsMap.get(eventLogKey) as unknown[];
  }

  async removeEvents(eventLogKey: string): Promise<void> {
    this.#eventsMap.delete(eventLogKey);
  }
}
