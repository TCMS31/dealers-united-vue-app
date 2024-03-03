import { describe, expect, it } from "vitest";
import Cookies from "vue-cookies";
import session from "@/lib/session";

describe("session", () => {
  it("starts out unauthenticated", () => {
    expect(session.getToken()).toBeNull();
    expect(session.getUserId()).toBeNull();
    expect(session.isAuthenticated()).toBe(false);
  });

  it("round-trips a saved session", () => {
    session.save({ token: "abc123", userId: 7 });

    expect(session.getToken()).toBe("abc123");
    expect(session.getUserId()).toBe("7");
    expect(session.isAuthenticated()).toBe(true);
  });

  it("removes the cookies on clear", () => {
    session.save({ token: "abc123", userId: 7 });
    session.clear();

    expect(session.getToken()).toBeNull();
    expect(session.isAuthenticated()).toBe(false);
  });

  it('treats a cookie literally set to "null" as no session', () => {
    // Regression: logout used to write `null`, which vue-cookies stores as the
    // string "null" — every later request then sent `Authorization: Bearer null`.
    Cookies.set("auth_token", null);
    Cookies.set("user_id", null);

    expect(session.getToken()).toBeNull();
    expect(session.getUserId()).toBeNull();
    expect(session.isAuthenticated()).toBe(false);
  });

  it("requires both a token and a user id", () => {
    Cookies.set("auth_token", "abc123");
    expect(session.isAuthenticated()).toBe(false);
  });
});
