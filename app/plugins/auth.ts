import { useAuthStore } from "~/stores/auth";

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();

  // Hanya fetch user di client-side, bukan di SSR
  if (process.client && !authStore.user) {
    await authStore.fetchUser();
  }
});
