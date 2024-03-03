import ApiError from "./ApiError";
import { DEMO_USER, asServerDateTime, seedCapsules } from "./demoFixtures";

/**
 * An in-memory stand-in for the Laravel API.
 *
 * It implements the same `{ get, post, put }` transport interface as
 * {@link module:api/httpTransport}, which is the extension seam of this app:
 * anything that speaks that interface can back the data layer. Demo mode
 * (`VUE_APP_DEMO=true`) uses it so the UI can be run, reviewed and
 * screenshotted without a backend, and the unit tests use it to exercise the
 * store end-to-end without touching the network.
 */

/** The backend hides unopened notes; mirror that so the UI is honest. */
function toResource(capsule) {
  return {
    id: capsule.id,
    note: capsule.is_opened ? capsule.note : `${capsule.note.slice(0, 4)}****`,
    scheduled_opening_time: capsule.scheduled_opening_time,
    is_opened: capsule.is_opened,
  };
}

const CAPSULE_COLLECTION = /^users\/(\d+)\/message-capsules$/;
const CAPSULE_OPEN = /^users\/(\d+)\/message-capsules\/(\d+)\/open$/;

function normalisePath(path) {
  return String(path)
    .replace(/^\/+|\/+$/g, "")
    .trim();
}

/**
 * @param {object} [options]
 * @param {number} [options.latencyMs] simulated round-trip time
 * @param {Array} [options.capsules] initial capsules
 * @returns {{ get: Function, post: Function, put: Function, reset: Function }}
 */
export function createDemoTransport({ latencyMs = 220, capsules = null } = {}) {
  let store = capsules ? [...capsules] : seedCapsules();
  let nextId = store.reduce((max, c) => Math.max(max, c.id), 100) + 1;

  const settle = (value) =>
    latencyMs > 0
      ? new Promise((resolve) => setTimeout(() => resolve(value), latencyMs))
      : Promise.resolve(value);

  const fail = (message, status, fieldErrors) =>
    settle(null).then(() => {
      throw new ApiError(message, { status, fieldErrors });
    });

  const issueSession = () =>
    settle({ user: DEMO_USER, token: `demo-token-${Date.now().toString(36)}` });

  return {
    get(path) {
      const route = normalisePath(path);
      if (route === "user") {
        return settle(DEMO_USER);
      }
      if (CAPSULE_COLLECTION.test(route)) {
        const sorted = [...store].sort(
          (a, b) => new Date(b.scheduled_opening_time) - new Date(a.scheduled_opening_time)
        );
        return settle({ data: sorted.map(toResource) });
      }
      return fail("Not found.", 404);
    },

    post(path, body = {}) {
      const route = normalisePath(path);

      if (route === "login") {
        if (!body.email || !body.password) {
          return fail("These credentials do not match our records.", 422, {
            email: ["The email field is required."],
          });
        }
        return issueSession();
      }

      if (route === "register") {
        if (body.password !== body.password_confirmation) {
          return fail("The password confirmation does not match.", 422, {
            password: ["The password confirmation does not match."],
          });
        }
        return issueSession();
      }

      if (CAPSULE_COLLECTION.test(route)) {
        if (!body.note || !String(body.note).trim()) {
          return fail("Please check the form and try again.", 422, {
            note: ["The note field is required."],
          });
        }
        const scheduled = new Date(body.scheduled_opening_time);
        if (Number.isNaN(scheduled.getTime()) || scheduled.getTime() <= Date.now()) {
          return fail("Please check the form and try again.", 422, {
            scheduled_opening_time: ["The scheduled opening time must be a date after now."],
          });
        }
        const created = {
          id: nextId++,
          note: String(body.note),
          scheduled_opening_time: asServerDateTime(scheduled),
          is_opened: false,
        };
        store = [created, ...store];
        return settle(created);
      }

      return fail("Not found.", 404);
    },

    put(path) {
      const match = normalisePath(path).match(CAPSULE_OPEN);
      if (!match) return fail("Not found.", 404);

      const capsule = store.find((c) => c.id === Number(match[2]));
      if (!capsule) return fail("We could not find what you were looking for.", 404);
      if (new Date(capsule.scheduled_opening_time).getTime() > Date.now()) {
        return fail("Message capsule cannot be opened - time remaining!", 403);
      }

      capsule.is_opened = true;
      return settle(toResource(capsule));
    },

    /** Test helper: restore the initial fixture set. */
    reset(nextCapsules = null) {
      store = nextCapsules ? [...nextCapsules] : seedCapsules();
      nextId = store.reduce((max, c) => Math.max(max, c.id), 100) + 1;
    },
  };
}

export default createDemoTransport;
