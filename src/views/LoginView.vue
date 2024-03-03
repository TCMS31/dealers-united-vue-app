<template>
  <AuthLayout title="Welcome back" subtitle="Log in to see the capsules you have waiting.">
    <form class="space-y-5" novalidate @submit.prevent="onSubmit">
      <AlertBanner :message="formError" />

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
        :error="fieldError('password')"
      >
        <input
          :id="id"
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          :aria-invalid="invalid"
          :aria-describedby="describedBy"
          :class="['field-input', invalid && 'field-input--invalid']"
          placeholder="••••••••"
          required
        />
      </FormField>

      <AppButton type="submit" tag="button" block size="lg" :loading="submitting">
        Log in
      </AppButton>
    </form>

    <template #footer>
      Don't have an account?
      <router-link :to="{ name: 'signup' }" class="font-medium text-brand-600 hover:text-brand-700">
        Sign up
      </router-link>
    </template>
  </AuthLayout>
</template>

<script>
import AuthLayout from "@/components/AuthLayout.vue";
import AlertBanner from "@/components/ui/AlertBanner.vue";
import AppButton from "@/components/ui/AppButton.vue";
import FormField from "@/components/ui/FormField.vue";

export default {
  name: "LoginView",

  components: { AlertBanner, AppButton, AuthLayout, FormField },

  data() {
    return {
      form: { email: "", password: "" },
      formError: "",
      fieldErrors: {},
      submitting: false,
    };
  },

  methods: {
    /**
     * @param {string} name
     * @returns {string} the first server-side message for a field
     */
    fieldError(name) {
      return this.fieldErrors[name]?.[0] ?? "";
    },

    async onSubmit() {
      this.formError = "";
      this.fieldErrors = {};

      if (!this.form.email || !this.form.password) {
        this.formError = "Enter your email address and password.";
        return;
      }

      this.submitting = true;
      try {
        await this.$store.dispatch("auth/login", { ...this.form });
        const redirect = this.$route.query.redirect;
        this.$router.push(
          typeof redirect === "string" && redirect.startsWith("/") ? redirect : { name: "capsules" }
        );
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
