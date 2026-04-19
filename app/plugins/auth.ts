import { useAuthStore } from "~/stores/auth";
export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();

  // Kalau halamannya direfresh dan state user kosong, suruh Pinia ambil datanya
  if (!authStore.user) {
    await authStore.fetchUser();
  }
});
