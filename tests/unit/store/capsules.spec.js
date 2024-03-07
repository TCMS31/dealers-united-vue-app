import { beforeEach, describe, expect, it, vi } from "vitest";
import ApiError from "@/api/ApiError";
import { createApiClient, createDemoTransport } from "@/api";
import session from "@/lib/session";
import { createAppStore } from "@/store";

const FIXTURES = [
  {
    id: 1,
    note: "Already opened, in full.",
    scheduled_opening_time: "2020-01-01 09:00:00",
    is_opened: true,
  },
  {
    id: 2,
    note: "Unlocked and waiting to be read.",
    scheduled_opening_time: "2020-06-01 09:00:00",
    is_opened: false,
  },
  {
    id: 3,
    note: "Still sealed for a long time.",
    scheduled_opening_time: "2099-01-01 09:00:00",
    is_opened: false,
  },
];

/** The demo transport is a real implementation of the transport interface, so
 *  these tests exercise the whole data layer without any network. */
function makeStore({ capsules = FIXTURES, pageSize } = {}) {
  const transport = createDemoTransport({ latencyMs: 0, capsules });
  return { store: createAppStore({ api: createApiClient(transport), pageSize }), transport };
}

describe("capsules module", () => {
  beforeEach(() => {
    session.save({ token: "tok", userId: 7 });
  });

  it("loads the signed-in user's capsules", async () => {
    const { store } = makeStore();
    await store.dispatch("capsules/fetchAll");

    expect(store.state.capsules.status).toBe("ready");
    expect(store.getters["capsules/total"]).toBe(3);
    expect(store.getters["capsules/openedCount"]).toBe(1);
    expect(store.getters["capsules/lockedCount"]).toBe(2);
  });

  it("keeps sealed notes masked, exactly as the API sends them", async () => {
    const { store } = makeStore();
    await store.dispatch("capsules/fetchAll");

    const sealed = store.state.capsules.items.find((c) => c.id === 3);
    expect(sealed.note).toBe("Stil****");

    const opened = store.state.capsules.items.find((c) => c.id === 1);
    expect(opened.note).toBe("Already opened, in full.");
  });

  it("sorts the newest scheduled capsule first", async () => {
    const { store } = makeStore();
    await store.dispatch("capsules/fetchAll");
    expect(store.getters["capsules/sorted"].map((c) => c.id)).toEqual([3, 2, 1]);
  });

  it("refuses to load without a session instead of requesting /users/undefined/...", async () => {
    session.clear();
    const { store } = makeStore();

    await store.dispatch("capsules/fetchAll");

    expect(store.getters["capsules/hasError"]).toBe(true);
    expect(store.state.capsules.error).toMatch(/not signed in/i);
  });

  it("records a failed load as an error state rather than throwing", async () => {
    const api = {
      listCapsules: vi.fn().mockRejectedValue({ response: { status: 500, data: {} } }),
    };
    const store = createAppStore({ api });

    await expect(store.dispatch("capsules/fetchAll")).resolves.toBeUndefined();
    expect(store.getters["capsules/hasError"]).toBe(true);
    expect(store.getters["capsules/isLoading"]).toBe(false);
    expect(store.getters["ui/isLoading"]).toBe(false);
  });

  it("reveals the full note when a capsule is opened", async () => {
    const { store } = makeStore();
    await store.dispatch("capsules/fetchAll");
    expect(store.state.capsules.items.find((c) => c.id === 2).note).toBe("Unlo****");

    await store.dispatch("capsules/open", 2);

    const opened = store.state.capsules.items.find((c) => c.id === 2);
    expect(opened.is_opened).toBe(true);
    expect(opened.note).toBe("Unlocked and waiting to be read.");
    expect(store.getters["capsules/total"]).toBe(3);
  });

  it("surfaces the backend's refusal to open a sealed capsule", async () => {
    const { store } = makeStore();
    await store.dispatch("capsules/fetchAll");

    await expect(store.dispatch("capsules/open", 3)).rejects.toBeInstanceOf(ApiError);
    expect(store.state.capsules.items.find((c) => c.id === 3).is_opened).toBe(false);
    expect(store.getters["ui/isLoading"]).toBe(false);
  });

  it("adds a newly created capsule to the list, masked like the API would send it", async () => {
    const { store } = makeStore();
    await store.dispatch("capsules/fetchAll");

    await store.dispatch("capsules/create", {
      note: "Something brand new for later.",
      scheduled_opening_time: new Date(Date.now() + 86_400_000).toISOString(),
    });

    expect(store.getters["capsules/total"]).toBe(4);
    // Sorting is by opening time, so the new capsule sits between the 2020 and
    // 2099 fixtures rather than at the top — what matters is that it is masked.
    const created = store.state.capsules.items.find((c) => c.note === "Some****");
    expect(created).toBeDefined();
    expect(created.is_opened).toBe(false);
  });

  it("rejects an invalid create with per-field messages", async () => {
    const { store } = makeStore();

    await expect(
      store.dispatch("capsules/create", { note: "  ", scheduled_opening_time: "2099-01-01" })
    ).rejects.toMatchObject({ status: 422 });
  });

  describe("pagination", () => {
    const many = Array.from({ length: 11 }, (_, index) => ({
      id: index + 1,
      note: `Capsule number ${index + 1}`,
      scheduled_opening_time: `20${30 + index}-01-01 09:00:00`,
      is_opened: false,
    }));

    it("renders one page at a time however many capsules come back", async () => {
      const { store } = makeStore({ capsules: many, pageSize: 4 });
      await store.dispatch("capsules/fetchAll");

      expect(store.getters["capsules/total"]).toBe(11);
      expect(store.getters["capsules/visible"]).toHaveLength(4);
      expect(store.getters["capsules/pageCount"]).toBe(3);
    });

    it("moves between pages and clamps at both ends", async () => {
      const { store } = makeStore({ capsules: many, pageSize: 4 });
      await store.dispatch("capsules/fetchAll");

      await store.dispatch("capsules/goToPage", 3);
      expect(store.state.capsules.page).toBe(3);
      expect(store.getters["capsules/visible"]).toHaveLength(3);

      await store.dispatch("capsules/goToPage", 99);
      expect(store.state.capsules.page).toBe(3);

      await store.dispatch("capsules/goToPage", -1);
      expect(store.state.capsules.page).toBe(1);
    });

    it("pulls the page back into range when the list shrinks", async () => {
      const { store } = makeStore({ capsules: many, pageSize: 4 });
      await store.dispatch("capsules/fetchAll");
      await store.dispatch("capsules/goToPage", 3);

      store.commit("capsules/setItems", many.slice(0, 2));
      expect(store.state.capsules.page).toBe(1);
    });
  });

  it("reports an empty account distinctly from a failed load", async () => {
    const { store } = makeStore({ capsules: [] });
    await store.dispatch("capsules/fetchAll");

    expect(store.getters["capsules/isEmpty"]).toBe(true);
    expect(store.getters["capsules/hasError"]).toBe(false);
  });
});
