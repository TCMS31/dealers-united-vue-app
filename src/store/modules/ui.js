/**
 * Global request-in-flight state.
 *
 * A boolean flag was wrong here: with two requests in flight the first one to
 * finish hid the overlay while the second was still running. Counting pending
 * requests makes the overlay correct under concurrency.
 */
export default {
  namespaced: true,

  state: () => ({
    pendingRequests: 0,
  }),

  getters: {
    isLoading: (state) => state.pendingRequests > 0,
  },

  mutations: {
    startRequest(state) {
      state.pendingRequests += 1;
    },
    finishRequest(state) {
      state.pendingRequests = Math.max(0, state.pendingRequests - 1);
    },
    reset(state) {
      state.pendingRequests = 0;
    },
  },
};
