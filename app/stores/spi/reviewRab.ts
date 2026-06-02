import { createPinia } from "pinia";

export const rabReviewStore = defineStore("rabReviewStore", () => {
  const rabList = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const page = ref(1);
  const limit = ref(10);
  const total = ref(0);

  const query = {
    page: page.value,
    limit: limit.value,
  };
  const fetchRabList = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch<any>("/api/spi/rab", {
        method: "GET",
        query,
      });

      if (response.success) {
        rabList.value = response.data;
        total.value = response.total;
      } else {
        error.value = response.message;
      }
    } catch (err: any) {
      error.value = err.message || "Gagal mengambil data RAB";
    } finally {
      loading.value = false;
    }
  };

  return {
    fetchRabList,
    loading,
    rabList,
    error,
    page,
    total,
    limit,
  };
});
