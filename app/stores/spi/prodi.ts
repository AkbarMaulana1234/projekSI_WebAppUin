import { defineStore } from "pinia";
import { ref } from "vue";

export const useSpiProdiStore = defineStore("spi-prodi", () => {
  const prodi = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchProdi = async () => {
    loading.value = true;
    try {
      const response = await $fetch<any>("/api/spi/prodi");
      if (response.success) {
        prodi.value = response.data;
      }
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const addProdi = async (data: { nama: string; kode: string; fakultasId: number }) => {
    loading.value = true;
    try {
      const response = await $fetch<any>("/api/spi/prodi", {
        method: "POST",
        body: data,
      });
      if (response.success) {
        await fetchProdi();
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
    prodi,
    loading,
    error,
    fetchProdi,
    addProdi,
  };
});
