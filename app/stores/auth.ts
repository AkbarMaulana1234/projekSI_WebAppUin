// stores/auth.ts
import { defineStore } from "pinia";
import { ref } from "vue";

export interface User {
  id: number;
  username: string;
  role: "ormawa" | "kaprodi" | "spi" | "ppk";
  fakultas: number | null;
  prodi: number | null;
  ormawa: number | null;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const hasRole = (roles: string | string[]) => {
    if (!user.value) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.value.role);
    }
    return user.value.role === roles;
  };
  const fetchUser = async () => {
    try {
      const $fetch = useRequestFetch();
      const headers = useRequestHeaders(["cookie"]);
      const response = await $fetch<{ valid: boolean; user: User }>(
        "/api/auth/verify",
        {
          headers,
        },
      );

      user.value = response.user;
    } catch (error) {
      user.value = null;
    }
  };

  // ACTIONS: Fungsi logout biar sekalian ngumpul di sini
  const logout = async () => {
    await $fetch("/api/registrasi/logout", { method: "POST" });
    user.value = null; // Hapus state lokal
    navigateTo("/registrasi/login"); // Lempar ke halaman login
  };

  return {
    user,
    hasRole,
    fetchUser,
    logout,
  };
});
