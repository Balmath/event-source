function getPathElements(urlString: string): [string] {
  const url = new URL(urlString);
  const [, ...elements] = url.pathname.split("/");
  return elements[elements.length - 1] === "" ? elements.slice(0, -1) : elements;
}

function handleMethod(req: Request, eventLogKey: string): Response {
  switch (req.method) {
    case "GET": {
      return Response.json({ events: [{ action: "added" }], key: eventLogKey });
    }
    case "POST": {
      return Response.json({ key: eventLogKey, message: "added" });
    }
    case "DELETE": {
      return Response.json({ key: eventLogKey, message: "removed" });
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

  return Response.error();
}

export default {
  async fetch(req: Request): Response {
    try {
      const pathElements = getPathElements(req.url);

      if (pathElements.length !== 2) {
        return Response.json({ error: "Invalid URL" }, { status: 404, statusText: "Not Found" });
      }

      const [eventsName, eventLogKey] = pathElements;

      if (eventsName != "events") {
        return Response.json({ error: "Invalid URL" }, { status: 404, statusText: "Not Found" });
      }

      return handleMethod(req, eventLogKey);
    } catch (error: unknown) {
      return handleError(error);
    }
  },
};
