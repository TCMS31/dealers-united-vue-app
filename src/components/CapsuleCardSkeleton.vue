<template>
  <div class="surface animate-pulse space-y-4 p-5" aria-hidden="true">
    <div class="flex items-center justify-between">
      <div class="h-5 w-20 rounded-full bg-stone-200" />
      <div class="h-3 w-24 rounded bg-stone-100" />
    </div>
    <div class="space-y-2">
      <div class="h-3 w-full rounded bg-stone-100" />
      <div class="h-3 w-4/5 rounded bg-stone-100" />
    </div>
    <div class="flex items-center justify-between border-t border-stone-100 pt-4">
      <div class="h-6 w-24 rounded bg-stone-100" />
      <div class="h-7 w-24 rounded-lg bg-stone-200" />
    </div>
  </div>
</template>

<script>
export default { name: "CapsuleCardSkeleton" };
</script>
