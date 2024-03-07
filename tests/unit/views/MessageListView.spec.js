import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import MessageListView from "@/views/MessageListView.vue";
import { createApiClient, createDemoTransport } from "@/api";
import { __resetClock } from "@/composables/useNow";
import session from "@/lib/session";
import { createAppStore } from "@/store";
import { mountView } from "../../helpers/mount";

const PAST = "2020-01-01 09:00:00";
const FUTURE = "2099-01-01 09:00:00";

const FIXTURES = [
  {
    id: 1,
    note: "An opened capsule, shown in full.",
    scheduled_opening_time: PAST,
    is_opened: true,
  },
  {
    id: 2,
    note: "Ready and waiting to be opened.",
    scheduled_opening_time: PAST,
    is_opened: false,
  },
  { id: 3, note: "Sealed for decades.", scheduled_opening_time: FUTURE, is_opened: false },
];

function storeWithFixtures(capsules = FIXTURES) {
  const transport = createDemoTransport({ latencyMs: 0, capsules });
  return createAppStore({ api: createApiClient(transport) });
}

describe("MessageListView", () => {
  beforeEach(() => {
    session.save({ token: "tok", userId: 7 });
    __resetClock();
  });

  it("shows skeletons while the first load is in flight", async () => {
    const store = createAppStore({
      api: { listCapsules: () => new Promise(() => {}) },
    });
    const { wrapper } = mountView(MessageListView, { store });
    await flushPromises();

    expect(wrapper.findAllComponents({ name: "CapsuleCardSkeleton" }).length).toBeGreaterThan(0);
    wrapper.unmount();
  });

  it("renders a card per capsule with the summary counts", async () => {
    const { wrapper } = mountView(MessageListView, { store: storeWithFixtures() });
    await flushPromises();

    expect(wrapper.findAllComponents({ name: "CapsuleCard" })).toHaveLength(3);
    expect(wrapper.text()).toContain("Sealed");
    expect(wrapper.text()).toContain("Ready to open");
    wrapper.unmount();
  });

  it("opens a capsule and reveals its note in place", async () => {
    const store = storeWithFixtures();
    const { wrapper } = mountView(MessageListView, { store });
    await flushPromises();

    expect(wrapper.text()).not.toContain("Ready and waiting to be opened.");

    const openable = wrapper
      .findAllComponents({ name: "CapsuleCard" })
      .find((card) => card.props("capsule").id === 2);
    await openable.get("button").trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Ready and waiting to be opened.");
    wrapper.unmount();
  });

  it("invites the user to write one when the account is empty", async () => {
    const { wrapper } = mountView(MessageListView, { store: storeWithFixtures([]) });
    await flushPromises();

    expect(wrapper.text()).toContain("Nothing sealed yet");
    expect(wrapper.findAllComponents({ name: "CapsuleCard" })).toHaveLength(0);
    wrapper.unmount();
  });

  it("offers a retry when the load fails", async () => {
    const listCapsules = vi
      .fn()
      .mockRejectedValueOnce({ response: { status: 500, data: { message: "Server exploded." } } })
      .mockResolvedValueOnce(FIXTURES);
    const store = createAppStore({ api: { listCapsules } });

    const { wrapper } = mountView(MessageListView, { store });
    await flushPromises();

    expect(wrapper.text()).toContain("We could not load your capsules");
    expect(wrapper.text()).toContain("Server exploded.");

    await wrapper.findAll("button").at(-1).trigger("click");
    await flushPromises();

    expect(listCapsules).toHaveBeenCalledTimes(2);
    expect(wrapper.findAllComponents({ name: "CapsuleCard" })).toHaveLength(3);
    wrapper.unmount();
  });

  it("surfaces a refusal to open without losing the list", async () => {
    const store = storeWithFixtures();
    const { wrapper } = mountView(MessageListView, { store });
    await flushPromises();

    const sealed = wrapper
      .findAllComponents({ name: "CapsuleCard" })
      .find((card) => card.props("capsule").id === 3);
    sealed.vm.$emit("open", 3);
    await flushPromises();

    expect(wrapper.text()).toContain("time remaining");
    expect(wrapper.findAllComponents({ name: "CapsuleCard" })).toHaveLength(3);
    wrapper.unmount();
  });
});
