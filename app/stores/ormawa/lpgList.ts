import { defineStore } from "pinia";

export interface LpgReadyRab {
  rabId: number;
  nomorPengajuan: string;
  judulKegiatan: string;
  totalAnggaran: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  statusRab: string;
  statusKegiatan: string;
  kegiatanId: number;
  lpgStatus: string | null;
  lpgId: number | null;
  submittedAt?: string | null;
}

export const useLpgListStore = defineStore("lpgList", {
  state: () => ({
    readyRabs: [] as LpgReadyRab[],
    historyRabs: [] as LpgReadyRab[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchReadyRabs() {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch<{ success: boolean; data: { ready: LpgReadyRab[], history: LpgReadyRab[] } }>(
          "/api/ormawa/Lpg/listReady"
        );
        if (response.success) {
          this.readyRabs = response.data.ready;
          this.historyRabs = response.data.history;
        }
      } catch (err: any) {
        this.error = err.data?.message || "Gagal mengambil daftar RAB untuk LPG";
        console.error("Fetch ready RABs error:", err);
      } finally {
        this.loading = false;
      }
    },
  },
});
