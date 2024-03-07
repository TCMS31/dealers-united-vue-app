import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import LoginView from "@/views/LoginView.vue";
import { createAppStore } from "@/store";
import { mountView } from "../../helpers/mount";

function makeApi(overrides = {}) {
  return {
    login: vi.fn().mockResolvedValue({ user: { id: 7, name: "Dana Ruiz" }, token: "tok" }),
    register: vi.fn(),
    listCapsules: vi.fn().mockResolvedValue([]),
    createCapsule: vi.fn(),
    openCapsule: vi.fn(),
    ...overrides,
  };
}

async function fillAndSubmit(wrapper, email = "dana@example.com", password = "secret123") {
  await wrapper.get("#email").setValue(email);
  await wrapper.get("#password").setValue(password);
  await wrapper.get("form").trigger("submit");
  await flushPromises();
}

describe("LoginView", () => {
  let api;
  let store;

  beforeEach(() => {
    api = makeApi();
    store = createAppStore({ api });
  });

  it("signs in and lands on the capsule list", async () => {
    const { wrapper, push } = mountView(LoginView, { store });
    await fillAndSubmit(wrapper);

    expect(api.login).toHaveBeenCalledWith({
      email: "dana@example.com",
      password: "secret123",
    });
    expect(push).toHaveBeenCalledWith({ name: "capsules" });
  });

  it("returns the visitor to the page they were blocked from", async () => {
    const { wrapper, push } = mountView(LoginView, {
      store,
      route: { query: { redirect: "/add-message" } },
    });
    await fillAndSubmit(wrapper);

    expect(push).toHaveBeenCalledWith("/add-message");
  });

  it("ignores an off-site redirect parameter", async () => {
    const { wrapper, push } = mountView(LoginView, {
      store,
      route: { query: { redirect: "https://evil.example.com" } },
    });
    await fillAndSubmit(wrapper);

    expect(push).toHaveBeenCalledWith({ name: "capsules" });
  });

  it("renders the server's message instead of calling alert()", async () => {
    api.login.mockRejectedValue({
      response: { status: 422, data: { message: "These credentials do not match our records." } },
    });
    const alertSpy = vi.spyOn(globalThis, "alert").mockImplementation(() => {});

    const { wrapper, push } = mountView(LoginView, { store });
    await fillAndSubmit(wrapper);

    expect(wrapper.text()).toContain("These credentials do not match our records.");
    expect(push).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("survives a network failure that has no response body", async () => {
    // Regression: `alert(error.response.data.message)` threw its own TypeError
    // whenever the request never reached the server.
    api.login.mockRejectedValue(new Error("Network Error"));

    const { wrapper } = mountView(LoginView, { store });
    await fillAndSubmit(wrapper);

    expect(wrapper.text()).toMatch(/could not reach the server/i);
  });

  it("does not call the API with an empty form", async () => {
    const { wrapper } = mountView(LoginView, { store });
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(api.login).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Enter your email address and password.");
  });
});
