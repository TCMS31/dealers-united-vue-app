import { describe, expect, it } from "vitest";
import { createStore } from "vuex";
import ui from "@/store/modules/ui";

function makeStore() {
  return createStore({ modules: { ui } });
}

describe("ui module", () => {
  it("is idle to begin with", () => {
    expect(makeStore().getters["ui/isLoading"]).toBe(false);
  });

  it("stays loading until the last request finishes", () => {
    // Regression: a boolean flag meant the first response to arrive hid the
    // overlay while a second request was still in flight.
    const store = makeStore();

    store.commit("ui/startRequest");
    store.commit("ui/startRequest");
    store.commit("ui/finishRequest");
    expect(store.getters["ui/isLoading"]).toBe(true);

    store.commit("ui/finishRequest");
    expect(store.getters["ui/isLoading"]).toBe(false);
  });

  it("never lets the counter go negative", () => {
    const store = makeStore();
    store.commit("ui/finishRequest");
    store.commit("ui/finishRequest");
    expect(store.state.ui.pendingRequests).toBe(0);
  });
});
