import { defineStore } from "pinia";
import { useUploadLpjStore } from "./uploadLpj";
import { useRabStore } from "./DetailRab";

export const useDetailLpgStore = defineStore("detailLpg", {
  state: () => ({
    loading: false,
    error: null as string | null,
    fileLpgBlob: null as Blob | null,
    fileLpgObjectUrl: null as string | null,
  }),

  actions: {
    async fetchFullLpgData(rabId: number) {
      this.loading = true;
      this.error = null;

      const uploadLpjStore = useUploadLpjStore();
      const rabStore = useRabStore();

      this.cleanupFileUrls();

      try {
        await Promise.all([
          rabStore.fetchFullRabData(rabId),
          uploadLpjStore.fetchLpgDetail(rabId),
        ]);

        // If LPG exists, try to fetch the physical file blob
        if (uploadLpjStore.lpg) {
          const fileRes = await $fetch("/api/ormawa/Lpg/fileSend", {
            method: "POST",
            body: { rabId },
            responseType: "blob",
          }).catch(() => null);
          if (fileRes) {
            this.fileLpgBlob = fileRes as Blob;
            this.fileLpgObjectUrl = window.URL.createObjectURL(
              this.fileLpgBlob,
            );
          }
        }
      } catch (err: any) {
        this.error =
          err.data?.message || err.message || "Gagal mengambil detail LPG";
        console.error("Error fetching LPG data:", err);
      } finally {
        this.loading = false;
      }
    },

    cleanupFileUrls() {
      if (this.fileLpgObjectUrl) {
        window.URL.revokeObjectURL(this.fileLpgObjectUrl);
        this.fileLpgObjectUrl = null;
        this.fileLpgBlob = null;
      }
    },
  },
});
