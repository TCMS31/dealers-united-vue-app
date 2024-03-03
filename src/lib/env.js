/**
 * Build-time configuration, read once and normalised.
 *
 * Vite replaces each literal `import.meta.env.VITE_*` expression at build time,
 * so changing a value means rebuilding, not restarting.
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
  import.meta.env.VITE_API_BASE_URL || "http://localhost/api/v1/"
);

/**
 * Demo mode swaps the HTTP transport for an in-memory fixture backend so the
 * app can be run, screenshotted and demoed with no Laravel instance running.
 */
export const DEMO_MODE = toBoolean(import.meta.env.VITE_DEMO, false);

/** Capsules rendered per page in the list view. */
export const PAGE_SIZE =
  Number(import.meta.env.VITE_PAGE_SIZE) > 0 ? Number(import.meta.env.VITE_PAGE_SIZE) : 8;

export default { API_BASE_URL, DEMO_MODE, PAGE_SIZE };
