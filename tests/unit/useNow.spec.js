import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, effectScope } from "vue";
import { mount } from "@vue/test-utils";
import { __resetClock, useNow } from "@/composables/useNow";

const Ticker = defineComponent({
  setup: () => useNow(),
  template: "<span>{{ now }}</span>",
});

afterEach(() => __resetClock());

describe("useNow", () => {
  it("advances once a second", async () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const { now } = scope.run(() => useNow());
    const start = now.value;

    vi.advanceTimersByTime(3000);
    expect(now.value).toBeGreaterThanOrEqual(start + 3000);

    scope.stop();
  });

  it("runs one timer no matter how many components subscribe", () => {
    vi.useFakeTimers();
    const setInterval = vi.spyOn(globalThis, "setInterval");

    const a = mount(Ticker);
    const b = mount(Ticker);
    const c = mount(Ticker);

    expect(setInterval).toHaveBeenCalledTimes(1);

    a.unmount();
    b.unmount();
    c.unmount();
  });

  it("stops the timer once the last subscriber unmounts", () => {
    vi.useFakeTimers();
    const clearInterval = vi.spyOn(globalThis, "clearInterval");

    const a = mount(Ticker);
    const b = mount(Ticker);

    a.unmount();
    expect(clearInterval).not.toHaveBeenCalled();

    b.unmount();
    expect(clearInterval).toHaveBeenCalledTimes(1);
  });
});
