/**
 * Build-time configuration, read once and normalised.
 *
 * Vue CLI inlines `VUE_APP_*` variables with webpack's DefinePlugin, which
 * rewrites the *exact* expression `process.env.VUE_APP_FOO`. Reading
 * `process.env` as an object would therefore come back undefined in the
 * browser, so each variable is referenced literally below.
 */

/**
 * @param {string|undefined} value
 * @param {boolean} fallback
 * @returns {boolean}
 */
function toBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

/** Trailing slash matters to axios' relative-URL joining; enforce one. */
function withTrailingSlash(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

export const API_BASE_URL = withTrailingSlash(
  process.env.VUE_APP_API_BASE_URL || "http://localhost/api/v1/"
);

/**
 * Demo mode swaps the HTTP transport for an in-memory fixture backend so the
 * app can be run, screenshotted and demoed with no Laravel instance running.
 */
export const DEMO_MODE = toBoolean(process.env.VUE_APP_DEMO, false);

/** Capsules rendered per page in the list view. */
export const PAGE_SIZE =
  Number(process.env.VUE_APP_PAGE_SIZE) > 0 ? Number(process.env.VUE_APP_PAGE_SIZE) : 8;

export default { API_BASE_URL, DEMO_MODE, PAGE_SIZE };
