import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import SignupView from "@/views/SignupView.vue";
import { createAppStore } from "@/store";
import { mountView } from "../../helpers/mount";

const VALID = {
  firstName: "Dana",
  lastName: "Ruiz",
  email: "dana@example.com",
  password: "secret123",
  passwordConfirmation: "secret123",
};

async function fill(wrapper, values = {}) {
  const data = { ...VALID, ...values };
  await wrapper.get("#firstName").setValue(data.firstName);
  await wrapper.get("#lastName").setValue(data.lastName);
  await wrapper.get("#email").setValue(data.email);
  await wrapper.get("#password").setValue(data.password);
  await wrapper.get("#passwordConfirmation").setValue(data.passwordConfirmation);
  await wrapper.get("form").trigger("submit");
  await flushPromises();
}

describe("SignupView", () => {
  let api;
  let store;

  beforeEach(() => {
    api = {
      register: vi.fn().mockResolvedValue({ user: { id: 9, name: "Dana Ruiz" }, token: "tok" }),
      login: vi.fn(),
      listCapsules: vi.fn().mockResolvedValue([]),
      createCapsule: vi.fn(),
      openCapsule: vi.fn(),
    };
    store = createAppStore({ api });
  });

  it("sends the confirmation the user actually typed", async () => {
    // Regression: the original view sent `password_confirmation: this.password`,
    // so a mistyped confirmation was silently discarded.
    const { wrapper } = mountView(SignupView, { store });
    await fill(wrapper, { password: "secret123", passwordConfirmation: "secret123" });

    expect(api.register).toHaveBeenCalledWith({
      name: "Dana Ruiz",
      email: "dana@example.com",
      password: "secret123",
      password_confirmation: "secret123",
    });
  });

  it("catches a mismatched confirmation before it reaches the API", async () => {
    const { wrapper } = mountView(SignupView, { store });
    await fill(wrapper, { passwordConfirmation: "different" });

    expect(api.register).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("The two passwords do not match.");
  });

  it("rejects a password that is too short", async () => {
    const { wrapper } = mountView(SignupView, { store });
    await fill(wrapper, { password: "short", passwordConfirmation: "short" });

    expect(api.register).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Use at least 8 characters.");
  });

  it("goes straight to the capsule list, because registering returns a token", async () => {
    const { wrapper, push } = mountView(SignupView, { store });
    await fill(wrapper);

    expect(push).toHaveBeenCalledWith({ name: "capsules" });
    expect(store.getters["auth/isAuthenticated"]).toBe(true);
  });

  it("shows per-field messages from a 422", async () => {
    api.register.mockRejectedValue({
      response: {
        status: 422,
        data: {
          message: "The given data was invalid.",
          errors: { email: ["The email has already been taken."] },
        },
      },
    });

    const { wrapper } = mountView(SignupView, { store });
    await fill(wrapper);

    expect(wrapper.text()).toContain("The email has already been taken.");
  });

  it("treats the last name as optional", async () => {
    const { wrapper } = mountView(SignupView, { store });
    await fill(wrapper, { lastName: "" });

    expect(api.register).toHaveBeenCalledWith(expect.objectContaining({ name: "Dana" }));
  });
});
