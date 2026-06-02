import { defineStore } from "pinia";
import { ref } from "vue";

interface Actor {
  fullname: string;
  role: string;
}

interface ApprovalLog {
  id: number;
  pengajuanRabId: number;
  action: "setuju" | "tolak" | "revisi";
  catatanRevisi?: string | null;
  createdAt: string;
  actor: Actor;
}

export const useSpiApprovalLogStore = defineStore("spi-approval-log", () => {
  const logs = ref<ApprovalLog[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchApprovalLogs(rabId: number | string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<any>("/api/spi/rab/approvalLog", {
        method: "POST",
        body: { rabId },
      });

      if (response.success) {
        logs.value = response.data;
      } else {
        throw new Error(response.message || "Failed to fetch approval logs");
      }
    } catch (err: any) {
      error.value = err.message || "An error occurred";
      console.error("Fetch SPI approval logs error:", err);
    } finally {
      loading.value = false;
    }
  }

  function clearLogs() {
    logs.value = [];
    error.value = null;
  }

  return {
    logs,
    loading,
    error,
    fetchApprovalLogs,
    clearLogs,
  };
});
