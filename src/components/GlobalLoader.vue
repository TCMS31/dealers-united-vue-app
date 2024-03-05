<template>
  <transition
    enter-active-class="transition-opacity duration-150"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-150"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-[1px]"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div class="flex items-center gap-3 rounded-full bg-white px-4 py-2.5 shadow-lg">
        <span
          class="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
          aria-hidden="true"
        />
        <span class="text-sm font-medium text-slate-600">Working…</span>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "GlobalLoader",

  computed: {
    ...mapGetters("ui", ["isLoading"]),
  },
};
</script>
