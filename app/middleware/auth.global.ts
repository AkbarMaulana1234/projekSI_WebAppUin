import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log("masuke middleware");
  const authStore = useAuthStore();
  if (!authStore.user) {
    await authStore.fetchUser();
  }
  if (!authStore.user) {
    if (to.path !== "/registrasi/login") {
      return navigateTo("/registrasi/login");
    }
  } else {
    if (to.path === "/registrasi/login") {
      return navigateTo("/");
    }
  }
  console.log("keluar dari middleware");
});
