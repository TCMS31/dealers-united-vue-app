import session from "@/lib/session";
import { normaliseError } from "@/api/ApiError";

/**
 * Authentication state.
 *
 * The token itself is not kept in Vuex — it lives in {@link session}, which is
 * the only module that knows about cookies. Vuex holds the profile and whether
 * a session exists, which is all the UI needs.
 *
 * @param {{ api: object }} deps
 */
export default function createAuthModule({ api }) {
  return {
    namespaced: true,

    state: () => ({
      user: null,
      hasSession: session.isAuthenticated(),
    }),

    getters: {
      isAuthenticated: (state) => state.hasSession,
      displayName: (state) => state.user?.name ?? state.user?.email ?? "Your capsules",
      initials: (state) => {
        const name = state.user?.name ?? state.user?.email ?? "";
        const parts = name
          .trim()
          .split(/[\s@.]+/)
          .filter(Boolean);
        if (parts.length === 0) return "?";
        return parts
          .slice(0, 2)
          .map((part) => part[0].toUpperCase())
          .join("");
      },
    },

    mutations: {
      setUser(state, user) {
        state.user = user ?? null;
      },
      setHasSession(state, value) {
        state.hasSession = Boolean(value);
      },
    },

    actions: {
      /**
       * @param {{email:string,password:string}} credentials
       * @throws {import('@/api/ApiError').default}
       */
      async login({ commit, dispatch }, credentials) {
        commit("ui/startRequest", null, { root: true });
        try {
          const { user, token } = await api.login(credentials);
          session.save({ token, userId: user.id });
          commit("setUser", user);
          commit("setHasSession", true);
          return user;
        } catch (error) {
          dispatch("clearSession");
          throw normaliseError(error);
        } finally {
          commit("ui/finishRequest", null, { root: true });
        }
      },

      /**
       * Registering signs the user straight in — the backend returns a token
       * with the created user.
       *
       * @param {{name:string,email:string,password:string,password_confirmation:string}} payload
       */
      async signup({ commit }, payload) {
        commit("ui/startRequest", null, { root: true });
        try {
          const { user, token } = await api.register(payload);
          session.save({ token, userId: user.id });
          commit("setUser", user);
          commit("setHasSession", true);
          return user;
        } catch (error) {
          throw normaliseError(error);
        } finally {
          commit("ui/finishRequest", null, { root: true });
        }
      },

      /**
       * Restore the profile after a full page reload. The session cookie
       * outlives the Vuex store, so without this the header would show a
       * signed-in user with no name.
       */
      async hydrate({ commit, dispatch, state }) {
        if (!session.isAuthenticated() || state.user) return;
        try {
          commit("setUser", await api.currentUser());
        } catch (error) {
          // A rejected token means the cookie is stale — start clean rather
          // than leaving the app in a half-signed-in state.
          if (normaliseError(error).isUnauthenticated) dispatch("clearSession");
        }
      },

      /** Drop the session and every trace of the user's data from memory. */
      clearSession({ commit }) {
        session.clear();
        commit("setUser", null);
        commit("setHasSession", false);
        commit("capsules/clear", null, { root: true });
      },

      logout({ dispatch }) {
        dispatch("clearSession");
      },
    },
  };
}
