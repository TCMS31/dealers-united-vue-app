<template>
  <div class="min-h-screen">
    <AppHeader />

    <main id="main" class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="page-title">Your capsules</h1>
          <p class="mt-1 text-sm text-stone-500">
            Sealed notes stay masked until their opening time passes.
          </p>
        </div>

        <AppButton tag="router-link" :to="{ name: 'add-capsule' }" size="lg">
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z"
            />
          </svg>
          New capsule
        </AppButton>
      </div>

      <dl v-if="total > 0" class="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
        <div v-for="stat in stats" :key="stat.label" class="surface px-4 py-3">
          <dt class="text-xs font-medium uppercase tracking-wide text-stone-500">
            {{ stat.label }}
          </dt>
          <dd :class="['mt-0.5 font-display text-2xl font-semibold tabular-nums', stat.tone]">
            {{ stat.value }}
          </dd>
        </div>
      </dl>

      <AlertBanner v-if="openError" class="mt-6" :message="openError" />

      <section class="mt-6" aria-label="Capsules" :aria-busy="isLoading ? 'true' : 'false'">
        <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2" role="status">
          <span class="sr-only">Loading your capsules</span>
          <CapsuleCardSkeleton v-for="n in 4" :key="n" />
        </div>

        <div v-else-if="hasError" class="surface">
          <StatePanel variant="error" title="We could not load your capsules" :description="error">
            <template #action>
              <AppButton variant="secondary" @click="reload">Try again</AppButton>
            </template>
          </StatePanel>
        </div>

        <div v-else-if="isEmpty" class="surface">
          <StatePanel
            variant="seal"
            title="Nothing sealed yet"
            description="Write a note to your future self and pick the moment it unlocks."
          >
            <template #action>
              <AppButton tag="router-link" :to="{ name: 'add-capsule' }">
                Write your first capsule
              </AppButton>
            </template>
          </StatePanel>
        </div>

        <div v-else class="space-y-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <CapsuleCard
              v-for="capsule in visible"
              :key="capsule.id"
              :capsule="capsule"
              :now="now"
              :busy="openingId === capsule.id"
              @open="onOpen"
            />
          </div>

          <PaginationControls
            :page="page"
            :page-count="pageCount"
            :total="total"
            @change="goToPage"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import AppHeader from "@/components/AppHeader.vue";
import AlertBanner from "@/components/ui/AlertBanner.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CapsuleCard from "@/components/CapsuleCard.vue";
import CapsuleCardSkeleton from "@/components/CapsuleCardSkeleton.vue";
import PaginationControls from "@/components/PaginationControls.vue";
import StatePanel from "@/components/ui/StatePanel.vue";
import { useNow } from "@/composables/useNow";

export default {
  name: "MessageListView",

  components: {
    AlertBanner,
    AppButton,
    AppHeader,
    CapsuleCard,
    CapsuleCardSkeleton,
    PaginationControls,
    StatePanel,
  },

  setup() {
    // One shared ticker drives every countdown on the page.
    return useNow();
  },

  data() {
    return {
      openingId: null,
      openError: "",
    };
  },

  computed: {
    ...mapState("capsules", ["error", "page"]),
    ...mapGetters("capsules", [
      "visible",
      "pageCount",
      "total",
      "openedCount",
      "lockedCount",
      "isLoading",
      "isEmpty",
      "hasError",
    ]),

    stats() {
      return [
        { label: "Total", value: this.total, tone: "text-stone-900" },
        { label: "Sealed", value: this.lockedCount, tone: "text-seal-700" },
        { label: "Opened", value: this.openedCount, tone: "text-brand-700" },
      ];
    },
  },

  created() {
    this.reload();
  },

  methods: {
    reload() {
      this.openError = "";
      return this.$store.dispatch("capsules/fetchAll");
    },

    goToPage(page) {
      this.$store.dispatch("capsules/goToPage", page);
    },

    async onOpen(capsuleId) {
      this.openError = "";
      this.openingId = capsuleId;
      try {
        await this.$store.dispatch("capsules/open", capsuleId);
      } catch (error) {
        this.openError = error.message;
      } finally {
        this.openingId = null;
      }
    },
  },
};
</script>
