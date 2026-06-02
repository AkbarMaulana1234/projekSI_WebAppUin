<template>
  <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm transition-all"
          >
            <Icon name="heroicons:arrow-left" class="w-5 h-5" />
          </button>
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25"
          >
            <Icon name="heroicons:document-text" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">
              Upload LPJ
            </h1>
            <p class="text-slate-500">
              Laporan Pertanggungjawaban Kegiatan
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form Upload -->
        <div class="lg:col-span-2">
          <form @submit.prevent="submitLpj" class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-6 sm:p-8 space-y-6">
              
              <!-- Upload LPJ -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2"
                  >File LPJ <span class="text-red-500">*</span></label
                >
                <div
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleFileDrop"
                  :class="[
                    'border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer',
                    isDragging
                      ? 'border-[#3b5988] bg-[#3b5988]/5'
                      : file
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : 'border-slate-300 hover:border-amber-500 hover:bg-amber-500/5',
                  ]"
                  @click="() => $refs.fileInput.click()"
                >
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".pdf"
                    class="hidden"
                    @change="handleFileSelect"
                  />
                  <div v-if="!file" class="space-y-2">
                    <div class="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                      <Icon name="heroicons:document-arrow-up" class="w-6 h-6 text-slate-400" />
                    </div>
                    <p class="text-sm font-medium text-slate-900">
                      Klik atau drag & drop untuk upload LPJ
                    </p>
                    <p class="text-xs text-slate-500">
                      Hanya PDF (Max 10MB)
                    </p>
                  </div>
                  <div v-else class="space-y-2">
                    <div class="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                      <Icon name="heroicons:document-check" class="w-6 h-6 text-emerald-600" />
                    </div>
                    <p class="text-sm font-medium text-emerald-700">
                      {{ file.name }}
                    </p>
                    <p class="text-xs text-emerald-600">
                      {{ formatFileSize(file.size) }}
                    </p>
                    <button
                      type="button"
                      @click.stop="removeFile"
                      class="text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <p v-if="errorMsg" class="mt-1 text-sm text-red-500">
                  {{ errorMsg }}
                </p>
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">
                  Catatan Pengajuan
                  <span class="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                  v-model="ormawaNotes"
                  rows="4"
                  placeholder="Tambahkan catatan jika ada..."
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                type="submit"
                :disabled="isSubmitting || !file"
                class="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-70"
              >
                <Icon
                  v-if="isSubmitting"
                  name="heroicons:arrow-path"
                  class="w-5 h-5 animate-spin"
                />
                <Icon v-else name="heroicons:paper-airplane" class="w-5 h-5" />
                {{ isSubmitting ? "Mengirim..." : "Upload LPJ" }}
              </button>
            </div>
          </form>
        </div>

        <!-- History Sidebar -->
        <div class="space-y-6">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Icon name="heroicons:clipboard-document-list" class="w-5 h-5 text-amber-500" />
              Riwayat Revisi LPJ
            </h3>

            <div v-if="loadingLogs" class="text-center py-4">
               <Icon name="heroicons:arrow-path" class="w-6 h-6 animate-spin text-slate-400 mx-auto" />
            </div>
            
            <div v-else-if="logs.length === 0" class="text-center py-8 text-slate-500 text-sm">
               Belum ada riwayat revisi dari SPI.
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="log in logs"
                :key="log.id"
                class="p-4 rounded-xl bg-amber-50 border border-amber-200"
              >
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center bg-amber-500 text-white font-bold text-xs">
                      {{ log.actor?.fullname?.charAt(0) || "S" }}
                    </div>
                    <div>
                      <p class="font-semibold text-xs text-slate-900">
                        {{ log.actor?.fullname || "SPI" }}
                      </p>
                      <p class="text-[10px] text-slate-500">
                        {{ formatDate(log.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>
                <p class="text-xs text-slate-700 leading-relaxed bg-white/50 p-2 rounded-lg">
                  {{ log.catatanRevisi || "Revisi LPJ diminta" }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUploadLpjStore } from "~/stores/ormawa/uploadLpj";

const route = useRoute();
const lpjStore = useUploadLpjStore();

const isDragging = ref(false);
const isSubmitting = ref(false);
const file = ref<File | null>(null);
const ormawaNotes = ref("");
const errorMsg = ref("");

const logs = ref<any[]>([]);
const loadingLogs = ref(false);

const rabId = route.params.id as string;

const goBack = () => navigateTo("/dashboard/ormawa");

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const handleFileSelect = (e: any) => {
  const selectedFile = e.target.files[0];
  if (selectedFile) processFile(selectedFile);
};

const handleFileDrop = (e: any) => {
  isDragging.value = false;
  const droppedFile = e.dataTransfer.files[0];
  if (droppedFile) processFile(droppedFile);
};

const processFile = (f: File) => {
  errorMsg.value = "";
  if (f.type !== "application/pdf") {
    errorMsg.value = "File harus berformat PDF";
    return;
  }
  if (f.size > 10 * 1024 * 1024) {
    errorMsg.value = "Ukuran file maksimal 10MB";
    return;
  }
  file.value = f;
};

const removeFile = () => {
  file.value = null;
  errorMsg.value = "";
};

const fetchLpjData = async () => {
  loadingLogs.value = true;
  try {
    const res: any = await $fetch("/api/ormawa/Lpg/getLpj", {
      method: "POST",
      body: { rabId: Number(rabId) }
    });
    if (res.success && res.logs) {
      logs.value = res.logs;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loadingLogs.value = false;
  }
};

const submitLpj = async () => {
  if (!file.value) {
    errorMsg.value = "Silakan pilih file terlebih dahulu";
    return;
  }
  
  isSubmitting.value = true;
  try {
    await lpjStore.uploadLpj(Number(rabId), file.value, ormawaNotes.value);
    alert("Berhasil mengupload LPJ");
    goBack();
  } catch (error: any) {
    alert(error.message || "Gagal mengupload LPJ");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchLpjData();
});
</script>
