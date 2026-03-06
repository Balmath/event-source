import { expect, test, vi } from "vitest";
import requestHandler from "../src/index.js";

test("fetch should return 404 with root URL", async () => {
  const response = await requestHandler.fetch(new Request("http://test.com/"));
  expect(response.status).toBe(404);
  expect(response.statusText).toBe("Not Found");
});

test("fetch should return 404 with no event log key URL", async () => {
  const response = await requestHandler.fetch(new Request("http://test.com/events/"));
  expect(response.status).toBe(404);
  expect(response.statusText).toBe("Not Found");
});

test("fetch should return 404 with not events URL", async () => {
  const response = await requestHandler.fetch(new Request("http://test.com/invalid/"));
  expect(response.status).toBe(404);
  expect(response.statusText).toBe("Not Found");
});

test("fetch should return 405 with PUT method", async () => {
  const response = await requestHandler.fetch(
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
  const response = await requestHandler.fetch(request);
  expect(response.status).toBe(400);
  expect(response.statusText).toBe("Bad Request");
  expect(spy).toHaveBeenCalledOnce();
});
