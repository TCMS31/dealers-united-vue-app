import { describe, expect, it } from "vitest";
import ApiError, { normaliseError } from "@/api/ApiError";

describe("normaliseError", () => {
  it("explains a request that never reached the server", () => {
    const error = normaliseError(new Error("Network Error"));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBeNull();
    expect(error.message).toMatch(/could not reach the server/i);
  });

  it("does not throw when there is no response object", () => {
    // The old views read `error.response.data.message` directly, which threw a
    // TypeError over the top of the real failure.
    expect(() => normaliseError(undefined)).not.toThrow();
    expect(normaliseError(undefined).message).toMatch(/could not reach/i);
  });

  it("carries Laravel validation messages through", () => {
    const error = normaliseError({
      response: {
        status: 422,
        data: {
          message: "The given data was invalid.",
          errors: { note: ["The note field is required."] },
        },
      },
    });

    expect(error.isValidation).toBe(true);
    expect(error.fieldErrors.note[0]).toBe("The note field is required.");
    expect(error.message).toBe("The given data was invalid.");
  });

  it("falls back to a per-status message when the body says nothing", () => {
    expect(normaliseError({ response: { status: 401, data: {} } }).message).toMatch(
      /session has expired/i
    );
    expect(normaliseError({ response: { status: 404, data: {} } }).message).toMatch(
      /could not find/i
    );
  });

  it("reads the backend's `error` key as well as `message`", () => {
    const error = normaliseError({
      response: { status: 403, data: { error: "Request user unauthorized." } },
    });
    expect(error.message).toBe("Request user unauthorized.");
  });

  it("flags 401 and 419 as lost sessions", () => {
    expect(new ApiError("x", { status: 401 }).isUnauthenticated).toBe(true);
    expect(new ApiError("x", { status: 419 }).isUnauthenticated).toBe(true);
    expect(new ApiError("x", { status: 500 }).isUnauthenticated).toBe(false);
  });

  it("passes an ApiError through unchanged", () => {
    const original = new ApiError("already normalised", { status: 418 });
    expect(normaliseError(original)).toBe(original);
  });
});
