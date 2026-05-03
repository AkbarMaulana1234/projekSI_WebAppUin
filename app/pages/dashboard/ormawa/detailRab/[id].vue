<template>
  <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-center">
        <Icon
          name="heroicons:arrow-path"
          class="w-12 h-12 animate-spin text-[#3b5988] mx-auto mb-4"
        />
        <p class="text-slate-600">Memuat data pengajuan...</p>
      </div>
    </div>

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

    <div v-else-if="rabData" class="max-w-6xl mx-auto space-y-6">
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
        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
          >
            <div class="flex items-start justify-between gap-4 mb-4">
              <div>
                <p class="text-sm text-slate-500 mb-1">Pengajuan RAB & TOR</p>
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

            <div
              class="flex flex-wrap items-center gap-4 text-sm text-slate-600"
            >
              <div class="flex items-center gap-2">
                <Icon name="heroicons:clock" class="w-4 h-4 text-[#d1a82a]" />
                <span class="font-medium text-slate-800">
                  Pelaksanaan: {{ formatDate(rabData.tanggalMulai) }} s/d
                  {{ formatDate(rabData.tanggalSelesai) }}
                </span>
              </div>
              <span class="text-slate-300 hidden sm:block">|</span>
              <div class="flex items-center gap-2">
                <Icon
                  name="heroicons:calendar"
                  class="w-4 h-4 text-slate-400"
                />
                <span>Diajukan {{ formatDate(rabData.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- ==================== PROGRESS PENGAJUAN (BARU) ==================== -->
          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
          >
            <h3
              class="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"
            >
              <Icon name="heroicons:chart-bar" class="w-5 h-5 text-[#d1a82a]" />
              Progress Pengajuan
              <span
                class="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600"
              >
                {{ getCurrentStepLabel() }}
              </span>
            </h3>

            <!-- Horizontal Stepper (Desktop) -->
            <div class="hidden md:block">
              <div class="relative">
                <!-- Progress Bar Background -->
                <div
                  class="absolute top-5 left-0 w-full h-0.5 bg-slate-200 rounded-full"
                ></div>

                <!-- Dynamic Progress Fill -->
                <div
                  class="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-[#3b5988] to-[#5b7bb0] rounded-full transition-all duration-500 ease-out"
                  :style="{ width: `${progressPercentage}%` }"
                ></div>

                <!-- Steps -->
                <div class="relative flex justify-between">
                  <div
                    v-for="(step, index) in timelineSteps"
                    :key="index"
                    class="flex flex-col items-center flex-1"
                  >
                    <!-- Step Circle with Icon -->
                    <div
                      class="relative z-10 mb-3 transition-all duration-300"
                      :class="{
                        'transform scale-110': step.isActive && !step.isError,
                        'animate-pulse': step.isError && step.isActive,
                      }"
                    >
                      <div
                        class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md"
                        :class="{
                          'bg-emerald-500 ring-4 ring-emerald-100':
                            step.isCompleted,
                          'bg-amber-500 ring-4 ring-amber-100': step.isError,
                          'bg-[#3b5988] ring-4 ring-[#3b5988]/20':
                            step.isActive && !step.isError && !step.isCompleted,
                          'bg-white border-2 border-slate-300':
                            !step.isActive &&
                            !step.isCompleted &&
                            !step.isError,
                        }"
                      >
                        <Icon
                          v-if="step.isCompleted"
                          name="heroicons:check"
                          class="w-5 h-5 text-white"
                        />
                        <Icon
                          v-else-if="step.isError"
                          name="heroicons:exclamation-triangle"
                          class="w-5 h-5 text-white"
                        />
                        <span
                          v-else
                          class="text-sm font-bold"
                          :class="
                            step.isActive ? 'text-white' : 'text-slate-500'
                          "
                        >
                          {{ index + 1 }}
                        </span>
                      </div>
                      <!-- Active step indicator dot -->
                      <div
                        v-if="
                          step.isActive && !step.isCompleted && !step.isError
                        "
                        class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#3b5988] animate-ping"
                      ></div>
                    </div>

                    <!-- Step Title -->
                    <div class="text-center">
                      <p
                        class="font-semibold text-sm mb-1 transition-colors"
                        :class="{
                          'text-[#3b5988]': step.isActive,
                          'text-slate-900': step.isCompleted,
                          'text-slate-500': !step.isActive && !step.isCompleted,
                          'text-amber-600': step.isError,
                        }"
                      >
                        {{ step.title }}
                      </p>
                      <p class="text-xs text-slate-500 max-w-[120px] mx-auto">
                        {{ step.description }}
                      </p>
                      <span
                        v-if="step.date"
                        class="inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600"
                      >
                        {{ step.date }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vertical Timeline (Mobile) -->
            <div class="md:hidden">
              <div class="relative">
                <div
                  class="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"
                ></div>
                <div class="space-y-6">
                  <div
                    v-for="(step, index) in timelineSteps"
                    :key="index"
                    class="relative flex gap-4 animate-fadeIn"
                    :style="{ animationDelay: `${index * 0.05}s` }"
                  >
                    <div class="relative z-10">
                      <div
                        class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                        :class="{
                          'bg-emerald-500': step.isCompleted,
                          'bg-amber-500': step.isError,
                          'bg-[#3b5988] shadow-lg shadow-[#3b5988]/30':
                            step.isActive && !step.isError && !step.isCompleted,
                          'bg-white border-2 border-slate-300':
                            !step.isActive &&
                            !step.isCompleted &&
                            !step.isError,
                        }"
                      >
                        <Icon
                          v-if="step.isCompleted"
                          name="heroicons:check"
                          class="w-4 h-4 text-white"
                        />
                        <Icon
                          v-else-if="step.isError"
                          name="heroicons:exclamation-triangle"
                          class="w-4 h-4 text-white"
                        />
                        <span
                          v-else
                          class="text-xs font-bold"
                          :class="
                            step.isActive ? 'text-white' : 'text-slate-500'
                          "
                        >
                          {{ index + 1 }}
                        </span>
                      </div>
                    </div>
                    <div class="flex-1 pb-4">
                      <div
                        class="flex items-center justify-between flex-wrap gap-2 mb-1"
                      >
                        <h4
                          class="font-semibold"
                          :class="{
                            'text-[#3b5988]': step.isActive,
                            'text-slate-900': step.isCompleted,
                            'text-slate-600':
                              !step.isActive && !step.isCompleted,
                            'text-amber-600': step.isError,
                          }"
                        >
                          {{ step.title }}
                        </h4>
                        <span
                          v-if="step.date"
                          class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded"
                        >
                          {{ step.date }}
                        </span>
                      </div>
                      <p class="text-sm text-slate-600 leading-relaxed">
                        {{ step.description }}
                      </p>
                      <div
                        v-if="step.isError && step.isActive"
                        class="mt-2 inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-lg"
                      >
                        <Icon
                          name="heroicons:arrow-path"
                          class="w-3 h-3 animate-spin"
                        />
                        Perlu Revisi
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status Summary Card -->
            <div class="mt-8 pt-6 border-t border-slate-100">
              <div
                class="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4"
              >
                <div
                  class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-full bg-[#3b5988]/10 flex items-center justify-center"
                    >
                      <Icon
                        name="heroicons:information-circle"
                        class="w-5 h-5 text-[#3b5988]"
                      />
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 uppercase tracking-wide">
                        Status Saat Ini
                      </p>
                      <p class="font-bold text-slate-900">
                        {{ getCurrentStatusDescription() }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-slate-600">
                    <Icon name="heroicons:clock" class="w-4 h-4" />
                    <span
                      >Terakhir diperbarui:
                      {{ formatDate(rabData?.updatedAt) }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- ==================== AKHIR PROGRESS PENGAJUAN ==================== -->

          <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div class="p-4 sm:p-6 border-b border-slate-100">
              <h3
                class="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"
              >
                <Icon
                  name="heroicons:document-text"
                  class="w-5 h-5 text-[#d1a82a]"
                />
                Preview Dokumen
              </h3>

              <div class="flex gap-2 p-1 bg-slate-100 rounded-xl inline-flex">
                <button
                  @click="activeDocumentTab = 'rab'"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                    activeDocumentTab === 'rab'
                      ? 'bg-white text-[#3b5988] shadow-sm'
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
                      ? 'bg-white text-[#3b5988] shadow-sm'
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
                  v-if="isPdf"
                  :src="currentFileObjectUrl"
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
                    Download {{ activeDocumentTab.toUpperCase() }}
                  </button>
                </div>
                <div class="flex justify-center gap-3 mt-4">
                  <button
                    @click="openDocument"
                    class="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b5988] text-white font-medium hover:bg-[#2d4570] transition-all"
                  >
                    <Icon name="heroicons:eye" class="w-5 h-5" />
                    Buka {{ activeDocumentTab.toUpperCase() }} di Tab Baru
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
                  Belum ada file
                </h4>
                <p class="text-sm text-slate-500 mb-4 max-w-sm">
                  File {{ activeDocumentTab.toUpperCase() }} tidak tersedia atau
                  gagal dimuat.
                </p>
              </div>
            </div>
          </div>

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
                >{{ approvalLogs.length }}</span
              >
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
            </div>
          </div>
        </div>

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
                  <span class="text-sm text-slate-600">Jadwal Acara</span>
                  <span
                    class="font-medium text-slate-900 text-right text-xs max-w-[120px]"
                  >
                    {{ formatDate(rabData.tanggalMulai) }} - <br />{{
                      formatDate(rabData.tanggalSelesai)
                    }}
                  </span>
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
                <Icon name="heroicons:paper-airplane" class="w-5 h-5" /> Ajukan
                Pengajuan
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
                <Icon name="heroicons:pencil-square" class="w-5 h-5" /> Edit
                Data & Dokumen
              </button>
              <button
                v-if="rabData.status === 'draft'"
                @click="showDeleteModal = true"
                class="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 font-medium hover:border-red-300 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <Icon name="heroicons:trash" class="w-5 h-5" /> Hapus Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals (Ajukan, Edit, Hapus) -->
    <div
      v-if="showAjukanModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showAjukanModal = false"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-slate-900 mb-4">Ajukan RAB & TOR</h3>
        <p class="text-slate-600 mb-6">
          Apakah Anda yakin ingin mengajukan RAB & TOR ini? Setelah diajukan,
          dokumen tidak dapat diubah hingga ada permintaan revisi.
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

    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showEditModal = false"
    >
      <div
        class="bg-white rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <h3 class="text-xl font-bold text-slate-900 mb-4">Edit Pengajuan</h3>
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Judul Kegiatan</label
            >
            <input
              type="text"
              v-model="editJudul"
              class="w-full border border-slate-200 rounded-lg p-3 focus:ring-[#3b5988] focus:border-[#3b5988]"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Tanggal Mulai</label
              >
              <input
                type="date"
                v-model="editTanggalMulai"
                class="w-full border border-slate-200 rounded-lg p-3 focus:ring-[#3b5988] focus:border-[#3b5988]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Tanggal Selesai</label
              >
              <input
                type="date"
                v-model="editTanggalSelesai"
                class="w-full border border-slate-200 rounded-lg p-3 focus:ring-[#3b5988] focus:border-[#3b5988]"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2"
              >Total Anggaran</label
            >
            <div class="relative">
              <span
                class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium"
                >Rp</span
              >
              <input
                type="text"
                :value="formatCurrency(anggaranBaru)"
                @input="
                  (e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    anggaranBaru = raw ? Number(raw) : 0;
                  }
                "
                placeholder="0"
                class="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-[#3b5988] focus:border-[#3b5988]"
              />
            </div>
          </div>

          <hr class="border-slate-200 my-2" />

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Upload File RAB Baru (Opsional)</label
            >
            <input
              type="file"
              @change="(e) => handleEditFile(e, 'rab')"
              accept=".pdf"
              class="w-full border border-slate-200 rounded-lg p-2"
            />
            <p class="text-xs text-slate-500 mt-1">
              Biarkan kosong jika tidak ingin mengubah file RAB (Hanya PDF, maks
              10MB)
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Upload File TOR Baru (Opsional)</label
            >
            <input
              type="file"
              @change="(e) => handleEditFile(e, 'tor')"
              accept=".pdf"
              class="w-full border border-slate-200 rounded-lg p-2"
            />
            <p class="text-xs text-slate-500 mt-1">
              Biarkan kosong jika tidak ingin mengubah file TOR (Hanya PDF, maks
              10MB)
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <button
            @click="showEditModal = false"
            class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            @click="saveEdit"
            :disabled="isEditing"
            class="px-4 py-2 rounded-lg bg-[#3b5988] text-white hover:bg-[#2d4570] disabled:opacity-50"
          >
            {{ isEditing ? "Menyimpan..." : "Simpan Perubahan" }}
          </button>
        </div>
      </div>
    </div>

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

  // Multi-document State
  const activeDocumentTab = ref("rab");
  const fileRabObjectUrl = computed(() => rabStore.fileRabObjectUrl);
  const fileTorObjectUrl = computed(() => rabStore.fileTorObjectUrl);
  const currentFileObjectUrl = computed(() =>
    activeDocumentTab.value === "rab"
      ? fileRabObjectUrl.value
      : fileTorObjectUrl.value,
  );

  // State dari store Approval Log
  const { logs: approvalLogs, loading: loadingLogs } =
    storeToRefs(approveLogStore);

  // UI state lokal
  const showAjukanModal = ref(false);
  const showEditModal = ref(false);
  const showDeleteModal = ref(false);
  const isSubmitting = ref(false);
  const isEditing = ref(false);

  // Edit Form State
  const editFileRab = ref(null);
  const editFileTor = ref(null);
  const editJudul = ref("");
  const editTanggalMulai = ref("");
  const editTanggalSelesai = ref("");
  const anggaranBaru = ref(0);

  const ormawaData = computed(() => authStore.user);

  // Helper functions
  const formatForInputDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toISOString().split("T")[0];
  };

  const fileInfo = computed(() => {
    const activeBlob =
      activeDocumentTab.value === "rab"
        ? rabStore.fileRabBlob
        : rabStore.fileTorBlob;
    const activeUrl =
      activeDocumentTab.value === "rab"
        ? rabData.value?.fileRabUrl
        : rabData.value?.fileTorUrl;

    if (activeBlob) {
      let name = `dokumen_${activeDocumentTab.value}`;
      if (activeUrl) {
        const urlParts = activeUrl.split("/");
        name = urlParts.pop() || name;
      }
      return {
        name: name,
        size: formatBytes(activeBlob.size),
        type: activeBlob.type || "application/pdf",
      };
    }
    return { name: null, size: null, type: null };
  });

  const isPdf = computed(() => {
    const type = fileInfo.value.type;
    const url =
      activeDocumentTab.value === "rab"
        ? rabData.value?.fileRabUrl
        : rabData.value?.fileTorUrl;
    return (
      type === "application/pdf" || (url || "").toLowerCase().endsWith(".pdf")
    );
  });

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
      disetujui: "text-emerald-600",
      selesai: "text-emerald-600",
    };
    return colors[status] || "text-slate-600";
  };

  // Timeline steps (sama seperti sebelumnya)
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
        description: "RAB & TOR dibuat dan disimpan sebagai draft",
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

  // Progress percentage untuk horizontal stepper
  const progressPercentage = computed(() => {
    const status = rabData.value?.status || "draft";
    const stepIndex = {
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
    const currentStep = stepIndex[status] || 0;
    const totalSteps = 4;
    return (currentStep / totalSteps) * 100;
  });

  const getCurrentStepLabel = () => {
    const status = rabData.value?.status || "draft";
    const stepMap = {
      draft: "Draft Awal",
      waiting_kaprodi: "Menunggu Review Kaprodi",
      revisi_kaprodi: "Revisi diperlukan",
      waiting_ppk: "Menunggu Review PPK",
      revisi_ppk: "Revisi diperlukan",
      waiting_spi: "Menunggu Review SPI",
      ditolak_spi: "Perlu Perbaikan",
      disetujui: "Disetujui",
      selesai: "Selesai & Pencairan",
    };
    return stepMap[status] || status;
  };

  const getCurrentStatusDescription = () => {
    const status = rabData.value?.status || "draft";
    const descMap = {
      draft: "Draft sedang disiapkan, dokumen belum diajukan",
      waiting_kaprodi: "Menunggu persetujuan dari Ketua Program Studi",
      revisi_kaprodi: "Dokumen perlu diperbaiki sesuai catatan Kaprodi",
      waiting_ppk: "Menunggu verifikasi anggaran dari PPK",
      revisi_ppk: "Anggaran perlu disesuaikan dengan catatan PPK",
      waiting_spi: "Sedang dalam proses audit oleh SPI",
      ditolak_spi: "Dokumen perlu perbaikan sesuai temuan SPI",
      disetujui: "Semua dokumen telah disetujui",
      selesai: "Dana siap dicairkan dan kegiatan dapat dilaksanakan",
    };
    return descMap[status] || "Proses pengajuan berjalan";
  };

  const goBack = () => navigateTo("/dashboard");

  const reloadData = async () => {
    const id = route.params.id;
    await rabStore.fetchFullRabData(id);
    await approveLogStore.fetchApprovalLogs(id);
  };

  const openDocument = () => {
    const activeUrl =
      activeDocumentTab.value === "rab"
        ? rabData.value?.fileRabUrl
        : rabData.value?.fileTorUrl;
    if (currentFileObjectUrl.value) {
      window.open(currentFileObjectUrl.value, "_blank");
    } else if (activeUrl) {
      window.open(activeUrl, "_blank");
    }
  };

  const downloadDocument = () => {
    const activeUrl =
      activeDocumentTab.value === "rab"
        ? rabData.value?.fileRabUrl
        : rabData.value?.fileTorUrl;
    if (currentFileObjectUrl.value) {
      const link = document.createElement("a");
      link.href = currentFileObjectUrl.value;
      link.download =
        fileInfo.value.name || `dokumen_${activeDocumentTab.value}.pdf`;
      link.click();
    } else if (activeUrl) {
      window.open(activeUrl, "_blank");
    }
  };

  const submitRab = async () => {
    isSubmitting.value = true;
    try {
      await $fetch("/api/ormawa/Rab/PengajuanDraftRab", {
        method: "POST",
        body: { rabId: rabData.value.id },
      });
      await reloadData();
      showAjukanModal.value = false;
    } catch (err) {
      console.error(err);
      alert("Gagal mengajukan dokumen");
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleEditFile = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === "rab") editFileRab.value = file;
      if (type === "tor") editFileTor.value = file;
    }
  };

  const saveEdit = async () => {
    isEditing.value = true;
    try {
      const formData = new FormData();
      formData.append("rabId", rabData.value.id);
      formData.append("anggaranBaru", anggaranBaru.value);
      formData.append(
        "editJudul",
        editJudul.value || rabData.value.judulKegiatan,
      );
      formData.append("tanggalMulai", editTanggalMulai.value);
      formData.append("tanggalSelesai", editTanggalSelesai.value);

      if (editFileRab.value) formData.append("fileRab", editFileRab.value);
      if (editFileTor.value) formData.append("fileTor", editFileTor.value);

      await $fetch("/api/ormawa/Rab/updateRab", {
        method: "patch",
        body: formData,
      });

      await reloadData();
      showEditModal.value = false;
      editFileRab.value = null;
      editFileTor.value = null;
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan perubahan");
    } finally {
      isEditing.value = false;
    }
  };

  const deleteDraft = async () => {
    try {
      await $fetch(`/api/ormawa/Rab/hapusDraft`, {
        method: "DELETE",
        body: { rabId: rabData.value.id },
      });
      navigateTo("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus draft");
    }
  };

  onMounted(async () => {
    const id = route.params.id;
    if (id) {
      await reloadData();
      if (rabData.value) {
        editJudul.value = rabData.value.judulKegiatan;
        anggaranBaru.value = rabData.value.totalAnggaran;
        editTanggalMulai.value = formatForInputDate(rabData.value.tanggalMulai);
        editTanggalSelesai.value = formatForInputDate(
          rabData.value.tanggalSelesai,
        );
      }
    }
  });

  onBeforeUnmount(() => {
    rabStore.cleanupFileUrls();
    approveLogStore.clearLogs();
  });
</script>

<style>
  @theme {
    --color-primary: #3b5988;
    --color-secondary: #d1a82a;
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
  /* Additional keyframes for horizontal stepper */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
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
