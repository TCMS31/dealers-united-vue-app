import { describe, expect, it } from "vitest";
import PaginationControls from "@/components/PaginationControls.vue";
import { mountView } from "../../helpers/mount";

function pagination(props) {
  return mountView(PaginationControls, { props }).wrapper;
}

describe("PaginationControls", () => {
  it("renders nothing when everything fits on one page", () => {
    expect(pagination({ page: 1, pageCount: 1, total: 3 }).find("nav").exists()).toBe(false);
  });

  it("disables Previous on the first page and Next on the last", () => {
    const first = pagination({ page: 1, pageCount: 3, total: 11 });
    expect(first.findAll("button")[0].attributes("disabled")).toBeDefined();
    expect(first.findAll("button")[1].attributes("disabled")).toBeUndefined();

    const last = pagination({ page: 3, pageCount: 3, total: 11 });
    expect(last.findAll("button")[1].attributes("disabled")).toBeDefined();
  });

  it("announces the position and emits the requested page", async () => {
    const wrapper = pagination({ page: 2, pageCount: 3, total: 11 });
    expect(wrapper.text()).toContain("Page 2 of 3");

    await wrapper.findAll("button")[1].trigger("click");
    await wrapper.findAll("button")[0].trigger("click");

    expect(wrapper.emitted("change")).toEqual([[3], [1]]);
  });
});
