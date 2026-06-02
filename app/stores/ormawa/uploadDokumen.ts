// stores/ormawa/uploadDokumen.ts
import { defineStore } from "pinia";
import { useDokumentasiStore } from "./allDokumen";

export const useKegiatanStore = defineStore("kegiatan", {
  state: () => ({
    // State untuk indikator loading saat upload
    dokumentasiUploading: false,
    barangUploading: false,
    jasaUploading: false,

    // State untuk notifikasi popup
    popupMessage: "",
    popupVisible: false,

    // Data kegiatan (jika diperlukan oleh parent)
    loading: false,
    kegiatan: null as any,
    dokumentasiList: [] as any[],
    barangList: [] as any[],
    jasaList: [] as any[],

    // Form data yang sesuai dengan database
    formBarang: {
      kegiatanId: null as number | null,
      tokoNama: "",
      tokoAlamat: "",
      namaPenerima: "",
      rekeningPenerima: "",
      bankPenerima: "",
      nominal: 0,
      fotoStruk: null as any,
      fotoBarang: null as any,
    },

    formJasa: {
      kegiatanId: null as number | null,
      namaPenerima: "",
      rekeningPenerima: "",
      bankPenerima: "",
      nominal: 0,
      skNomor: "",
      skFile: null as any,
      spmtNomor: "",
      spmtFile: null as any,
      amprahNomor: "",
      amprahFile: null as any,
      npwpNomor: "",
      npwpFile: null as any,
      ktpNomor: "",
      ktpFile: null as any,
      bukuRekeningFile: null as any,
    },
  }),

  actions: {
    async submitDokumentasi(fd: FormData) {
      const dokumentasiStore = useDokumentasiStore();
      this.dokumentasiUploading = true;
      try {
        await $fetch("/api/ormawa/dokumentasi/dokumentasiKegiatan", {
          method: "POST",
          body: fd,
        });
        this.popupMessage = "Berhasil mengupload dokumentasi kegiatan";
        this.popupVisible = true;

        // Refresh list dokumentasi
        const kegiatanId = Number(fd.get("kegiatanId"));
        if (kegiatanId) {
          await dokumentasiStore.refreshDokumentasi(kegiatanId);
        }
      } catch {
        alert("Gagal upload dokumentasi");
      } finally {
        this.dokumentasiUploading = false;
      }
    },

    async submitBarang(fd: FormData) {
      const dokumentasiStore = useDokumentasiStore();
      this.barangUploading = true;
      try {
        await $fetch("/api/ormawa/dokumentasi/dokumentasiBarang", {
          method: "POST",
          body: fd,
        });
        this.popupMessage = "Berhasil mengupload barang";
        this.popupVisible = true;

        const kegiatanId = Number(fd.get("kegiatanId"));
        if (kegiatanId) {
          await dokumentasiStore.refreshDokumentasi(kegiatanId);
        }
      } catch {
        alert("Gagal upload barang");
      } finally {
        this.barangUploading = false;
      }
    },

    async submitJasa(fd: FormData) {
      const dokumentasiStore = useDokumentasiStore();
      this.jasaUploading = true;
      try {
        await $fetch("/api/ormawa/dokumentasi/dokumentasiJasa", {
          method: "POST",
          body: fd,
        });
        this.popupMessage = "Berhasil mengupload jasa";
        this.popupVisible = true;
        const kegiatanId = Number(fd.get("kegiatanId"));
        if (kegiatanId) {
          await dokumentasiStore.refreshDokumentasi(kegiatanId);
        }
      } catch {
        alert("Gagal upload jasa");
      } finally {
        this.jasaUploading = false;
      }
    },

    async deleteUpload(item: any) {
      const dokumentasiStore = useDokumentasiStore();
      try {
        await $fetch(`/api/ormawa/dokumentasi/dokumentasi`, {
          method: "DELETE",
          body: { id: item.id },
        });

        if (item.kegiatanId) {
          await dokumentasiStore.refreshDokumentasi(
            item.kegiatanId,
            dokumentasiStore.currentPage,
            dokumentasiStore.perPage,
          );
        }

        this.popupMessage = `Berhasil hapus ${item.jenisLabel || "dokumentasi"}`;
        this.popupVisible = true;
        return { success: true };
      } catch (error) {
        console.error("Gagal hapus:", error);
        this.popupMessage = "Gagal menghapus dokumentasi";
        this.popupVisible = true;
        return { success: false };
      }
    },

    async updateDokumentasi(fd: FormData, kegiatanId: number) {
      const dokumentasiStore = useDokumentasiStore();
      try {
        const response = await $fetch(`/api/ormawa/dokumentasi/dokumentasi`, {
          method: "PATCH",
          body: fd,
        });
        console.log(response);
        if (kegiatanId) {
          await dokumentasiStore.refreshDokumentasi(
            kegiatanId,
            dokumentasiStore.currentPage,
            dokumentasiStore.perPage,
          );
        }

        this.popupMessage = "Dokumentasi berhasil diperbarui";
        this.popupVisible = true;
        return { success: true };
      } catch (error) {
        console.error("Gagal update:", error);
        this.popupMessage = "Gagal memperbarui dokumentasi";
        this.popupVisible = true;
        return { success: false };
      }
    },

    resetForms() {
      this.formBarang = {
        kegiatanId: null,
        tokoNama: "",
        tokoAlamat: "",
        namaPenerima: "",
        rekeningPenerima: "",
        bankPenerima: "",
        nominal: 0,
        fotoStruk: null,
        fotoBarang: null,
      };
      this.formJasa = {
        kegiatanId: null,
        namaPenerima: "",
        rekeningPenerima: "",
        bankPenerima: "",
        nominal: 0,
        skNomor: "",
        skFile: null,
        spmtNomor: "",
        spmtFile: null,
        amprahNomor: "",
        amprahFile: null,
        npwpNomor: "",
        npwpFile: null,
        ktpNomor: "",
        ktpFile: null,
        bukuRekeningFile: null,
      };
    },

    closePopup() {
      this.popupVisible = false;
    },

    // Method dummy untuk fetch data kegiatan jika diperlukan (untuk detail page)
    async fetchKegiatan(id: number) {
      this.loading = true;
      try {
        // Implementasi fetch kegiatan jika ada API-nya
      } finally {
        this.loading = false;
      }
    },
  },
});
