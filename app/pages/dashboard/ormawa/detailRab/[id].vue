<template>
  <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <!-- Loading State -->
    <div
      v-if="detailRabStore.loading"
      class="flex justify-center items-center h-64"
    >
      <div class="text-center">
        <Icon
          name="heroicons:arrow-path"
          class="w-12 h-12 animate-spin text-[#3b5988] mx-auto mb-4"
        />
        <p class="text-slate-600">Memuat data RAB...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="detailRabStore.error" class="max-w-6xl mx-auto">
      <div class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <Icon
          name="heroicons:exclamation-triangle"
          class="w-12 h-12 text-red-500 mx-auto mb-4"
        />
        <h3 class="text-lg font-bold text-red-800 mb-2">Gagal Memuat Data</h3>
        <p class="text-red-600">{{ detailRabStore.error }}</p>
        <button
          @click="reloadData"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
        >
          Coba Lagi
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="rabData" class="max-w-6xl mx-auto space-y-6">
      <!-- Header Navigation -->
      <div class="flex items-center justify-between">
        <button
          @click="goBack"
          class="flex items-center gap-2 text-slate-600 hover:text-[#3b5988] transition-colors"
        >
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
          <span class="font-medium">Kembali ke Dashboard</span>
        </button>

        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-500"
            >ID: {{ rabData.nomorPengajuan }}</span
          >
          <div
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5',
              getStatusColor(rabData.status),
            ]"
          >
            <span
              :class="[
                'w-1.5 h-1.5 rounded-full',
                getStatusDot(rabData.status),
              ]"
            ></span>
            {{ formatStatus(rabData.status) }}
          </div>
        </div>
      </div>

      <!-- Grid Layout Sama Seperti Sebelumnya, Gunakan rabData dari store -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Title Card -->
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
          >
            <div class="flex items-start justify-between gap-4 mb-4">
              <div>
                <p class="text-sm text-slate-500 mb-1">Pengajuan RAB</p>
                <h1
                  class="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight"
                >
                  {{ rabData.judulKegiatan }}
                </h1>
              </div>
              <div class="flex gap-2">
                <button
                  v-if="rabData.status === 'draft'"
                  @click="showAjukanModal = true"
                  class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                >
                  <Icon name="heroicons:paper-airplane" class="w-5 h-5" />
                  Ajukan
                </button>
                <button
                  v-if="
                    ['draft', 'revisi_kaprodi', 'revisi_ppk'].includes(
                      rabData.status,
                    )
                  "
                  @click="showEditModal = true"
                  class="px-4 py-2 rounded-xl bg-[#3b5988] text-white font-medium hover:bg-[#2d4570] transition-all shadow-lg shadow-[#3b5988]/25 flex items-center gap-2"
                >
                  <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                  Edit
                </button>
              </div>
            </div>
            <div class="flex items-center gap-4 text-sm text-slate-600">
              <div class="flex items-center gap-2">
                <Icon
                  name="heroicons:calendar"
                  class="w-4 h-4 text-[#d1a82a]"
                />
                <span>Diajukan {{ formatDate(rabData.createdAt) }}</span>
              </div>
              <span class="text-slate-300">|</span>
              <div class="flex items-center gap-2">
                <Icon
                  name="heroicons:arrow-path"
                  class="w-4 h-4 text-[#d1a82a]"
                />
                <span>Update {{ formatDate(rabData.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Timeline Progress (dihitung dari status) -->
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
          >
            <h3
              class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"
            >
              <Icon name="heroicons:chart-bar" class="w-5 h-5 text-[#d1a82a]" />
              Progress Pengajuan
            </h3>
            <div class="relative">
              <div
                class="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"
              ></div>
              <div class="space-y-6">
                <div
                  v-for="(step, index) in timelineSteps"
                  :key="index"
                  :class="[
                    'relative flex gap-4',
                    step.isActive ? 'opacity-100' : 'opacity-60',
                  ]"
                >
                  <!-- Icon -->
                  <div
                    :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2',
                      step.isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : step.isActive
                          ? 'bg-[#3b5988] border-[#3b5988] text-white'
                          : 'bg-white border-slate-300 text-slate-400',
                    ]"
                  >
                    <Icon
                      v-if="step.isCompleted"
                      name="heroicons:check"
                      class="w-5 h-5"
                    />
                    <span v-else class="text-xs font-bold">{{
                      index + 1
                    }}</span>
                  </div>
                  <div class="flex-1 pb-6">
                    <div class="flex items-center justify-between mb-1">
                      <h4
                        :class="[
                          'font-semibold',
                          step.isActive ? 'text-slate-900' : 'text-slate-600',
                        ]"
                      >
                        {{ step.title }}
                      </h4>
                      <span v-if="step.date" class="text-xs text-slate-500">{{
                        step.date
                      }}</span>
                    </div>
                    <p class="text-sm text-slate-600">{{ step.description }}</p>
                    <div v-if="step.isActive" class="mt-2">
                      <span
                        :class="[
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border',
                          getStatusColor(rabData.status),
                        ]"
                      >
                        <span
                          :class="[
                            'w-1.5 h-1.5 rounded-full',
                            getStatusDot(rabData.status),
                          ]"
                        ></span>
                        {{ formatStatus(rabData.status) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Document Viewer -->
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div
              class="p-6 border-b border-slate-100 flex items-center justify-between"
            >
              <h3
                class="text-lg font-bold text-slate-900 flex items-center gap-2"
              >
                <Icon
                  name="heroicons:document-text"
                  class="w-5 h-5 text-[#d1a82a]"
                />
                Dokumen RAB
              </h3>
              <div class="flex gap-2">
                <button
                  @click="viewMode = 'preview'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    viewMode === 'preview'
                      ? 'bg-[#3b5988] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  ]"
                >
                  Preview
                </button>
                <button
                  @click="viewMode = 'info'"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    viewMode === 'info'
                      ? 'bg-[#3b5988] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  ]"
                >
                  Info File
                </button>
              </div>
            </div>
            <div v-if="viewMode === 'preview'" class="p-6">
              <div
                class="aspect-[3/4] bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center"
              >
                <div
                  class="w-20 h-20 rounded-2xl bg-[#3b5988]/10 flex items-center justify-center mb-4"
                >
                  <Icon
                    name="heroicons:document-text"
                    class="w-10 h-10 text-[#3b5988]"
                  />
                </div>
                <h4 class="text-lg font-semibold text-slate-900 mb-2">
                  Preview Dokumen
                </h4>
                <p class="text-sm text-slate-500 mb-4 max-w-sm">
                  File dokumen RAB siap untuk dilihat. Klik tombol di bawah
                  untuk membuka atau mendownload file.
                </p>
                <div class="flex gap-3">
                  <button
                    @click="openDocument"
                    class="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b5988] text-white font-medium hover:bg-[#2d4570] transition-all"
                  >
                    <Icon name="heroicons:eye" class="w-5 h-5" />
                    Lihat Dokumen
                  </button>
                  <button
                    @click="downloadDocument"
                    class="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#3b5988] text-[#3b5988] font-medium hover:bg-[#3b5988]/5 transition-all"
                  >
                    <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="p-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p
                    class="text-xs text-slate-500 uppercase tracking-wider mb-1"
                  >
                    Nama File
                  </p>
                  <p class="font-medium text-slate-900 truncate">
                    {{ rabData.fileName || "Tidak tersedia" }}
                  </p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p
                    class="text-xs text-slate-500 uppercase tracking-wider mb-1"
                  >
                    Ukuran File
                  </p>
                  <p class="font-medium text-slate-900">
                    {{ rabData.fileSize || "-" }}
                  </p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p
                    class="text-xs text-slate-500 uppercase tracking-wider mb-1"
                  >
                    Format
                  </p>
                  <p class="font-medium text-slate-900">
                    {{ rabData.fileType || "-" }}
                  </p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p
                    class="text-xs text-slate-500 uppercase tracking-wider mb-1"
                  >
                    Diupload
                  </p>
                  <p class="font-medium text-slate-900">
                    {{ formatDate(rabData.createdAt) }}
                  </p>
                </div>
              </div>
              <div
                class="mt-4 p-4 rounded-xl bg-[#d1a82a]/10 border border-[#d1a82a]/20"
              >
                <div class="flex items-start gap-3">
                  <Icon
                    name="heroicons:information-circle"
                    class="w-5 h-5 text-[#d1a82a] mt-0.5"
                  />
                  <div>
                    <p class="text-sm font-medium text-slate-900">
                      URL Dokumen
                    </p>
                    <p class="text-sm text-slate-600 font-mono break-all mt-1">
                      {{ rabData.fileRabUrl }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments Section (masih dummy, nanti bisa dari store approvalLog) -->
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
          >
            <h3
              class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"
            >
              <Icon
                name="heroicons:chat-bubble-left-right"
                class="w-5 h-5 text-[#d1a82a]"
              />
              Riwayat Komentar & Revisi
              <span
                class="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs"
              >
                {{ comments.length }}
              </span>
            </h3>
            <div class="space-y-4">
              <div
                v-for="(comment, index) in comments"
                :key="index"
                :class="[
                  'p-4 rounded-xl border-l-4',
                  comment.type === 'revisi'
                    ? 'bg-amber-50 border-amber-400'
                    : comment.type === 'reject'
                      ? 'bg-red-50 border-red-400'
                      : comment.type === 'approve'
                        ? 'bg-emerald-50 border-emerald-400'
                        : 'bg-slate-50 border-slate-300',
                ]"
              >
                <!-- ... konten komentar sama seperti sebelumnya ... -->
                <div class="flex items-start justify-between gap-4 mb-2">
                  <div class="flex items-center gap-3">
                    <div
                      :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm',
                        comment.type === 'revisi'
                          ? 'bg-amber-500'
                          : comment.type === 'reject'
                            ? 'bg-red-500'
                            : comment.type === 'approve'
                              ? 'bg-emerald-500'
                              : 'bg-[#3b5988]',
                      ]"
                    >
                      {{ comment.author.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-semibold text-slate-900">
                        {{ comment.author }}
                      </p>
                      <p class="text-xs text-slate-500">
                        {{ comment.role }} • {{ comment.date }}
                      </p>
                    </div>
                  </div>
                  <span
                    :class="[
                      'px-2 py-1 rounded-lg text-xs font-medium',
                      comment.type === 'revisi'
                        ? 'bg-amber-100 text-amber-700'
                        : comment.type === 'reject'
                          ? 'bg-red-100 text-red-700'
                          : comment.type === 'approve'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600',
                    ]"
                  >
                    {{
                      comment.type === "revisi"
                        ? "Perlu Revisi"
                        : comment.type === "reject"
                          ? "Ditolak"
                          : comment.type === "approve"
                            ? "Disetujui"
                            : "Komentar"
                    }}
                  </span>
                </div>
                <p class="text-sm text-slate-700 leading-relaxed ml-13 pl-13">
                  {{ comment.message }}
                </p>
                <div v-if="comment.attachment" class="mt-3 ml-13">
                  <a
                    href="#"
                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 hover:border-[#3b5988] hover:text-[#3b5988] transition-all"
                  >
                    <Icon name="heroicons:paper-clip" class="w-4 h-4" />
                    {{ comment.attachment }}
                  </a>
                </div>
              </div>
              <!-- Input komentar -->
              <div
                v-if="canAddComment"
                class="mt-6 pt-6 border-t border-slate-100"
              >
                <div class="flex gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-[#3b5988] flex items-center justify-center text-white font-bold flex-shrink-0"
                  >
                    {{ ormawaData?.nama?.charAt(0) || "U" }}
                  </div>
                  <div class="flex-1">
                    <textarea
                      v-model="newComment"
                      rows="3"
                      placeholder="Tambahkan komentar atau respon revisi..."
                      class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#3b5988] focus:ring-2 focus:ring-[#3b5988]/20 outline-none resize-none"
                    ></textarea>
                    <div class="flex justify-between items-center mt-2">
                      <button
                        class="text-sm text-slate-500 hover:text-[#3b5988] flex items-center gap-1"
                      >
                        <Icon name="heroicons:paper-clip" class="w-4 h-4" />
                        Lampirkan file
                      </button>
                      <button
                        @click="addComment"
                        :disabled="!newComment.trim()"
                        class="px-4 py-2 rounded-lg bg-[#3b5988] text-white text-sm font-medium hover:bg-[#2d4570] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Kirim Komentar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Summary -->
        <div class="space-y-6">
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-20"
          >
            <h3 class="text-lg font-bold text-slate-900 mb-4">Ringkasan</h3>
            <div class="space-y-4">
              <div
                class="p-4 rounded-xl bg-gradient-to-br from-[#3b5988] to-[#2d4570] text-white"
              >
                <p class="text-sm text-blue-100 mb-1">
                  Total Anggaran Diajukan
                </p>
                <p class="text-2xl font-bold">
                  Rp {{ formatCurrency(rabData.totalAnggaran) }}
                </p>
              </div>
              <div class="space-y-3">
                <div
                  class="flex justify-between items-center py-2 border-b border-slate-100"
                >
                  <span class="text-sm text-slate-600">Pengaju</span>
                  <span class="font-medium text-sm text-slate-900">{{
                    ormawaData?.nama || "-"
                  }}</span>
                </div>
                <div
                  class="flex justify-between items-center py-2 border-b border-slate-100"
                >
                  <span class="text-sm text-slate-600">Tanggal Pengajuan</span>
                  <span class="font-medium text-slate-900">{{
                    formatDate(rabData.createdAt)
                  }}</span>
                </div>
                <div
                  class="flex justify-between items-center py-2 border-b border-slate-100"
                >
                  <span class="text-sm text-slate-600">Terakhir Update</span>
                  <span class="font-medium text-slate-900">{{
                    formatDate(rabData.updatedAt)
                  }}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                  <span class="text-sm text-slate-600">Status Saat Ini</span>
                  <span
                    :class="['font-medium', getStatusTextColor(rabData.status)]"
                  >
                    {{ formatStatus(rabData.status) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="mt-6 space-y-3">
              <button
                v-if="rabData.status === 'draft'"
                @click="showAjukanModal = true"
                class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <Icon name="heroicons:paper-airplane" class="w-5 h-5" />
                Ajukan RAB
              </button>
              <button
                v-if="
                  ['draft', 'revisi_kaprodi', 'revisi_ppk'].includes(
                    rabData.status,
                  )
                "
                @click="showEditModal = true"
                class="w-full py-3 rounded-xl bg-[#3b5988] text-white font-medium hover:bg-[#2d4570] transition-all shadow-lg shadow-[#3b5988]/25 flex items-center justify-center gap-2"
              >
                <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                Edit Dokumen
              </button>
              <button
                @click="downloadDocument"
                class="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:border-[#3b5988] hover:text-[#3b5988] transition-all flex items-center justify-center gap-2"
              >
                <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
                Download Dokumen
              </button>
              <button
                v-if="rabData.status === 'draft'"
                @click="showDeleteModal = true"
                class="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 font-medium hover:border-red-300 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <Icon name="heroicons:trash" class="w-5 h-5" />
                Hapus Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal-modal (Ajukan, Edit, Delete) sama seperti sebelumnya, sesuaikan actions -->
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from "vue";
  import { useDetailRab } from "~/stores/ormawa/DetailRab";
  import { useAuthStore } from "~/stores/auth"; // asumsi ada store auth

  const route = useRoute();
  const detailRabStore = useDetailRab();
  const authStore = useAuthStore();

  // State untuk UI
  const viewMode = ref("preview");
  const showAjukanModal = ref(false);
  const showEditModal = ref(false);
  const showDeleteModal = ref(false);
  const isSubmitting = ref(false);
  const isEditing = ref(false);
  const newComment = ref("");
  const editFile = ref(null);
  const editNote = ref("");

  // Data dari store
  const rabData = computed(() => detailRabStore.detail);
  const ormawaData = computed(() => authStore.user); // asumsi user terautentikasi

  // Dummy comments (nanti bisa diganti dengan fetch dari approvalLog)
  const comments = ref([]);

  // Hitung timeline steps berdasarkan status
  const timelineSteps = computed(() => {
    const status = rabData.value?.status;
    const steps = [
      {
        title: "Pengajuan Draft",
        description: "RAB dibuat dan disimpan sebagai draft",
        date: formatDate(rabData.value?.createdAt),
        isCompleted: true,
        isActive: false,
      },
      {
        title: "Review Kaprodi",
        description: "Menunggu review dan approval dari Kaprodi",
        date: null,
        isCompleted: false,
        isActive: false,
      },
      {
        title: "Review PPK",
        description: "Verifikasi anggaran oleh Pusat Pengelolaan Keuangan",
        date: null,
        isCompleted: false,
        isActive: false,
      },
      {
        title: "Review SPI",
        description: "Audit dan pengawasan oleh Satuan Pengawasan Internal",
        date: null,
        isCompleted: false,
        isActive: false,
      },
      {
        title: "Pencairan Dana",
        description: "Anggaran disetujui dan siap dicairkan",
        date: null,
        isCompleted: false,
        isActive: false,
      },
    ];
    const statusOrder = [
      "draft",
      "waiting_kaprodi",
      "revisi_kaprodi",
      "waiting_ppk",
      "revisi_ppk",
      "waiting_spi",
      "ditolak_spi",
      "disetujui",
      "selesai_spi",
    ];
    const currentIndex = statusOrder.indexOf(status);
    steps.forEach((step, idx) => {
      if (idx < currentIndex) step.isCompleted = true;
      if (idx === currentIndex) step.isActive = true;
    });
    // Tweak untuk revisi
    if (status === "revisi_kaprodi") steps[1].isActive = true;
    if (status === "revisi_ppk") steps[2].isActive = true;
    if (status === "ditolak_spi") steps[3].isActive = true;
    return steps;
  });

  // Apakah user dapat menambah komentar
  const canAddComment = computed(() => {
    const status = rabData.value?.status;
    return [
      "revisi_kaprodi",
      "revisi_ppk",
      "waiting_kaprodi",
      "waiting_ppk",
      "waiting_spi",
    ].includes(status);
  });

  // Fungsi helper
  const formatStatus = (status) => {
    const map = {
      draft: "Draft",
      waiting_kaprodi: "Menunggu Kaprodi",
      revisi_kaprodi: "Revisi Kaprodi",
      waiting_ppk: "Menunggu PPK",
      revisi_ppk: "Revisi PPK",
      waiting_spi: "Menunggu SPI",
      ditolak_spi: "Ditolak SPI",
      disetujui: "Disetujui",
      selesai_spi: "Selesai",
    };
    return map[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-slate-100 text-slate-700 border-slate-200",
      waiting_kaprodi: "bg-blue-50 text-blue-700 border-blue-200",
      revisi_kaprodi: "bg-amber-50 text-amber-700 border-amber-200",
      waiting_ppk: "bg-blue-50 text-blue-700 border-blue-200",
      revisi_ppk: "bg-amber-50 text-amber-700 border-amber-200",
      waiting_spi: "bg-purple-50 text-purple-700 border-purple-200",
      ditolak_spi: "bg-red-50 text-red-700 border-red-200",
      disetujui: "bg-emerald-50 text-emerald-700 border-emerald-200",
      selesai_spi: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const getStatusDot = (status) => {
    const dots = {
      draft: "bg-slate-400",
      waiting_kaprodi: "bg-blue-500",
      revisi_kaprodi: "bg-amber-500",
      waiting_ppk: "bg-blue-500",
      revisi_ppk: "bg-amber-500",
      waiting_spi: "bg-purple-500",
      ditolak_spi: "bg-red-500",
      disetujui: "bg-emerald-500",
      selesai_spi: "bg-emerald-500",
    };
    return dots[status] || "bg-slate-400";
  };

  const getStatusTextColor = (status) => {
    const colors = {
      draft: "text-slate-600",
      waiting_kaprodi: "text-blue-600",
      revisi_kaprodi: "text-amber-600",
      waiting_ppk: "text-blue-600",
      revisi_ppk: "text-amber-600",
      waiting_spi: "text-purple-600",
      ditolak_spi: "text-red-600",
      disetujui: "text-emerald-600",
      selesai_spi: "text-emerald-600",
    };
    return colors[status] || "text-slate-600";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat("id-ID").format(parseFloat(value));
  };

  // Actions
  const goBack = () => navigateTo("/dashboard");
  const reloadData = () => detailRabStore.getDetailRab(route.params.id);

  const openDocument = () => {
    if (rabData.value?.fileRabUrl)
      window.open(rabData.value.fileRabUrl, "_blank");
  };

  const downloadDocument = () => {
    if (rabData.value?.fileRabUrl) {
      const link = document.createElement("a");
      link.href = rabData.value.fileRabUrl;
      link.download = rabData.value.fileName || "dokumen.pdf";
      link.click();
    }
  };

  const submitRab = async () => {
    isSubmitting.value = true;
    try {
      await $fetch("/api/ormawa/Rab/submit", {
        method: "POST",
        body: { rabId: rabData.value.id },
      });
      await detailRabStore.getDetailRab(route.params.id);
      showAjukanModal.value = false;
      alert("RAB berhasil diajukan");
    } catch (err) {
      console.error(err);
      alert("Gagal mengajukan RAB");
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleEditFile = (e) => {
    const file = e.target.files[0];
    if (file) editFile.value = file;
  };

  const saveEdit = async () => {
    if (!editFile.value) return;
    isEditing.value = true;
    try {
      const formData = new FormData();
      formData.append("rabId", rabData.value.id);
      formData.append("file", editFile.value);
      formData.append("note", editNote.value);
      await $fetch("/api/ormawa/Rab/update", {
        method: "POST",
        body: formData,
      });
      await detailRabStore.getDetailRab(route.params.id);
      showEditModal.value = false;
      editFile.value = null;
      editNote.value = "";
      alert("Revisi berhasil disimpan");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan revisi");
    } finally {
      isEditing.value = false;
    }
  };

  const addComment = async () => {
    if (!newComment.value.trim()) return;
    try {
      await $fetch("/api/ormawa/Rab/comment", {
        method: "POST",
        body: { rabId: rabData.value.id, message: newComment.value },
      });
      // Refresh komentar (misal panggil endpoint get comments)
      newComment.value = "";
      alert("Komentar terkirim");
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim komentar");
    }
  };

  const deleteDraft = async () => {
    try {
      await $fetch(`/api/ormawa/Rab/${rabData.value.id}`, { method: "DELETE" });
      navigateTo("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus draft");
    }
  };

  onMounted(() => {
    const id = route.params.id;
    if (id) detailRabStore.getDetailRab(id);
  });
</script>

<style>
  @theme {
    --color-primary: #3b5988;
    --color-secondary: #d1a82a;
    --color-bgLogin: #eee8aa;
  }

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

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
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
