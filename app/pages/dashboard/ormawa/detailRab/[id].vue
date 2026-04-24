<template>
  <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-center">
        <Icon
          name="heroicons:arrow-path"
          class="w-12 h-12 animate-spin text-[#3b5988] mx-auto mb-4"
        />
        <p class="text-slate-600">Memuat data RAB...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-6xl mx-auto">
      <div class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <Icon
          name="heroicons:exclamation-triangle"
          class="w-12 h-12 text-red-500 mx-auto mb-4"
        />
        <h3 class="text-lg font-bold text-red-800 mb-2">Gagal Memuat Data</h3>
        <p class="text-red-600">{{ error }}</p>
        <button
          @click="reloadData"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
        >
          Coba Lagi
        </button>
      </div>
    </div>

    <!-- Konten Utama -->
    <div v-else-if="rabData" class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
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

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Kolom Kiri (2/3) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Judul & Info -->
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

          <!-- Progress Timeline -->
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
                    'relative flex gap-4 transition-opacity duration-300',
                    step.isActive || step.isCompleted
                      ? 'opacity-100'
                      : 'opacity-50',
                  ]"
                >
                  <div
                    :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 transition-all duration-300',
                      step.isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : step.isError
                          ? 'bg-amber-500 border-amber-500 text-white animate-pulse'
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
                    <Icon
                      v-else-if="step.isError"
                      name="heroicons:exclamation-triangle"
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
                      <span
                        v-if="step.date"
                        class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded"
                        >{{ step.date }}</span
                      >
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

          <!-- Dokumen RAB (Preview & Info) -->
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
              <div v-if="fileObjectUrl" class="w-full">
                <iframe
                  v-if="isPdf"
                  :src="fileObjectUrl"
                  class="w-full h-[600px] rounded-xl border border-slate-200"
                  frameborder="0"
                ></iframe>
                <div v-else class="text-center py-12">
                  <Icon
                    name="heroicons:document"
                    class="w-16 h-16 text-slate-400 mx-auto mb-4"
                  />
                  <p class="text-slate-600 mb-4">
                    Preview tidak tersedia untuk tipe file ini.
                  </p>
                  <button
                    @click="downloadDocument"
                    class="px-4 py-2 bg-[#3b5988] text-white rounded-lg"
                  >
                    Download File
                  </button>
                </div>
                <div class="flex justify-center gap-3 mt-4">
                  <button
                    @click="openDocument"
                    class="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b5988] text-white font-medium hover:bg-[#2d4570] transition-all"
                  >
                    <Icon name="heroicons:eye" class="w-5 h-5" />
                    Lihat di Tab Baru
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
              <div
                v-else
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
                  Preview Tidak Tersedia
                </h4>
                <p class="text-sm text-slate-500 mb-4 max-w-sm">
                  File mungkin belum diupload atau format tidak didukung untuk
                  pratinjau.
                </p>
                <button
                  @click="downloadDocument"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#3b5988] text-[#3b5988] font-medium hover:bg-[#3b5988]/5 transition-all"
                >
                  <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
                  Download File
                </button>
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
                    {{ fileInfo.name || "Tidak tersedia" }}
                  </p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p
                    class="text-xs text-slate-500 uppercase tracking-wider mb-1"
                  >
                    Ukuran File
                  </p>
                  <p class="font-medium text-slate-900">
                    {{ fileInfo.size || "-" }}
                  </p>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p
                    class="text-xs text-slate-500 uppercase tracking-wider mb-1"
                  >
                    Format
                  </p>
                  <p class="font-medium text-slate-900">
                    {{ fileInfo.type || "-" }}
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

          <!-- Riwayat Approval Log (menggunakan store) -->
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
          >
            <h3
              class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"
            >
              <Icon
                name="heroicons:clipboard-document-list"
                class="w-5 h-5 text-[#d1a82a]"
              />
              Riwayat Persetujuan & Revisi
              <span
                class="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs"
              >
                {{ approvalLogs.length }}
              </span>
            </h3>
            <div class="space-y-4">
              <div
                v-for="log in approvalLogs"
                :key="log.id"
                :class="[
                  'p-4 rounded-xl border-l-4',
                  log.action === 'revisi'
                    ? 'bg-amber-50 border-amber-400'
                    : log.action === 'tolak'
                      ? 'bg-red-50 border-red-400'
                      : log.action === 'setuju'
                        ? 'bg-emerald-50 border-emerald-400'
                        : 'bg-slate-50 border-slate-300',
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
                            : log.action === 'setuju'
                              ? 'bg-emerald-500'
                              : 'bg-[#3b5988]',
                      ]"
                    >
                      {{ log.actor?.fullname?.charAt(0) || "?" }}
                    </div>
                    <div>
                      <p class="font-semibold text-slate-900">
                        {{ log.actor?.fullname || "Unknown" }}
                      </p>
                      <p class="text-xs text-slate-500">
                        {{ log.actor?.role || "-" }} •
                        {{ formatDate(log.approvalLog.createdAt) }}
                      </p>
                    </div>
                  </div>
                  <span
                    :class="[
                      'px-2 py-1 rounded-lg text-xs font-medium',
                      log.approvalLog.action === 'revisi'
                        ? 'bg-amber-100 text-amber-700'
                        : log.approvalLog.action === 'tolak'
                          ? 'bg-red-100 text-red-700'
                          : log.approvalLog.action === 'setuju'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600',
                    ]"
                  >
                    {{
                      log.approvalLog.action === "revisi"
                        ? "Perlu Revisi"
                        : log.approvalLog.action === "tolak"
                          ? "Ditolak"
                          : log.approvalLog.action === "setuju"
                            ? "Disetujui"
                            : "Catatan"
                    }}
                  </span>
                </div>
                <p class="text-sm text-slate-700 leading-relaxed ml-13 pl-13">
                  {{ log.approvalLog?.catatanRevisi || "Tidak ada catatan" }}
                </p>
              </div>
              <div
                v-if="approvalLogs.length === 0 && !loadingLogs"
                class="text-center py-8 text-slate-500"
              >
                Belum ada riwayat persetujuan.
              </div>
              <div v-if="loadingLogs" class="text-center py-8 text-slate-500">
                Memuat riwayat...
              </div>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan (1/3) Ringkasan -->
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
                    ormawaData?.fullName || "-"
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
                    >{{ formatStatus(rabData.status) }}</span
                  >
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

    <!-- Modal Konfirmasi Ajukan -->
    <div
      v-if="showAjukanModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showAjukanModal = false"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-slate-900 mb-4">Ajukan RAB</h3>
        <p class="text-slate-600 mb-6">
          Apakah Anda yakin ingin mengajukan RAB ini? Setelah diajukan, dokumen
          tidak dapat diubah hingga ada permintaan revisi.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="showAjukanModal = false"
            class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            @click="submitRab"
            :disabled="isSubmitting"
            class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {{ isSubmitting ? "Mengajukan..." : "Ya, Ajukan" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Edit Upload File -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showEditModal = false"
    >
      <div class="bg-white rounded-2xl max-w-lg w-full p-6">
        <h3 class="text-xl font-bold text-slate-900 mb-4">Edit Dokumen RAB</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Upload File Baru</label
            >
            <input
              type="file"
              @change="handleEditFile"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              class="w-full border border-slate-200 rounded-lg p-2"
            />
            <p class="text-xs text-slate-500 mt-1">
              Unggah file PDF, Word, atau Excel (maks. 10MB)
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Catatan Revisi (opsional)</label
            >
            <textarea
              v-model="editNote"
              rows="3"
              placeholder="Jelaskan perubahan yang dilakukan..."
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-[#3b5988] focus:ring-1 focus:ring-[#3b5988] outline-none"
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showEditModal = false"
            class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            @click="saveEdit"
            :disabled="isEditing || !editFile"
            class="px-4 py-2 rounded-lg bg-[#3b5988] text-white hover:bg-[#2d4570] disabled:opacity-50"
          >
            {{ isEditing ? "Menyimpan..." : "Simpan Perubahan" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Hapus Draft -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-slate-900 mb-4">Hapus Draft</h3>
        <p class="text-slate-600 mb-6">
          Apakah Anda yakin ingin menghapus draft RAB ini? Tindakan ini tidak
          dapat dibatalkan.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            @click="deleteDraft"
            class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from "vue";
  import { useRabStore } from "~/stores/ormawa/DetailRab";
  import { useAuthStore } from "~/stores/auth";
  import { useApproveLog } from "~/stores/ormawa/approveLogRab";
  import { storeToRefs } from "pinia";

  const route = useRoute();
  const rabStore = useRabStore();
  const authStore = useAuthStore();
  const approveLogStore = useApproveLog();

  // State dari store RAB
  const rabData = computed(() => rabStore.detail);
  const loading = computed(() => rabStore.loading);
  const error = computed(() => rabStore.error);
  const fileObjectUrl = computed(() => rabStore.fileObjectUrl);

  // State dari store Approval Log
  const { logs: approvalLogs, loading: loadingLogs } =
    storeToRefs(approveLogStore);

  // UI state lokal
  const viewMode = ref("preview");
  const showAjukanModal = ref(false);
  const showEditModal = ref(false);
  const showDeleteModal = ref(false);
  const isSubmitting = ref(false);
  const isEditing = ref(false);
  const editFile = ref(null);
  const editNote = ref("");

  const ormawaData = computed(() => authStore.user);

  // Informasi file dari blob
  const fileInfo = computed(() => {
    if (rabStore.fileBlob) {
      const blob = rabStore.fileBlob;
      let name = "dokumen";
      if (rabData.value?.fileRabUrl) {
        const urlParts = rabData.value.fileRabUrl.split("/");
        name = urlParts.pop() || "dokumen";
      }
      return {
        name: name,
        size: formatBytes(blob.size),
        type: blob.type || "application/octet-stream",
      };
    }
    return { name: null, size: null, type: null };
  });

  const isPdf = computed(() => {
    const type = fileInfo.value.type;
    const url = rabData.value?.fileRabUrl || "";
    return type === "application/pdf" || url.toLowerCase().endsWith(".pdf");
  });

  // Helper functions
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat("id-ID").format(parseFloat(value));
  };

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
      selesai: "Selesai",
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
      selesai: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
      selesai: "bg-emerald-500",
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
      selesai: "text-emerald-600",
    };
    return colors[status] || "text-slate-600";
  };

  // Timeline steps
  const timelineSteps = computed(() => {
    const status = rabData.value?.status || "draft";
    const statusToStepMap = {
      draft: 0,
      waiting_kaprodi: 1,
      revisi_kaprodi: 1,
      waiting_ppk: 2,
      revisi_ppk: 2,
      waiting_spi: 3,
      ditolak_spi: 3,
      disetujui: 4,
      selesai: 4,
    };
    const currentStepIndex = statusToStepMap[status] ?? 0;

    const steps = [
      {
        title: "Pengajuan Draft",
        description: "RAB dibuat dan disimpan sebagai draft",
        date: formatDate(rabData.value?.createdAt),
      },
      {
        title: "Review Kaprodi",
        description: "Verifikasi oleh Ketua Program Studi",
        date: currentStepIndex > 1 ? "Selesai" : null,
      },
      {
        title: "Review PPK",
        description: "Verifikasi anggaran oleh Pejabat Pembuat Komitmen",
        date: currentStepIndex > 2 ? "Selesai" : null,
      },
      {
        title: "Review SPI",
        description: "Audit oleh Satuan Pengawasan Internal",
        date: status === "disetujui" || status === "selesai" ? "Selesai" : null,
      },
      {
        title: "Pencairan Dana",
        description: "Anggaran disetujui dan siap dicairkan",
        date: status === "selesai" ? "Selesai" : null,
      },
    ];

    return steps.map((step, index) => {
      const isRevisi = status.includes("revisi") || status.includes("ditolak");
      return {
        ...step,
        isActive: index === currentStepIndex,
        isCompleted:
          index < currentStepIndex || (index === 4 && status === "selesai"),
        isError: index === currentStepIndex && isRevisi,
      };
    });
  });

  // Actions
  const goBack = () => navigateTo("/dashboard");

  const reloadData = async () => {
    const id = route.params.id;
    await rabStore.fetchFullRabData(id);
    await approveLogStore.fetchApprovalLogs(id);
  };

  const openDocument = () => {
    if (fileObjectUrl.value) {
      window.open(fileObjectUrl.value, "_blank");
    } else if (rabData.value?.fileRabUrl) {
      window.open(rabData.value.fileRabUrl, "_blank");
    }
  };

  const downloadDocument = () => {
    if (fileObjectUrl.value) {
      const link = document.createElement("a");
      link.href = fileObjectUrl.value;
      link.download = fileInfo.value.name || "dokumen_rab.pdf";
      link.click();
    } else if (rabData.value?.fileRabUrl) {
      window.open(rabData.value.fileRabUrl, "_blank");
    }
  };

  const submitRab = async () => {
    isSubmitting.value = true;
    try {
      await $fetch("/api/ormawa/Rab/PengajuanDraftRab", {
        method: "POST",
        body: { rabId: rabData.value.id },
      });
      await rabStore.fetchFullRabData(route.params.id);
      await approveLogStore.fetchApprovalLogs(route.params.id);
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
      await rabStore.fetchFullRabData(route.params.id);
      await approveLogStore.fetchApprovalLogs(route.params.id);
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

  const deleteDraft = async () => {
    try {
      await $fetch(`/api/ormawa/Rab/${rabData.value.id}`, { method: "DELETE" });
      navigateTo("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus draft");
    }
  };

  // Lifecycle
  onMounted(async () => {
    const id = route.params.id;
    if (id) {
      await rabStore.fetchFullRabData(id);
      await approveLogStore.fetchApprovalLogs(id);
    }
  });

  onBeforeUnmount(() => {
    rabStore.cleanupFileUrl();
    approveLogStore.clearLogs();
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
