<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :to="to"
    :disabled="tag === 'button' ? disabled || loading : undefined"
    :aria-busy="loading ? 'true' : undefined"
    :class="classes"
  >
    <span
      v-if="loading"
      class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>

<script>
const VARIANTS = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300",
  secondary:
    "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-400",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-400",
  danger:
    "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200 disabled:text-rose-300",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export default {
  name: "AppButton",

  props: {
    /** Render as a `<button>`, a `<router-link>` or an `<a>`. */
    tag: {
      type: String,
      default: "button",
      validator: (value) => ["button", "router-link", "a"].includes(value),
    },
    type: { type: String, default: "button" },
    to: { type: [String, Object], default: undefined },
    variant: {
      type: String,
      default: "primary",
      validator: (value) => Object.keys(VARIANTS).includes(value),
    },
    size: {
      type: String,
      default: "md",
      validator: (value) => Object.keys(SIZES).includes(value),
    },
    block: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },

  computed: {
    classes() {
      return [
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition",
        "disabled:cursor-not-allowed",
        VARIANTS[this.variant],
        SIZES[this.size],
        this.block ? "w-full" : "",
      ];
    },
  },
};
</script>
