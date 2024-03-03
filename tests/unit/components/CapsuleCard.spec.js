import { describe, expect, it } from "vitest";
import CapsuleCard from "@/components/CapsuleCard.vue";
import { mountView } from "../../helpers/mount";

const NOW = Date.UTC(2024, 2, 1, 12, 0, 0);

function card(capsule, now = NOW) {
  return mountView(CapsuleCard, { props: { capsule, now } }).wrapper;
}

describe("CapsuleCard", () => {
  it("counts down towards a sealed capsule and disables the button", () => {
    const wrapper = card({
      id: 1,
      note: "Seal****",
      scheduled_opening_time: "2024-03-02 15:04:05",
      is_opened: false,
    });

    expect(wrapper.text()).toContain("Sealed");
    expect(wrapper.text()).toContain("1d 03:04:05");
    expect(wrapper.get("button").attributes("disabled")).toBeDefined();
  });

  it("offers the capsule once its opening time has passed", async () => {
    const wrapper = card({
      id: 2,
      note: "Read****",
      scheduled_opening_time: "2024-03-01 11:59:00",
      is_opened: false,
    });

    expect(wrapper.text()).toContain("Ready to open");
    const button = wrapper.get("button");
    expect(button.attributes("disabled")).toBeUndefined();

    await button.trigger("click");
    expect(wrapper.emitted("open")).toEqual([[2]]);
  });

  it("shows the full note and no button once opened", () => {
    const wrapper = card({
      id: 3,
      note: "The whole message, unmasked.",
      scheduled_opening_time: "2024-02-01 09:00:00",
      is_opened: true,
    });

    expect(wrapper.text()).toContain("The whole message, unmasked.");
    expect(wrapper.text()).toContain("Opened");
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("re-renders as unlocked when the shared clock passes the opening time", async () => {
    const capsule = {
      id: 4,
      note: "Almo****",
      scheduled_opening_time: "2024-03-01 12:00:10",
      is_opened: false,
    };
    const wrapper = card(capsule);
    expect(wrapper.text()).toContain("Sealed");

    await wrapper.setProps({ now: NOW + 11_000 });
    expect(wrapper.text()).toContain("Ready to open");
    expect(wrapper.get("button").attributes("disabled")).toBeUndefined();
  });

  it("shows a spinner instead of double-firing while a request is in flight", async () => {
    const wrapper = card({
      id: 5,
      note: "Read****",
      scheduled_opening_time: "2024-01-01 09:00:00",
      is_opened: false,
    });
    await wrapper.setProps({ busy: true });

    expect(wrapper.get("button").attributes("disabled")).toBeDefined();
    expect(wrapper.get("button").attributes("aria-busy")).toBe("true");
  });
});
