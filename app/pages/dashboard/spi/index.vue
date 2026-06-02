<template>
  <div class="min-h-screen bg-slate-50 font-sans">
    <!-- Main Content -->
    <div class="transition-all duration-300">
      <!-- Header -->
      <header
        class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div>
              <h2 class="text-xl font-bold text-slate-900">
                Dashboard <span class="text-[#c41e3a]">SPI</span>
              </h2>
              <p class="text-sm text-slate-500">
                Monitoring penjaminan kualitas internal
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <select
              v-model="statusFilter"
              @change="handleStatusChange"
              class="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] bg-white hidden sm:block"
            >
              <option value="all">Semua Dokumen</option>
              <option value="waiting_spi">Menunggu</option>
              <option value="disetujui">Disetujui</option>
            </select>
            <button
              class="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Icon name="heroicons:bell" class="w-6 h-6" />
              <span
                class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"
              ></span>
            </button>
            <button
              class="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Icon name="heroicons:magnifying-glass" class="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <!-- Dashboard Content -->
      <main class="p-4 sm:p-6 lg:p-8 space-y-8">
        <!-- Welcome Section -->

        <!-- Menu Utama (Quick Actions Grid) -->
        <div>
          <h3 class="text-lg font-bold text-slate-900 mb-4 px-1">
            Menu Utama SPI
          </h3>
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3 sm:gap-4"
          >
            <!-- Manajemen RAB -->
            <NuxtLink
              to="/dashboard/spi/rab"
              class="flex flex-col items-center justify-start p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#c41e3a] hover:shadow-md transition-all group text-center"
            >
              <div
                class="w-12 h-12 rounded-xl bg-[#c41e3a]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <Icon
                  name="heroicons:document-currency-dollar"
                  class="w-6 h-6 text-[#c41e3a]"
                />
              </div>
              <span class="text-xs font-bold text-slate-700 leading-tight"
                >Manajemen RAB</span
              >
            </NuxtLink>

            <!-- Manajemen LPG -->
            <NuxtLink
              to="/dashboard/spi/lpg"
              class="flex flex-col items-center justify-start p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group text-center"
            >
              <div
                class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <Icon
                  name="heroicons:document-check"
                  class="w-6 h-6 text-emerald-600"
                />
              </div>
              <span class="text-xs font-bold text-slate-700 leading-tight"
                >Manajemen LPG</span
              >
            </NuxtLink>

            <!-- Monitoring -->
            <NuxtLink
              to="/dashboard/spi/monitorings"
              class="flex flex-col items-center justify-start p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group text-center"
            >
              <div
                class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <Icon
                  name="heroicons:video-camera"
                  class="w-6 h-6 text-blue-600"
                />
              </div>
              <span class="text-xs font-bold text-slate-700 leading-tight"
                >Monitoring Kegiatan</span
              >
            </NuxtLink>

            <!-- Laporan -->
            <NuxtLink
              to="/dashboard/spi/reports"
              class="flex flex-col items-center justify-start p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all group text-center"
            >
              <div
                class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <Icon
                  name="heroicons:presentation-chart-line"
                  class="w-6 h-6 text-purple-600"
                />
              </div>
              <span class="text-xs font-bold text-slate-700 leading-tight"
                >Laporan & Ekspor</span
              >
            </NuxtLink>

            <!-- Master Data: Fakultas -->
            <NuxtLink
              to="/dashboard/spi/management/fakultas"
              class="flex flex-col items-center justify-start p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all group text-center"
            >
              <div
                class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <Icon
                  name="heroicons:building-library"
                  class="w-6 h-6 text-slate-600"
                />
              </div>
              <span class="text-xs font-bold text-slate-700 leading-tight"
                >Data Fakultas</span
              >
            </NuxtLink>

            <!-- Master Data: Prodi -->
            <NuxtLink
              to="/dashboard/spi/management/prodi"
              class="flex flex-col items-center justify-start p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all group text-center"
            >
              <div
                class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <Icon
                  name="heroicons:academic-cap"
                  class="w-6 h-6 text-slate-600"
                />
              </div>
              <span class="text-xs font-bold text-slate-700 leading-tight"
                >Data Prodi</span
              >
            </NuxtLink>

            <!-- Master Data: Ormawa -->
            <NuxtLink
              to="/dashboard/spi/management/ormawa"
              class="flex flex-col items-center justify-start p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all group text-center"
            >
              <div
                class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <Icon
                  name="heroicons:user-group"
                  class="w-6 h-6 text-slate-600"
                />
              </div>
              <span class="text-xs font-bold text-slate-700 leading-tight"
                >Data Ormawa</span
              >
            </NuxtLink>

            <!-- Master Data: Users -->
            <NuxtLink
              to="/dashboard/spi/management/users"
              class="flex flex-col items-center justify-start p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all group text-center"
            >
              <div
                class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <Icon name="heroicons:users" class="w-6 h-6 text-slate-600" />
              </div>
              <span class="text-xs font-bold text-slate-700 leading-tight"
                >Kelola Akun & User</span
              >
            </NuxtLink>

            <!-- Pengumuman -->
            <NuxtLink
              to="/dashboard/spi/announcements"
              class="flex flex-col items-center justify-start p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all group text-center"
            >
              <div
                class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <Icon
                  name="heroicons:megaphone"
                  class="w-6 h-6 text-amber-500"
                />
              </div>
              <span class="text-xs font-bold text-slate-700 leading-tight"
                >Pengumuman</span
              >
            </NuxtLink>

            <!-- Pengaturan -->
            <NuxtLink
              to="/dashboard/spi/settings"
              class="flex flex-col items-center justify-start p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-800 hover:shadow-md transition-all group text-center"
            >
              <div
                class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
              >
                <Icon
                  name="heroicons:cog-8-tooth"
                  class="w-6 h-6 text-slate-700"
                />
              </div>
              <span class="text-xs font-bold text-slate-700 leading-tight"
                >Pengaturan Sistem</span
              >
            </NuxtLink>
          </div>
        </div>

        <!-- List RAB Section -->
        <div class="w-full">
          <div class="flex items-center justify-between mb-4 px-1">
            <h3 class="text-lg font-bold text-slate-900">
              Antrean RAB (Menunggu Review)
            </h3>
            <NuxtLink
              to="/dashboard/spi/rab"
              class="text-sm font-medium text-[#c41e3a] hover:underline"
              >Lihat Semua RAB &rarr;</NuxtLink
            >
          </div>
          <spi-rab-table />
        </div>

        <!-- Content Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Acara yang Akan Datang -->
            <!-- ... (unchanged) ... -->
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Info Card -->
            <div
              class="bg-gradient-to-br from-[#c41e3a]/10 to-[#c41e3a]/5 rounded-2xl border border-[#c41e3a]/20 p-6"
            >
              <div class="flex items-start gap-3">
                <Icon
                  name="heroicons:information-circle"
                  class="w-5 h-5 text-[#c41e3a] flex-shrink-0 mt-0.5"
                />
                <div>
                  <h4 class="font-medium text-slate-900 mb-1">Tentang SPI</h4>
                  <p class="text-sm text-slate-600">
                    Satuan Penjaminan Internal (SPI) melakukan monitoring dan
                    evaluasi terhadap pelaksanaan kegiatan dan implementasi RAB
                    untuk memastikan kualitas dan sesuai dengan perencanaan.
                  </p>
                </div>
              </div>
            </div>

            <!-- Completed Activities Summary -->
            <div
              class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              <h3 class="text-lg font-bold text-slate-900 mb-4">
                Ringkasan Kegiatan Selesai
              </h3>
              <div class="space-y-2">
                <div
                  class="flex justify-between items-center p-3 bg-emerald-50 rounded-lg"
                >
                  <span class="text-sm text-slate-600">Total Selesai</span>
                  <span class="text-xl font-bold text-emerald-600">{{
                    spiStore.summary?.completedActivities || 0
                  }}</span>
                </div>
                <div
                  class="flex justify-between items-center p-3 bg-slate-100 rounded-lg"
                >
                  <span class="text-sm text-slate-600">Pending Review</span>
                  <span class="text-xl font-bold text-slate-600">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { useAuthStore } from "~/stores/auth";
  import { useSpiDashboardStore } from "~/stores/spi/dashboard";
  import { useSpiAllRabStore } from "~/stores/spi/AlllRab";

  const authStore = useAuthStore();
  const spiStore = useSpiDashboardStore();
  const rabStore = useSpiAllRabStore();
  const { user } = authStore;

  const statusFilter = ref("all");

  const handleStatusChange = async () => {
    await rabStore.fetchRabList(statusFilter.value);
  };

  const nav = (path: string) => {
    return navigateTo(path);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRp = (amount: number) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  onMounted(async () => {
    await Promise.all([spiStore.fetchSpiDashboard()]);
  });
</script>

<style scoped></style>
