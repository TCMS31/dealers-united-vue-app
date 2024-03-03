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

    <component :is="headingTag" class="mt-4 font-display text-lg font-semibold text-stone-900">
      {{ title }}
    </component>
    <p v-if="description" class="mt-1.5 max-w-sm text-sm text-stone-500">
      {{ description }}
    </p>

    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>

<script>
const TONES = {
  neutral: "bg-stone-100 text-stone-500",
  error: "bg-rose-100 text-rose-600",
  brand: "bg-brand-100 text-brand-600",
  seal: "bg-seal-100 text-seal-600",
};

export default {
  name: "StatePanel",

  props: {
    title: { type: String, required: true },
    /** The panel sits under the page's h1 unless it is the page's only heading. */
    headingTag: {
      type: String,
      default: "h2",
      validator: (value) => ["h1", "h2", "h3"].includes(value),
    },
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
