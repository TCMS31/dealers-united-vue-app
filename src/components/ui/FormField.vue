<template>
  <div>
    <label :for="id" class="field-label">
      {{ label }}
      <span v-if="!required" class="font-normal text-slate-400">(optional)</span>
    </label>

    <slot :id="id" :invalid="Boolean(error)" :described-by="error ? errorId : undefined" />

    <p v-if="error" :id="errorId" class="mt-1.5 text-xs text-rose-600" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>

<script>
export default {
  name: "FormField",

  props: {
    id: { type: String, required: true },
    label: { type: String, required: true },
    /** First validation message for this field, if any. */
    error: { type: String, default: "" },
    hint: { type: String, default: "" },
    required: { type: Boolean, default: true },
  },

  computed: {
    errorId() {
      return `${this.id}-error`;
    },
  },
};
</script>
