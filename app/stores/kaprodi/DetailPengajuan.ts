// FILE: app/stores/kaprodi/DetailPengajuan.ts
// Store untuk detail pengajuan Kaprodi — pola sama persis dengan stores/ppk/DetailPengajuan.ts
// Fetch detail + file blob RAB/TOR via API Kaprodi

import { defineStore } from "pinia";

interface DetailPengajuan {
  id: number;
  nomorPengajuan: string;
  judulKegiatan: string;
  deskripsi: string | null;
  totalAnggaran: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: string;
  fileRabUrl: string;
  fileTorUrl: string;
  createdAt: string;
  updatedAt: string;
  pengaju: {
    id: number | null;
    nama: string;
    email: string;
  };
  ormawa: {
    id: number | null;
    nama: string;
    kode: string;
    totalAnggaran: number;
  };
  riwayat: Array<{
    id: number;
    action: string;
    catatan: string;
    createdAt: string;
    aktor: {
      nama: string;
      role: string;
    };
  }>;
  revisionSnapshots?: Array<{
    id: string;
    createdAt: string;
    rab: { before: string | null; after: string | null };
    tor: { before: string | null; after: string | null };
  }>;
}

export const useKaprodiDetailStore = defineStore("kaprodiDetailStore", {
  state: () => ({
    detail: null as DetailPengajuan | null,
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
    async fetchFullData(rabId: number | string) {
      this.loading = true;
      this.error = null;

      this.cleanupFileUrls();

      try {
        // Fetch detail pengajuan via Kaprodi API
        const detailRes = await $fetch<{
          success: boolean;
          data: DetailPengajuan;
        }>(`/api/kaprodi/kegiatan/${Number(rabId)}`);

        if (!detailRes.success)
          throw new Error("Gagal mengambil detail pengajuan");
        this.detail = detailRes.data;

        // Fetch file RAB & TOR sebagai blob — pola sama seperti DetailRab.ts
        const [rabFileRes, torFileRes] = await Promise.all([
          $fetch(`/api/kaprodi/kegiatan/${Number(rabId)}/file`, {
            method: "POST",
            body: { documentType: "rab" },
            responseType: "blob",
          }).catch(() => null),

          $fetch(`/api/kaprodi/kegiatan/${Number(rabId)}/file`, {
            method: "POST",
            body: { documentType: "tor" },
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
        console.error("Error fetching Kaprodi detail data:", err);
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
