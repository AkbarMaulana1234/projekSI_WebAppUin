import { defineStore } from "pinia";

// Interface sesuai schema Drizzle kamu
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
    fileBlob: null as Blob | null, // Simpan file di sini
    fileObjectUrl: null as string | null, // URL untuk <img> atau <iframe>
    loading: false,
    error: null as string | null,
  }),

  actions: {
    /**
     * Action Utama untuk fetch Metadata sekaligus Filenya
     */
    async fetchFullRabData(rabId: number | string) {
      this.loading = true;
      this.error = null;

      // Bersihkan data lama jika ada
      this.cleanupFileUrl();

      try {
        // --- REQUEST 1: Ambil Metadata (JSON) ---
        const detailRes = await $fetch<{ success: boolean; data: DetailRab }>(
          "/api/ormawa/Rab/detailRab",
          {
            method: "POST",
            body: { rabId: Number(rabId) },
          },
        );

        if (!detailRes.success) throw new Error("Gagal mengambil detail RAB");
        this.detail = detailRes.data;

        // --- REQUEST 2: Ambil File Fisik (Stream/Blob) ---
        // Kita panggil endpoint fileRab menggunakan rabId yang sama
        const fileRes = await $fetch("/api/ormawa/Rab/fileRab", {
          method: "POST",
          body: { rabId: Number(rabId) },
          responseType: "blob", // PENTING: Supaya diterima sebagai data biner
        });

        // Simpan ke state
        this.fileBlob = fileRes as Blob;

        // Buat URL yang bisa dibaca browser (untuk preview)
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
