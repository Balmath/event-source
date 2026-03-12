import { expect, test, vi } from "vitest";
import { EventSource } from "../src/event-source.js";

test("fetch should return 404 with root URL", async () => {
  const response = await new EventSource().fetch(new Request("http://test.com/"));
  expect(response.status).toBe(404);
  expect(response.statusText).toBe("Not Found");
});

test("fetch should return 404 with no event log key URL", async () => {
  const response = await new EventSource().fetch(new Request("http://test.com/events/"));
  expect(response.status).toBe(404);
  expect(response.statusText).toBe("Not Found");
});

test("fetch should return 404 with not events URL", async () => {
  const response = await new EventSource().fetch(new Request("http://test.com/invalid/test/"));
  expect(response.status).toBe(404);
  expect(response.statusText).toBe("Not Found");
});

test("fetch should return 404 with not events URL and no event log key", async () => {
  const response = await new EventSource().fetch(new Request("http://test.com/invalid/"));
  expect(response.status).toBe(404);
  expect(response.statusText).toBe("Not Found");
});

test("fetch should return 404 with extra URL element", async () => {
  const response = await new EventSource().fetch(new Request("http://test.com/events/test/extra"));
  expect(response.status).toBe(404);
  expect(response.statusText).toBe("Not Found");
});

test("fetch should return 405 with PUT method", async () => {
  const response = await new EventSource().fetch(
    new Request("http://test.com/events/test", {
      method: "PUT",
    }),
  );
  expect(response.status).toBe(405);
  expect(response.statusText).toBe("Method Not Allowed");
});

test("fetch should return 400 with invalid URL", async () => {
  const request = new Request("http://test.com/");
  const spy = vi.spyOn(request, "url", "get").mockReturnValue("^http://test.com/events/test");
  const response = await new EventSource().fetch(request);
  expect(response.status).toBe(400);
  expect(response.statusText).toBe("Bad Request");
  expect(spy).toHaveBeenCalledOnce();
});

test("fetch should return 500 when an error is thrown", async () => {
  const request = new Request("http://test.com/events/test");
  const eventStorage = {
    addEvent: () => {
      throw new Error("test");
    },
    getEvents: () => {
      throw new Error("test");
    },
    removeEvents: () => {
      throw new Error("test");
    },
  };
  const eventSource = new EventSource(eventStorage);
  const response = await eventSource.fetch(request);
  expect(response.status).toBe(500);
  expect(response.statusText).toBe("Internal Server Error");
});

test("fetch should return 200 when adding event", async () => {
  const request = new Request("http://test.com/events/test-log", {
    body: JSON.stringify({ action: "testAction", name: "testName" }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const response = await new EventSource().fetch(request);
  expect(response.status).toBe(200);
  expect(response.statusText).toBe("OK");
  expect(await response.json()).toStrictEqual({ key: "test-log", message: "added" });
});

function setupEvents(eventSource: EventSource, events: unknown[]): Promise<void> {
  const responses = events.map((event) => {
    const request = new Request("http://test.com/events/test-log", {
      body: JSON.stringify(event),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    return eventSource.fetch(request);
  });
  return Promise.all(responses);
}

test("fetch should return 200 when fetching events", async () => {
  const eventSource = new EventSource();
  const event1 = { action: "testAction", name: "testName" };
  const event2 = { next: "testNext", status: "testStatus" };
  await setupEvents(eventSource, [event1, event2]);
  const request = new Request("http://test.com/events/test-log");
  const response = await eventSource.fetch(request);
  expect(response.status).toBe(200);
  expect(response.statusText).toBe("OK");
  expect(await response.json()).toStrictEqual({ events: [event1, event2], key: "test-log" });
});

test("fetch should return 200 when deleting event log", async () => {
  const eventSource = new EventSource();
  const event1 = { action: "testAction", name: "testName" };
  const event2 = { next: "testNext", status: "testStatus" };
  await setupEvents(eventSource, [event1, event2]);
  const request = new Request("http://test.com/events/test-log", {
    method: "DELETE",
  });
  const response = await eventSource.fetch(request);
  expect(response.status).toBe(200);
  expect(response.statusText).toBe("OK");
  expect(await response.json()).toStrictEqual({ key: "test-log", message: "removed" });
});
