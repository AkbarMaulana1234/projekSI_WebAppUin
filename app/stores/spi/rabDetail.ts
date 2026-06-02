import { defineStore } from "pinia";
import { ref } from "vue";

export const useSpiRabDetailStore = defineStore("spi-rab-detail", () => {
  const rabDetail = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // State untuk file RAB
  const fileRabBlob = ref<Blob | null>(null);
  const fileRabObjectUrl = ref<string | null>(null);
  // State untuk file TOR
  const fileTorBlob = ref<Blob | null>(null);
  const fileTorObjectUrl = ref<string | null>(null);

  const fetchFullDetail = async (rabId: number) => {
    loading.value = true;
    error.value = null;
    
    cleanupFileUrls();

    try {
      // Fetch detail textual data
      const response = await $fetch<any>("/api/spi/rab/detail", {
        method: "POST",
        body: { rabId },
      });

      if (response.success) {
        rabDetail.value = response.data;
      } else {
        throw new Error(response.message || "Gagal mengambil detail RAB");
      }

      // Fetch file blobs
      const [rabFileRes, torFileRes] = await Promise.all([
        $fetch("/api/spi/rab/file", {
          method: "POST",
          body: { rabId: Number(rabId), documentType: "rab" },
          responseType: "blob",
        }).catch(() => null),

        $fetch("/api/spi/rab/file", {
          method: "POST",
          body: { rabId: Number(rabId), documentType: "tor" },
          responseType: "blob",
        }).catch(() => null),
      ]);

      if (rabFileRes) {
        fileRabBlob.value = rabFileRes as Blob;
        fileRabObjectUrl.value = window.URL.createObjectURL(fileRabBlob.value);
      }

      if (torFileRes) {
        fileTorBlob.value = torFileRes as Blob;
        fileTorObjectUrl.value = window.URL.createObjectURL(fileTorBlob.value);
      }

    } catch (err: any) {
      error.value = err.data?.message || err.message || "Terjadi kesalahan saat memuat data";
      console.error("SPI RAB Detail Fetch Error:", err);
    } finally {
      loading.value = false;
    }
  };

  const cleanupFileUrls = () => {
    if (fileRabObjectUrl.value) {
      window.URL.revokeObjectURL(fileRabObjectUrl.value);
      fileRabObjectUrl.value = null;
      fileRabBlob.value = null;
    }
    if (fileTorObjectUrl.value) {
      window.URL.revokeObjectURL(fileTorObjectUrl.value);
      fileTorObjectUrl.value = null;
      fileTorBlob.value = null;
    }
  };

  return {
    rabDetail,
    loading,
    error,
    fileRabBlob,
    fileRabObjectUrl,
    fileTorBlob,
    fileTorObjectUrl,
    fetchFullDetail,
    cleanupFileUrls,
  };
});
