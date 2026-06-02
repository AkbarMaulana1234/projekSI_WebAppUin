<!-- pages/dashboard/ormawa/lpg/index.vue -->
<template>
  <div class="p-6 max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div
      class="flex items-center justify-between border-b border-gray-200 pb-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Manajemen LPG</h1>
        <p class="text-sm text-gray-500 mt-1">
          Kelola laporan pertanggungjawaban kegiatan
        </p>
      </div>
      <NuxtLink
        to="/dashboard/ormawa"
        class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Icon name="heroicons:arrow-left" class="w-4 h-4" />
        Dashboard
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="lpgListStore.loading" class="flex justify-center py-12">
      <Icon
        name="heroicons:arrow-path"
        class="w-8 h-8 animate-spin text-blue-600"
      />
    </div>

    <template v-else>
      <!-- Section: Siap Upload -->
      <section>
        <div class="flex items-center gap-2 mb-4">
          <Icon
            name="heroicons:document-arrow-up"
            class="w-5 h-5 text-blue-600"
          />
          <h2 class="text-lg font-semibold text-gray-900">Siap Upload LPG</h2>
        </div>

        <div
          v-if="lpgListStore.readyRabs.length === 0"
          class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center"
        >
          <p class="text-gray-500">
            Semua kegiatan yang telah lunas sudah memiliki laporan.
          </p>
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <div
            v-for="item in lpgListStore.readyRabs"
            :key="item.rabId"
            class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition"
          >
            <div class="flex justify-between items-start mb-3">
              <span class="text-xs text-gray-400 font-mono">{{
                item.nomorPengajuan
              }}</span>
              <span
                v-if="item.lpgStatus === 'REVISION'"
                class="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full"
                >Perlu Revisi</span
              >
            </div>
            <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">
              {{ item.judulKegiatan }}
            </h3>
            <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <Icon name="heroicons:calendar" class="w-4 h-4" />
              <span>{{ formatDate(item.tanggalMulai) }}</span>
            </div>
            <div
              class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100"
            >
              <span class="font-bold text-gray-900">{{
                formatRupiah(item.totalAnggaran)
              }}</span>
              <NuxtLink
                :to="`/dashboard/ormawa/lpg/${item.rabId}`"
                class="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {{ item.lpgId ? "Perbaiki" : "Buat LPG" }}
                <Icon name="heroicons:arrow-right" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Riwayat -->
      <section>
        <div class="flex items-center gap-2 mb-4">
          <Icon name="heroicons:clock" class="w-5 h-5 text-gray-500" />
          <h2 class="text-lg font-semibold text-gray-900">Riwayat Laporan</h2>
        </div>

        <div
          v-if="lpgListStore.historyRabs.length === 0"
          class="bg-white border border-gray-200 rounded-lg p-8 text-center"
        >
          <p class="text-gray-500">Belum ada riwayat pelaporan.</p>
        </div>

        <div
          v-else
          class="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Kegiatan
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Anggaran
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="item in lpgListStore.historyRabs"
                :key="item.rabId"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4">
                  <p class="text-sm font-medium text-gray-900">
                    {{ item.judulKegiatan }}
                  </p>
                  <p class="text-xs text-gray-500">{{ item.nomorPengajuan }}</p>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ formatRupiah(item.totalAnggaran) }}
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="getStatusBadgeClass(item.lpgStatus)"
                    class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ getStatusLabel(item.lpgStatus) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <NuxtLink
                    :to="`/dashboard/ormawa/lpg/detail/${item.rabId}`"
                    class="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Detail
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { useLpgListStore } from "~/stores/ormawa/lpgList";
  const lpgListStore = useLpgListStore();
  onMounted(async () => {
    await lpgListStore.fetchReadyRabs();
  });
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };
  const formatRupiah = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };
  const getStatusBadgeClass = (status: string | null) => {
    switch (status) {
      case "WAITING_SPI":
        return "bg-blue-100 text-blue-700";
      case "DISETUJUI":
        return "bg-green-100 text-green-700";
      case "REVISI_SPI":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return "Belum Diupload";
    switch (status) {
      case "WAITING_SPI":
        return "Menunggu SPI";
      case "DISETUJUI":
        return "Disetujui";
      case "REVISI_SPI":
        return "Revisi";
      default:
        return status;
    }
  };
</script>
