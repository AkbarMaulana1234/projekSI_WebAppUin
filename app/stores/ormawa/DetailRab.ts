import { defineStore } from "pinia";

interface DetailRab {
  id: number;
  nomorPengajuan: string;
  judulKegiatan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsi: string | null;
  fileRabUrl: string;
  fileTorUrl: string;
  totalAnggaran: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const useRabStore = defineStore("rabStore", {
  state: () => ({
    detail: null as DetailRab | null,
    // State untuk file RAB
    fileRabBlob: null as Blob | null,
    fileRabObjectUrl: null as string | null,
    // State untuk file TOR
    fileTorBlob: null as Blob | null,
    fileTorObjectUrl: null as string | null,

    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchFullRabData(rabId: number | string) {
      this.loading = true;
      this.error = null;

      this.cleanupFileUrls();

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

        const [rabFileRes, torFileRes] = await Promise.all([
          $fetch("/api/ormawa/Rab/fileSend", {
            method: "POST",
            body: { rabId: Number(rabId), documentType: "rab" },
            responseType: "blob",
          }).catch(() => null),

          $fetch("/api/ormawa/Rab/fileSend", {
            method: "POST",
            body: { rabId: Number(rabId), documentType: "tor" },
            responseType: "blob",
          }).catch(() => null),
        ]);

        if (rabFileRes) {
          this.fileRabBlob = rabFileRes as Blob;
          this.fileRabObjectUrl = window.URL.createObjectURL(this.fileRabBlob);
        }

        if (torFileRes) {
          this.fileTorBlob = torFileRes as Blob;
          this.fileTorObjectUrl = window.URL.createObjectURL(this.fileTorBlob);
        }
      } catch (err: any) {
        this.error =
          err.data?.message ||
          err.message ||
          "Terjadi kesalahan saat memuat data";
        console.error("Error fetching RAB/TOR data:", err);
      } finally {
        this.loading = false;
      }
    },

    cleanupFileUrls() {
      if (this.fileRabObjectUrl) {
        window.URL.revokeObjectURL(this.fileRabObjectUrl);
        this.fileRabObjectUrl = null;
        this.fileRabBlob = null;
      }
      if (this.fileTorObjectUrl) {
        window.URL.revokeObjectURL(this.fileTorObjectUrl);
        this.fileTorObjectUrl = null;
        this.fileTorBlob = null;
      }
    },
  },
});
