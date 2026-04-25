<template>
  <div class="min-h-screen bg-slate-50 font-sans">
    <!-- Main Content -->
    <div class="transition-all duration-300">
      <!-- Header -->
      <header
        class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4"
      >
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div>
              <h2 class="text-xl font-bold text-slate-900">
                Pengajuan <span class="text-[#d1a82a]">Kegiatan</span>
              </h2>
              <p class="text-sm text-slate-500">
                Verifikasi proposal kegiatan ormawa se-fakultas
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <!-- Search & Filter -->
            <div
              class="flex items-center gap-2 bg-white rounded-full border border-slate-200 px-4 py-2 shadow-sm"
            >
              <Icon
                name="heroicons:magnifying-glass"
                class="w-4 h-4 text-slate-400"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari kegiatan..."
                class="bg-transparent border-none text-sm text-slate-700 focus:outline-none w-40 sm:w-56"
              />
            </div>
            <div
              class="flex items-center gap-2 bg-white rounded-full border border-slate-200 px-4 py-2 shadow-sm"
            >
              <Icon name="heroicons:funnel" class="w-4 h-4 text-[#d1a82a]" />
              <select
                v-model="filterStatus"
                class="bg-transparent border-none text-sm text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="menunggu">Menunggu</option>
                <option value="disetujui">Disetujui</option>
                <option value="revisi">Revisi</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
            <div
              class="bg-[#d1a82a] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md"
            >
              {{ todayStr }}
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="p-4 sm:p-6 lg:p-8 space-y-6">
        <!-- Stats Cards -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          <!-- Total Kegiatan -->
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
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">
                {{ totalKegiatan }}
              </h3>
              <p class="text-sm text-slate-500">Total Kegiatan</p>
              <span class="inline-block mt-1 text-xs text-slate-400"
                >Semua proposal</span
              >
            </div>
          </div>

          <!-- Menunggu -->
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
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">
                {{ countByStatus("menunggu") }}
              </h3>
              <p class="text-sm text-slate-500">Menunggu</p>
              <span
                class="inline-block mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"
                >Perlu ditinjau</span
              >
            </div>
          </div>

          <!-- Disetujui -->
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
                {{ countByStatus("disetujui") }}
              </h3>
              <p class="text-sm text-slate-500">Disetujui</p>
              <span
                class="inline-block mt-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
                >Lanjut SPI</span
              >
            </div>
          </div>

          <!-- Ditolak -->
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
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">
                {{ countByStatus("ditolak") }}
              </h3>
              <p class="text-sm text-slate-500">Ditolak</p>
              <span
                class="inline-block mt-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full"
                >Tidak diproses</span
              >
            </div>
          </div>
        </div>

        <!-- Table Panel -->
        <div
          class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div
            class="flex justify-between items-center p-5 border-b border-slate-200"
          >
            <div>
              <h3 class="text-lg font-bold text-slate-900">Daftar Pengajuan</h3>
              <p class="text-sm text-slate-500">
                {{ filteredList.length }} kegiatan ditampilkan
              </p>
            </div>
            <span
              class="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full"
              >{{ totalKegiatan }} total</span
            >
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="text-left py-3 px-4 font-semibold text-slate-500">
                    Kegiatan
                  </th>
                  <th class="text-left py-3 px-4 font-semibold text-slate-500">
                    Ormawa
                  </th>
                  <th class="text-left py-3 px-4 font-semibold text-slate-500">
                    Tanggal Pengajuan
                  </th>
                  <th class="text-right py-3 px-4 font-semibold text-slate-500">
                    Dana Diajukan
                  </th>
                  <th
                    class="text-center py-3 px-4 font-semibold text-slate-500"
                  >
                    Status
                  </th>
                  <th
                    class="text-center py-3 px-4 font-semibold text-slate-500"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in filteredList"
                  :key="item.id"
                  class="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td class="py-3 px-4">
                    <p class="font-semibold text-slate-800">
                      {{ item.namaKegiatan }}
                    </p>
                    <p class="text-xs text-slate-500">
                      {{ item.jenisKegiatan }}
                    </p>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <div
                        class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        :style="{ backgroundColor: item.color || '#3b5988' }"
                      >
                        {{ item.kodeOrmawa?.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-medium text-slate-800">
                          {{ item.namaOrmawa }}
                        </p>
                        <p class="text-xs text-slate-500">
                          {{ item.kodeOrmawa }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-slate-600">
                    {{ formatDate(item.tanggalPengajuan) }}
                  </td>
                  <td class="py-3 px-4 text-right font-semibold text-[#d1a82a]">
                    {{ formatRp(item.totalDana) }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span
                      class="inline-flex text-xs font-semibold px-2 py-1 rounded-full"
                      :class="{
                        'bg-amber-100 text-amber-700':
                          statusColor(item.status) === 'yellow',
                        'bg-emerald-100 text-emerald-700':
                          statusColor(item.status) === 'mint',
                        'bg-orange-100 text-orange-700':
                          statusColor(item.status) === 'orange',
                        'bg-red-100 text-red-700':
                          statusColor(item.status) === 'coral',
                        'bg-blue-100 text-blue-700':
                          statusColor(item.status) === 'blue',
                      }"
                    >
                      {{ statusLabel(item.status) }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <button
                      @click="openDetail(item)"
                      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#d1a82a]/10 text-[#d1a82a] hover:bg-[#d1a82a]/20 transition font-medium text-sm"
                    >
                      <Icon name="heroicons:eye" class="w-4 h-4" /> Detail
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredList.length === 0">
                  <td colspan="6" class="py-12 text-center text-slate-400">
                    <Icon
                      name="heroicons:document-magnifying-glass"
                      class="w-12 h-12 mx-auto mb-2 text-slate-300"
                    />
                    <p>Tidak ada data kegiatan</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Detail -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-[#3b5988]/5 to-transparent"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-[#3b5988] text-white flex items-center justify-center"
            >
              <Icon name="heroicons:document-check" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800">
                {{ selected?.namaKegiatan }}
              </h3>
              <p class="text-xs text-slate-500">
                {{ selected?.namaOrmawa }} · {{ selected?.kodeOrmawa }}
              </p>
            </div>
          </div>
          <button
            @click="closeModal"
            class="p-1 rounded-full hover:bg-slate-100"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-slate-200 px-5">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-all"
            :class="
              activeTab === tab.key
                ? 'border-[#d1a82a] text-[#3b5988]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            "
          >
            <Icon :name="tab.icon" class="w-4 h-4" /> {{ tab.label }}
          </button>
        </div>

        <!-- Modal Body (scrollable) -->
        <div class="flex-1 overflow-y-auto p-5 space-y-5">
          <!-- TAB INFO KEGIATAN -->
          <div v-if="activeTab === 'info'" class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-xs font-semibold uppercase text-slate-400">
                  Nama Kegiatan
                </p>
                <p class="font-medium">{{ selected?.namaKegiatan }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase text-slate-400">
                  Jenis Kegiatan
                </p>
                <p class="font-medium">{{ selected?.jenisKegiatan }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase text-slate-400">
                  Tanggal Kegiatan
                </p>
                <p class="font-medium">
                  {{ formatDate(selected?.tanggalKegiatan) }}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase text-slate-400">
                  Lokasi
                </p>
                <p class="font-medium">{{ selected?.lokasi }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase text-slate-400">
                  Peserta
                </p>
                <p class="font-medium">{{ selected?.jumlahPeserta }} orang</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase text-slate-400">
                  Dana Diajukan
                </p>
                <p class="font-bold text-[#3b5988]">
                  {{ formatRp(selected?.totalDana) }}
                </p>
              </div>
              <div class="md:col-span-2">
                <p class="text-xs font-semibold uppercase text-slate-400">
                  Deskripsi Kegiatan
                </p>
                <p class="text-slate-700">{{ selected?.deskripsi }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase text-slate-400">
                  Diajukan oleh
                </p>
                <p class="font-medium">{{ selected?.pengaju }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase text-slate-400">
                  Tanggal Pengajuan
                </p>
                <p class="font-medium">
                  {{ formatDate(selected?.tanggalPengajuan) }}
                </p>
              </div>
            </div>

            <!-- RAB Table -->
            <div class="border border-slate-200 rounded-xl overflow-hidden">
              <div
                class="flex items-center gap-2 bg-slate-50 px-4 py-2 border-b border-slate-200"
              >
                <Icon
                  name="heroicons:calculator"
                  class="w-4 h-4 text-[#d1a82a]"
                />
                <span class="font-semibold text-slate-700"
                  >Rincian Anggaran Biaya (RAB)</span
                >
              </div>
              <table class="min-w-full text-sm">
                <thead class="bg-slate-50">
                  <tr>
                    <th
                      class="text-left py-2 px-4 font-semibold text-slate-500"
                    >
                      Item
                    </th>
                    <th
                      class="text-right py-2 px-4 font-semibold text-slate-500"
                    >
                      Qty
                    </th>
                    <th
                      class="text-right py-2 px-4 font-semibold text-slate-500"
                    >
                      Harga Satuan
                    </th>
                    <th
                      class="text-right py-2 px-4 font-semibold text-slate-500"
                    >
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="rab in selected?.rabItems || []"
                    :key="rab.id"
                    class="border-t border-slate-100"
                  >
                    <td class="py-2 px-4">{{ rab.nama }}</td>
                    <td class="py-2 px-4 text-right">{{ rab.qty }}</td>
                    <td class="py-2 px-4 text-right">
                      {{ formatRp(rab.harga) }}
                    </td>
                    <td class="py-2 px-4 text-right font-semibold">
                      {{ formatRp(rab.qty * rab.harga) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colspan="3" class="py-2 px-4 text-right font-bold">
                      Total
                    </td>
                    <td class="py-2 px-4 text-right font-bold text-[#3b5988]">
                      {{ formatRp(selected?.totalDana) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- TAB DOKUMEN -->
          <div v-if="activeTab === 'dokumen'">
            <h4 class="text-xs font-bold uppercase text-slate-400 mb-3">
              Lampiran Dokumen Proposal
            </h4>
            <div v-if="selected?.dokumen?.length" class="space-y-3">
              <div
                v-for="doc in selected.dokumen"
                :key="doc.id"
                class="flex items-center gap-4 p-3 border border-slate-200 rounded-xl hover:border-slate-300 transition"
              >
                <div
                  class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"
                >
                  <Icon name="heroicons:document-text" class="w-5 h-5" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-slate-800">{{ doc.nama }}</p>
                  <p class="text-xs text-slate-500">
                    {{ doc.tipe }} · {{ doc.ukuran }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <a
                    :href="doc.url"
                    target="_blank"
                    class="text-sm text-[#3b5988] hover:underline flex items-center gap-1"
                  >
                    <Icon name="heroicons:eye" class="w-4 h-4" /> Lihat
                  </a>
                  <a
                    :href="doc.url"
                    download
                    class="text-sm text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
                    Unduh
                  </a>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-slate-400">
              <Icon
                name="heroicons:folder-open"
                class="w-12 h-12 mx-auto mb-2 text-slate-300"
              />
              <p>Belum ada dokumen dilampirkan</p>
            </div>
          </div>

          <!-- TAB KEPUTUSAN -->
          <div v-if="activeTab === 'keputusan'" class="space-y-5">
            <!-- Status saat ini -->
            <div
              class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200"
            >
              <span class="text-xs font-semibold uppercase text-slate-400"
                >Status Saat Ini</span
              >
              <span
                class="inline-flex text-sm font-semibold px-3 py-1 rounded-full"
                :class="{
                  'bg-amber-100 text-amber-700':
                    statusColor(selected?.status) === 'yellow',
                  'bg-emerald-100 text-emerald-700':
                    statusColor(selected?.status) === 'mint',
                  'bg-orange-100 text-orange-700':
                    statusColor(selected?.status) === 'orange',
                  'bg-red-100 text-red-700':
                    statusColor(selected?.status) === 'coral',
                }"
              >
                {{ statusLabel(selected?.status) }}
              </span>
            </div>

            <!-- Riwayat -->
            <div v-if="selected?.riwayat?.length">
              <h4 class="text-xs font-bold uppercase text-slate-400 mb-2">
                Riwayat Keputusan
              </h4>
              <div class="space-y-3">
                <div
                  v-for="rw in selected.riwayat"
                  :key="rw.id"
                  class="flex gap-3"
                >
                  <div
                    class="w-2.5 h-2.5 rounded-full mt-1.5"
                    :class="{
                      'bg-emerald-500': rw.status === 'disetujui',
                      'bg-amber-500': rw.status === 'revisi',
                      'bg-red-500': rw.status === 'ditolak',
                      'bg-slate-300': rw.status === 'menunggu',
                    }"
                  ></div>
                  <div>
                    <p class="text-sm font-medium text-slate-800">
                      {{ rw.keterangan }}
                    </p>
                    <p class="text-xs text-slate-500">
                      {{ rw.oleh }} · {{ formatDate(rw.tanggal) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form keputusan (hanya jika menunggu) -->
            <div
              v-if="selected?.status === 'menunggu'"
              class="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3"
            >
              <label class="text-sm font-semibold text-slate-700 block"
                >Catatan / Alasan (opsional)</label
              >
              <textarea
                v-model="catatanPPK"
                rows="3"
                class="w-full border border-slate-300 rounded-lg p-2 text-sm"
                placeholder="Masukkan catatan atau alasan keputusan..."
              ></textarea>
              <div class="flex flex-wrap gap-3">
                <button
                  @click="handleDecision('disetujui')"
                  :disabled="loadingAction"
                  class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                >
                  <Icon name="heroicons:check-circle" class="w-5 h-5" /> Setujui
                  — Teruskan ke SPI
                </button>
                <button
                  @click="handleDecision('revisi')"
                  :disabled="loadingAction"
                  class="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition"
                >
                  <Icon name="heroicons:arrow-path" class="w-5 h-5" /> Minta
                  Revisi
                </button>
                <button
                  @click="handleDecision('ditolak')"
                  :disabled="loadingAction"
                  class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  <Icon name="heroicons:x-circle" class="w-5 h-5" /> Tolak
                </button>
              </div>
            </div>

            <div
              v-else
              class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-slate-500 text-sm border border-slate-200"
            >
              <Icon name="heroicons:information-circle" class="w-5 h-5" />
              Keputusan telah diberikan. Hubungi admin untuk perubahan.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from "vue";

  // Types
  interface RabItem {
    id: number;
    nama: string;
    qty: number;
    harga: number;
  }

  interface DokumenItem {
    id: number;
    nama: string;
    tipe: string;
    ukuran: string;
    url: string;
  }

  interface RiwayatKeputusan {
    id: number;
    status: string;
    keterangan: string;
    oleh: string;
    tanggal: string;
  }

  interface KegiatanItem {
    id: number;
    namaKegiatan: string;
    jenisKegiatan: string;
    tanggalKegiatan: string;
    lokasi: string;
    jumlahPeserta: number;
    totalDana: number;
    deskripsi: string;
    pengaju: string;
    tanggalPengajuan: string;
    status: "menunggu" | "disetujui" | "revisi" | "ditolak" | "dikirim_spi";
    namaOrmawa: string;
    kodeOrmawa: string;
    rabItems: RabItem[];
    dokumen: DokumenItem[];
    riwayat: RiwayatKeputusan[];
    color?: string;
  }

  // API call
  const { data: kegiatanData, refresh } = await useFetch<{
    data: KegiatanItem[];
  }>("/api/ppk/kegiatan");

  // State
  const searchQuery = ref("");
  const filterStatus = ref("");
  const showModal = ref(false);
  const selected = ref<KegiatanItem | null>(null);
  const activeTab = ref<"info" | "dokumen" | "keputusan">("info");
  const catatanPPK = ref("");
  const loadingAction = ref(false);

  // Tabs
  const tabs = [
    {
      key: "info" as const,
      label: "Info Kegiatan",
      icon: "heroicons:information-circle",
    },
    {
      key: "dokumen" as const,
      label: "Dokumen",
      icon: "heroicons:document-text",
    },
    { key: "keputusan" as const, label: "Keputusan", icon: "heroicons:scale" },
  ];

  // Helpers
  const todayStr = new Date().toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const kegiatanList = computed(() => kegiatanData.value?.data || []);
  const totalKegiatan = computed(() => kegiatanList.value.length);
  const countByStatus = (status: string) =>
    kegiatanList.value.filter((k) => k.status === status).length;

  const filteredList = computed(() => {
    return kegiatanList.value.filter((item) => {
      const q = searchQuery.value.toLowerCase();
      const matchSearch =
        !q ||
        item.namaKegiatan.toLowerCase().includes(q) ||
        item.namaOrmawa.toLowerCase().includes(q);
      const matchStatus =
        !filterStatus.value || item.status === filterStatus.value;
      return matchSearch && matchStatus;
    });
  });

  const openDetail = (item: KegiatanItem) => {
    selected.value = item;
    activeTab.value = "info";
    catatanPPK.value = "";
    showModal.value = true;
  };
  const closeModal = () => {
    showModal.value = false;
    selected.value = null;
  };

  const handleDecision = async (keputusan: string) => {
    if (!selected.value) return;
    loadingAction.value = true;
    try {
      await $fetch(`/api/ppk/kegiatan/${selected.value.id}/keputusan`, {
        method: "POST",
        body: { status: keputusan, catatan: catatanPPK.value },
      });
      selected.value.status = keputusan as any;
      if (keputusan === "disetujui") activeTab.value = "keputusan";
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      loadingAction.value = false;
    }
  };

  const statusColor = (s?: string) => {
    const map: Record<string, string> = {
      menunggu: "yellow",
      disetujui: "mint",
      revisi: "orange",
      ditolak: "coral",
      dikirim_spi: "blue",
    };
    return map[s || ""] || "blue";
  };

  const statusLabel = (s?: string) => {
    const map: Record<string, string> = {
      menunggu: "Menunggu",
      disetujui: "Disetujui",
      revisi: "Revisi",
      ditolak: "Ditolak",
      dikirim_spi: "Dikirim ke SPI",
    };
    return map[s || ""] || s || "-";
  };

  const formatRp = (n?: number) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(n || 0);
  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";
</script>

<style scoped>
  /* Custom scrollbar (opsional, sama seperti dokumen pertama) */
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
</style>
