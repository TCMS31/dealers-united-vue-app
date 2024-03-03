import { createRouter, createWebHistory } from "vue-router";
import session from "@/lib/session";

/**
 * Routes are lazily imported so the login screen does not ship the capsule list
 * and vice versa — each view becomes its own chunk.
 */
export const routes = [
  { path: "/", redirect: { name: "capsules" } },
  {
    path: "/login",
    name: "login",
    component: () => import(/* webpackChunkName: "auth" */ "@/views/LoginView.vue"),
    meta: { guestOnly: true, title: "Log in" },
  },
  {
    path: "/signup",
    name: "signup",
    component: () => import(/* webpackChunkName: "auth" */ "@/views/SignupView.vue"),
    meta: { guestOnly: true, title: "Create an account" },
  },
  {
    path: "/message-list",
    name: "capsules",
    component: () => import(/* webpackChunkName: "capsules" */ "@/views/MessageListView.vue"),
    meta: { requiresAuth: true, title: "Your capsules" },
  },
  {
    path: "/add-message",
    name: "add-capsule",
    component: () => import(/* webpackChunkName: "capsules" */ "@/views/AddMessageView.vue"),
    meta: { requiresAuth: true, title: "New capsule" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import(/* webpackChunkName: "auth" */ "@/views/NotFoundView.vue"),
    meta: { title: "Not found" },
  },
];

/**
 * The guard that the original app was missing: `/message-list` and
 * `/add-message` were reachable by URL with no session at all, which then fired
 * an API call with `user_id` undefined.
 *
 * @param {import('vue-router').RouteLocationNormalized} to
 * @param {{ isAuthenticated: () => boolean }} [auth]
 */
export function authGuard(to, auth = session) {
  const signedIn = auth.isAuthenticated();

  if (to.meta?.requiresAuth && !signedIn) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  if (to.meta?.guestOnly && signedIn) {
    return { name: "capsules" };
  }
  return true;
}

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to) => authGuard(to));

router.afterEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} · Time Capsule` : "Time Capsule";
});

export default router;
