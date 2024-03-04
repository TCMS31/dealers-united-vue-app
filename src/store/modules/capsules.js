import session from "@/lib/session";
import { PAGE_SIZE } from "@/lib/env";
import { normaliseError } from "@/api/ApiError";
import { parseServerDate } from "@/lib/datetime";

/** @typedef {'idle'|'loading'|'ready'|'error'} LoadStatus */

/**
 * Message-capsule state.
 *
 * The API returns every capsule a user owns in one unpaginated response, so
 * pagination is applied here rather than in the template: the list view renders
 * one page at a time regardless of how many capsules come back.
 *
 * @param {{ api: object, pageSize?: number }} deps
 */
export default function createCapsulesModule({ api, pageSize = PAGE_SIZE }) {
  return {
    namespaced: true,

    state: () => ({
      /** @type {Array<object>} */
      items: [],
      /** @type {LoadStatus} */
      status: "idle",
      /** @type {string|null} */
      error: null,
      page: 1,
      pageSize,
    }),

    getters: {
      /** Newest scheduled time first — the capsule you care about is at the top. */
      sorted: (state) =>
        [...state.items].sort((a, b) => {
          const left = parseServerDate(b.scheduled_opening_time)?.getTime() ?? 0;
          const right = parseServerDate(a.scheduled_opening_time)?.getTime() ?? 0;
          return left - right;
        }),

      pageCount: (state) => Math.max(1, Math.ceil(state.items.length / state.pageSize)),

      /** @returns {Array<object>} only the capsules on the current page */
      visible: (state, getters) => {
        const start = (state.page - 1) * state.pageSize;
        return getters.sorted.slice(start, start + state.pageSize);
      },

      total: (state) => state.items.length,
      openedCount: (state) => state.items.filter((c) => c.is_opened).length,
      lockedCount: (state) => state.items.filter((c) => !c.is_opened).length,

      isLoading: (state) => state.status === "loading",
      isEmpty: (state) => state.status === "ready" && state.items.length === 0,
      hasError: (state) => state.status === "error",
    },

    mutations: {
      setItems(state, items) {
        state.items = Array.isArray(items) ? items : [];
        const lastPage = Math.max(1, Math.ceil(state.items.length / state.pageSize));
        state.page = Math.min(state.page, lastPage);
      },
      upsert(state, capsule) {
        if (!capsule || capsule.id === undefined) return;
        const index = state.items.findIndex((item) => item.id === capsule.id);
        if (index === -1) {
          state.items = [capsule, ...state.items];
        } else {
          state.items = [
            ...state.items.slice(0, index),
            { ...state.items[index], ...capsule },
            ...state.items.slice(index + 1),
          ];
        }
      },
      setStatus(state, status) {
        state.status = status;
      },
      setError(state, message) {
        state.error = message ?? null;
      },
      setPage(state, page) {
        const lastPage = Math.max(1, Math.ceil(state.items.length / state.pageSize));
        state.page = Math.min(Math.max(1, page), lastPage);
      },
      clear(state) {
        state.items = [];
        state.status = "idle";
        state.error = null;
        state.page = 1;
      },
    },

    actions: {
      /**
       * Load the signed-in user's capsules.
       *
       * Failures are recorded in `status`/`error` rather than thrown: the list
       * view renders an error panel with a retry button, so nothing upstream
       * needs a try/catch.
       */
      async fetchAll({ commit }) {
        const userId = session.getUserId();
        if (!userId) {
          commit("setStatus", "error");
          commit("setError", "You are not signed in.");
          return;
        }

        commit("setStatus", "loading");
        commit("setError", null);
        commit("ui/startRequest", null, { root: true });
        try {
          commit("setItems", await api.listCapsules(userId));
          commit("setStatus", "ready");
        } catch (error) {
          commit("setStatus", "error");
          commit("setError", normaliseError(error).message);
        } finally {
          commit("ui/finishRequest", null, { root: true });
        }
      },

      /**
       * @param {{note:string, scheduled_opening_time:string}} payload
       * @throws {import('@/api/ApiError').default} so the form can show field errors
       */
      async create({ commit }, payload) {
        const userId = session.getUserId();
        if (!userId) throw normaliseError(new Error("You are not signed in."));

        commit("ui/startRequest", null, { root: true });
        try {
          const created = await api.createCapsule(userId, payload);
          // The create endpoint returns the raw model, so the note comes back
          // unmasked. Mask it locally to match what the list endpoint sends.
          commit("upsert", {
            ...created,
            note: created.is_opened
              ? created.note
              : `${String(created.note ?? "").slice(0, 4)}****`,
          });
          return created;
        } catch (error) {
          throw normaliseError(error);
        } finally {
          commit("ui/finishRequest", null, { root: true });
        }
      },

      /**
       * @param {number|string} capsuleId
       * @throws {import('@/api/ApiError').default}
       */
      async open({ commit }, capsuleId) {
        const userId = session.getUserId();
        if (!userId) throw normaliseError(new Error("You are not signed in."));

        commit("ui/startRequest", null, { root: true });
        try {
          commit("upsert", await api.openCapsule(userId, capsuleId));
        } catch (error) {
          const apiError = normaliseError(error);
          commit("setError", apiError.message);
          throw apiError;
        } finally {
          commit("ui/finishRequest", null, { root: true });
        }
      },

      goToPage({ commit }, page) {
        commit("setPage", page);
      },
    },
  };
}
