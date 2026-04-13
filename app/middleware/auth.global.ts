// middleware/auth.global.ts
import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  if (!authStore.user) {
    await authStore.fetchUser();
  }

  if (!authStore.user) {
    if (from.path == "/registrasi/login" || to.path == "/registrasi/login") {
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
    kaprodi: [`/dashboard/${role}`],
    ormawa: [`/dashboard/${role}`],
    ppk: [`/dashboard/${role}`],
    spi: [`/dashboard/${role}`],
  };
  const allowedPaths = roleAccess[role] || [defaultPath];
  const isAllowed = allowedPaths.some((prefix) => {
    console.log(prefix);
    return to.path === prefix || to.path.startsWith(prefix + "/");
  });
  console.log(to.path.startsWith("/dashboard"));
  if (allowedPaths.includes(to.path)) {
    return;
  }
  if (isAllowed) {
    return;
  }
  return navigateTo(defaultPath);
});
