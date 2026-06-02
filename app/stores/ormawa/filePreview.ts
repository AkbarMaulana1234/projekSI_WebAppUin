import { defineStore } from "pinia";
import { ref } from "vue";

interface FileData {
  field: string;
  label: string;
  url: string; // This will be the data URL (base64)
  type: string; // MIME type
}

export const useFilePreviewStore = defineStore("filePreview", () => {
  const files = ref<FileData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchFiles = async (id: string) => {
    loading.value = true;
    error.value = null;
    files.value = [];
    try {
      const response = await $fetch<{ success: boolean; data: FileData[] }>(
        "/api/ormawa/dokumentasi/getFiles",
        {
          method: "POST",
          body: { id },
        }
      );
      if (response.success) {
        files.value = response.data;
      }
    } catch (err: any) {
      error.value = err.message || "Gagal mengambil file";
      console.error("Fetch files error:", err);
    } finally {
      loading.value = false;
    }
  };

  const clearFiles = () => {
    files.value = [];
  };

  return {
    files,
    loading,
    error,
    fetchFiles,
    clearFiles,
  };
});
