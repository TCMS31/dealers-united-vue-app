import { afterEach, beforeEach, vi } from "vitest";

/**
 * No test in this suite is allowed to touch the network. Both browser transports
 * are replaced with a throwing stub, so an accidental real request fails loudly
 * instead of silently hitting a server.
 */
function forbidNetwork() {
  const explode = (what) => () => {
    throw new Error(`Test attempted a real network call via ${what}.`);
  };

  globalThis.fetch = vi.fn(explode("fetch"));

  class ForbiddenXhr {
    open = explode("XMLHttpRequest");
    send = explode("XMLHttpRequest");
    setRequestHeader() {}
    addEventListener() {}
  }
  globalThis.XMLHttpRequest = ForbiddenXhr;
}

function clearCookies() {
  document.cookie
    .split(";")
    .map((pair) => pair.split("=")[0].trim())
    .filter(Boolean)
    .forEach((name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
}

beforeEach(() => {
  forbidNetwork();
  clearCookies();
});

afterEach(() => {
  clearCookies();
  vi.useRealTimers();
});
