import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import AddMessageView from "@/views/AddMessageView.vue";
import { createAppStore } from "@/store";
import session from "@/lib/session";
import { mountView } from "../../helpers/mount";

/** A datetime-local string, `offsetMs` from now, in the browser's timezone. */
function localInput(offsetMs) {
  const date = new Date(Date.now() + offsetMs);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

describe("AddMessageView", () => {
  let api;
  let store;

  beforeEach(() => {
    session.save({ token: "tok", userId: 7 });
    api = {
      createCapsule: vi.fn().mockResolvedValue({
        id: 50,
        note: "A note for later.",
        scheduled_opening_time: "2030-01-01 09:00:00",
        is_opened: false,
      }),
      listCapsules: vi.fn().mockResolvedValue([]),
      openCapsule: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
    };
    store = createAppStore({ api });
  });

  async function submit(wrapper, { note, openingTime }) {
    if (note !== undefined) await wrapper.get("#note").setValue(note);
    if (openingTime !== undefined) await wrapper.get("#openingTime").setValue(openingTime);
    await wrapper.get("form").trigger("submit");
    await flushPromises();
  }

  it("sends an absolute UTC instant, not the raw local input", async () => {
    // Regression: posting "2030-01-01T09:00" made the backend (UTC) unlock the
    // capsule at the wrong moment for every non-UTC user.
    const { wrapper } = mountView(AddMessageView, { store });
    const openingTime = localInput(86_400_000);

    await submit(wrapper, { note: "A note for later.", openingTime });

    const [, payload] = api.createCapsule.mock.calls[0];
    expect(payload.scheduled_opening_time).toBe(new Date(openingTime).toISOString());
    expect(payload.scheduled_opening_time).toMatch(/Z$/);
  });

  it("trims the note and posts it under the signed-in user", async () => {
    const { wrapper, push } = mountView(AddMessageView, { store });
    await submit(wrapper, { note: "  padded note  ", openingTime: localInput(3_600_000) });

    expect(api.createCapsule).toHaveBeenCalledWith(
      "7",
      expect.objectContaining({ note: "padded note" })
    );
    expect(push).toHaveBeenCalledWith({ name: "capsules" });
  });

  it("refuses an opening time in the past without calling the API", async () => {
    const { wrapper } = mountView(AddMessageView, { store });
    await submit(wrapper, { note: "Too late.", openingTime: localInput(-3_600_000) });

    expect(api.createCapsule).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Pick a moment in the future.");
  });

  it("refuses a whitespace-only note", async () => {
    const { wrapper } = mountView(AddMessageView, { store });
    await submit(wrapper, { note: "   ", openingTime: localInput(3_600_000) });

    expect(api.createCapsule).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Write something first.");
  });

  it("sets a min attribute so the picker cannot offer the past", () => {
    const { wrapper } = mountView(AddMessageView, { store });
    expect(wrapper.get("#openingTime").attributes("min")).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
    );
  });

  it("shows the backend's validation message and stays on the page", async () => {
    api.createCapsule.mockRejectedValue({
      response: {
        status: 422,
        data: {
          message: "The given data was invalid.",
          errors: {
            scheduled_opening_time: ["The scheduled opening time must be a date after now."],
          },
        },
      },
    });

    const { wrapper, push } = mountView(AddMessageView, { store });
    await submit(wrapper, { note: "Anything.", openingTime: localInput(60_000) });

    expect(wrapper.text()).toContain("The scheduled opening time must be a date after now.");
    expect(push).not.toHaveBeenCalled();
  });

  it("counts characters against the limit", async () => {
    const { wrapper } = mountView(AddMessageView, { store });
    await wrapper.get("#note").setValue("hello");
    expect(wrapper.text()).toContain("5/2000 characters");
  });
});
