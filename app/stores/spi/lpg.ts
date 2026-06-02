import { defineStore } from "pinia";

export interface SpiLpgListItem {
  lpgId: number | null;
  statusLpg: string | null;
  submittedAt: string | null;
  judulKegiatan: string;
  nomorPengajuan: string;
  ormawaName: string;
  rabId: number;
  totalAnggaran: string;
  rabStatus: string;
}

export const useSpiLpgStore = defineStore("spiLpg", {
  state: () => ({
    lpgList: [] as SpiLpgListItem[],
    detail: null as any,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchLpgList() {
      this.loading = true;
      this.error = null;
      try {
        const res = await $fetch<{ success: boolean; data: SpiLpgListItem[] }>("/api/spi/lpg/list");
        if (res.success) {
          this.lpgList = res.data;
        }
      } catch (err: any) {
        this.error = err.data?.message || "Gagal mengambil daftar LPG";
      } finally {
        this.loading = false;
      }
    },

    async fetchLpgDetail(lpgId: number) {
      this.loading = true;
      this.error = null;
      try {
        const res = await $fetch<{ success: boolean; data: any }>("/api/spi/lpg/detail", {
          method: "POST",
          body: { lpgId },
        });
        if (res.success) {
          this.detail = res.data;
        }
      } catch (err: any) {
        this.error = err.data?.message || "Gagal mengambil detail LPG";
      } finally {
        this.loading = false;
      }
    },

    async reviewLpg(lpgId: number, action: 'approve' | 'revision', notes: string) {
      this.loading = true;
      this.error = null;
      try {
        const res = await $fetch<{ success: boolean; message: string }>("/api/spi/lpg/review", {
          method: "POST",
          body: { lpgId, action, notes },
        });
        return res;
      } catch (err: any) {
        this.error = err.data?.message || "Gagal memproses review LPG";
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
