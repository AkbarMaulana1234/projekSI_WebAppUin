<template>
  <div class="min-h-screen bg-slate-50 font-sans">
    <!-- Sidebar -->
    <!-- Main Content -->
    <div :class="['transition-all duration-300']">
      <!-- Header -->
      <header
        class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div>
              <h2 class="text-xl font-bold text-slate-900">Dashboard</h2>
              <p class="text-sm text-slate-500">
                Selamat datang kembali, {{ user?.username }}
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
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          <!-- Total RAB -->
          <div
            class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-[#3b5988]/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-xl bg-[#3b5988]/10 text-[#3b5988]">
                  <Icon name="heroicons:document-text" class="w-6 h-6" />
                </div>
                <span
                  class="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"
                >
                  <Icon name="heroicons:arrow-trending-up" class="w-3 h-3" />
                  +12%
                </span>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">24</h3>
              <p class="text-sm text-slate-500">Total RAB Diajukan</p>
            </div>
          </div>

          <!-- Pending -->
          <div
            class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                  <Icon name="heroicons:clock" class="w-6 h-6" />
                </div>
                <span class="text-xs font-medium text-slate-400">Menunggu</span>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">8</h3>
              <p class="text-sm text-slate-500">RAB Dalam Proses</p>
            </div>
          </div>

          <!-- Rejected -->
          <div
            class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-xl bg-red-500/10 text-red-600">
                  <Icon name="heroicons:x-circle" class="w-6 h-6" />
                </div>
                <span class="text-xs font-medium text-slate-400">Ditolak</span>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">3</h3>
              <p class="text-sm text-slate-500">RAB Ditolak</p>
            </div>
          </div>

          <!-- Completed -->
          <div
            class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Icon name="heroicons:check-badge" class="w-6 h-6" />
                </div>
                <span
                  class="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"
                >
                  <Icon name="heroicons:arrow-trending-up" class="w-3 h-3" />
                  +5%
                </span>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">13</h3>
              <p class="text-sm text-slate-500">RAB Selesai</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions & Chart -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Quick Actions -->
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <h3 class="text-lg font-bold text-slate-900 mb-4">Aksi Cepat</h3>
            <div class="space-y-3">
              <button
                @click="nav('/dashboard/ormawa/pengajuanRab')"
                class="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#3b5988] to-[#2d4570] text-white hover:shadow-lg hover:shadow-[#3b5988]/25 transition-all group"
              >
                <div class="p-2 rounded-lg bg-white/20">
                  <Icon name="heroicons:plus" class="w-5 h-5" />
                </div>
                <div class="text-left">
                  <p class="font-semibold">Ajukan RAB Baru</p>
                  <p class="text-xs text-blue-100">
                    Buat pengajuan anggaran baru
                  </p>
                </div>
                <Icon
                  name="heroicons:arrow-right"
                  class="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform"
                />
              </button>

              <button
                class="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-[#d1a82a] hover:text-[#d1a82a] hover:bg-[#d1a82a]/5 transition-all group"
              >
                <div
                  class="p-2 rounded-lg bg-slate-100 group-hover:bg-[#d1a82a]/10"
                >
                  <Icon name="heroicons:folder-open" class="w-5 h-5" />
                </div>
                <div class="text-left">
                  <p class="font-semibold">Lihat Arsip</p>
                  <p class="text-xs text-slate-400">Akses dokumen lama</p>
                </div>
              </button>
            </div>

            <!-- Mini Calendar -->
            <div class="mt-6 pt-6 border-t border-slate-100">
              <div class="flex items-center gap-2 mb-3">
                <Icon
                  name="heroicons:calendar"
                  class="w-5 h-5 text-[#d1a82a]"
                />
                <span class="font-semibold text-slate-900"
                  >Jadwal Mendatang</span
                >
              </div>
              <div class="space-y-2">
                <div
                  class="flex items-center gap-3 p-3 rounded-lg bg-[#d1a82a]/10 border border-[#d1a82a]/20"
                >
                  <div
                    class="w-10 h-10 rounded-lg bg-[#d1a82a] flex flex-col items-center justify-center text-white text-xs font-bold"
                  >
                    <span>15</span>
                    <span class="text-[10px] font-normal">Okt</span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900">
                      Review RAB Q4
                    </p>
                    <p class="text-xs text-slate-500">10:00 - 12:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Statistics Chart -->
        </div>
        <!-- RAB List -->
        <table-component></table-component>
      </main>
    </div>

    <!-- Detail Modal -->
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { useAuthStore } from "~/stores/auth";
  const authStore = useAuthStore();
  const { user } = authStore;
  const nav = (path: string) => {
    return navigateTo(path);
  };
</script>

<style>
  @theme {
    --color-primary: #3b5988;
    --color-secondary: #d1a82a;
    --color-bgLogin: #eee8aa;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Smooth transitions */
  * {
    transition-property:
      color, background-color, border-color, text-decoration-color, fill,
      stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
</style>
