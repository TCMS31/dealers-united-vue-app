<template>
  <div class="min-h-screen bg-slate-50">
    <AppHeader />

    <main class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <router-link
        :to="{ name: 'capsules' }"
        class="inline-flex items-center gap-1.5 rounded text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M12.7 15.7a1 1 0 01-1.4 0l-5-5a1 1 0 010-1.4l5-5a1 1 0 111.4 1.4L8.42 10l4.3 4.3a1 1 0 01-.02 1.4z"
            clip-rule="evenodd"
          />
        </svg>
        Back to capsules
      </router-link>

      <h1 class="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Seal a new capsule</h1>
      <p class="mt-1 text-sm text-slate-500">
        Once sealed, the note is masked until the opening time you pick.
      </p>

      <form class="surface mt-6 space-y-6 p-6" novalidate @submit.prevent="onSubmit">
        <AlertBanner :message="formError" />

        <FormField
          id="note"
          v-slot="{ id, invalid, describedBy }"
          label="Message"
          :hint="`${form.note.length}/${MAX_NOTE_LENGTH} characters`"
          :error="fieldError('note')"
        >
          <textarea
            :id="id"
            v-model="form.note"
            rows="6"
            :maxlength="MAX_NOTE_LENGTH"
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            :class="['field-input resize-y', invalid && 'field-input--invalid']"
            placeholder="What do you want your future self to read?"
            required
          />
        </FormField>

        <FormField
          id="openingTime"
          v-slot="{ id, invalid, describedBy }"
          label="Opening time"
          hint="Interpreted in your own timezone and sent to the API as UTC."
          :error="fieldError('scheduled_opening_time')"
        >
          <input
            :id="id"
            v-model="form.openingTime"
            type="datetime-local"
            :min="minOpeningTime"
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            :class="['field-input', invalid && 'field-input--invalid']"
            required
          />
        </FormField>

        <div
          class="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"
        >
          <AppButton tag="router-link" variant="secondary" :to="{ name: 'capsules' }">
            Cancel
          </AppButton>
          <AppButton type="submit" tag="button" :loading="submitting"> Seal capsule </AppButton>
        </div>
      </form>
    </main>
  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader.vue";
import AlertBanner from "@/components/ui/AlertBanner.vue";
import AppButton from "@/components/ui/AppButton.vue";
import FormField from "@/components/ui/FormField.vue";
import { isFutureLocalInput, localInputMin, localInputToIso } from "@/lib/datetime";

const MAX_NOTE_LENGTH = 2000;

export default {
  name: "AddMessageView",

  components: { AlertBanner, AppButton, AppHeader, FormField },

  data() {
    return {
      MAX_NOTE_LENGTH,
      form: { note: "", openingTime: "" },
      formError: "",
      fieldErrors: {},
      submitting: false,
      minOpeningTime: localInputMin(),
    };
  },

  methods: {
    fieldError(name) {
      return this.fieldErrors[name]?.[0] ?? "";
    },

    /** @returns {boolean} */
    validate() {
      if (!this.form.note.trim()) {
        this.fieldErrors = { note: ["Write something first."] };
        return false;
      }
      if (!isFutureLocalInput(this.form.openingTime)) {
        this.fieldErrors = {
          scheduled_opening_time: ["Pick a moment in the future."],
        };
        return false;
      }
      return true;
    },

    async onSubmit() {
      this.formError = "";
      this.fieldErrors = {};

      if (!this.validate()) return;

      this.submitting = true;
      try {
        await this.$store.dispatch("capsules/create", {
          note: this.form.note.trim(),
          // Sent as an absolute instant. The original build posted the raw
          // `datetime-local` value, which the backend read as UTC — so a capsule
          // scheduled for 9am local unlocked at the wrong time everywhere but UTC.
          scheduled_opening_time: localInputToIso(this.form.openingTime),
        });
        this.$router.push({ name: "capsules" });
      } catch (error) {
        this.formError = error.message;
        this.fieldErrors = error.fieldErrors ?? {};
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
