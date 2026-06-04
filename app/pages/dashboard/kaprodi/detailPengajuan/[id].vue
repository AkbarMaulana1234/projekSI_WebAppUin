<!-- FILE: app/pages/dashboard/kaprodi/detailPengajuan/[id].vue -->
<template>
  <div class="min-h-screen bg-slate-50 font-sans">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="$router.back()" class="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition font-medium">
            <Icon name="heroicons:arrow-left" class="w-4 h-4" /> Kembali
          </button>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-400 font-mono">{{ detail?.nomorPengajuan }}</span>
          <div class="bg-[#d1a82a] text-white text-xs font-bold px-4 py-2 rounded-full">{{ todayStr }}</div>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="flex flex-col items-center gap-3 text-slate-400">
        <div class="w-8 h-8 border-2 border-slate-200 border-t-[#3b5988] rounded-full animate-spin"></div>
        <p class="text-sm">Memuat data pengajuan...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="storeError" class="flex items-center justify-center py-32">
      <div class="text-center text-slate-400">
        <Icon name="heroicons:exclamation-circle" class="w-12 h-12 mx-auto mb-2 text-red-300" />
        <p class="font-medium text-red-500">Gagal memuat data</p>
        <p class="text-sm mt-1">{{ storeError }}</p>
        <button @click="reloadData" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm">
          Coba Lagi
        </button>
      </div>
    </div>

    <!-- Content -->
    <main v-else-if="detail" class="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- LEFT: Info + Dokumen + Log -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Info Kegiatan -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#3b5988]/5 to-transparent">
            <div class="w-9 h-9 rounded-xl bg-[#3b5988] text-white flex items-center justify-center">
              <Icon name="heroicons:document-text" class="w-5 h-5" />
            </div>
            <div>
              <h2 class="font-bold text-slate-800 text-lg">{{ detail.judulKegiatan }}</h2>
              <p class="text-xs text-slate-500">{{ detail.ormawa?.nama }} · {{ detail.ormawa?.kode }}</p>
            </div>
            <div class="ml-auto">
              <span class="inline-flex text-xs font-semibold px-3 py-1 rounded-full" :class="statusClass(detail.status)">
                {{ statusLabel(detail.status) }}
              </span>
            </div>
          </div>
          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p class="text-xs font-semibold uppercase text-slate-400 mb-1">Diajukan Oleh</p>
              <p class="font-medium text-slate-800">{{ detail.pengaju?.nama }}</p>
              <p class="text-xs text-slate-500">{{ detail.pengaju?.email }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase text-slate-400 mb-1">Organisasi</p>
              <p class="font-medium text-slate-800">{{ detail.ormawa?.nama }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase text-slate-400 mb-1">Tanggal Kegiatan</p>
              <p class="font-medium text-slate-800">
                {{ formatDate(detail.tanggalMulai) }}
                <span v-if="detail.tanggalSelesai && detail.tanggalSelesai !== detail.tanggalMulai">
                  — {{ formatDate(detail.tanggalSelesai) }}
                </span>
              </p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase text-slate-400 mb-1">Total Anggaran</p>
              <p class="font-bold text-[#3b5988] text-lg">{{ formatRp(detail.totalAnggaran) }}</p>
            </div>
            <div class="sm:col-span-2">
              <p class="text-xs font-semibold uppercase text-slate-400 mb-1">Deskripsi</p>
              <p class="text-slate-700 text-sm leading-relaxed">{{ detail.deskripsi || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Preview Dokumen -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 sm:p-6 border-b border-slate-100">
            <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Icon name="heroicons:document-text" class="w-5 h-5 text-[#d1a82a]" />
              Preview Dokumen
            </h3>

            <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex gap-2 p-1 bg-slate-100 rounded-xl inline-flex">
              <button
                @click="activeDoc = 'rab'"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                  activeDoc === 'rab'
                    ? 'bg-white text-[#3b5988] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900',
                ]"
              >
                <Icon name="heroicons:calculator" class="w-4 h-4" />
                RAB
              </button>
              <button
                @click="activeDoc = 'tor'"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                  activeDoc === 'tor'
                    ? 'bg-white text-[#3b5988] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900',
                ]"
              >
                <Icon name="heroicons:document-duplicate" class="w-4 h-4" />
                TOR
              </button>
            </div>
              <button
                v-if="revisionSnapshots.length"
                @click="openCompare(revisionSnapshots[revisionSnapshots.length - 1])"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
              >
                <Icon name="heroicons:arrows-right-left" class="w-4 h-4" />
                Compare Revisi
              </button>
            </div>
          </div>

          <div class="p-6">
            <div v-if="currentFileObjectUrl" class="w-full">
              <iframe
                v-if="isPdf"
                :src="currentFileObjectUrl"
                class="w-full h-[600px] rounded-xl border border-slate-200"
                frameborder="0"
              ></iframe>
              <div v-else class="text-center py-12">
                <Icon name="heroicons:document" class="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p class="text-slate-600 mb-4">
                  Preview tidak tersedia untuk tipe file ini.
                </p>
                <button
                  @click="downloadDocument"
                  class="px-4 py-2 bg-[#3b5988] text-white rounded-lg"
                >
                  Download {{ activeDoc.toUpperCase() }}
                </button>
              </div>
              <div class="flex justify-center gap-3 mt-4">
                <button
                  @click="openDocument"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b5988] text-white font-medium hover:bg-[#2d4570] transition-all"
                >
                  <Icon name="heroicons:eye" class="w-5 h-5" />
                  Buka {{ activeDoc.toUpperCase() }} di Tab Baru
                </button>
              </div>
            </div>

            <div
              v-else
              class="aspect-[3/4] bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center"
            >
              <div class="w-20 h-20 rounded-2xl bg-[#3b5988]/10 flex items-center justify-center mb-4">
                <Icon name="heroicons:document-text" class="w-10 h-10 text-[#3b5988]" />
              </div>
              <h4 class="text-lg font-semibold text-slate-900 mb-2">
                Belum ada file
              </h4>
              <p class="text-sm text-slate-500 mb-4 max-w-sm">
                File {{ activeDoc.toUpperCase() }} tidak tersedia atau gagal dimuat.
              </p>
            </div>
          </div>
        </div>

        <!-- Log Riwayat -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <Icon name="heroicons:clock" class="w-5 h-5 text-[#d1a82a]" />
            <h3 class="font-bold text-slate-800">Riwayat Persetujuan & Revisi</h3>
            <span v-if="detail.riwayat?.length" class="ml-auto text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
              {{ detail.riwayat.length }} entri
            </span>
          </div>
          <div class="p-6">
            <!-- Upload pertama -->
            <div class="flex gap-4 mb-4">
              <div class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:arrow-up-tray" class="w-4 h-4" />
                </div>
                <div v-if="detail.riwayat?.length" class="w-0.5 flex-1 bg-slate-200 mt-2"></div>
              </div>
              <div class="pb-4">
                <p class="text-sm font-semibold text-slate-800">Pengajuan diunggah</p>
                <p class="text-xs text-slate-500 mt-0.5">oleh {{ detail.pengaju?.nama }} · {{ formatDateTime(detail.createdAt) }}</p>
              </div>
            </div>

            <!-- Riwayat approval -->
            <div v-if="detail.riwayat?.length" class="space-y-0">
              <div v-for="(log, i) in detail.riwayat" :key="log.id" class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    :class="logIconClass(log.action)">
                    <Icon :name="logIcon(log.action)" class="w-4 h-4" />
                  </div>
                  <div v-if="i < detail.riwayat.length - 1" class="w-0.5 flex-1 bg-slate-200 mt-2"></div>
                </div>
                <div class="pb-4 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <p class="text-sm font-semibold text-slate-800">{{ logLabel(log) }}</p>
                    <span class="text-xs text-slate-400 whitespace-nowrap">{{ formatDateTime(log.createdAt) }}</span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">oleh {{ log.aktor?.nama }} ({{ log.aktor?.role }})</p>
                  <div v-if="log.catatan" class="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                    <span class="font-semibold">Catatan:</span> {{ log.catatan }}
                  </div>
                  <button
                    v-if="revisionSnapshots[i]"
                    @click="openCompare(revisionSnapshots[i])"
                    class="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#3b5988] hover:underline"
                  >
                    <Icon name="heroicons:arrows-right-left" class="w-4 h-4" />
                    Compare dokumen revisi
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-6 text-slate-400">
              <p class="text-sm">Belum ada riwayat persetujuan</p>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Ringkasan + Aksi Kaprodi -->
      <div class="space-y-6">

        <!-- Ringkasan -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-800">Ringkasan</h3>
          </div>
          <div class="p-5 space-y-4">
            <div class="bg-[#3b5988] rounded-xl p-4 text-white">
              <p class="text-xs opacity-70 mb-1">Total Anggaran Diajukan</p>
              <p class="text-xl font-bold">{{ formatRp(detail.totalAnggaran) }}</p>
            </div>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500">Pengaju</span>
                <span class="font-medium text-slate-800 text-right max-w-[60%]">{{ detail.pengaju?.nama }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Tanggal Upload</span>
                <span class="font-medium text-slate-800">{{ formatDate(detail.createdAt) }}</span>
              </div>
              <div v-if="lastRevisi" class="flex justify-between">
                <span class="text-slate-500">Terakhir Direvisi</span>
                <span class="font-medium text-slate-800">{{ formatDate(lastRevisi) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Status Saat Ini</span>
                <span class="inline-flex text-xs font-semibold px-2 py-0.5 rounded-full" :class="statusClass(detail.status)">
                  {{ statusLabel(detail.status) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Jumlah Revisi</span>
                <span class="font-bold text-slate-800">{{ jumlahRevisi }}x</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Aksi Kaprodi -->
        <div v-if="detail.status === 'waiting_kaprodi'" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-800">Keputusan Anda (Kaprodi)</h3>
            <p class="text-xs text-slate-500 mt-0.5">Tinjau pengajuan lalu berikan keputusan</p>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <label class="text-sm font-semibold text-slate-700 block mb-1.5">
                Catatan / Alasan
                <span class="font-normal text-slate-400">(wajib untuk revisi & tolak)</span>
              </label>
              <textarea
                v-model="catatan"
                rows="4"
                class="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b5988]/30 focus:border-[#3b5988] resize-none"
                placeholder="Tuliskan catatan atau alasan keputusan..."
              ></textarea>
            </div>

            <div class="space-y-2">
              <button
                @click="handleDecision('disetujui')"
                :disabled="actionLoading"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold transition text-sm shadow-md"
              >
                <Icon name="heroicons:check-circle" class="w-5 h-5" />
                Setujui — Teruskan ke PPK
              </button>
              <button
                @click="handleDecision('revisi')"
                :disabled="actionLoading || !catatan.trim()"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl font-semibold transition text-sm shadow-sm"
              >
                <Icon name="heroicons:arrow-path" class="w-5 h-5" />
                Minta Revisi
              </button>
              <button
                @click="handleDecision('tolak')"
                :disabled="actionLoading || !catatan.trim()"
                class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold transition text-sm shadow-sm"
              >
                <Icon name="heroicons:x-circle" class="w-5 h-5" />
                Tolak Pengajuan
              </button>
            </div>

            <p v-if="actionLoading" class="text-center text-xs text-slate-400 animate-pulse">Memproses keputusan...</p>
            <p v-if="successMsg" class="text-center text-xs text-emerald-600 font-semibold">{{ successMsg }}</p>
            <p v-if="errorMsg" class="text-center text-xs text-red-500">{{ errorMsg }}</p>
          </div>
        </div>

        <!-- Keputusan sudah diberikan -->
        <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div class="flex items-center gap-2 text-slate-500 text-sm">
            <Icon name="heroicons:information-circle" class="w-5 h-5" />
            <span>Keputusan telah diberikan untuk pengajuan ini.</span>
          </div>
        </div>

      </div>
    </main>

    <div
      v-if="compareOpen"
      class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center"
    >
      <div class="w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div class="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="font-bold text-slate-900">Compare Dokumen Revisi</h3>
            <p class="text-xs text-slate-500">Sebelum dan sesudah revisi ditampilkan berdampingan.</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                v-for="doc in compareDocs"
                :key="doc"
                @click="setCompareDoc(doc)"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase"
                :class="compareDoc === doc ? 'bg-white text-[#3b5988] shadow-sm' : 'text-slate-500'"
              >
                {{ doc }}
              </button>
            </div>
            <button
              @click="closeCompare"
              class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
          <div class="border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col min-h-0">
            <div class="px-4 py-2 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700">Sebelum Revisi</div>
            <iframe v-if="compareBeforeUrl" :src="compareBeforeUrl" class="w-full flex-1" frameborder="0"></iframe>
            <div v-else class="flex-1 flex items-center justify-center text-sm text-slate-400">File sebelum revisi tidak tersedia.</div>
          </div>
          <div class="flex flex-col min-h-0">
            <div class="px-4 py-2 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700">Sesudah Revisi</div>
            <iframe v-if="compareAfterUrl" :src="compareAfterUrl" class="w-full flex-1" frameborder="0"></iframe>
            <div v-else class="flex-1 flex items-center justify-center text-sm text-slate-400">File setelah revisi tidak tersedia.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useKaprodiDetailStore } from '~/stores/kaprodi/DetailPengajuan'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

// Gunakan store Kaprodi
const kaprodiStore = useKaprodiDetailStore()

const detail = computed(() => kaprodiStore.detail)
const loading = computed(() => kaprodiStore.loading)
const storeError = computed(() => kaprodiStore.error)

// Multi-document state
const activeDoc = ref<'rab' | 'tor'>('rab')
const fileRabObjectUrl = computed(() => kaprodiStore.fileRabObjectUrl)
const fileTorObjectUrl = computed(() => kaprodiStore.fileTorObjectUrl)
const currentFileObjectUrl = computed(() =>
  activeDoc.value === 'rab'
    ? fileRabObjectUrl.value
    : fileTorObjectUrl.value,
)

// File info untuk deteksi tipe
const fileInfo = computed(() => {
  const activeBlob =
    activeDoc.value === 'rab'
      ? kaprodiStore.fileRabBlob
      : kaprodiStore.fileTorBlob
  const activeUrl =
    activeDoc.value === 'rab'
      ? detail.value?.fileRabUrl
      : detail.value?.fileTorUrl

  if (activeBlob) {
    let name = `dokumen_${activeDoc.value}`
    if (activeUrl) {
      const urlParts = activeUrl.split('/')
      name = urlParts.pop() || name
    }
    return {
      name,
      size: activeBlob.size,
      type: activeBlob.type || 'application/pdf',
    }
  }
  return { name: null, size: null, type: null }
})

const isPdf = computed(() => {
  const type = fileInfo.value.type
  const url =
    activeDoc.value === 'rab'
      ? detail.value?.fileRabUrl
      : detail.value?.fileTorUrl
  return (
    type === 'application/pdf' || (url || '').toLowerCase().endsWith('.pdf')
  )
})

// Action state
const catatan = ref('')
const actionLoading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const compareOpen = ref(false)
const compareDoc = ref<'rab' | 'tor'>('rab')
const compareDocs = ['rab', 'tor'] as const
const selectedRevision = ref<any>(null)
const compareBeforeUrl = ref<string | null>(null)
const compareAfterUrl = ref<string | null>(null)

const revisionSnapshots = computed(() => detail.value?.revisionSnapshots || [])

const jumlahRevisi = computed(() =>
  (detail.value?.riwayat || []).filter((r: any) => r.action === 'revisi' || r.action === 'ditolak').length
)

const lastRevisi = computed(() => {
  const revisi = (detail.value?.riwayat || []).filter((r: any) => r.action === 'revisi' || r.action === 'ditolak')
  return revisi.length ? revisi[revisi.length - 1].createdAt : null
})

const todayStr = new Date().toLocaleDateString('id-ID', {
  weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
})

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

const formatDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'

const formatRp = (n?: number | string) =>
  'Rp ' + new Intl.NumberFormat('id-ID').format(Number(n) || 0)

const statusLabel = (s?: string) => {
  const map: Record<string, string> = {
    waiting_kaprodi: 'Menunggu Kaprodi', revisi_kaprodi: 'Revisi Kaprodi',
    waiting_ppk: 'Menunggu PPK', revisi_ppk: 'Revisi PPK', waiting_spi: 'Dikirim ke SPI',
    ditolak_spi: 'Ditolak SPI', disetujui: 'Disetujui', draft: 'Draft',
  }
  return map[s || ''] || s || '-'
}

const statusClass = (s?: string) => {
  const map: Record<string, string> = {
    waiting_kaprodi: 'bg-amber-100 text-amber-700',
    revisi_kaprodi: 'bg-orange-100 text-orange-700',
    waiting_ppk: 'bg-blue-100 text-blue-700',
    revisi_ppk: 'bg-orange-100 text-orange-700',
    waiting_spi: 'bg-blue-100 text-blue-700',
    disetujui: 'bg-emerald-100 text-emerald-700',
    ditolak_spi: 'bg-red-100 text-red-700',
  }
  return map[s || ''] || 'bg-slate-100 text-slate-600'
}

const logIcon = (action?: string) => {
  const map: Record<string, string> = {
    disetujui: 'heroicons:check-circle', revisi: 'heroicons:arrow-path',
    ditolak: 'heroicons:x-circle', submit: 'heroicons:arrow-up-tray',
  }
  return map[action || ''] || 'heroicons:ellipsis-horizontal-circle'
}

const logIconClass = (action?: string) => {
  const map: Record<string, string> = {
    disetujui: 'bg-emerald-100 text-emerald-600',
    revisi: 'bg-amber-100 text-amber-600',
    ditolak: 'bg-red-100 text-red-600',
  }
  return map[action || ''] || 'bg-slate-100 text-slate-500'
}

// Format tulisan timeline dinamis berdasarkan actor pengambil tindakan
const logLabel = (log: any) => {
  const action = log.action
  const role = log.aktor?.role?.toUpperCase() || ''
  if (action === 'disetujui') {
    return `Disetujui oleh ${role} — diteruskan ke tahap berikutnya`
  }
  if (action === 'revisi') {
    return `Diminta revisi oleh ${role}`
  }
  if (action === 'ditolak') {
    return `Ditolak oleh ${role}`
  }
  return action || '-'
}

// Buka dokumen di tab baru
const openDocument = () => {
  if (currentFileObjectUrl.value) {
    window.open(currentFileObjectUrl.value, '_blank')
  }
}

// Download dokumen
const downloadDocument = () => {
  if (currentFileObjectUrl.value) {
    const link = document.createElement('a')
    link.href = currentFileObjectUrl.value
    link.download = fileInfo.value.name || `dokumen_${activeDoc.value}.pdf`
    link.click()
  }
}

const cleanupCompareUrls = () => {
  if (compareBeforeUrl.value) {
    window.URL.revokeObjectURL(compareBeforeUrl.value)
    compareBeforeUrl.value = null
  }
  if (compareAfterUrl.value) {
    window.URL.revokeObjectURL(compareAfterUrl.value)
    compareAfterUrl.value = null
  }
}

const loadCompareFiles = async () => {
  cleanupCompareUrls()
  if (!selectedRevision.value) return

  const [beforeBlob, afterBlob] = await Promise.all([
    $fetch(`/api/kaprodi/kegiatan/${id}/file`, {
      method: 'POST',
      body: {
        documentType: compareDoc.value,
        revisionId: selectedRevision.value.id,
        side: 'before',
      },
      responseType: 'blob',
    }).catch(() => null),
    $fetch(`/api/kaprodi/kegiatan/${id}/file`, {
      method: 'POST',
      body: {
        documentType: compareDoc.value,
        revisionId: selectedRevision.value.id,
        side: 'after',
      },
      responseType: 'blob',
    }).catch(() => null),
  ])

  if (beforeBlob) compareBeforeUrl.value = window.URL.createObjectURL(beforeBlob as Blob)
  if (afterBlob) compareAfterUrl.value = window.URL.createObjectURL(afterBlob as Blob)
}

const openCompare = async (revision: any) => {
  selectedRevision.value = revision
  compareOpen.value = true
  await loadCompareFiles()
}

const setCompareDoc = async (doc: 'rab' | 'tor') => {
  compareDoc.value = doc
  await loadCompareFiles()
}

const closeCompare = () => {
  compareOpen.value = false
  selectedRevision.value = null
  cleanupCompareUrls()
}

// Reload data
const reloadData = async () => {
  await kaprodiStore.fetchFullData(id)
}

// Kirim keputusan verifikasi
const handleDecision = async (keputusan: string) => {
  if ((keputusan === 'revisi' || keputusan === 'tolak') && !catatan.value.trim()) {
    errorMsg.value = 'Catatan wajib diisi untuk revisi atau tolak.'
    return
  }
  actionLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await $fetch(`/api/kaprodi/kegiatan/${id}/keputusan`, {
      method: 'POST',
      body: { keputusan, catatan: catatan.value },
    })
    successMsg.value = keputusan === 'disetujui'
      ? 'Pengajuan berhasil disetujui dan diteruskan ke PPK.'
      : keputusan === 'revisi' ? 'Pengajuan dikembalikan ke Ormawa untuk revisi.' : 'Pengajuan ditolak.'
    await reloadData()
    setTimeout(() => router.back(), 1500)
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || 'Gagal memproses keputusan.'
  } finally {
    actionLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  if (id) {
    await reloadData()
  }
})

onBeforeUnmount(() => {
  cleanupCompareUrls()
  kaprodiStore.cleanupFileUrls()
})
</script>

<style scoped>
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
</style>
