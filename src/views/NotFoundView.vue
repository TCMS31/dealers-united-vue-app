<template>
  <main id="main" class="flex min-h-screen items-center justify-center px-4">
    <div class="surface w-full max-w-md">
      <StatePanel
        heading-tag="h1"
        title="Page not found"
        description="That link does not lead anywhere in this app."
      >
        <template #action>
          <AppButton tag="router-link" :to="{ name: 'capsules' }">Go to your capsules</AppButton>
        </template>
      </StatePanel>
    </div>
  </main>
</template>

<script>
import AppButton from "@/components/ui/AppButton.vue";
import StatePanel from "@/components/ui/StatePanel.vue";

export default {
  name: "NotFoundView",
  components: { AppButton, StatePanel },
};
</script>
