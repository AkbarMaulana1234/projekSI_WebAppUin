// middleware/auth.global.ts
import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware di SSR untuk halaman login
  if (to.path === "/registrasi/login") {
    return;
  }

  const authStore = useAuthStore();
  
  if (!authStore.user) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      // Kalau fetch gagal, redirect ke login
      return navigateTo("/registrasi/login");
    }
  }

  if (!authStore.user) {
    if (from.path === "/registrasi/login" || to.path === "/registrasi/login") {
      return;
    }
    return navigateTo("/registrasi/login");
  }

  const { role } = authStore.user;
  const defaultPath = `/dashboard/${role}`;
  
  if (to.path === "/registrasi/login") {
    return navigateTo(defaultPath);
  }

  const roleAccess: Record<string, string[]> = {
    kaprodi: [`/dashboard/${role}`, `/dashboard/${role}/`],
    ormawa: [`/dashboard/${role}`, `/dashboard/${role}/`],
    ppk: [`/dashboard/${role}`, `/dashboard/${role}/`],
    spi: [`/dashboard/${role}`, `/dashboard/${role}/`],
  };

  const allowedPaths = roleAccess[role] || [defaultPath];
  const isAllowed = allowedPaths.some((prefix) => {
    return to.path === prefix || to.path.startsWith(prefix + "/");
  });

  if (isAllowed) {
    return;
  }

  return navigateTo(defaultPath);
});
