import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApiClient } from "@/api";

describe("api client", () => {
  let transport;
  let api;

  beforeEach(() => {
    transport = {
      get: vi.fn().mockResolvedValue({ data: [] }),
      post: vi.fn().mockResolvedValue({}),
      put: vi.fn().mockResolvedValue({}),
    };
    api = createApiClient(transport);
  });

  it("builds the nested capsule collection path", async () => {
    await api.listCapsules(7);
    expect(transport.get).toHaveBeenCalledWith("users/7/message-capsules");
  });

  it("unwraps the JsonResource `data` envelope", async () => {
    transport.get.mockResolvedValue({ data: [{ id: 1 }] });
    await expect(api.listCapsules(7)).resolves.toEqual([{ id: 1 }]);
  });

  it("tolerates a bare array and a missing body", async () => {
    transport.get.mockResolvedValue([{ id: 2 }]);
    await expect(api.listCapsules(7)).resolves.toEqual([{ id: 2 }]);

    transport.get.mockResolvedValue(undefined);
    await expect(api.listCapsules(7)).resolves.toEqual([]);
  });

  it("posts a new capsule to the user's collection", async () => {
    const payload = { note: "hello", scheduled_opening_time: "2030-01-01T00:00:00.000Z" };
    await api.createCapsule(7, payload);
    expect(transport.post).toHaveBeenCalledWith("users/7/message-capsules", payload);
  });

  it("opens a capsule with the un-spaced URL", async () => {
    // Regression: the original store built "message-capsules " with a trailing
    // space, which the API answered with a 404.
    await api.openCapsule(7, 42);
    const [path] = transport.put.mock.calls[0];
    expect(path).toBe("users/7/message-capsules/42/open");
    expect(path).not.toMatch(/\s/);
  });

  it("accepts an open response with or without a data envelope", async () => {
    transport.put.mockResolvedValue({ id: 42, is_opened: true });
    await expect(api.openCapsule(7, 42)).resolves.toEqual({ id: 42, is_opened: true });

    transport.put.mockResolvedValue({ data: { id: 42, is_opened: true } });
    await expect(api.openCapsule(7, 42)).resolves.toEqual({ id: 42, is_opened: true });
  });

  it("reads the signed-in profile from the sanctum /user endpoint", async () => {
    await api.currentUser();
    expect(transport.get).toHaveBeenCalledWith("user");
  });

  it("posts auth payloads to the Fortify endpoints", async () => {
    await api.login({ email: "a@b.c", password: "x" });
    await api.register({ name: "A", email: "a@b.c", password: "x", password_confirmation: "x" });

    expect(transport.post).toHaveBeenNthCalledWith(1, "login", {
      email: "a@b.c",
      password: "x",
    });
    expect(transport.post.mock.calls[1][0]).toBe("register");
  });
});
