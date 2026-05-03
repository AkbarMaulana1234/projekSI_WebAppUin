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
      <main class="p-4 sm:p-6 lg:p-8 space-y-6">
        <!-- Stats Cards -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6"
        >
          <!-- Total RAB Disetujui -->
          <div
            class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-[#c41e3a]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-xl bg-[#c41e3a]/10 text-[#c41e3a]">
                  <Icon name="heroicons:document-check" class="w-6 h-6" />
                </div>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">
                {{ spiStore.summary?.totalApprovedRab || 0 }}
              </h3>
              <p class="text-sm text-slate-500">RAB Disetujui</p>
            </div>
          </div>

          <!-- Acara Akan Datang -->
          <div
            class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                  <Icon name="heroicons:calendar" class="w-6 h-6" />
                </div>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">
                {{ spiStore.summary?.upcomingActivities || 0 }}
              </h3>
              <p class="text-sm text-slate-500">Acara akan Datang</p>
            </div>
          </div>

          <!-- Acara Sedang Berjalan -->
          <div
            class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                  <Icon name="heroicons:bolt" class="w-6 h-6" />
                </div>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">
                {{ spiStore.summary?.ongoingActivities || 0 }}
              </h3>
              <p class="text-sm text-slate-500">Sedang Berjalan</p>
            </div>
          </div>

          <!-- Acara Selesai -->
          <div
            class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Icon name="heroicons:check-circle" class="w-6 h-6" />
                </div>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">
                {{ spiStore.summary?.completedActivities || 0 }}
              </h3>
              <p class="text-sm text-slate-500">Selesai</p>
            </div>
          </div>

          <!-- Total Dokumentasi -->
          <div
            class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-xl bg-purple-500/10 text-purple-600">
                  <Icon name="heroicons:document-text" class="w-6 h-6" />
                </div>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">
                {{ spiStore.summary?.totalDocumentation || 0 }}
              </h3>
              <p class="text-sm text-slate-500">Dokumentasi</p>
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Acara yang Akan Datang -->
            <div
              class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="text-lg font-bold text-slate-900">Acara yang Akan Dilaksanakan</h3>
                  <p class="text-sm text-slate-500">Daftar kegiatan yang akan datang</p>
                </div>
              </div>
              <div class="space-y-3 max-h-96 overflow-y-auto">
                <template v-if="spiStore.upcomingActivities && spiStore.upcomingActivities.length > 0">
                  <div
                    v-for="activity in spiStore.upcomingActivities"
                    :key="activity.id"
                    class="p-4 border border-slate-200 rounded-lg hover:border-[#c41e3a] hover:bg-[#c41e3a]/5 transition-all"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h4 class="font-semibold text-slate-900">{{ activity.judulKegiatan }}</h4>
                        <p class="text-xs text-slate-500 mt-1">{{ activity.deskripsi }}</p>
                      </div>
                      <span class="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {{ activity.statusKegiatan }}
                      </span>
                    </div>
                    <div class="grid grid-cols-3 gap-3 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                      <div>
                        <span class="text-slate-400">Mulai:</span>
                        <p class="font-medium">{{ formatDate(activity.tanggalMulai) }}</p>
                      </div>
                      <div>
                        <span class="text-slate-400">Selesai:</span>
                        <p class="font-medium">{{ formatDate(activity.tanggalSelesai) }}</p>
                      </div>
                      <div>
                        <span class="text-slate-400">Budget:</span>
                        <p class="font-medium">{{ formatRp(activity.totalAnggaran) }}</p>
                      </div>
                    </div>
                    <div v-if="activity.fileTorUrl" class="mt-3 pt-3 border-t border-slate-100">
                      <a
                        :href="activity.fileTorUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 text-xs font-medium text-[#c41e3a] hover:text-[#a01830] transition-colors"
                      >
                        <Icon name="heroicons:document" class="w-4 h-4" />
                        Download TOR
                      </a>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <p class="text-sm text-slate-500 py-4 text-center">Belum ada acara yang akan datang</p>
                </template>
              </div>
            </div>

            <!-- Acara Sedang Berjalan -->
            <div
              class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="text-lg font-bold text-slate-900">Acara Sedang Berjalan</h3>
                  <p class="text-sm text-slate-500">Kegiatan dalam proses pelaksanaan</p>
                </div>
              </div>
              <div class="space-y-3 max-h-96 overflow-y-auto">
                <template v-if="spiStore.ongoingActivities && spiStore.ongoingActivities.length > 0">
                  <div
                    v-for="activity in spiStore.ongoingActivities"
                    :key="activity.id"
                    class="p-4 border border-amber-200 rounded-lg bg-amber-50 hover:bg-amber-100 transition-all"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h4 class="font-semibold text-slate-900">{{ activity.judulKegiatan }}</h4>
                        <p class="text-xs text-slate-500 mt-1">{{ activity.deskripsi }}</p>
                      </div>
                      <span class="text-xs font-medium bg-amber-600 text-white px-2 py-1 rounded">
                        {{ activity.statusKegiatan }}
                      </span>
                    </div>
                    <div class="grid grid-cols-3 gap-3 text-xs text-slate-600 mt-3 pt-3 border-t border-amber-200">
                      <div>
                        <span class="text-slate-400">Mulai:</span>
                        <p class="font-medium">{{ formatDate(activity.tanggalMulai) }}</p>
                      </div>
                      <div>
                        <span class="text-slate-400">Selesai:</span>
                        <p class="font-medium">{{ formatDate(activity.tanggalSelesai) }}</p>
                      </div>
                      <div>
                        <span class="text-slate-400">Budget:</span>
                        <p class="font-medium">{{ formatRp(activity.totalAnggaran) }}</p>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <p class="text-sm text-slate-500 py-4 text-center">Tidak ada acara yang sedang berjalan</p>
                </template>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Quick Actions -->
            <div
              class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              <h3 class="text-lg font-bold text-slate-900 mb-4">Aksi Cepat</h3>
              <div class="space-y-3">
                <NuxtLink
                  to="/dashboard/spi/monitorings"
                  class="flex items-center gap-3 p-3 rounded-lg bg-[#c41e3a]/10 text-[#c41e3a] hover:bg-[#c41e3a]/20 transition-colors"
                >
                  <Icon name="heroicons:clipboard-document-check" class="w-5 h-5" />
                  <span class="font-medium">Monitor Kegiatan</span>
                </NuxtLink>
                <NuxtLink
                  to="/dashboard/spi/documentation"
                  class="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors"
                >
                  <Icon name="heroicons:document-text" class="w-5 h-5" />
                  <span class="font-medium">Dokumentasi</span>
                </NuxtLink>
                <NuxtLink
                  to="/dashboard/spi/reports"
                  class="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                >
                  <Icon name="heroicons:chart-bar" class="w-5 h-5" />
                  <span class="font-medium">Laporan Audit</span>
                </NuxtLink>
              </div>
            </div>

            <!-- Info Card -->
            <div
              class="bg-gradient-to-br from-[#c41e3a]/10 to-[#c41e3a]/5 rounded-2xl border border-[#c41e3a]/20 p-6"
            >
              <div class="flex items-start gap-3">
                <Icon name="heroicons:information-circle" class="w-5 h-5 text-[#c41e3a] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 class="font-medium text-slate-900 mb-1">Tentang SPI</h4>
                  <p class="text-sm text-slate-600">
                    Satuan Penjaminan Internal (SPI) melakukan monitoring dan evaluasi terhadap pelaksanaan kegiatan dan implementasi RAB untuk memastikan kualitas dan sesuai dengan perencanaan.
                  </p>
                </div>
              </div>
            </div>

            <!-- Completed Activities Summary -->
            <div
              class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              <h3 class="text-lg font-bold text-slate-900 mb-4">Ringkasan Kegiatan Selesai</h3>
              <div class="space-y-2">
                <div class="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <span class="text-sm text-slate-600">Total Selesai</span>
                  <span class="text-xl font-bold text-emerald-600">{{ spiStore.summary?.completedActivities || 0 }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-slate-100 rounded-lg">
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

const authStore = useAuthStore();
const spiStore = useSpiDashboardStore();
const { user } = authStore;

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
  await spiStore.fetchSpiDashboard();
});
</script>

<style scoped></style>
