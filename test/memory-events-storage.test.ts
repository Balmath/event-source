import { expect, test } from "vitest";
import MemoryEventsStorage from "../src/memory-events-storage.js";

test("Add event should create a new event log", async () => {
  const eventStorage = new MemoryEventsStorage();
  const event = { name: "test", value: 10 };
  await eventStorage.addEvent("TestEvents", event);
  const events = await eventStorage.getEvents("TestEvents");
  expect(events).toHaveLength(1);
  expect(events[0]).toBe(event);
});

test("Add event into an exising event log should append the event", async () => {
  const eventStorage = new MemoryEventsStorage();
  const event1 = { name: "test", value: 10 };
  await eventStorage.addEvent("TestEvents", event1);
  const event2 = { name: "test", value1: 10, value2: false };
  await eventStorage.addEvent("TestEvents", event2);
  const events = await eventStorage.getEvents("TestEvents");
  expect(events).toHaveLength(2);
  expect(events[0]).toBe(event1);
  expect(events[1]).toBe(event2);
});

test("Get events from non existing event log should return undefined", async () => {
  const eventStorage = new MemoryEventsStorage();
  const events = await eventStorage.getEvents("TestEvents");
  expect(events).toBeUndefined();
});

test("Remove events should return undefined when accessing event log", async () => {
  const eventStorage = new MemoryEventsStorage();
  const event = { name: "test", value: 10 };
  await eventStorage.addEvent("TestEvents", event);
  let events = await eventStorage.getEvents("TestEvents");
  expect(events).toBeDefined();
  await eventStorage.removeEvents("TestEvents");
  events = await eventStorage.getEvents("TestEvents");
  expect(events).toBeUndefined();
});
