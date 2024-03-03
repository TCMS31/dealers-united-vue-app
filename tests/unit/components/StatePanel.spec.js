import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import StatePanel from "@/components/ui/StatePanel.vue";

describe("StatePanel", () => {
  it("titles itself with an h2 so it nests under the page heading", () => {
    const wrapper = mount(StatePanel, { props: { title: "Nothing sealed yet" } });
    expect(wrapper.get("h2").text()).toBe("Nothing sealed yet");
  });

  it("can be the page's h1 when it is the only heading", () => {
    const wrapper = mount(StatePanel, { props: { title: "Page not found", headingTag: "h1" } });
    expect(wrapper.get("h1").text()).toBe("Page not found");
    expect(wrapper.find("h2").exists()).toBe(false);
  });

  it("renders the action slot only when one is given", () => {
    const bare = mount(StatePanel, { props: { title: "Empty" } });
    expect(bare.find("button").exists()).toBe(false);

    const withAction = mount(StatePanel, {
      props: { title: "Failed" },
      slots: { action: "<button>Try again</button>" },
    });
    expect(withAction.get("button").text()).toBe("Try again");
  });
});
