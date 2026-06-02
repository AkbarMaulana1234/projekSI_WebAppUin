import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useKegiatanListStore = defineStore("kegiatanList", () => {
  const activities = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchActivities = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch<{ success: boolean; data: any[] }>(
        "/api/ormawa/kegiatan",
      );

      if (response && response.success) {
        activities.value = response.data;
      }
    } catch (err: any) {
      error.value = err.message || "Gagal mengambil data kegiatan";
      console.error("Fetch activities error:", err);
    } finally {
      loading.value = false;
    }
  };

  const featuredActivities = computed(() => {
    return activities.value.filter(
      (item) =>
        item.kegiatan.statusKegiatan === "SEDANG_DILAKSANAKAN" ||
        item.kegiatan.statusKegiatan === "BELUM_DILAKSANAKAN",
    );
  });

  const allActivities = computed(() => activities.value);

  return {
    activities,
    loading,
    error,
    fetchActivities,
    featuredActivities,
    allActivities,
  };
});
