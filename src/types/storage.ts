export interface Storage {
  addEvent(eventLogKey: string, event: unknown): void;
  getEvents(eventLogKey: string): [unknown];
}
