<script setup lang="ts">
import { useSpiLpgStore } from '~/stores/spi/lpg';

const route = useRoute();
const router = useRouter();
const spiLpgStore = useSpiLpgStore();

const lpgId = Number(route.params.id);

const notes = ref("");
const reviewAction = ref<'approve' | 'revision'>('approve');

onMounted(() => {
  spiLpgStore.fetchLpgDetail(lpgId);
});

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatRupiah = (amount: string | number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount));
};

const submitReview = async () => {
  if (reviewAction.value === 'revision' && !notes.value) {
    alert("Catatan revisi wajib diisi jika ingin melakukan revisi");
    return;
  }

  try {
    await spiLpgStore.reviewLpg(lpgId, reviewAction.value, notes.value);
    alert(reviewAction.value === 'approve' ? "LPG Berhasil Disetujui" : "Revisi Berhasil Dikirim");
    router.push("/dashboard/spi/lpg");
  } catch (error: any) {
    alert(error.message || "Gagal memproses review");
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'WAITING_SPI': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'REVISION': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};
</script>

<template>
  <div class="p-8 max-w-6xl mx-auto min-h-screen">
    <div v-if="spiLpgStore.loading && !spiLpgStore.detail" class="flex flex-col items-center justify-center py-32">
       <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
       <p class="text-slate-500 text-sm font-medium">Memuat detail LPG...</p>
    </div>

    <div v-else-if="spiLpgStore.detail" class="space-y-6">
      <!-- Formal Header -->
      <div class="flex items-center justify-between bg-white p-6 border border-slate-200 rounded-lg shadow-sm">
        <div class="flex items-center gap-4">
          <NuxtLink to="/dashboard/spi/lpg" class="p-2 bg-slate-50 border border-slate-200 rounded text-slate-500 hover:text-slate-900 transition-all">
            <Icon name="lucide:arrow-left" class="w-4 h-4" />
          </NuxtLink>
          <div>
             <h1 class="text-xl font-bold text-slate-900">Review Laporan Pertanggungjawaban</h1>
             <p class="text-xs text-slate-500 font-medium mt-0.5 tracking-wide uppercase">
               {{ spiLpgStore.detail.rab.nomorPengajuan }} • {{ spiLpgStore.detail.ormawa.fullName }}
             </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
           <span 
             class="px-3 py-1 rounded text-[10px] font-bold border uppercase tracking-widest shadow-sm"
             :class="getStatusBadgeClass(spiLpgStore.detail.lpg.statusLpg)"
           >
             {{ spiLpgStore.detail.lpg.statusLpg }}
           </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <!-- Main Info Card -->
          <div class="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
            <div class="mb-8">
              <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-2">Informasi Kegiatan</span>
              <h2 class="text-2xl font-bold text-slate-900 leading-tight">{{ spiLpgStore.detail.rab.judulKegiatan }}</h2>
            </div>
            
            <div class="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-100">
              <div class="space-y-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Anggaran Disetujui</p>
                <p class="text-xl font-bold text-emerald-600 font-mono">{{ formatRupiah(spiLpgStore.detail.rab.totalAnggaran) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periode Pelaksanaan</p>
                <p class="text-sm font-bold text-slate-900">{{ spiLpgStore.detail.rab.tanggalMulai }} — {{ spiLpgStore.detail.rab.tanggalSelesai }}</p>
              </div>
            </div>

            <!-- File Section -->
            <div class="space-y-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dokumen Pertanggungjawaban (PDF)</p>
              <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-200 transition-all group">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-white rounded border border-slate-200 flex items-center justify-center shadow-sm">
                    <span class="i-lucide-file-text w-5 h-5 text-emerald-600"></span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900">Laporan_Pertanggungjawaban.pdf</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Diterima: {{ formatDate(spiLpgStore.detail.lpg.submittedAt) }}</p>
                  </div>
                </div>
                <a 
                  :href="`/${spiLpgStore.detail.lpg.fileLpgUrl}`" 
                  target="_blank"
                  class="px-4 py-2 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm flex items-center gap-2"
                >
                  Buka Dokumen
                  <Icon name="lucide:external-link" class="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <!-- Ormawa Notes -->
            <div v-if="spiLpgStore.detail.lpg.ormawaNotes" class="mt-8 p-5 bg-blue-50/50 rounded-lg border-l-4 border-blue-500">
              <p class="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Catatan Pengaju</p>
              <p class="text-sm text-slate-700 leading-relaxed font-medium italic">"{{ spiLpgStore.detail.lpg.ormawaNotes }}"</p>
            </div>
          </div>

          <!-- History Review Table-like -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2 px-1">
              <span class="i-lucide-history w-4 h-4 text-emerald-500"></span>
              Riwayat Pemeriksaan
            </h3>
            
            <div v-if="spiLpgStore.detail.logs.length === 0" class="p-10 text-center bg-white rounded-lg border border-dashed border-slate-300">
               <p class="text-slate-400 text-sm font-medium">Belum ada riwayat review sebelumnya.</p>
            </div>
            
            <div v-else class="space-y-3">
              <div v-for="log in spiLpgStore.detail.logs" :key="log.id" class="p-5 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div class="flex items-center justify-between mb-3 pb-3 border-b border-slate-50">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-900">{{ log.actor.fullName }}</span>
                    <span class="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wider border border-slate-200">{{ log.actor.role }}</span>
                  </div>
                  <span class="text-[10px] text-slate-400 font-medium">{{ formatDate(log.createdAt) }}</span>
                </div>
                <p class="text-xs text-slate-600 font-medium leading-relaxed">{{ log.catatanRevisi }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Actions -->
        <div class="space-y-6">
          <div v-if="spiLpgStore.detail.lpg.statusLpg === 'WAITING_SPI'" class="bg-white border border-slate-200 rounded-lg p-6 shadow-md sticky top-8">
            <h3 class="text-base font-bold text-slate-900 mb-6 border-b border-slate-100 pb-3">Keputusan Review</h3>
            
            <div class="space-y-6">
              <div class="grid grid-cols-1 gap-2">
                <button 
                  @click="reviewAction = 'approve'"
                  :class="[
                    'w-full flex items-center justify-between p-3 rounded border transition-all font-bold text-xs',
                    reviewAction === 'approve' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 hover:border-emerald-200 text-slate-500'
                  ]"
                >
                  Setujui Laporan
                  <Icon name="lucide:check-circle" class="w-4 h-4" />
                </button>
                <button 
                  @click="reviewAction = 'revision'"
                  :class="[
                    'w-full flex items-center justify-between p-3 rounded border transition-all font-bold text-xs',
                    reviewAction === 'revision' ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-sm' : 'border-slate-200 hover:border-rose-200 text-slate-500'
                  ]"
                >
                  Minta Perbaikan
                  <span class="i-lucide-alert-circle w-4 h-4"></span>
                </button>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">
                  {{ reviewAction === 'approve' ? 'Catatan (Opsional)' : 'Alasan Revisi (Wajib)' }}
                </label>
                <textarea 
                  v-model="notes"
                  rows="6"
                  class="w-full p-3 bg-slate-50 border border-slate-300 rounded text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all resize-none font-medium"
                  :placeholder="reviewAction === 'approve' ? 'Opsional: Tambahkan catatan persetujuan...' : 'Wajib: Jelaskan detail poin yang harus diperbaiki...'"
                ></textarea>
              </div>

              <button 
                @click="submitReview"
                :disabled="spiLpgStore.loading"
                class="w-full py-3 rounded font-bold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 text-sm"
                :class="reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'"
              >
                <span v-if="spiLpgStore.loading" class="flex items-center justify-center gap-2">
                   <span class="i-lucide-loader-2 w-4 h-4 animate-spin"></span>
                   Memproses...
                </span>
                <span v-else>
                   Kirim Keputusan
                </span>
              </button>
            </div>
          </div>
          
          <!-- Already Reviewed -->
          <div v-else class="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center space-y-4">
             <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto border border-slate-100 shadow-sm">
                <span v-if="spiLpgStore.detail.lpg.statusLpg === 'APPROVED'" class="i-lucide-check-circle w-6 h-6 text-emerald-600"></span>
                <span v-else class="i-lucide-alert-circle w-6 h-6 text-rose-600"></span>
             </div>
             <div>
                <h4 class="text-sm font-bold text-slate-900">Pemeriksaan Selesai</h4>
                <p class="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">LPG ini telah diproses dengan status akhir <span class="font-bold text-slate-900">{{ spiLpgStore.detail.lpg.statusLpg }}</span>.</p>
             </div>
          </div>

          <!-- Quick Tip -->
          <div class="p-5 bg-emerald-50 rounded-lg border border-emerald-100">
             <h4 class="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-2">
               <Icon name="lucide:info" class="w-3.5 h-3.5" />
               Panduan Verifikasi
             </h4>
             <ul class="text-[11px] text-emerald-700 space-y-2 font-medium">
               <li>• Pastikan semua nota valid dan sesuai.</li>
               <li>• Periksa kesesuaian dengan RAB awal.</li>
               <li>• Verifikasi dokumentasi kegiatan.</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
