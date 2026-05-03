import { defineStore } from "pinia";
import { ref } from "vue";

export interface Activity {
  id: number;
  statusKegiatan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  judulKegiatan: string;
  deskripsi: string;
  totalAnggaran: number;
  fileTorUrl: string;
}

export interface SpiDashboardSummary {
  totalApprovedRab: number;
  upcomingActivities: number;
  ongoingActivities: number;
  completedActivities: number;
  totalDocumentation: number;
}

export const useSpiDashboardStore = defineStore("spi-dashboard", () => {
  const summary = ref<SpiDashboardSummary | null>(null);
  const upcomingActivities = ref<Activity[]>([]);
  const ongoingActivities = ref<Activity[]>([]);
  const completedActivities = ref<Activity[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchSpiDashboard = async () => {
    loading.value = true;
    error.value = null;
    try {
      const $fetch = useRequestFetch();
      const headers = useRequestHeaders(["cookie"]);
      const response = await $fetch<{
        success: boolean;
        summary: SpiDashboardSummary;
        upcomingActivities: Activity[];
        ongoingActivities: Activity[];
        completedActivities: Activity[];
      }>("/api/spi/dashboard", {
        headers,
      });

      summary.value = response.summary;
      upcomingActivities.value = response.upcomingActivities || [];
      ongoingActivities.value = response.ongoingActivities || [];
      completedActivities.value = response.completedActivities || [];
    } catch (err: any) {
      error.value = err.message || "Error fetching SPI dashboard data";
      console.error("SPI Dashboard Fetch Error:", err);
    } finally {
      loading.value = false;
    }
  };

  return {
    summary,
    upcomingActivities,
    ongoingActivities,
    completedActivities,
    loading,
    error,
    fetchSpiDashboard,
  };
});
