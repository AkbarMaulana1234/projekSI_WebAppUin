// stores/rab.ts
import { defineStore } from "pinia";

interface RabSummary {
  total: number;
  ditolak: number;
  selesai: number;
  proses: number;
}

export const useRabStore = defineStore("rab", {
  state: () => ({
    summary: null as RabSummary | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    // Contoh getter: persentase proses
    persentaseProses: (state) => {
      if (!state.summary || state.summary.total === 0) return 0;
      return (state.summary.proses / state.summary.total) * 100;
    },
  },

  actions: {
    async fetchRabSummary() {
      this.loading = true;
      this.error = null;

      try {
        const response = await $fetch<RabSummary>("/api/ormawa/dashboard"); // sesuaikan endpoint
        this.summary = response;
      } catch (err: any) {
        this.error = err.data?.statusMessage || "Gagal mengambil data RAB";
        console.error("Fetch RAB error:", err);
      } finally {
        this.loading = false;
      }
    },
  },
});
