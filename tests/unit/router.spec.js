import { describe, expect, it } from "vitest";
import { authGuard, routes } from "@/router";

const signedIn = { isAuthenticated: () => true };
const signedOut = { isAuthenticated: () => false };

describe("authGuard", () => {
  it("sends an anonymous visitor to the login page", () => {
    // Regression: /message-list and /add-message were reachable by URL with no
    // session, which then fired a request for /users/undefined/message-capsules.
    const result = authGuard(
      { fullPath: "/message-list", meta: { requiresAuth: true } },
      signedOut
    );

    expect(result).toEqual({ name: "login", query: { redirect: "/message-list" } });
  });

  it("remembers where the visitor was heading", () => {
    const result = authGuard({ fullPath: "/add-message", meta: { requiresAuth: true } }, signedOut);
    expect(result.query.redirect).toBe("/add-message");
  });

  it("lets a signed-in user through", () => {
    expect(authGuard({ fullPath: "/message-list", meta: { requiresAuth: true } }, signedIn)).toBe(
      true
    );
  });

  it("keeps a signed-in user away from the login and signup screens", () => {
    expect(authGuard({ fullPath: "/login", meta: { guestOnly: true } }, signedIn)).toEqual({
      name: "capsules",
    });
  });

  it("leaves public routes alone", () => {
    expect(authGuard({ fullPath: "/nowhere", meta: {} }, signedOut)).toBe(true);
    expect(authGuard({ fullPath: "/nowhere" }, signedOut)).toBe(true);
  });
});

describe("routes", () => {
  it("guards every authenticated route and lazily loads each view", () => {
    const protectedRoutes = routes.filter((route) =>
      ["capsules", "add-capsule"].includes(route.name)
    );

    expect(protectedRoutes).toHaveLength(2);
    protectedRoutes.forEach((route) => {
      expect(route.meta.requiresAuth).toBe(true);
      expect(typeof route.component).toBe("function");
    });
  });

  it("has a catch-all so an unknown URL is not a blank page", () => {
    expect(routes.some((route) => route.name === "not-found")).toBe(true);
  });
});
