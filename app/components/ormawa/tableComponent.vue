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
          Kelola dan monitor status pengajuan anggaran
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <Icon
            name="heroicons:magnifying-glass"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari RAB..."
            class="pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b5988]/20 focus:border-[#3b5988] w-full sm:w-64"
          />
        </div>
        <button
          class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Icon name="heroicons:funnel" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-50/50 border-b border-slate-200">
          <tr>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Nama Kegiatan
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Jadwal Acara
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Tanggal Pengajuan
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Total Anggaran
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Status
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
            v-for="rab in tableStore.table"
            :key="rab.id"
            class="hover:bg-slate-50/50 transition-colors group"
          >
            <td class="px-6 py-4">
              <p class="text-sm font-semibold text-slate-900">
                {{ rab.pengajuanRabTable.judulKegiatan }}
              </p>
              <p class="text-xs text-slate-500">Pengaju: {{ rab.username }}</p>
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex flex-col gap-0.5">
                <span class="font-medium text-[#3b5988]">
                  Mulai: {{ formatDate(rab.pengajuanRabTable.tanggalMulai) }}
                </span>
                <span class="text-slate-500">
                  Selesai:
                  {{ formatDate(rab.pengajuanRabTable.tanggalSelesai) }}
                </span>
              </div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
              {{ formatDate(rab.pengajuanRabTable.createdAt) }}
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm font-semibold text-slate-900">
                Rp
                {{
                  Number(rab.pengajuanRabTable.totalAnggaran).toLocaleString(
                    "id-ID",
                  )
                }}
              </span>
            </td>

            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium border',
                  rab.pengajuanRabTable.status === 'disetujui'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : rab.pengajuanRabTable.status === 'ditolak_spi'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : rab.pengajuanRabTable.status.includes('waiting')
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200',
                ]"
              >
                {{ rab.pengajuanRabTable.status }}
              </span>
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-right">
              <button
                @click="openDetail(rab.pengajuanRabTable.id)"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#3b5988] bg-[#3b5988]/10 hover:bg-[#3b5988] hover:text-white transition-all group/btn"
              >
                <span>Detail</span>
                <Icon
                  name="heroicons:eye"
                  class="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="px-6 py-4 border-t border-slate-200 flex items-center justify-between"
    >
      <p class="text-sm text-slate-500">
        Menampilkan {{ tableStore.offset + 1 }} -
        {{ tableStore.offset + tableStore.table.length }}
        dari {{ tableStore.total }} data
      </p>

      <div class="flex items-center gap-2">
        <button
          @click="tableStore.prevPage"
          :disabled="tableStore.page === 1"
          class="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-50"
        >
          <Icon name="heroicons:chevron-left" class="w-5 h-5" />
        </button>

        <span class="px-4 py-2 rounded-lg bg-[#3b5988] text-white text-sm">
          {{ tableStore.page }}
        </span>

        <button
          @click="tableStore.nextPage"
          :disabled="
            tableStore.offset + tableStore.table.length >= tableStore.total
          "
          class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 disabled:opacity-50"
        >
          <Icon name="heroicons:chevron-right" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useTableStore } from "~/stores/ormawa/table";
  import { ref, onMounted } from "vue";

  const isSidebarOpen = ref(false);
  const isModalOpen = ref(false);
  const selectedRab = ref(null);
  const tableStore = useTableStore();

  // Helper function untuk format tanggal yang lebih rapi
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  onMounted(async () => {
    await tableStore.getTable();
  });

  const openDetail = (rabID: number) => {
    return navigateTo(`/dashboard/ormawa/detailRab/${rabID}`);
  };
</script>
