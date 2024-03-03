import { createStore } from "vuex";
import api from "@/api";
import createAuthModule from "./modules/auth";
import createCapsulesModule from "./modules/capsules";
import ui from "./modules/ui";

/**
 * Build the root store.
 *
 * The API client is injected rather than imported by the modules so tests can
 * hand in a fixture-backed client and exercise the real actions without a
 * network stub.
 *
 * @param {{ api?: object, pageSize?: number }} [deps]
 */
export function createAppStore({ api: apiClient = api, pageSize } = {}) {
  return createStore({
    modules: {
      ui,
      auth: createAuthModule({ api: apiClient }),
      capsules: createCapsulesModule({ api: apiClient, pageSize }),
    },
  });
}

export default createAppStore();
