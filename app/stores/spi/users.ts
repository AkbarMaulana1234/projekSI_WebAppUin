import { defineStore } from "pinia";
import { ref } from "vue";

export const useSpiUsersStore = defineStore("spi-users", () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const addUser = async (data: any) => {
    loading.value = true;
    try {
      const response = await $fetch<any>("/api/spi/users", {
        method: "POST",
        body: data,
      });
      return response;
    } catch (err: any) {
      return { success: false, message: err.message };
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    addUser,
  };
});
