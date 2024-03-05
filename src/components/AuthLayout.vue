<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- Brand panel: hidden below `lg` so small screens get the form immediately. -->
    <aside
      class="relative hidden overflow-hidden bg-brand-700 p-12 text-white lg:flex lg:flex-col lg:justify-between"
    >
      <div class="flex items-center gap-2.5">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15"
          aria-hidden="true"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path stroke-linecap="round" d="M12 7v5l3 2" />
          </svg>
        </span>
        <span class="text-lg font-semibold tracking-tight">Time Capsule</span>
      </div>

      <div class="max-w-md">
        <h2 class="text-3xl font-semibold leading-tight tracking-tight">
          Write a note today. Read it when it matters.
        </h2>
        <p class="mt-4 text-sm leading-relaxed text-brand-100">
          Capsules stay sealed until the moment you chose. Until then even the API only returns the
          first few characters — the rest is never sent to the browser.
        </p>
      </div>

      <p class="text-xs text-brand-200">Vue 3 · Vuex · Laravel API</p>
      <div
        class="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-brand-500/40 blur-3xl"
        aria-hidden="true"
      />
    </aside>

    <main class="flex items-center justify-center px-4 py-12 sm:px-8">
      <div class="w-full max-w-sm">
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">{{ title }}</h1>
        <p class="mt-1.5 text-sm text-slate-500">{{ subtitle }}</p>

        <div class="mt-8">
          <slot />
        </div>

        <p class="mt-8 text-center text-sm text-slate-500">
          <slot name="footer" />
        </p>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "AuthLayout",

  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
  },
};
</script>
