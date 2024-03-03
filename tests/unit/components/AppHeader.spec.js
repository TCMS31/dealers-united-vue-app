import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import AppHeader from "@/components/AppHeader.vue";
import GlobalLoader from "@/components/GlobalLoader.vue";
import session from "@/lib/session";
import { createAppStore } from "@/store";
import { mountView } from "../../helpers/mount";

function makeApi() {
  return {
    login: vi.fn().mockResolvedValue({ user: { id: 7, name: "Dana Ruiz" }, token: "tok" }),
    register: vi.fn(),
    currentUser: vi.fn(),
    listCapsules: vi.fn().mockResolvedValue([]),
    createCapsule: vi.fn(),
    openCapsule: vi.fn(),
  };
}

describe("AppHeader", () => {
  let store;

  beforeEach(async () => {
    store = createAppStore({ api: makeApi() });
    await store.dispatch("auth/login", { email: "dana@example.com", password: "secret123" });
  });

  it("shows the signed-in user's initials", () => {
    const { wrapper } = mountView(AppHeader, { store });
    expect(wrapper.text()).toContain("DR");
  });

  it("hides the avatar when the profile has not loaded yet", () => {
    store.commit("auth/setUser", null);
    const { wrapper } = mountView(AppHeader, { store });
    expect(wrapper.text()).not.toContain("DR");
  });

  it("logs out and returns to the login screen", async () => {
    const { wrapper, push } = mountView(AppHeader, { store });

    await wrapper.get("button").trigger("click");
    await flushPromises();

    expect(session.isAuthenticated()).toBe(false);
    expect(push).toHaveBeenCalledWith({ name: "login" });
  });

  it("offers no log-out control to a signed-out visitor", () => {
    session.clear();
    const anonymous = createAppStore({ api: makeApi() });
    const { wrapper } = mountView(AppHeader, { store: anonymous });
    expect(wrapper.find("button").exists()).toBe(false);
  });
});

describe("GlobalLoader", () => {
  it("stays hidden while nothing is in flight", () => {
    const store = createAppStore({ api: makeApi() });
    const { wrapper } = mountView(GlobalLoader, { store });
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });

  it("appears while a request is pending and disappears when it settles", async () => {
    const store = createAppStore({ api: makeApi() });
    const { wrapper } = mountView(GlobalLoader, { store });

    store.commit("ui/startRequest");
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[role="status"]').exists()).toBe(true);

    store.commit("ui/finishRequest");
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[role="status"]').exists()).toBe(false);
  });
});
