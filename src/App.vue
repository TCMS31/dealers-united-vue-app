<template>
  <GlobalLoader />
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script>
import GlobalLoader from "@/components/GlobalLoader.vue";

export default {
  name: "App",

  components: { GlobalLoader },

  created() {
    // Deliberately not awaited: a stale profile should never block first paint.
    this.$store.dispatch("auth/hydrate");
  },
};
</script>
