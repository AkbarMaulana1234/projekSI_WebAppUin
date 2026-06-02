import { defineStore } from "pinia";
import { ref } from "vue";

export const useSpiPersetujuanStore = defineStore("spi-persetujuan", () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const processAction = async (
    rabId: number,
    action: "setuju" | "tolak" | "revisi",
    catatan?: string,
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<any>("/api/spi/persetujuanRab/action", {
        method: "POST",
        body: { rabId, action, catatan },
      });

      if (!response.success) {
        throw new Error(response.message || "Gagal memproses aksi persetujuan");
      }
      return response;
    } catch (err: any) {
      error.value =
        err.data?.message || err.message || "Terjadi kesalahan sistem";
      return { success: false, message: error.value };
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    processAction,
  };
});
