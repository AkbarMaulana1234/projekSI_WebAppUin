<template>
  <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight">
            Manajemen RAB
          </h1>
          <p class="text-slate-500 mt-1 text-sm font-medium">
            Monitoring dan verifikasi pengajuan RAB & TOR dari seluruh Unit
            Kerja/Ormawa.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/dashboard/spi"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            Kembali
          </NuxtLink>
        </div>
      </div>

      <!-- Filters Section -->
      <div
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6"
      >
        <div class="flex items-center gap-2 text-slate-800 font-bold mb-2">
          <Icon name="heroicons:funnel" class="w-5 h-5 text-primary" />
          Filter Data
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="space-y-1.5">
            <label
              class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
              >Cari Kegiatan</label
            >
            <div class="relative">
              <Icon
                name="heroicons:magnifying-glass"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              />
              <input
                v-model="filters.search"
                type="text"
                placeholder="No. Pengajuan / Judul..."
                class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                @input="debouncedSearch"
              />
            </div>
          </div>

          <!-- Status Filter -->
          <div class="space-y-1.5">
            <label
              class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
              >Status</label
            >
            <select
              v-model="filters.status"
              class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
              @change="rabStore.fetchRabList()"
            >
              <option value="all">Semua Status</option>
              <option value="waiting_spi">Menunggu SPI</option>
              <option value="disetujui">Disetujui</option>
              <option value="revisi_spi">Revisi SPI</option>
              <option value="ditolak_spi">Ditolak SPI</option>
              <option value="selesai_spi">Selesai</option>
            </select>
          </div>

          <!-- Fakultas Filter -->
          <div class="space-y-1.5">
            <label
              class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
              >Fakultas</label
            >
            <select
              v-model="filters.fakultasId"
              class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
              @change="onFakultasChange"
            >
              <option value="">Semua Fakultas</option>
              <option
                v-for="f in fakultasStore.fakultas"
                :key="f.id"
                :value="f.id"
              >
                {{ f.nama }}
              </option>
            </select>
          </div>

          <!-- Prodi Filter -->
          <div class="space-y-1.5">
            <label
              class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
              >Program Studi</label
            >
            <select
              v-model="filters.prodiId"
              class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
              @change="rabStore.fetchRabList()"
            >
              <option value="">Semua Prodi</option>
              <option v-for="p in filteredProdi" :key="p.id" :value="p.id">
                {{ p.nama }}
              </option>
            </select>
          </div>

          <!-- Ormawa Filter -->
          <div class="space-y-1.5">
            <label
              class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
              >Unit Kerja / Ormawa</label
            >
            <select
              v-model="filters.ormawaId"
              class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
              @change="rabStore.fetchRabList()"
            >
              <option value="">Semua Ormawa</option>
              <option v-for="o in filteredOrmawa" :key="o.id" :value="o.id">
                {{ o.nama }}
              </option>
            </select>
          </div>

          <!-- Date Start -->
          <div class="space-y-1.5">
            <label
              class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
              >Mulai Dari</label
            >
            <input
              v-model="filters.startDate"
              type="date"
              class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              @change="rabStore.fetchRabList()"
            />
          </div>

          <!-- Date End -->
          <div class="space-y-1.5">
            <label
              class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
              >Sampai Dengan</label
            >
            <input
              v-model="filters.endDate"
              type="date"
              class="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              @change="rabStore.fetchRabList()"
            />
          </div>

          <!-- Reset -->
          <div class="flex items-end pb-0.5">
            <button
              @click="rabStore.resetFilters()"
              class="w-full px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 border border-red-100 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Icon name="heroicons:trash" class="w-4 h-4" />
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div
        class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th
                  class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  No. Pengajuan
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Kegiatan
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Unit / Ormawa
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Anggaran
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center"
                >
                  Status
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-if="rabStore.loading"
                v-for="i in 5"
                :key="i"
                class="animate-pulse"
              >
                <td colspan="6" class="px-6 py-4">
                  <div class="h-4 bg-slate-100 rounded w-full"></div>
                </td>
              </tr>
              <tr v-else-if="rabStore.rabList.length === 0">
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <div
                      class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center"
                    >
                      <Icon
                        name="heroicons:document-text"
                        class="w-8 h-8 text-slate-300"
                      />
                    </div>
                    <p class="text-slate-500 font-medium">
                      Tidak ada data pengajuan yang ditemukan.
                    </p>
                  </div>
                </td>
              </tr>
              <tr
                v-else
                v-for="rab in rabStore.rabList"
                :key="rab.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-bold text-slate-900">{{
                    rab.nomorPengajuan
                  }}</span>
                  <div
                    class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5"
                  >
                    {{ formatDate(rab.createdAt) }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm font-semibold text-slate-900 line-clamp-1">
                    {{ rab.judulKegiatan }}
                  </p>
                  <p class="text-xs text-slate-500">
                    {{ formatDate(rab.tanggalMulai) }} -
                    {{ formatDate(rab.tanggalSelesai) }}
                  </p>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-700">{{
                      rab.ormawa
                    }}</span>
                    <span class="text-[10px] text-slate-500 font-medium">{{
                      rab.fakultas
                    }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-extrabold text-slate-900">
                    <span class="text-xs font-bold text-slate-400 mr-0.5"
                      >Rp</span
                    >
                    {{ formatNumber(rab.totalAnggaran) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center whitespace-nowrap">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                      getStatusStyles(rab.status),
                    ]"
                  >
                    {{ formatStatus(rab.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <NuxtLink
                    :to="`/dashboard/spi/rab/${rab.id}`"
                    class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-primary rounded-lg hover:bg-[#a01830] transition-all shadow-md shadow-primary/20"
                  >
                    Detail & Review
                    <Icon name="heroicons:chevron-right" class="w-3.5 h-3.5" />
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="rabStore.total > 0"
          class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between"
        >
          <div class="text-sm text-slate-500 font-medium">
            Menampilkan
            <span class="font-bold text-slate-900">{{
              (rabStore.page - 1) * rabStore.limit + 1
            }}</span>
            -
            <span class="font-bold text-slate-900">{{
              Math.min(rabStore.page * rabStore.limit, rabStore.total)
            }}</span>
            dari
            <span class="font-bold text-slate-900">{{ rabStore.total }}</span>
            data
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="rabStore.changePage(rabStore.page - 1)"
              :disabled="rabStore.page === 1"
              class="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              <Icon name="heroicons:chevron-left" class="w-5 h-5" />
            </button>
            <div class="flex items-center gap-1">
              <button
                v-for="p in totalPages"
                :key="p"
                @click="rabStore.changePage(p)"
                :class="[
                  'w-9 h-9 rounded-lg text-sm font-bold transition-all',
                  rabStore.page === p
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-slate-600 hover:bg-slate-100',
                ]"
              >
                {{ p }}
              </button>
            </div>
            <button
              @click="rabStore.changePage(rabStore.page + 1)"
              :disabled="rabStore.page === totalPages"
              class="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              <Icon name="heroicons:chevron-right" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSpiAllRabStore } from "~/stores/spi/AlllRab";
  import { useSpiFakultasStore } from "~/stores/spi/fakultas";
  import { useSpiProdiStore } from "~/stores/spi/prodi";
  import { useSpiOrmawaStore } from "~/stores/spi/ormawa";
  import { ref, computed, onMounted } from "vue";
  import { storeToRefs } from "pinia";

  const rabStore = useSpiAllRabStore();
  const fakultasStore = useSpiFakultasStore();
  const prodiStore = useSpiProdiStore();
  const ormawaStore = useSpiOrmawaStore();

  const { filters } = storeToRefs(rabStore);

  const totalPages = computed(() => Math.ceil(rabStore.total / rabStore.limit));

  const filteredProdi = computed(() => {
    if (!filters.value.fakultasId) return prodiStore.prodi;
    return prodiStore.prodi.filter(
      (p) => p.fakultasId === filters.value.fakultasId,
    );
  });

  const filteredOrmawa = computed(() => {
    if (!filters.value.fakultasId) return ormawaStore.ormawa;
    let list = ormawaStore.ormawa.filter(
      (o) => o.fakultasId === filters.value.fakultasId,
    );
    if (filters.value.prodiId) {
      list = list.filter((o) => o.prodiId === filters.value.prodiId);
    }
    return list;
  });

  const onFakultasChange = () => {
    filters.value.prodiId = "";
    filters.value.ormawaId = "";
    rabStore.fetchRabList();
  };

  let searchTimeout: any = null;
  const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      rabStore.fetchRabList();
    }, 500);
  };

  onMounted(async () => {
    await Promise.all([
      rabStore.fetchRabList(),
      fakultasStore.fetchFakultas(),
      prodiStore.fetchProdi(),
      ormawaStore.fetchOrmawa(),
    ]);
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatNumber = (num: number | string) => {
    return Number(num).toLocaleString("id-ID");
  };

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      draft: "Draft",
      waiting_kaprodi: "Review Kaprodi",
      revisi_kaprodi: "Revisi Kaprodi",
      waiting_ppk: "Review PPK",
      revisi_ppk: "Revisi PPK",
      waiting_spi: "Review SPI",
      ditolak_spi: "Ditolak SPI",
      revisi_spi: "Revisi SPI",
      disetujui: "Disetujui",
      lunas_ppk: "Lunas PPK",
      selesai_spi: "Selesai",
    };
    return map[status] || status;
  };

  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      waiting_spi: "bg-amber-50 text-amber-600 border-amber-200",
      disetujui: "bg-emerald-50 text-emerald-600 border-emerald-200",
      selesai_spi: "bg-emerald-50 text-emerald-600 border-emerald-200",
      ditolak_spi: "bg-red-50 text-red-600 border-red-200",
      revisi_spi: "bg-yellow-50 text-yellow-600 border-yellow-200",
      draft: "bg-slate-50 text-slate-500 border-slate-200",
    };
    return styles[status] || "bg-blue-50 text-blue-600 border-blue-200";
  };
</script>

<style scoped>
  .text-primary {
    color: var(--color-primary);
  }
  .bg-primary {
    background-color: var(--color-primary);
  }
</style>
