<template>
  <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <!-- Loading State -->
    <div
      v-if="detailStore.loading"
      class="flex justify-center items-center h-64"
    >
      <div class="text-center">
        <Icon
          name="heroicons:arrow-path"
          class="w-12 h-12 animate-spin text-[#c41e3a] mx-auto mb-4"
        />
        <p class="text-slate-600">Memuat data pengajuan...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="detailStore.error" class="max-w-6xl mx-auto">
      <div class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <Icon
          name="heroicons:exclamation-triangle"
          class="w-12 h-12 text-red-500 mx-auto mb-4"
        />
        <h3 class="text-lg font-bold text-red-800 mb-2">Gagal Memuat Data</h3>
        <p class="text-red-600">{{ detailStore.error }}</p>
        <button
          @click="reloadData"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
        >
          Coba Lagi
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="rab" class="max-w-6xl mx-auto space-y-6">
      <!-- Header Actions -->
      <div class="flex items-center justify-between">
        <button
          @click="goBack"
          class="flex items-center gap-2 text-slate-600 hover:text-[#c41e3a] transition-colors"
        >
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
          <span class="font-medium">Kembali ke Dashboard</span>
        </button>
        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-500"
            >ID: {{ rab.nomorPengajuan }}</span
          >
          <div
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5',
              getStatusColor(rab.status),
            ]"
          >
            <span
              :class="['w-1.5 h-1.5 rounded-full', getStatusDot(rab.status)]"
            ></span>
            {{ formatStatus(rab.status) }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <!-- Main Info Card -->
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
          >
            <!-- Processing Timeline -->

            <div class="flex items-start justify-between gap-4 mb-4">
              <div>
                <p
                  class="text-sm text-slate-500 mb-1 font-semibold uppercase tracking-wider"
                >
                  Pengajuan RAB & TOR
                </p>
                <h1
                  class="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight"
                >
                  {{ rab.judulKegiatan }}
                </h1>
              </div>
            </div>

            <div
              class="flex flex-wrap items-center gap-4 text-sm text-slate-600"
            >
              <div class="flex items-center gap-2">
                <Icon name="heroicons:clock" class="w-4 h-4 text-[#c41e3a]" />
                <span class="font-medium text-slate-800">
                  Pelaksanaan: {{ formatDate(rab.tanggalMulai) }} s/d
                  {{ formatDate(rab.tanggalSelesai) }}
                </span>
              </div>
              <span class="text-slate-300 hidden sm:block">|</span>
              <div class="flex items-center gap-2">
                <Icon
                  name="heroicons:calendar"
                  class="w-4 h-4 text-slate-400"
                />
                <span>Diajukan {{ formatDate(rab.createdAt) }}</span>
              </div>
            </div>
            <div class="mt-6 flex gap-3 flex-end">
              <template v-if="rab.status === 'waiting_spi'">
                <button
                  @click="openActionModal('setuju')"
                  class="inline-flex items-center gap-2 rounded-lg border border-green-400 bg-transparent px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50 focus:outline-none"
                >
                  <Icon name="heroicons:check-badge" class="h-4 w-4" />
                  Setujui
                </button>
                <button
                  @click="openActionModal('revisi')"
                  class="inline-flex items-center gap-2 rounded-lg border border-yellow-400 bg-transparent px-4 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-50 focus:outline-none"
                >
                  <Icon name="heroicons:arrow-path" class="h-4 w-4" />
                  Revisi
                </button>
                <button
                  @click="openActionModal('tolak')"
                  class="inline-flex items-center gap-2 rounded-lg border border-red-400 bg-transparent px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none"
                >
                  <Icon name="heroicons:x-mark" class="h-4 w-4" />
                  Tolak
                </button>
              </template>
              <template v-else>
                <div
                  class="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3"
                >
                  <p class="text-center text-sm font-medium text-slate-500">
                    Dokumen ini tidak dalam status menunggu review SPI.
                  </p>
                </div>
              </template>
            </div>
            <div
              class="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
            >
              <label
                class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block"
                >Deskripsi</label
              >
              <p class="text-slate-700 leading-relaxed text-sm">
                {{ rab.deskripsi || "Tidak ada deskripsi" }}
              </p>
            </div>
          </div>

          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div class="p-4 sm:p-6 border-b border-slate-100">
              <h3
                class="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"
              >
                <Icon
                  name="heroicons:document-text"
                  class="w-5 h-5 text-[#c41e3a]"
                />
                Preview Dokumen
              </h3>

              <div class="flex gap-2 p-1 bg-slate-100 rounded-xl inline-flex">
                <button
                  @click="activeDocumentTab = 'rab'"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                    activeDocumentTab === 'rab'
                      ? 'bg-white text-[#c41e3a] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900',
                  ]"
                >
                  <Icon name="heroicons:calculator" class="w-4 h-4" />
                  RAB
                </button>
                <button
                  @click="activeDocumentTab = 'tor'"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                    activeDocumentTab === 'tor'
                      ? 'bg-white text-[#c41e3a] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900',
                  ]"
                >
                  <Icon name="heroicons:document-duplicate" class="w-4 h-4" />
                  TOR
                </button>
              </div>
            </div>

            <div class="p-6">
              <div v-if="currentFileObjectUrl" class="w-full">
                <iframe
                  :src="currentFileObjectUrl"
                  class="w-full h-[600px] rounded-xl border border-slate-200 shadow-inner"
                  frameborder="0"
                ></iframe>
                <div class="flex justify-center gap-3 mt-4">
                  <button
                    @click="openDocument"
                    class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-[#a01830] transition-all shadow-md shadow-[#c41e3a]/20"
                  >
                    <Icon name="heroicons:eye" class="w-5 h-5" />
                    Buka di Tab Baru
                  </button>
                </div>
              </div>
              <div
                v-else
                class="aspect-[3/4] bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center"
              >
                <div
                  class="w-20 h-20 rounded-2xl bg-[#c41e3a]/10 flex items-center justify-center mb-4"
                >
                  <Icon
                    name="heroicons:document-text"
                    class="w-10 h-10 text-[#c41e3a]"
                  />
                </div>
                <h4 class="text-lg font-semibold text-slate-900 mb-2">
                  Belum ada file
                </h4>
                <p class="text-sm text-slate-500">
                  File {{ activeDocumentTab.toUpperCase() }} tidak tersedia atau
                  gagal dimuat.
                </p>
              </div>
            </div>
          </div>

          <!-- History / Logs Card -->
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
          >
            <h3
              class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"
            >
              <Icon
                name="heroicons:clipboard-document-list"
                class="w-5 h-5 text-[#c41e3a]"
              />
              Riwayat Persetujuan
              <span
                class="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs"
                >{{ approvalLogs.length }}</span
              >
            </h3>
            <div class="space-y-4">
              <div
                v-for="log in approvalLogs"
                :key="log.id"
                :class="[
                  'p-4 rounded-xl border-l-4 shadow-sm',
                  log.action === 'revisi'
                    ? 'bg-amber-50 border-amber-400'
                    : log.action === 'tolak'
                      ? 'bg-red-50 border-red-400'
                      : 'bg-emerald-50 border-emerald-400',
                ]"
              >
                <div class="flex items-start justify-between gap-4 mb-2">
                  <div class="flex items-center gap-3">
                    <div
                      :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm',
                        log.action === 'revisi'
                          ? 'bg-amber-500'
                          : log.action === 'tolak'
                            ? 'bg-red-500'
                            : 'bg-emerald-500',
                      ]"
                    >
                      {{ log.actor?.fullname?.charAt(0) || "?" }}
                    </div>
                    <div>
                      <p class="font-semibold text-slate-900">
                        {{ log.actor?.fullname || "Petugas" }}
                      </p>
                      <p class="text-xs text-slate-500 uppercase font-medium">
                        {{ log.actor?.role }} • {{ formatDate(log.createdAt) }}
                      </p>
                    </div>
                  </div>
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider',
                      log.action === 'revisi'
                        ? 'bg-amber-100 text-amber-700'
                        : log.action === 'tolak'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700',
                    ]"
                  >
                    {{
                      log.action === "revisi"
                        ? "Revisi"
                        : log.action === "tolak"
                          ? "Ditolak"
                          : "Disetujui"
                    }}
                  </span>
                </div>
                <p class="text-sm text-slate-700 leading-relaxed pl-13">
                  {{ log.catatanRevisi || "Tidak ada catatan tambahan" }}
                </p>
              </div>
              <div
                v-if="approvalLogs.length === 0"
                class="text-center py-8 text-slate-400 italic text-sm"
              >
                Belum ada riwayat persetujuan untuk pengajuan ini.
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Summary Card -->
        <div class="space-y-6">
          <div
            class="rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-20"
          >
            <h3 class="text-lg font-bold text-slate-900 mb-4">
              Ringkasan Pengajuan
            </h3>
            <div class="space-y-4">
              <div
                class="relative p-6 rounded-3xl text-white bg-primary shadow-2xl shadow-primary/20 border border-white/10 overflow-hidden group transition-all duration-300 hover:shadow-primary/30"
              >
                <!-- Decorative pattern (subtle dots) - adds texture without extra gaps -->
                <div
                  class="absolute inset-0 opacity-10 pointer-events-none"
                  style="
                    background-image: radial-gradient(
                      circle at 1px 1px,
                      white 1px,
                      transparent 1px
                    );
                    background-size: 16px 16px;
                  "
                ></div>

                <!-- Subtle shine effect at top-right -->
                <div
                  class="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl"
                ></div>

                <div class="relative z-10">
                  <!-- Header with icon and title - compact gap-2 -->
                  <div class="flex items-center gap-2 mb-2">
                    <!-- Elegant wallet / budget icon -->
                    <svg
                      class="w-5 h-5 text-white/80 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 5.25v10.5a.75.75 0 0 0 .75.75h15a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75H3.75a.75.75 0 0 0-.75.75Zm16.5 4.5h-2.25a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 .75.75h2.25a.75.75 0 0 0 .75-.75v-3a.75.75 0 0 0-.75-.75Z"
                      />
                    </svg>
                    <p
                      class="text-xs font-semibold text-white/90 tracking-wider uppercase"
                    >
                      Total Anggaran Diajukan
                    </p>
                    <!-- Small indicator badge (optional) -->
                    <span
                      class="ml-auto text-[10px] font-medium bg-white/10 px-2 py-0.5 rounded-full"
                      >2025</span
                    >
                  </div>

                  <!-- Amount with refined typography and subtle glow -->
                  <div class="flex items-baseline flex-wrap gap-0.5">
                    <span class="text-xl font-bold text-white/80 tracking-wide"
                      >Rp</span
                    >
                    <span
                      class="text-5xl font-black tracking-tighter leading-none drop-shadow-sm"
                      style="text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)"
                    >
                      {{ Number(rab.totalAnggaran).toLocaleString("id-ID") }}
                    </span>
                  </div>

                  <!-- Minimal footer line (no extra vertical gap, just a hairline decoration) -->
                  <div
                    class="mt-3 pt-2 border-t border-white/10 flex justify-end"
                  >
                    <span
                      class="text-[11px] font-medium text-white/60 tracking-wide"
                      >✓ Anggaran aktif</span
                    >
                  </div>
                </div>
              </div>
              <div class="space-y-3 pt-2 flex gap-5 flex-col">
                <div
                  class="flex justify-between items-start border-b border-slate-100"
                >
                  <span class="text-sm text-slate-500 font-medium"
                    >Pengaju</span
                  >
                  <div class="text-right">
                    <p class="font-bold text-sm text-slate-900">
                      {{ rab.pengaju }}
                    </p>

                    <p class="text-[10px] text-slate-800 uppercase font-bold">
                      {{ rab.prodi || "Ormawa Fakultas" }}
                    </p>
                  </div>
                </div>
                <div
                  class="flex justify-between items-center border-b border-slate-100"
                >
                  <span class="text-sm text-slate-500 font-medium"
                    >Fakultas</span
                  >
                  <span class="font-bold text-sm text-slate-900">{{
                    rab.fakultas
                  }}</span>
                </div>
                <div
                  class="flex justify-between items-start gap-4 border-b border-slate-100 py-2"
                >
                  <span class="text-sm text-slate-500 font-medium shrink-0"
                    >Ormawa</span
                  >
                  <span
                    class="font-semibold text-sm text-slate-800 text-end break-words"
                  >
                    {{ rab.ormawa }}
                  </span>
                </div>
              </div>
            </div>
            <div
              v-if="rab.status === 'waiting_spi'"
              class="p-4 bg-amber-50 border border-amber-100 rounded-xl mt-4"
            >
              <p class="text-xs text-amber-700 text-center font-medium">
                Review dokumen di sebelah kiri dengan teliti sebelum memberikan
                keputusan penjaminan kualitas.
              </p>
            </div>
            <!-- Action Buttons for SPI -->

            <div class="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-8">
              <div class="flex items-center gap-2 mb-3">
                <Icon
                  name="heroicons:information-circle"
                  class="w-5 h-5 text-blue-600"
                />
                <h4
                  class="font-bold text-blue-900 text-sm uppercase tracking-wide"
                >
                  Tugas SPI
                </h4>
              </div>
              <ul
                class="text-xs text-blue-700 space-y-2 list-disc list-inside leading-relaxed"
              >
                <li>Verifikasi kesesuaian antara TOR dan RAB.</li>
                <li>Pastikan rincian biaya masuk akal dan efisien.</li>
                <li>Periksa kelengkapan administrasi dokumen.</li>
                <li>Memberikan rekomendasi persetujuan atau perbaikan.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Modal (Setuju, Revisi, Tolak) -->
    <div
      v-if="showActionModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showActionModal = false"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <div class="flex items-center gap-3 mb-4">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center text-white',
              actionType === 'setuju'
                ? 'bg-emerald-500'
                : actionType === 'tolak'
                  ? 'bg-red-500'
                  : 'bg-amber-500',
            ]"
          >
            <Icon
              :name="
                actionType === 'setuju'
                  ? 'heroicons:check'
                  : actionType === 'tolak'
                    ? 'heroicons:x-mark'
                    : 'heroicons:arrow-path'
              "
              class="w-6 h-6"
            />
          </div>
          <h3 class="text-xl font-bold text-slate-900">
            {{
              actionType === "setuju"
                ? "Setujui Pengajuan"
                : actionType === "tolak"
                  ? "Tolak Pengajuan"
                  : "Minta Revisi"
            }}
          </h3>
        </div>

        <p class="text-sm text-slate-600 mb-6">
          {{
            actionType === "setuju"
              ? "Anda akan menyetujui dokumen RAB dan TOR ini. Pastikan semua rincian telah diperiksa."
              : "Berikan catatan spesifik mengapa dokumen ini dikembalikan atau ditolak agar pengaju dapat memperbaikinya."
          }}
        </p>

        <div class="space-y-4">
          <div v-if="actionType !== 'setuju'">
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Catatan <span class="text-red-500">*</span></label
            >
            <textarea
              v-model="actionCatatan"
              rows="4"
              class="w-full border border-slate-200 rounded-lg p-3 focus:ring-[#c41e3a] focus:border-[#c41e3a] outline-none transition-colors text-sm"
              :placeholder="
                actionType === 'revisi'
                  ? 'Contoh: Rincian biaya konsumsi pada TOR tidak sesuai dengan RAB.'
                  : 'Contoh: Kegiatan ini tidak sesuai dengan RKAT tahun berjalan.'
              "
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showActionModal = false"
            class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
          >
            Batal
          </button>
          <button
            @click="submitAction"
            :disabled="
              persetujuanStore.loading ||
              (actionType !== 'setuju' && !actionCatatan.trim())
            "
            :class="[
              'px-4 py-2 rounded-lg text-white transition-all font-medium disabled:opacity-50 flex items-center gap-2',
              actionType === 'setuju'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : actionType === 'tolak'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-500 hover:bg-amber-600',
            ]"
          >
            <Icon
              v-if="persetujuanStore.loading"
              name="heroicons:arrow-path"
              class="w-4 h-4 animate-spin"
            />
            {{ persetujuanStore.loading ? "Memproses..." : "Konfirmasi" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { useSpiRabDetailStore } from "~/stores/spi/rabDetail";
  import { useSpiApprovalLogStore } from "~/stores/spi/approvalLog";
  import { useSpiPersetujuanStore } from "~/stores/spi/persetujuanRab";
  import { storeToRefs } from "pinia";

  const route = useRoute();
  const router = useRouter();
  const detailStore = useSpiRabDetailStore();
  const approveLogStore = useSpiApprovalLogStore();
  const persetujuanStore = useSpiPersetujuanStore();

  const { logs: approvalLogs } = storeToRefs(approveLogStore);
  const rab = computed(() => detailStore.rabDetail);

  const activeDocumentTab = ref<"rab" | "tor">("rab");
  const currentFileObjectUrl = computed(() =>
    activeDocumentTab.value === "rab"
      ? detailStore.fileRabObjectUrl
      : detailStore.fileTorObjectUrl,
  );

  // Action Modal State
  const showActionModal = ref(false);
  const actionType = ref<"setuju" | "tolak" | "revisi">("setuju");
  const actionCatatan = ref("");

  const reloadData = async () => {
    const id = Number(route.params.id);
    if (id) {
      await Promise.all([
        detailStore.fetchFullDetail(id),
        approveLogStore.fetchApprovalLogs(id),
      ]);
    }
  };

  const openActionModal = (type: "setuju" | "tolak" | "revisi") => {
    actionType.value = type;
    actionCatatan.value = "";
    showActionModal.value = true;
  };

  const submitAction = async () => {
    if (
      (actionType.value === "tolak" || actionType.value === "revisi") &&
      !actionCatatan.value.trim()
    ) {
      alert("Catatan wajib diisi");
      return;
    }

    const res = await persetujuanStore.processAction(
      rab.value.id,
      actionType.value,
      actionCatatan.value,
    );

    if (res.success) {
      showActionModal.value = false;
      await reloadData();
    } else {
      alert(res.message);
    }
  };

  onMounted(async () => {
    await reloadData();
  });

  onBeforeUnmount(() => {
    detailStore.cleanupFileUrls();
    approveLogStore.clearLogs();
  });

  const goBack = () => router.back();

  const openDocument = () => {
    if (currentFileObjectUrl.value) {
      window.open(currentFileObjectUrl.value, "_blank");
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      lunas_ppk: "Lunas (PPK)",
      selesai_spi: "Selesai",
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-slate-100 text-slate-700 border-slate-200",
      disetujui: "bg-emerald-50 text-emerald-700 border-emerald-200",
      selesai_spi: "bg-emerald-50 text-emerald-700 border-emerald-200",
      ditolak_spi: "bg-red-50 text-red-700 border-red-200",
      revisi_spi: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
    return colors[status] || "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getStatusDot = (status: string) => {
    const dots: Record<string, string> = {
      draft: "bg-slate-400",
      disetujui: "bg-emerald-500",
      selesai_spi: "bg-emerald-500",
      ditolak_spi: "bg-red-500",
      revisi_spi: "bg-yellow-500",
    };
    return dots[status] || "bg-amber-500";
  };

  const getStatusTextColor = (status: string) => {
    const colors: Record<string, string> = {
      disetujui: "text-emerald-600",
      selesai_spi: "text-emerald-600",
      ditolak_spi: "text-red-600",
      revisi_spi: "text-yellow-600",
    };
    return colors[status] || "text-amber-600";
  };

  const getCurrentStepLabel = () => {
    const status = rab.value?.status || "draft";
    const map: Record<string, string> = {
      draft: "Persiapan Draft",
      waiting_kaprodi: "Audit Kaprodi",
      waiting_ppk: "Verifikasi PPK",
      waiting_spi: "Review SPI (Saat Ini)",
      disetujui: "Disetujui",
    };
    return map[status] || "Sedang Diproses";
  };
  const formatRupiah = (value: number | string): string => {
    const numericValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numericValue)) return "Rp 0";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0, // Mengatur agar tidak ada angka di belakang koma (,00)
      maximumFractionDigits: 0,
    }).format(numericValue);
  };
  const timelineSteps = computed(() => {
    const status = rab.value?.status || "draft";
    const statusToStepMap: Record<string, number> = {
      draft: 0,
      waiting_kaprodi: 1,
      revisi_kaprodi: 1,
      waiting_ppk: 2,
      revisi_ppk: 2,
      waiting_spi: 3,
      ditolak_spi: 3,
      disetujui: 4,
      selesai_spi: 4,
    };
    const currentStepIndex = statusToStepMap[status] ?? 0;

    return [
      {
        title: "Pengajuan",
        description: "RAB & TOR Diajukan",
        date: formatDate(rab.value?.createdAt),
      },
      { title: "Kaprodi", description: "Review Prodi" },
      { title: "PPK", description: "Verifikasi Anggaran" },
      { title: "SPI", description: "Audit Kualitas" },
      { title: "Selesai", description: "Persetujuan Akhir" },
    ].map((step, index) => ({
      ...step,
      isActive: index === currentStepIndex,
      isCompleted:
        index < currentStepIndex ||
        (index === 4 && (status === "disetujui" || status === "selesai_spi")),
      isError:
        index === currentStepIndex &&
        (status.includes("revisi") || status.includes("ditolak")),
    }));
  });

  const progressPercentage = computed(() => {
    const status = rab.value?.status || "draft";
    const stepIndex: Record<string, number> = {
      draft: 0,
      waiting_kaprodi: 1,
      revisi_kaprodi: 1,
      waiting_ppk: 2,
      revisi_ppk: 2,
      waiting_spi: 3,
      ditolak_spi: 3,
      disetujui: 4,
      selesai_spi: 4,
    };
    return ((stepIndex[status] || 0) / 4) * 100;
  });
</script>

<style scoped>
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .bg-primary {
    background: var(--color-primary);
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
</style>
