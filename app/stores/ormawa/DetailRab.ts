import { defineStore } from "pinia";

interface DetailRab {
  id: number;
  nomorPengajuan: string;
  judulKegiatan: string;
  deskripsi: string | null;
  fileRabUrl: string;
  totalAnggaran: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const useRabStore = defineStore("rabStore", {
  state: () => ({
    detail: null as DetailRab | null,
    fileBlob: null as Blob | null,
    fileObjectUrl: null as string | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchFullRabData(rabId: number | string) {
      this.loading = true;
      this.error = null;

      this.cleanupFileUrl();

      try {
        const detailRes = await $fetch<{ success: boolean; data: DetailRab }>(
          "/api/ormawa/Rab/detailRab",
          {
            method: "POST",
            body: { rabId: Number(rabId) },
          },
        );

        if (!detailRes.success) throw new Error("Gagal mengambil detail RAB");
        this.detail = detailRes.data;

        const fileRes = await $fetch("/api/ormawa/Rab/fileRab", {
          method: "POST",
          body: { rabId: Number(rabId) },
          responseType: "blob",
        });

        this.fileBlob = fileRes as Blob;

        this.fileObjectUrl = window.URL.createObjectURL(this.fileBlob);
      } catch (err: any) {
        this.error = err.data?.message || err.message || "Terjadi kesalahan";
        console.error("Error fetching RAB data:", err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Bersihkan URL objek agar tidak memory leak
     */
    cleanupFileUrl() {
      if (this.fileObjectUrl) {
        window.URL.revokeObjectURL(this.fileObjectUrl);
        this.fileObjectUrl = null;
      }
    },
  },
});
