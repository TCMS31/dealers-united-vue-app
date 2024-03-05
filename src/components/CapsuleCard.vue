<template>
  <article
    class="surface flex h-full flex-col gap-4 p-5 transition hover:shadow-md"
    :aria-label="`Capsule scheduled for ${scheduledLabel}`"
  >
    <header class="flex items-start justify-between gap-3">
      <span
        :class="[
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
          statusTone,
        ]"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
        {{ statusLabel }}
      </span>

      <time
        class="shrink-0 text-xs tabular-nums text-slate-500"
        :datetime="capsule.scheduled_opening_time"
      >
        {{ scheduledLabel }}
      </time>
    </header>

    <p
      :class="[
        'flex-1 text-sm leading-relaxed',
        capsule.is_opened ? 'text-slate-800' : 'select-none font-mono text-slate-400',
      ]"
    >
      {{ capsule.note }}
    </p>

    <footer class="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <div v-if="!capsule.is_opened && !isUnlocked" class="text-xs text-slate-500">
        <span class="block">Unlocks in</span>
        <span class="font-mono text-sm tabular-nums text-slate-700">{{ countdown }}</span>
      </div>
      <div v-else-if="capsule.is_opened" class="text-xs text-slate-500">
        Opened — the full note is shown above.
      </div>
      <div v-else class="text-xs font-medium text-emerald-700">The wait is over.</div>

      <AppButton
        v-if="!capsule.is_opened"
        size="sm"
        :variant="isUnlocked ? 'primary' : 'secondary'"
        :disabled="!isUnlocked || busy"
        :loading="busy"
        @click="$emit('open', capsule.id)"
      >
        {{ isUnlocked ? "Open capsule" : "Locked" }}
      </AppButton>
    </footer>
  </article>
</template>

<script>
import AppButton from "@/components/ui/AppButton.vue";
import { formatCountdown, formatDateTime, millisecondsUntil } from "@/lib/datetime";

export default {
  name: "CapsuleCard",

  components: { AppButton },

  props: {
    /** @type {import('vue').PropType<{id:number,note:string,scheduled_opening_time:string,is_opened:boolean}>} */
    capsule: { type: Object, required: true },
    /**
     * Current time in epoch ms, supplied by the parent. The list owns a single
     * ticker so a page of cards costs one timer, not one per card.
     */
    now: { type: Number, required: true },
    busy: { type: Boolean, default: false },
  },

  emits: ["open"],

  computed: {
    remainingMs() {
      return millisecondsUntil(this.capsule.scheduled_opening_time, this.now);
    },

    isUnlocked() {
      return this.remainingMs === 0;
    },

    countdown() {
      return formatCountdown(this.remainingMs);
    },

    scheduledLabel() {
      return formatDateTime(this.capsule.scheduled_opening_time);
    },

    statusLabel() {
      if (this.capsule.is_opened) return "Opened";
      return this.isUnlocked ? "Ready to open" : "Sealed";
    },

    statusTone() {
      if (this.capsule.is_opened) return "bg-slate-100 text-slate-600";
      return this.isUnlocked ? "bg-emerald-100 text-emerald-700" : "bg-brand-50 text-brand-700";
    },
  },
};
</script>
