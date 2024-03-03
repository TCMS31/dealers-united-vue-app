<template>
  <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
    <div :class="['flex h-12 w-12 items-center justify-center rounded-full', iconTone]">
      <slot name="icon">
        <svg
          class="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path stroke-linecap="round" d="M12 8v4m0 4h.01" />
        </svg>
      </slot>
    </div>

    <h3 class="mt-4 text-base font-semibold text-slate-900">{{ title }}</h3>
    <p v-if="description" class="mt-1.5 max-w-sm text-sm text-slate-500">
      {{ description }}
    </p>

    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>

<script>
const TONES = {
  neutral: "bg-slate-100 text-slate-500",
  error: "bg-rose-100 text-rose-600",
  brand: "bg-brand-100 text-brand-600",
};

export default {
  name: "StatePanel",

  props: {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    variant: {
      type: String,
      default: "neutral",
      validator: (value) => Object.keys(TONES).includes(value),
    },
  },

  computed: {
    iconTone() {
      return TONES[this.variant];
    },
  },
};
</script>
