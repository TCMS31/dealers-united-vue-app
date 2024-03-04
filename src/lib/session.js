/**
 * The single place that knows where the session lives.
 *
 * Everything else (HTTP interceptor, store, router guard) reads the session
 * through this module, so swapping cookies for `localStorage` — or for an
 * in-memory store during tests — is a one-file change.
 */
import Cookies from "vue-cookies";

const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "user_id";

/** Cookies live for a week unless the user logs out first. */
const TTL = "7d";

/**
 * vue-cookies returns the *string* "null" for a cookie that was written as
 * `null`, which the original code did on logout — leaving every subsequent
 * request with an `Authorization: Bearer null` header. Treat those as absent.
 *
 * @param {string} key
 * @returns {string|null}
 */
function read(key) {
  const value = Cookies.get(key);
  if (value === null || value === undefined) return null;
  const asString = String(value);
  if (asString === "" || asString === "null" || asString === "undefined") {
    return null;
  }
  return asString;
}

export const session = {
  /** @returns {string|null} */
  getToken() {
    return read(TOKEN_KEY);
  },

  /** @returns {string|null} */
  getUserId() {
    return read(USER_ID_KEY);
  },

  /** @returns {boolean} */
  isAuthenticated() {
    return this.getToken() !== null && this.getUserId() !== null;
  },

  /**
   * @param {{ token: string, userId: string|number }} credentials
   */
  save({ token, userId }) {
    Cookies.set(TOKEN_KEY, String(token), TTL);
    Cookies.set(USER_ID_KEY, String(userId), TTL);
  },

  clear() {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_ID_KEY);
  },
};

export default session;
