import { defineStore } from "pinia";
import { ref } from "vue";

export const useSpiOrmawaStore = defineStore("spi-ormawa", () => {
  const ormawa = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchOrmawa = async () => {
    loading.value = true;
    try {
      const response = await $fetch<any>("/api/spi/ormawa");
      if (response.success) {
        ormawa.value = response.data;
      }
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const addOrmawa = async (data: { 
    nama: string; 
    kode: string; 
    totalAnggaran: number; 
    fakultasId: number;
    prodiId?: number | null;
  }) => {
    loading.value = true;
    try {
      const response = await $fetch<any>("/api/spi/ormawa", {
        method: "POST",
        body: data,
      });
      if (response.success) {
        await fetchOrmawa();
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
    ormawa,
    loading,
    error,
    fetchOrmawa,
    addOrmawa,
  };
});
