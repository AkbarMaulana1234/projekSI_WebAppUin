<script setup lang="ts">
  import { useUploadLpjStore } from "~/stores/ormawa/uploadLpj";
  import { useRabStore } from "~/stores/ormawa/DetailRab";
  import { useDetailLpgStore } from "~/stores/ormawa/DetailLpg";

  const route = useRoute();
  const uploadLpjStore = useUploadLpjStore();
  const rabStore = useRabStore();
  const detailLpgStore = useDetailLpgStore();

  const rabId = Number(route.params.id);

  onMounted(() => {
    detailLpgStore.fetchFullLpgData(rabId);
  });

  onUnmounted(() => {
    detailLpgStore.cleanupFileUrls();
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRupiah = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "WAITING_SPI":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "DISETUJUI":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "REVISI_SPI":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "WAITING_SPI":
        return "Menunggu Review SPI";
      case "DISETUJUI":
        return "Disetujui SPI";
      case "REVISI_SPI":
        return "Perlu Revisi";
      default:
        return "Status Tidak Diketahui";
    }
  };
</script>

<template>
  <div class="p-8 max-w-6xl mx-auto min-h-screen pb-20">
    <div
      v-if="detailLpgStore.loading"
      class="flex flex-col items-center justify-center py-32"
    >
      <Icon
        name="lucide:loader-2"
        class="w-12 h-12 text-blue-600 animate-spin mb-4"
      />
      <p class="text-slate-500 font-medium tracking-tight">
        Memuat detail dokumen...
      </p>
    </div>

    <div
      v-else-if="detailLpgStore.error"
      class="bg-rose-50 border border-rose-200 p-8 rounded-xl text-center"
    >
      <p class="text-rose-600 font-medium">{{ detailLpgStore.error }}</p>
    </div>

    <div v-else-if="rabStore.detail && uploadLpjStore.lpg" class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/dashboard/ormawa/lpg"
            class="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            <Icon name="lucide:arrow-left" class="w-5 h-5" />
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">
              Detail Laporan Pertanggungjawaban
            </h1>
            <p class="text-sm text-slate-500 font-medium">
              #{{ rabStore.detail.nomorPengajuan }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span
            class="px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest shadow-sm"
            :class="getStatusBadgeClass(uploadLpjStore.lpg.statusLpg)"
          >
            {{ getStatusLabel(uploadLpjStore.lpg.statusLpg) }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Info Card -->
          <div
            class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm relative overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 -z-0"
            ></div>

            <div class="relative z-10">
              <div class="mb-6">
                <p
                  class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1"
                >
                  Informasi Kegiatan
                </p>
                <h2 class="text-xl font-black text-slate-900 leading-tight">
                  {{ rabStore.detail.judulKegiatan }}
                </h2>
              </div>

              <div
                class="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div>
                  <p
                    class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1"
                  >
                    Anggaran Disetujui
                  </p>
                  <p class="text-lg font-black text-emerald-600">
                    {{ formatRupiah(rabStore.detail.totalAnggaran) }}
                  </p>
                </div>
                <div>
                  <p
                    class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1"
                  >
                    Waktu Pelaksanaan
                  </p>
                  <p class="text-xs font-bold text-slate-900">
                    {{ formatDate(rabStore.detail.tanggalMulai) }}
                  </p>
                </div>
              </div>

              <div
                v-if="uploadLpjStore.lpg.ormawaNotes"
                class="mt-6 p-6 bg-blue-50/50 rounded-xl border border-blue-100"
              >
                <p
                  class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1"
                >
                  Catatan Anda saat pengajuan
                </p>
                <p class="text-sm text-slate-600 font-medium italic">
                  "{{ uploadLpjStore.lpg.ormawaNotes }}"
                </p>
              </div>
            </div>
          </div>

          <!-- Document Viewer -->
          <div
            class="bg-slate-900 rounded-xl p-4 shadow-xl h-[800px] flex flex-col"
          >
            <div
              class="flex items-center justify-between px-4 pb-4 mb-4 border-b border-white/10"
            >
              <h3 class="text-white font-black flex items-center gap-2">
                <Icon name="lucide:file-text" class="w-5 h-5 text-blue-400" />
                Dokumen LPJ
              </h3>
              <a
                v-if="detailLpgStore.fileLpgObjectUrl"
                :href="detailLpgStore.fileLpgObjectUrl"
                download="Dokumen_LPJ.pdf"
                class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-2"
              >
                Unduh
                <Icon name="lucide:download" class="w-4 h-4" />
              </a>
            </div>

            <div class="flex-1 bg-white rounded-lg overflow-hidden relative">
              <iframe
                v-if="detailLpgStore.fileLpgObjectUrl"
                :src="detailLpgStore.fileLpgObjectUrl"
                class="w-full h-full border-0 absolute inset-0"
              ></iframe>
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-slate-50"
              >
                <div class="flex flex-col items-center gap-3 text-slate-400">
                  <Icon name="lucide:file-x" class="w-12 h-12" />
                  <p class="font-medium text-sm">
                    Preview dokumen tidak tersedia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-8">
          <!-- Action needed if revision -->
          <div
            v-if="uploadLpjStore.lpg.statusLpg === 'REVISI_SPI'"
            class="bg-rose-50 border border-rose-200 rounded-xl p-8 shadow-sm"
          >
            <div class="flex items-start gap-4 mb-4">
              <div
                class="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-rose-500 shadow-sm shrink-0"
              >
                <Icon name="lucide:alert-circle" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-black text-slate-900">Perbaikan Diperlukan</h3>
                <p class="text-xs text-slate-600 font-medium mt-1">
                  LPG Anda dikembalikan oleh SPI untuk diperbaiki.
                </p>
              </div>
            </div>

            <NuxtLink
              :to="`/dashboard/ormawa/lpg/${rabId}`"
              class="w-full py-3 mt-4 bg-rose-600 text-white rounded-lg font-bold text-sm hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-200 active:scale-95"
            >
              Upload Ulang LPJ
              <Icon name="lucide:upload-cloud" class="w-4 h-4" />
            </NuxtLink>
          </div>

          <!-- Review History -->
          <div
            class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm"
          >
            <h3
              class="text-sm font-black text-slate-900 mb-6 flex items-center gap-2"
            >
              <Icon name="lucide:history" class="w-4 h-4 text-blue-500" />
              Riwayat Review
            </h3>

            <div
              v-if="uploadLpjStore.logs.length === 0"
              class="text-center py-8"
            >
              <p
                class="text-[10px] text-slate-400 font-bold uppercase tracking-widest"
              >
                Belum ada review
              </p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="log in uploadLpjStore.logs"
                :key="log.id"
                class="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2 relative"
              >
                <div
                  class="absolute -left-1.5 top-5 w-3 h-3 bg-white border-2 border-slate-200 rounded-full"
                  v-if="uploadLpjStore.logs.length > 1"
                ></div>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black text-slate-900">{{
                    log.actor.fullname
                  }}</span>
                  <span class="text-[9px] font-bold text-slate-400">{{
                    formatDate(log.createdAt)
                  }}</span>
                </div>
                <p class="text-xs text-slate-600 font-medium leading-relaxed">
                  {{ log.catatanRevisi }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
