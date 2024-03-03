/**
 * The data layer.
 *
 * Views and the store only ever see this client — they never import axios and
 * never build a URL. The client is constructed from a *transport*
 * (`{ get, post, put }`), which is the seam the app is meant to be extended at:
 * HTTP in production, an in-memory fixture backend in demo mode and in tests,
 * and anything else (a mock server, a different API version, a cached layer)
 * without touching a component.
 */
import { DEMO_MODE } from "@/lib/env";
import createDemoTransport from "./demoTransport";
import createHttpTransport from "./httpTransport";
import ApiError, { normaliseError } from "./ApiError";

/**
 * @typedef {object} Transport
 * @property {(path: string) => Promise<any>} get
 * @property {(path: string, body?: any) => Promise<any>} post
 * @property {(path: string, body?: any) => Promise<any>} put
 */

/**
 * @param {Transport} transport
 * @returns {{
 *   register: Function,
 *   login: Function,
 *   listCapsules: Function,
 *   createCapsule: Function,
 *   openCapsule: Function,
 * }}
 */
export function createApiClient(transport) {
  const capsulesPath = (userId) => `users/${userId}/message-capsules`;

  return {
    /**
     * @param {{name:string,email:string,password:string,password_confirmation:string}} payload
     * @returns {Promise<{user: object, token: string}>}
     */
    register(payload) {
      return transport.post("register", payload);
    },

    /**
     * @param {{email:string,password:string}} credentials
     * @returns {Promise<{user: object, token: string}>}
     */
    login(credentials) {
      return transport.post("login", credentials);
    },

    /**
     * The signed-in user's profile, used to rehydrate the header after a full
     * page reload (the session cookie survives, the Vuex state does not).
     *
     * @returns {Promise<object>}
     */
    currentUser() {
      return transport.get("user");
    },

    /**
     * @param {string|number} userId
     * @returns {Promise<Array<object>>} the unwrapped `data` collection
     */
    async listCapsules(userId) {
      const body = await transport.get(capsulesPath(userId));
      return Array.isArray(body) ? body : (body?.data ?? []);
    },

    /**
     * @param {string|number} userId
     * @param {{note:string, scheduled_opening_time:string}} payload
     * @returns {Promise<object>} the created capsule
     */
    createCapsule(userId, payload) {
      return transport.post(capsulesPath(userId), payload);
    },

    /**
     * @param {string|number} userId
     * @param {string|number} capsuleId
     * @returns {Promise<object>} the capsule, now with its full note
     */
    async openCapsule(userId, capsuleId) {
      const body = await transport.put(`${capsulesPath(userId)}/${capsuleId}/open`);
      return body?.data ?? body;
    },
  };
}

/** The transport chosen by build-time configuration. */
export const transport = DEMO_MODE ? createDemoTransport() : createHttpTransport();

/** The app-wide client. */
export const api = createApiClient(transport);

export { ApiError, normaliseError, createDemoTransport, createHttpTransport };
export default api;
