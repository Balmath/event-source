import type { EventsStorage } from "./types.js";
import MemoryEventsStorage from "./memory-events-storage.js";

function getPathElements(urlString: string): string[] {
  const url = new URL(urlString);
  const [, ...elements] = url.pathname.split("/");
  return elements[elements.length - 1] === "" ? elements.slice(0, -1) : elements;
}

async function handleMethod(
  req: Request,
  eventLogKey: string,
  eventsStorage: EventsStorage,
): Promise<Response> {
  switch (req.method) {
    case "GET": {
      const events = await eventsStorage.getEvents(eventLogKey);
      return Response.json({ events: events, key: eventLogKey }, { statusText: "OK" });
    }
    case "POST": {
      await eventsStorage.addEvent(eventLogKey, await req.json());
      return Response.json({ key: eventLogKey, message: "added" }, { statusText: "OK" });
    }
    case "DELETE": {
      await eventsStorage.removeEvents(eventLogKey);
      return Response.json({ key: eventLogKey, message: "removed" }, { statusText: "OK" });
    }
    default: {
      return Response.json(
        { error: "Invalid method. Use GET, POST or DELETE" },
        { status: 405, statusText: "Method Not Allowed" },
      );
    }
  }
}

function handleError(error: unknown): Response {
  if (error instanceof TypeError) {
    return Response.json({ error: error.message }, { status: 400, statusText: "Bad Request" });
  }

  return Response.json(
    { error: "Server Error" },
    { status: 500, statusText: "Internal Server Error" },
  );
}

export class EventSource {
  #eventsStorage: EventsStorage;

  constructor(eventsStorage: EventsStorage | null | undefined) {
    this.#eventsStorage = eventsStorage ?? new MemoryEventsStorage();
  }

  async fetch(req: Request): Promise<Response> {
    try {
      const pathElements = getPathElements(req.url);

      if (pathElements.length !== 2) {
        return Response.json({ error: "Invalid URL" }, { status: 404, statusText: "Not Found" });
      }

      const [eventsName, eventLogKey] = pathElements;

      if (eventsName != "events" || typeof eventLogKey === "undefined") {
        return Response.json({ error: "Invalid URL" }, { status: 404, statusText: "Not Found" });
      }

      const response = await handleMethod(req, eventLogKey, this.#eventsStorage);

      return response;
    } catch (error: unknown) {
      return handleError(error);
    }
  }
}
