import { defineStore } from "pinia";
import { ref } from "vue";

interface User {
  fullname: string;
  role: string;
}

interface Log {
  id: number;
  action: "review" | "approve" | "reject" | "pay" | "revisi";
  komentar: string;
  createdAt: string;
  user: User;
}

export const useLogDokumentasiTagihanStore = defineStore("logDokumentasiTagihan", () => {
  const logs = ref<Log[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchLogs = async (id: string) => {
    loading.value = true;
    error.value = null;
    logs.value = [];
    try {
      const response = await $fetch<{ success: boolean; data: Log[] }>(
        "/api/ormawa/dokumentasi/getLogs",
        {
          method: "POST",
          body: { id },
        }
      );
      if (response.success) {
        logs.value = response.data;
      }
    } catch (err: any) {
      error.value = err.message || "Gagal mengambil log";
      console.error("Fetch logs error:", err);
    } finally {
      loading.value = false;
    }
  };

  const clearLogs = () => {
    logs.value = [];
  };

  return {
    logs,
    loading,
    error,
    fetchLogs,
    clearLogs,
  };
});
