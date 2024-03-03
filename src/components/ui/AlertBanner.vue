<template>
  <div
    v-if="message"
    :class="['flex items-start gap-3 rounded-lg border p-3 text-sm', tone]"
    role="alert"
  >
    <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fill-rule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"
        clip-rule="evenodd"
      />
    </svg>
    <span>{{ message }}</span>
  </div>
</template>

<script>
const TONES = {
  error: "border-rose-200 bg-rose-50 text-rose-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-brand-200 bg-brand-50 text-brand-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export default {
  name: "AlertBanner",

  props: {
    message: { type: String, default: "" },
    variant: {
      type: String,
      default: "error",
      validator: (value) => Object.keys(TONES).includes(value),
    },
  },

  computed: {
    tone() {
      return TONES[this.variant];
    },
  },
};
</script>
