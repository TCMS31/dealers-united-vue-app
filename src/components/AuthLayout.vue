<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- Brand panel: hidden below `lg` so small screens get the form immediately. -->
    <aside
      class="relative hidden overflow-hidden bg-brand-800 p-12 text-brand-50 lg:flex lg:flex-col lg:justify-between"
    >
      <div class="flex items-center gap-2.5">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-full bg-seal-600 text-seal-50"
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
        <span class="font-display text-xl font-semibold tracking-tight">Time Capsule</span>
      </div>

      <div class="max-w-md">
        <p class="font-display text-4xl font-semibold leading-tight tracking-tight">
          Write a note today. Read it when it matters.
        </p>
        <p class="mt-4 text-sm leading-relaxed text-brand-100">
          Capsules stay sealed until the moment you chose. Until then even the API only returns the
          first few characters — the rest is never sent to the browser.
        </p>
      </div>

      <p class="text-xs text-brand-200">Sealed on the server. Opened on schedule.</p>
      <div
        class="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full border-[28px] border-seal-600/30"
        aria-hidden="true"
      />
    </aside>

    <main id="main" class="flex items-center justify-center px-4 py-12 sm:px-8">
      <div class="w-full max-w-sm">
        <p class="mb-8 flex items-center gap-2 lg:hidden" aria-hidden="true">
          <span class="h-3 w-3 rounded-full bg-seal-600" />
          <span class="font-display text-lg font-semibold text-brand-800">Time Capsule</span>
        </p>
        <h1 class="page-title">{{ title }}</h1>
        <p class="mt-1.5 text-sm text-stone-500">{{ subtitle }}</p>

        <div class="mt-8">
          <slot />
        </div>

        <p class="mt-8 text-center text-sm text-stone-500">
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
