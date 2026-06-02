<script setup lang="ts">
import { useSpiLpgStore } from '~/stores/spi/lpg';

const spiLpgStore = useSpiLpgStore();
const searchQuery = ref("");

onMounted(() => {
  spiLpgStore.fetchLpgList();
});

const filteredList = computed(() => {
  if (!searchQuery.value) return spiLpgStore.lpgList;
  const q = searchQuery.value.toLowerCase();
  return spiLpgStore.lpgList.filter(item => 
    item.judulKegiatan.toLowerCase().includes(q) || 
    item.nomorPengajuan.toLowerCase().includes(q) ||
    item.ormawaName.toLowerCase().includes(q)
  );
});

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatRupiah = (amount: string | number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount));
};

const getStatusBadgeClass = (status: string | null) => {
  if (!status) return 'bg-amber-50 text-amber-700 border-amber-200';
  switch (status) {
    case 'WAITING_SPI': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'REVISION': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getStatusLabel = (status: string | null) => {
  if (!status) return 'Belum Upload';
  switch (status) {
    case 'WAITING_SPI': return 'Menunggu Review';
    case 'APPROVED': return 'Disetujui';
    case 'REVISION': return 'Revisi';
    default: return status;
  }
};
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto min-h-screen">
    <!-- Formal Header Section -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Manajemen LPG</h1>
        <p class="text-sm text-slate-500 mt-1">Verifikasi dan validasi Laporan Pertanggungjawaban Ormawa.</p>
      </div>
      
      <div class="relative w-full md:w-80">
        <Icon name="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Cari kegiatan atau ormawa..."
          class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all text-sm shadow-sm"
        >
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="spiLpgStore.loading && spiLpgStore.lpgList.length === 0" class="flex flex-col items-center justify-center py-32">
       <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
       <p class="text-slate-500 text-sm font-medium">Memuat data LPG...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="spiLpgStore.error" class="bg-rose-50 border border-rose-200 p-8 rounded-lg text-center">
      <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
        <span class="i-lucide-alert-circle w-6 h-6 text-rose-500"></span>
      </div>
      <h3 class="text-base font-bold text-slate-900 mb-1">Terjadi Kesalahan</h3>
      <p class="text-sm text-rose-600 font-medium mb-6">{{ spiLpgStore.error }}</p>
      <button 
        @click="spiLpgStore.fetchLpgList()" 
        class="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredList.length === 0" class="bg-white border border-slate-200 p-20 rounded-xl text-center shadow-sm">
      <div class="bg-slate-50 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
        <span class="i-lucide-file-x-2 w-8 h-8 text-slate-300"></span>
      </div>
      <h3 class="text-lg font-bold text-slate-900 mb-2">Tidak Ada Data LPG</h3>
      <p class="text-slate-500 max-w-md mx-auto text-sm leading-relaxed font-medium">
        Belum ada laporan pertanggungjawaban yang masuk atau data yang Anda cari tidak ditemukan.
      </p>
    </div>

    <!-- List Table -->
    <div v-else class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor & Kegiatan</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ormawa</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Anggaran</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status LPG</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Tanggal Kirim</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in filteredList" :key="item.rabId" class="hover:bg-slate-50/80 transition-colors group">
              <td class="px-6 py-5">
                <p class="text-[11px] font-bold text-emerald-600 mb-1 tracking-wider uppercase">{{ item.nomorPengajuan }}</p>
                <h4 class="text-sm font-bold text-slate-900 line-clamp-1 leading-snug group-hover:text-emerald-700 transition-colors">
                  {{ item.judulKegiatan }}
                </h4>
              </td>
              <td class="px-6 py-5">
                <span class="text-sm font-medium text-slate-700">
                  {{ item.ormawaName }}
                </span>
              </td>
              <td class="px-6 py-5 text-right font-mono text-sm font-bold text-slate-900">
                {{ formatRupiah(item.totalAnggaran) }}
              </td>
              <td class="px-6 py-5 text-center">
                <span 
                  class="inline-block px-3 py-1 rounded-md text-[11px] font-bold border"
                  :class="getStatusBadgeClass(item.statusLpg)"
                >
                  {{ getStatusLabel(item.statusLpg) }}
                </span>
              </td>
              <td class="px-6 py-5 text-center">
                <p class="text-xs font-medium text-slate-500">{{ formatDate(item.submittedAt) }}</p>
              </td>
              <td class="px-6 py-5 text-center">
                <div v-if="item.lpgId">
                  <NuxtLink 
                    :to="`/dashboard/spi/lpg/${item.lpgId}`"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200 active:scale-95"
                  >
                    Detail Review
                    <span class="i-lucide-chevron-right w-3.5 h-3.5"></span>
                  </NuxtLink>
                </div>
                <div v-else>
                   <span class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600">
                     <span class="i-lucide-clock w-3.5 h-3.5"></span>
                     Menunggu
                   </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
