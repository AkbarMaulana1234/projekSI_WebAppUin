import { defineStore } from "pinia";
import { ref } from "vue";

export const useSpiFakultasStore = defineStore("spi-fakultas", () => {
  const fakultas = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchFakultas = async () => {
    loading.value = true;
    try {
      const response = await $fetch<any>("/api/spi/fakultas");
      if (response.success) {
        fakultas.value = response.data;
      }
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const addFakultas = async (data: { nama: string; kode: string }) => {
    loading.value = true;
    try {
      const response = await $fetch<any>("/api/spi/fakultas", {
        method: "POST",
        body: data,
      });
      if (response.success) {
        await fetchFakultas();
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (err: any) {
      return { success: false, message: err.message };
    } finally {
      loading.value = false;
    }
  };

  return {
    fakultas,
    loading,
    error,
    fetchFakultas,
    addFakultas,
  };
});
