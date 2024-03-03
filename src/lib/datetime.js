/**
 * Date/time helpers.
 *
 * The Laravel backend serialises `scheduled_opening_time` straight off the
 * `datetime` column, so it arrives as a *naive* string ("2024-03-01 12:00:00")
 * with no offset. Laravel's default `APP_TIMEZONE` is UTC, so naive values are
 * interpreted as UTC here. `new Date("2024-03-01 12:00:00")` is not specified by
 * ECMAScript and has historically returned Invalid Date in Safari, which is why
 * this module normalises the string instead of handing it to the Date
 * constructor directly.
 */

const NAIVE_DATETIME = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2})?)(\.\d+)?$/;

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * Parse a timestamp coming from the API into a Date.
 *
 * @param {string|number|Date|null|undefined} value
 * @returns {Date|null} null when the value is missing or unparseable.
 */
export function parseServerDate(value) {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === "number") {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }

  const raw = String(value).trim();
  const naive = raw.match(NAIVE_DATETIME);
  const normalised = naive
    ? `${naive[1]}T${naive[2].length === 5 ? `${naive[2]}:00` : naive[2]}${naive[3] ?? ""}Z`
    : raw;

  const parsed = new Date(normalised);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Convert the value of an `<input type="datetime-local">` (which is expressed in
 * the *browser's* timezone and carries no offset) into an unambiguous ISO-8601
 * instant for the API.
 *
 * @param {string} localValue e.g. "2024-03-01T12:00"
 * @returns {string|null} e.g. "2024-03-01T11:00:00.000Z"
 */
export function localInputToIso(localValue) {
  if (!localValue) return null;
  const parsed = new Date(localValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/**
 * @param {string} localValue value of a datetime-local input
 * @param {number} [now] epoch ms to compare against
 * @returns {boolean} true when the value is strictly in the future
 */
export function isFutureLocalInput(localValue, now = Date.now()) {
  const iso = localInputToIso(localValue);
  return iso !== null && new Date(iso).getTime() > now;
}

/**
 * Value for the `min` attribute of a datetime-local input: "now", rendered in
 * the browser's timezone.
 *
 * @param {number} [now] epoch ms
 * @returns {string} e.g. "2024-03-01T12:00"
 */
export function localInputMin(now = Date.now()) {
  const date = new Date(now);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * @param {string|Date|null} value
 * @param {string} [locale]
 * @returns {string} a human-readable local datetime, or "—" when unparseable.
 */
export function formatDateTime(value, locale = undefined) {
  const date = parseServerDate(value);
  if (!date) return "—";
  return date.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Milliseconds until `value`, floored at zero.
 *
 * @param {string|Date|null} value
 * @param {number} [now] epoch ms
 * @returns {number}
 */
export function millisecondsUntil(value, now = Date.now()) {
  const date = parseServerDate(value);
  if (!date) return 0;
  return Math.max(0, date.getTime() - now);
}

/**
 * Format a duration as a countdown. Days are broken out so that a capsule
 * scheduled a month away reads "31d 04:05:06" rather than "748:05:06".
 *
 * @param {number} milliseconds
 * @returns {string}
 */
export function formatCountdown(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds / MS_PER_SECOND));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return days > 0 ? `${days}d ${clock}` : clock;
}
