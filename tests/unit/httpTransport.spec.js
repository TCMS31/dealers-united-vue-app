import { describe, expect, it, vi } from "vitest";
import ApiError from "@/api/ApiError";
import { createHttpTransport } from "@/api/httpTransport";

/**
 * A stub axios adapter. Nothing leaves the process — the adapter is the last
 * hop before the network, so replacing it exercises the real interceptors.
 */
function adapterReturning(response) {
  return vi.fn((config) =>
    Promise.resolve({
      data: response,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    })
  );
}

describe("http transport", () => {
  it("attaches a bearer token when the session has one", async () => {
    const adapter = adapterReturning({ ok: true });
    const transport = createHttpTransport({
      baseURL: "http://api.test/v1/",
      tokenProvider: { getToken: () => "token-123" },
      adapter,
    });

    await transport.get("users/7/message-capsules");

    const config = adapter.mock.calls[0][0];
    expect(config.headers.Authorization).toBe("Bearer token-123");
    expect(config.url).toBe("users/7/message-capsules");
    expect(config.baseURL).toBe("http://api.test/v1/");
  });

  it("sends no Authorization header when signed out", async () => {
    const adapter = adapterReturning({});
    const transport = createHttpTransport({
      tokenProvider: { getToken: () => null },
      adapter,
    });

    await transport.post("login", { email: "a@b.c", password: "secret" });

    expect(adapter.mock.calls[0][0].headers.Authorization).toBeUndefined();
  });

  it("unwraps the response body", async () => {
    const transport = createHttpTransport({
      tokenProvider: { getToken: () => null },
      adapter: adapterReturning({ data: [1, 2, 3] }),
    });

    await expect(transport.get("anything")).resolves.toEqual({ data: [1, 2, 3] });
  });

  it("rejects with an ApiError, never a raw axios error", async () => {
    const transport = createHttpTransport({
      tokenProvider: { getToken: () => null },
      adapter: () =>
        Promise.reject(
          Object.assign(new Error("Request failed"), {
            response: { status: 422, data: { message: "Nope.", errors: { email: ["Taken."] } } },
          })
        ),
    });

    await expect(transport.post("register", {})).rejects.toBeInstanceOf(ApiError);
    await transport.post("register", {}).catch((error) => {
      expect(error.status).toBe(422);
      expect(error.fieldErrors.email).toEqual(["Taken."]);
    });
  });
});
