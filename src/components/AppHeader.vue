<template>
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow"
  >
    Skip to content
  </a>
  <header class="sticky top-0 z-40 border-b border-stone-200 bg-paper/90 backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <router-link
        :to="{ name: 'capsules' }"
        class="flex items-center gap-2.5 rounded-md text-stone-900"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full bg-seal-600 text-seal-50 shadow-inner"
          aria-hidden="true"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path stroke-linecap="round" d="M12 7v5l3 2" />
          </svg>
        </span>
        <span class="font-display text-lg font-semibold tracking-tight">Time Capsule</span>
      </router-link>

      <div class="flex items-center gap-3">
        <span
          v-if="demoMode"
          class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900"
        >
          Demo data
        </span>

        <div v-if="isAuthenticated" class="flex items-center gap-3">
          <span
            v-if="user"
            class="hidden h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800 sm:flex"
            :title="displayName"
          >
            {{ initials }}
          </span>
          <AppButton variant="secondary" size="sm" @click="onLogout">Log out</AppButton>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import AppButton from "@/components/ui/AppButton.vue";
import { DEMO_MODE } from "@/lib/env";

export default {
  name: "AppHeader",

  components: { AppButton },

  data() {
    return { demoMode: DEMO_MODE };
  },

  computed: {
    ...mapState("auth", ["user"]),
    ...mapGetters("auth", ["isAuthenticated", "displayName", "initials"]),
  },

  methods: {
    async onLogout() {
      await this.$store.dispatch("auth/logout");
      this.$router.push({ name: "login" });
    },
  },
};
</script>
