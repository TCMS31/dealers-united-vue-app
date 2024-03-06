<template>
  <AuthLayout
    title="Create an account"
    subtitle="It takes a minute. Your first capsule takes less."
  >
    <form class="space-y-5" novalidate @submit.prevent="onSubmit">
      <AlertBanner :message="formError" />

      <div class="grid gap-5 sm:grid-cols-2">
        <FormField
          id="firstName"
          v-slot="{ id, invalid, describedBy }"
          label="First name"
          :error="fieldError('name')"
        >
          <input
            :id="id"
            v-model.trim="form.firstName"
            type="text"
            autocomplete="given-name"
            :aria-invalid="invalid"
            :aria-describedby="describedBy"
            :class="['field-input', invalid && 'field-input--invalid']"
            required
          />
        </FormField>

        <FormField id="lastName" v-slot="{ id }" label="Last name" :required="false">
          <input
            :id="id"
            v-model.trim="form.lastName"
            type="text"
            autocomplete="family-name"
            class="field-input"
          />
        </FormField>
      </div>

      <FormField
        id="email"
        v-slot="{ id, invalid, describedBy }"
        label="Email"
        :error="fieldError('email')"
      >
        <input
          :id="id"
          v-model.trim="form.email"
          type="email"
          autocomplete="email"
          :aria-invalid="invalid"
          :aria-describedby="describedBy"
          :class="['field-input', invalid && 'field-input--invalid']"
          placeholder="you@example.com"
          required
        />
      </FormField>

      <FormField
        id="password"
        v-slot="{ id, invalid, describedBy }"
        label="Password"
        hint="At least 8 characters."
        :error="fieldError('password')"
      >
        <input
          :id="id"
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          :aria-invalid="invalid"
          :aria-describedby="describedBy"
          :class="['field-input', invalid && 'field-input--invalid']"
          required
        />
      </FormField>

      <FormField
        id="passwordConfirmation"
        v-slot="{ id, invalid, describedBy }"
        label="Confirm password"
        :error="confirmationError"
      >
        <input
          :id="id"
          v-model="form.passwordConfirmation"
          type="password"
          autocomplete="new-password"
          :aria-invalid="invalid"
          :aria-describedby="describedBy"
          :class="['field-input', invalid && 'field-input--invalid']"
          required
        />
      </FormField>

      <AppButton type="submit" tag="button" block size="lg" :loading="submitting">
        Create account
      </AppButton>
    </form>

    <template #footer>
      Already have an account?
      <router-link :to="{ name: 'login' }" class="font-medium text-brand-600 hover:text-brand-700">
        Log in
      </router-link>
    </template>
  </AuthLayout>
</template>

<script>
import AuthLayout from "@/components/AuthLayout.vue";
import AlertBanner from "@/components/ui/AlertBanner.vue";
import AppButton from "@/components/ui/AppButton.vue";
import FormField from "@/components/ui/FormField.vue";

const MIN_PASSWORD_LENGTH = 8;

export default {
  name: "SignupView",

  components: { AlertBanner, AppButton, AuthLayout, FormField },

  data() {
    return {
      form: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirmation: "",
      },
      formError: "",
      fieldErrors: {},
      confirmationError: "",
      submitting: false,
    };
  },

  computed: {
    fullName() {
      return [this.form.firstName, this.form.lastName].filter(Boolean).join(" ");
    },
  },

  methods: {
    fieldError(name) {
      return this.fieldErrors[name]?.[0] ?? "";
    },

    /** @returns {boolean} */
    validate() {
      this.confirmationError = "";

      if (this.form.password.length < MIN_PASSWORD_LENGTH) {
        this.fieldErrors = {
          password: [`Use at least ${MIN_PASSWORD_LENGTH} characters.`],
        };
        return false;
      }
      if (this.form.password !== this.form.passwordConfirmation) {
        this.confirmationError = "The two passwords do not match.";
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
        await this.$store.dispatch("auth/signup", {
          name: this.fullName,
          email: this.form.email,
          password: this.form.password,
          // The original build sent `password` here, so a mistyped confirmation
          // was silently accepted and the account got the wrong password.
          password_confirmation: this.form.passwordConfirmation,
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
