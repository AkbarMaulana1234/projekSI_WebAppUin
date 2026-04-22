// stores/approveLog.ts
import { defineStore } from "pinia";

interface Actor {
  fullname: string;
  role: string;
}

interface ApprovalLog {
  id: number;
  pengajuanRabId: number;
  actorId: number;
  action: "setuju" | "tolak" | "revisi";
  catatanRevisi?: string | null;
  createdAt: string;
  actor: Actor;
}

interface ApprovalLogResponse {
  success: boolean;
  data: ApprovalLog[];
}

export const useApproveLog = defineStore("approveLog", () => {
  const logs = ref<ApprovalLog[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const hasLogs = computed(() => logs.value.length > 0);
  const latestLog = computed(() => logs.value[logs.value.length - 1]);

  // Contoh getter untuk memfilter berdasarkan action
  const approvedLogs = computed(() =>
    logs.value.filter((log) => log.action === "setuju"),
  );
  const rejectedLogs = computed(() =>
    logs.value.filter((log) => log.action === "tolak"),
  );
  const revisionLogs = computed(() =>
    logs.value.filter((log) => log.action === "revisi"),
  );

  async function fetchApprovalLogs(rabId: number | string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<ApprovalLogResponse>(
        "/api/ormawa/Rab/approvalLog",
        {
          method: "POST",
          body: { rabId },
        },
      );

      if (response.success) {
        logs.value = response.data;
      } else {
        throw new Error("Failed to fetch approval logs");
      }
    } catch (err: any) {
      error.value = err.message || "An error occurred";
      console.error("Fetch approval logs error:", err);
    } finally {
      loading.value = false;
    }
  }

  function clearLogs() {
    logs.value = [];
    error.value = null;
  }

  function addLog(log: ApprovalLog) {
    logs.value.push(log);
  }

  return {
    logs,
    loading,
    error,
    hasLogs,
    latestLog,
    approvedLogs,
    rejectedLogs,
    revisionLogs,
    fetchApprovalLogs,
    clearLogs,
    addLog,
  };
});
