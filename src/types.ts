export declare const EventsStorage: EventsStorage;

export interface EventsStorage {
  addEvent(eventLogKey: string, event: unknown): Promise<void>;
  getEvents(eventLogKey: string): Promise<unknown[]>;
  removeEvents(eventLogKey: string): Promise<void>;
}
