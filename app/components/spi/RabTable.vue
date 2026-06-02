<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
  >
    <div
      class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h3 class="text-lg font-bold text-slate-900">Daftar Pengajuan RAB</h3>
        <p class="text-sm text-slate-500">
          Monitor dan verifikasi pengajuan anggaran
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative">
          <Icon
            name="heroicons:magnifying-glass"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari RAB..."
            class="pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] w-full sm:w-64"
          />
        </div>
      </div>
    </div>

    <div v-if="rabStore.loading" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center gap-3">
        <Icon
          name="heroicons:arrow-path"
          class="w-8 h-8 animate-spin text-[#c41e3a]"
        />
        <p class="text-slate-500 text-sm">Memuat data RAB...</p>
      </div>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-50/50 border-b border-slate-200">
          <tr>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Nomor Pengajuan
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Nama Kegiatan
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Pengaju
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Total Anggaran
            </th>

            <th
              class="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="rab in filteredRabList"
            :key="rab.id"
            class="hover:bg-slate-50/50 transition-colors group"
          >
            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900"
            >
              {{ rab.nomorPengajuan }}
            </td>
            <td class="px-6 py-4">
              <p class="text-sm font-semibold text-slate-900">
                {{ rab.judulKegiatan }}
              </p>
              <p class="text-xs text-slate-500">
                {{ formatDate(rab.createdAt) }}
              </p>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
              {{ rab.pengaju }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm font-semibold text-slate-900"
                >Rp
                {{ Number(rab.totalAnggaran).toLocaleString("id-ID") }}</span
              >
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-right">
              <button
                @click="openDetail(rab.id)"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 hover:text-white transition-all"
              >
                <span>Review</span>
                <Icon name="heroicons:eye" class="w-4 h-4" />
              </button>
            </td>
          </tr>
          <tr v-if="filteredRabList.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-slate-500">
              Tidak ada data RAB yang cocok
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      class="px-6 py-4 border-t border-slate-200 flex items-center justify-between"
    >
      <p class="text-sm text-slate-500">
        Menampilkan {{ (rabStore.page - 1) * rabStore.limit + 1 }} -
        {{ Math.min(rabStore.page * rabStore.limit, rabStore.total) }}
        dari {{ rabStore.total }} data
      </p>

      <div class="flex items-center gap-2">
        <button
          @click="rabStore.changePage(rabStore.page - 1)"
          :disabled="rabStore.page === 1 || rabStore.loading"
          class="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="heroicons:chevron-left" class="w-5 h-5" />
        </button>

        <span
          class="px-4 py-2 rounded-lg bg-[#c41e3a] text-white text-sm font-medium shadow-sm shadow-[#c41e3a]/20"
        >
          {{ rabStore.page }}
        </span>

        <button
          @click="rabStore.changePage(rabStore.page + 1)"
          :disabled="
            rabStore.page * rabStore.limit >= rabStore.total || rabStore.loading
          "
          class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="heroicons:chevron-right" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { rabReviewStore } from "~/stores/spi/reviewRab";

  const rabStore = rabReviewStore();
  const searchQuery = ref("");

  const filteredRabList = computed(() => {
    if (!searchQuery.value) return rabStore.rabList;
    const query = searchQuery.value.toLowerCase();
    return rabStore.rabList.filter(
      (rab) =>
        rab.nomorPengajuan?.toLowerCase().includes(query) ||
        rab.judulKegiatan?.toLowerCase().includes(query) ||
        rab.pengaju?.toLowerCase().includes(query),
    );
  });

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  onMounted(async () => {
    await rabStore.fetchRabList();
  });

  const openDetail = (id: number) => {
    navigateTo(`/dashboard/spi/rab/${id}`);
  };
</script>
