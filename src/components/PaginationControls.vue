<template>
  <nav
    v-if="pageCount > 1"
    class="flex items-center justify-between gap-4 border-t border-slate-200 pt-4"
    aria-label="Pagination"
  >
    <AppButton
      variant="secondary"
      size="sm"
      :disabled="page <= 1"
      @click="$emit('change', page - 1)"
    >
      Previous
    </AppButton>

    <p class="text-xs text-slate-500" aria-live="polite">
      Page <span class="font-semibold text-slate-700">{{ page }}</span> of {{ pageCount }}
      <span class="hidden sm:inline">· {{ total }} capsules</span>
    </p>

    <AppButton
      variant="secondary"
      size="sm"
      :disabled="page >= pageCount"
      @click="$emit('change', page + 1)"
    >
      Next
    </AppButton>
  </nav>
</template>

<script>
import AppButton from "@/components/ui/AppButton.vue";

export default {
  name: "PaginationControls",

  components: { AppButton },

  props: {
    page: { type: Number, required: true },
    pageCount: { type: Number, required: true },
    total: { type: Number, default: 0 },
  },

  emits: ["change"],
};
</script>
