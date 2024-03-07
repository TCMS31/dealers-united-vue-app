import { mount } from "@vue/test-utils";
import { RouterLinkStub } from "@vue/test-utils";
import { vi } from "vitest";

/**
 * Mount a component with the router bits every view depends on, without
 * standing up a real router (which would mean real navigation and async
 * component loading inside a unit test).
 *
 * @param {object} component
 * @param {object} [options]
 * @param {import('vuex').Store} [options.store]
 * @param {object} [options.route] a fake `$route`
 * @param {object} [options.props]
 * @returns {{ wrapper: import('@vue/test-utils').VueWrapper, push: Function }}
 */
export function mountView(component, { store, route = {}, props = {}, ...rest } = {}) {
  const push = vi.fn();

  const wrapper = mount(component, {
    props,
    global: {
      plugins: store ? [store] : [],
      components: { RouterLink: RouterLinkStub },
      stubs: { RouterLink: RouterLinkStub },
      mocks: {
        $router: { push, replace: vi.fn(), back: vi.fn() },
        $route: { query: {}, params: {}, fullPath: "/", ...route },
      },
    },
    ...rest,
  });

  return { wrapper, push };
}

export { RouterLinkStub };
