import { beforeEach, describe, expect, it, vi } from "vitest";
import ApiError from "@/api/ApiError";
import session from "@/lib/session";
import { createAppStore } from "@/store";

function makeApi(overrides = {}) {
  return {
    login: vi.fn().mockResolvedValue({ user: { id: 7, name: "Dana Ruiz" }, token: "tok" }),
    register: vi.fn().mockResolvedValue({ user: { id: 8, name: "New User" }, token: "tok2" }),
    currentUser: vi.fn().mockResolvedValue({ id: 7, name: "Dana Ruiz" }),
    listCapsules: vi.fn().mockResolvedValue([]),
    createCapsule: vi.fn(),
    openCapsule: vi.fn(),
    ...overrides,
  };
}

describe("auth module", () => {
  let api;
  let store;

  beforeEach(() => {
    api = makeApi();
    store = createAppStore({ api });
  });

  it("stores the profile and the session on login", async () => {
    await store.dispatch("auth/login", { email: "dana@example.com", password: "secret" });

    expect(api.login).toHaveBeenCalledWith({
      email: "dana@example.com",
      password: "secret",
    });
    expect(store.getters["auth/isAuthenticated"]).toBe(true);
    expect(session.getToken()).toBe("tok");
    expect(session.getUserId()).toBe("7");
  });

  it("clears the loader whether the call succeeds or fails", async () => {
    await store.dispatch("auth/login", { email: "a@b.c", password: "x" });
    expect(store.getters["ui/isLoading"]).toBe(false);

    api.login.mockRejectedValue({ response: { status: 422, data: { message: "Nope." } } });
    await expect(store.dispatch("auth/login", {})).rejects.toThrow();
    expect(store.getters["ui/isLoading"]).toBe(false);
  });

  it("throws an ApiError and leaves no half-session behind on failure", async () => {
    api.login.mockRejectedValue({
      response: { status: 422, data: { message: "These credentials do not match." } },
    });

    await expect(
      store.dispatch("auth/login", { email: "a@b.c", password: "x" })
    ).rejects.toBeInstanceOf(ApiError);
    expect(session.isAuthenticated()).toBe(false);
    expect(store.getters["auth/isAuthenticated"]).toBe(false);
  });

  it("signs the user in straight after registering", async () => {
    await store.dispatch("auth/signup", {
      name: "New User",
      email: "new@example.com",
      password: "secret123",
      password_confirmation: "secret123",
    });

    expect(store.getters["auth/isAuthenticated"]).toBe(true);
    expect(session.getUserId()).toBe("8");
  });

  it("drops the session and every cached capsule on logout", async () => {
    await store.dispatch("auth/login", { email: "a@b.c", password: "x" });
    store.commit("capsules/setItems", [{ id: 1, note: "priv****", is_opened: false }]);

    await store.dispatch("auth/logout");

    expect(session.isAuthenticated()).toBe(false);
    expect(store.getters["auth/isAuthenticated"]).toBe(false);
    expect(store.state.capsules.items).toEqual([]);
  });

  it("derives initials for the header avatar", async () => {
    await store.dispatch("auth/login", { email: "a@b.c", password: "x" });
    expect(store.getters["auth/initials"]).toBe("DR");
    expect(store.getters["auth/displayName"]).toBe("Dana Ruiz");
  });

  it("falls back to a placeholder when there is no user yet", () => {
    expect(store.getters["auth/initials"]).toBe("?");
  });

  describe("hydrate", () => {
    it("restores the profile from the cookie after a reload", async () => {
      session.save({ token: "tok", userId: 7 });
      const reloaded = createAppStore({ api });

      await reloaded.dispatch("auth/hydrate");

      expect(api.currentUser).toHaveBeenCalledTimes(1);
      expect(reloaded.state.auth.user).toMatchObject({ name: "Dana Ruiz" });
    });

    it("does nothing when nobody is signed in", async () => {
      await store.dispatch("auth/hydrate");
      expect(api.currentUser).not.toHaveBeenCalled();
    });

    it("does not re-fetch a profile it already has", async () => {
      await store.dispatch("auth/login", { email: "a@b.c", password: "x" });
      await store.dispatch("auth/hydrate");
      expect(api.currentUser).not.toHaveBeenCalled();
    });

    it("clears a stale cookie the API rejects", async () => {
      session.save({ token: "expired", userId: 7 });
      api.currentUser.mockRejectedValue({ response: { status: 401, data: {} } });
      const reloaded = createAppStore({ api });

      await reloaded.dispatch("auth/hydrate");

      expect(session.isAuthenticated()).toBe(false);
      expect(reloaded.getters["auth/isAuthenticated"]).toBe(false);
    });

    it("keeps the session when the profile call fails for another reason", async () => {
      session.save({ token: "tok", userId: 7 });
      api.currentUser.mockRejectedValue({ response: { status: 500, data: {} } });
      const reloaded = createAppStore({ api });

      await reloaded.dispatch("auth/hydrate");

      expect(session.isAuthenticated()).toBe(true);
    });
  });
});
