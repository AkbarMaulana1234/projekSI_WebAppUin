import { defineStore } from "pinia";

interface LpgData {
  id: number;
  kegiatanId: number;
  fileLpgUrl: string;
  statusLpg: string;
  spiNotes: string | null;
  ormawaNotes: string | null;
  submittedAt: string;
}

interface LpgLog {
  id: number;
  catatanRevisi: string;
  createdAt: string;
  actor: {
    fullname: string;
    role: string;
  };
}

export const useUploadLpjStore = defineStore("uploadLpj", {
  state: () => ({
    lpg: null as LpgData | null,
    logs: [] as LpgLog[],
    loading: false,
    fetching: false,
    error: null as string | null,
    successMessage: null as string | null,
  }),

  actions: {
    async fetchLpgDetail(rabId: number) {
      this.fetching = true;
      this.error = null;
      try {
        const response = await $fetch<{ success: boolean; data: LpgData | null; logs: LpgLog[] }>(
          "/api/ormawa/Lpg/getLpj",
          {
            method: "POST",
            body: { rabId },
          }
        );
        if (response.success) {
          this.lpg = response.data;
          this.logs = response.logs;
        }
      } catch (err: any) {
        this.error = err.data?.message || "Gagal mengambil data LPG";
      } finally {
        this.fetching = false;
      }
    },

    async uploadLpj(rabId: number, file: File, ormawaNotes: string) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;

      try {
        const formData = new FormData();
        formData.append("rabId", rabId.toString());
        formData.append("fileLpj", file);
        if (ormawaNotes) {
          formData.append("ormawaNotes", ormawaNotes);
        }

        const response = await $fetch<{ success: boolean; message: string }>("/api/ormawa/Lpg/uploadLpj", {
          method: "POST",
          body: formData,
        });

        if (response.success) {
          this.successMessage = response.message;
          await this.fetchLpgDetail(rabId); // Refresh after upload
        }
        return response;
      } catch (err: any) {
        this.error = err.data?.message || err.message || "Gagal mengupload LPJ";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    clearState() {
      this.lpg = null;
      this.logs = [];
      this.error = null;
      this.successMessage = null;
    }
  },
});
