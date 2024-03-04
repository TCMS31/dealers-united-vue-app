/**
 * A transport-agnostic error.
 *
 * Views used to reach into `error.response.data.message`, which throws its own
 * TypeError the moment the request fails before a response exists (offline,
 * DNS failure, CORS). Every transport normalises into this type instead, so the
 * UI has exactly one error shape to render.
 */
export default class ApiError extends Error {
  /**
   * @param {string} message human-readable, safe to show to a user
   * @param {object} [options]
   * @param {number|null} [options.status] HTTP status, null when the request never landed
   * @param {Record<string, string[]>} [options.fieldErrors] per-field validation messages
   * @param {unknown} [options.cause] the original error
   */
  constructor(message, { status = null, fieldErrors = {}, cause = undefined } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.cause = cause;
  }

  /** @returns {boolean} true for 401/419 — the session is gone. */
  get isUnauthenticated() {
    return this.status === 401 || this.status === 419;
  }

  /** @returns {boolean} true for 422 — the payload was rejected. */
  get isValidation() {
    return this.status === 422;
  }
}

const STATUS_FALLBACKS = {
  401: "Your session has expired. Please log in again.",
  403: "You are not allowed to do that.",
  404: "We could not find what you were looking for.",
  422: "Please check the form and try again.",
  429: "Too many requests. Please wait a moment and try again.",
};

/**
 * Turn anything thrown by axios into an {@link ApiError}.
 *
 * @param {unknown} error
 * @returns {ApiError}
 */
export function normaliseError(error) {
  if (error instanceof ApiError) return error;

  const response = error?.response;

  if (!response) {
    return new ApiError("Could not reach the server. Check your connection and try again.", {
      status: null,
      cause: error,
    });
  }

  const body = response.data ?? {};
  const message =
    (typeof body === "string" && body.trim() !== "" ? body : null) ||
    body.message ||
    body.error ||
    STATUS_FALLBACKS[response.status] ||
    "Something went wrong. Please try again.";

  return new ApiError(String(message), {
    status: response.status,
    fieldErrors: body.errors ?? {},
    cause: error,
  });
}
