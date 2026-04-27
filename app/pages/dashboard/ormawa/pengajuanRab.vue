<template>
  <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b5988] to-[#2d4570] flex items-center justify-center shadow-lg"
          >
            <Icon name="heroicons:document-plus" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">
              Form Pengajuan RAB
            </h1>
            <p class="text-slate-500">
              Ajukan rencana anggaran kegiatan organisasi mahasiswa
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="space-y-6">
        <div
          class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <!-- Progress Stepper (sama) -->
          <div class="bg-slate-50/50 border-b border-slate-200 px-6 py-4">
            <div class="flex items-center justify-between">
              <div
                v-for="(step, index) in steps"
                :key="index"
                class="flex items-center"
              >
                <div
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    currentStep >= index + 1
                      ? 'bg-[#3b5988] text-white'
                      : 'bg-slate-200 text-slate-500',
                  ]"
                >
                  <Icon
                    v-if="currentStep > index + 1"
                    name="heroicons:check"
                    class="w-5 h-5"
                  />
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <span
                  :class="[
                    'ml-2 text-sm font-medium hidden sm:block',
                    currentStep >= index + 1
                      ? 'text-[#3b5988]'
                      : 'text-slate-400',
                  ]"
                  >{{ step }}</span
                >
                <div
                  v-if="index < steps.length - 1"
                  :class="[
                    'w-12 sm:w-24 h-0.5 mx-2 sm:mx-4 transition-all',
                    currentStep > index + 1 ? 'bg-[#3b5988]' : 'bg-slate-200',
                  ]"
                ></div>
              </div>
            </div>
          </div>

          <div class="p-6 sm:p-8 space-y-6">
            <!-- STEP 1: Informasi Dasar + Tanggal -->
            <div v-if="currentStep === 1" class="space-y-6 animate-fadeIn">
              <div class="flex items-center gap-2 mb-4">
                <Icon
                  name="heroicons:information-circle"
                  class="w-5 h-5 text-[#d1a82a]"
                />
                <h2 class="text-lg font-bold text-slate-900">
                  Informasi Kegiatan
                </h2>
              </div>

              <!-- Nomor Pengajuan (auto) -->
              <div
                class="p-4 rounded-xl bg-[#3b5988]/5 border border-[#3b5988]/10"
              >
                <label class="block text-sm font-medium text-[#3b5988] mb-1"
                  >Nomor Pengajuan</label
                >
                <div class="flex items-center gap-3">
                  <span class="text-lg font-mono font-bold text-[#3b5988]">{{
                    formData.nomor_pengajuan
                  }}</span>
                  <span
                    class="text-xs text-slate-500 bg-white px-2 py-1 rounded border"
                    >Auto-generated</span
                  >
                </div>
                <p class="text-xs text-slate-500 mt-1">
                  Nomor unik akan dibuatkan otomatis oleh sistem
                </p>
              </div>

              <!-- Judul Kegiatan -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">
                  Judul Kegiatan <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.judul_kegiatan"
                  type="text"
                  placeholder="Contoh: Seminar Nasional Teknologi 2024"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#3b5988] focus:ring-2 focus:ring-[#3b5988]/20 outline-none transition-all"
                  :class="{
                    'border-red-300 focus:border-red-500 focus:ring-red-200':
                      errors.judul_kegiatan,
                  }"
                />
                <p
                  v-if="errors.judul_kegiatan"
                  class="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
                  {{ errors.judul_kegiatan }}
                </p>
              </div>

              <!-- Deskripsi -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">
                  Deskripsi Kegiatan
                  <span class="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                  v-model="formData.deskripsi"
                  rows="4"
                  placeholder="Jelaskan secara singkat tentang kegiatan yang akan dilaksanakan..."
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#3b5988] focus:ring-2 focus:ring-[#3b5988]/20 outline-none transition-all resize-none"
                ></textarea>
                <div class="flex justify-between mt-1">
                  <p class="text-xs text-slate-500">
                    Min. 50 karakter untuk deskripsi yang baik
                  </p>
                  <p class="text-xs text-slate-400">
                    {{ formData.deskripsi?.length || 0 }}/500
                  </p>
                </div>
              </div>

              <!-- Tanggal Mulai & Selesai (baru) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Tanggal Mulai <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.tanggal_mulai"
                    type="date"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#3b5988] focus:ring-2 focus:ring-[#3b5988]/20 outline-none transition-all"
                    :class="{ 'border-red-300': errors.tanggal_mulai }"
                  />
                  <p
                    v-if="errors.tanggal_mulai"
                    class="mt-1 text-sm text-red-500"
                  >
                    {{ errors.tanggal_mulai }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Tanggal Selesai <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.tanggal_selesai"
                    type="date"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#3b5988] focus:ring-2 focus:ring-[#3b5988]/20 outline-none transition-all"
                    :class="{ 'border-red-300': errors.tanggal_selesai }"
                  />
                  <p
                    v-if="errors.tanggal_selesai"
                    class="mt-1 text-sm text-red-500"
                  >
                    {{ errors.tanggal_selesai }}
                  </p>
                </div>
              </div>

              <!-- Ormawa Info (readonly) -->
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label class="block text-sm font-medium text-slate-600 mb-2"
                  >Organisasi Mahasiswa</label
                >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-lg bg-[#3b5988] flex items-center justify-center text-white font-bold"
                  >
                    {{ user?.username?.charAt(0) || "O" }}
                  </div>
                  <div>
                    <p class="font-semibold text-slate-900">
                      {{ user?.username || "Loading..." }}
                    </p>
                    <p class="text-xs text-slate-500">
                      {{ user?.email || "" }}
                    </p>
                  </div>
                </div>
                <input type="hidden" v-model="formData.users_id" />
              </div>
            </div>

            <!-- STEP 2: Upload Dokumen (RAB + TOR) -->
            <div v-if="currentStep === 2" class="space-y-6 animate-fadeIn">
              <div class="flex items-center gap-2 mb-4">
                <Icon
                  name="heroicons:cloud-arrow-up"
                  class="w-5 h-5 text-[#d1a82a]"
                />
                <h2 class="text-lg font-bold text-slate-900">Upload Dokumen</h2>
              </div>

              <!-- Upload RAB -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2"
                  >File RAB <span class="text-red-500">*</span></label
                >
                <div
                  @dragover.prevent="isDraggingRAB = true"
                  @dragleave.prevent="isDraggingRAB = false"
                  @drop.prevent="handleFileDrop($event, 'rab')"
                  :class="[
                    'border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer',
                    isDraggingRAB
                      ? 'border-[#3b5988] bg-[#3b5988]/5'
                      : formData.file_rab
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : 'border-slate-300 hover:border-[#d1a82a] hover:bg-[#d1a82a]/5',
                  ]"
                  @click="() => $refs.fileInputRAB.click()"
                >
                  <input
                    ref="fileInputRAB"
                    type="file"
                    accept=".pdf,.xlsx,.xls,.doc,.docx"
                    class="hidden"
                    @change="(e) => handleFileSelect(e, 'rab')"
                  />
                  <div v-if="!formData.file_rab" class="space-y-2">
                    <div
                      class="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center"
                    >
                      <Icon
                        name="heroicons:document-arrow-up"
                        class="w-6 h-6 text-slate-400"
                      />
                    </div>
                    <p class="text-sm font-medium text-slate-900">
                      Klik atau drag & drop untuk upload RAB
                    </p>
                    <p class="text-xs text-slate-500">
                      PDF, Excel, Word (Max 10MB)
                    </p>
                  </div>
                  <div v-else class="space-y-2">
                    <div
                      class="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center"
                    >
                      <Icon
                        name="heroicons:document-check"
                        class="w-6 h-6 text-emerald-600"
                      />
                    </div>
                    <p class="text-sm font-medium text-emerald-700">
                      {{ formData.file_name }}
                    </p>
                    <p class="text-xs text-emerald-600">
                      {{ formData.file_size }}
                    </p>
                    <button
                      type="button"
                      @click.stop="removeFile('rab')"
                      class="text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <p v-if="errors.file_rab" class="mt-1 text-sm text-red-500">
                  {{ errors.file_rab }}
                </p>
              </div>

              <!-- Upload TOR -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2"
                  >File TOR (Term of Reference)
                  <span class="text-red-500">*</span></label
                >
                <div
                  @dragover.prevent="isDraggingTOR = true"
                  @dragleave.prevent="isDraggingTOR = false"
                  @drop.prevent="handleFileDrop($event, 'tor')"
                  :class="[
                    'border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer',
                    isDraggingTOR
                      ? 'border-[#3b5988] bg-[#3b5988]/5'
                      : formData.file_tor
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : 'border-slate-300 hover:border-[#d1a82a] hover:bg-[#d1a82a]/5',
                  ]"
                  @click="() => $refs.fileInputTOR.click()"
                >
                  <input
                    ref="fileInputTOR"
                    type="file"
                    accept=".pdf,.xlsx,.xls,.doc,.docx"
                    class="hidden"
                    @change="(e) => handleFileSelect(e, 'tor')"
                  />
                  <div v-if="!formData.file_tor" class="space-y-2">
                    <div
                      class="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center"
                    >
                      <Icon
                        name="heroicons:document-arrow-up"
                        class="w-6 h-6 text-slate-400"
                      />
                    </div>
                    <p class="text-sm font-medium text-slate-900">
                      Klik atau drag & drop untuk upload TOR
                    </p>
                    <p class="text-xs text-slate-500">
                      PDF, Excel, Word (Max 10MB)
                    </p>
                  </div>
                  <div v-else class="space-y-2">
                    <div
                      class="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center"
                    >
                      <Icon
                        name="heroicons:document-check"
                        class="w-6 h-6 text-emerald-600"
                      />
                    </div>
                    <p class="text-sm font-medium text-emerald-700">
                      {{ formData.tor_name }}
                    </p>
                    <p class="text-xs text-emerald-600">
                      {{ formData.tor_size }}
                    </p>
                    <button
                      type="button"
                      @click.stop="removeFile('tor')"
                      class="text-xs text-red-500 hover:text-red-700 underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <p v-if="errors.file_tor" class="mt-1 text-sm text-red-500">
                  {{ errors.file_tor }}
                </p>
              </div>

              <!-- Template download (opsional) -->
              <div
                class="p-4 rounded-xl bg-[#d1a82a]/10 border border-[#d1a82a]/20"
              >
                <div class="flex items-start gap-3">
                  <Icon
                    name="heroicons:light-bulb"
                    class="w-5 h-5 text-[#d1a82a] mt-0.5"
                  />
                  <div>
                    <p class="text-sm font-medium text-slate-900">
                      Belum punya template?
                    </p>
                    <p class="text-sm text-slate-600 mb-2">
                      Download template RAB dan TOR resmi kampus
                    </p>
                    <button
                      type="button"
                      class="text-sm font-medium text-[#3b5988] hover:text-[#2d4570] flex items-center gap-1"
                    >
                      <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 3: Anggaran & Review (sama seperti sebelumnya) -->
            <div v-if="currentStep === 3" class="space-y-6 animate-fadeIn">
              <!-- ... konten step 3 tidak berubah ... -->
              <div class="flex items-center gap-2 mb-4">
                <Icon
                  name="heroicons:currency-dollar"
                  class="w-5 h-5 text-[#d1a82a]"
                />
                <h2 class="text-lg font-bold text-slate-900">Total Anggaran</h2>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">
                  Total Anggaran yang Diajukan
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium"
                    >Rp</span
                  >
                  <input
                    v-model="formattedAnggaran"
                    type="text"
                    placeholder="0"
                    class="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#3b5988] focus:ring-2 focus:ring-[#3b5988]/20 outline-none transition-all font-mono text-lg"
                    :class="{ 'border-red-300': errors.total_anggaran }"
                    @input="formatCurrency"
                  />
                </div>
                <p
                  v-if="errors.total_anggaran"
                  class="mt-1 text-sm text-red-500"
                >
                  {{ errors.total_anggaran }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  Masukkan nominal tanpa titik atau koma
                </p>
              </div>

              <div
                class="p-6 rounded-xl bg-gradient-to-br from-[#3b5988] to-[#2d4570] text-white"
              >
                <h3 class="text-sm font-medium text-blue-100 mb-4">
                  Preview Pengajuan
                </h3>
                <div class="space-y-3">
                  <div
                    class="flex justify-between items-center py-2 border-b border-white/10"
                  >
                    <span class="text-sm text-blue-100">Nomor Pengajuan</span>
                    <span class="font-mono font-medium">{{
                      formData.nomor_pengajuan
                    }}</span>
                  </div>
                  <div
                    class="flex justify-between items-center py-2 border-b border-white/10"
                  >
                    <span class="text-sm text-blue-100">Judul Kegiatan</span>
                    <span class="font-medium text-right max-w-xs truncate">{{
                      formData.judul_kegiatan || "-"
                    }}</span>
                  </div>
                  <div
                    class="flex justify-between items-center py-2 border-b border-white/10"
                  >
                    <span class="text-sm text-blue-100">Periode</span>
                    <span class="font-medium"
                      >{{ formData.tanggal_mulai }} s/d
                      {{ formData.tanggal_selesai }}</span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center py-2 border-b border-white/10"
                  >
                    <span class="text-sm text-blue-100">Organisasi</span>
                    <span class="font-medium">{{ user?.username || "-" }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-blue-100">Total Anggaran</span>
                    <span class="text-xl font-bold text-[#d1a82a]"
                      >Rp {{ formattedAnggaran || "0" }}</span
                    >
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2"
                  >Status Pengajuan</label
                >
                <div class="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    @click="formData.status = 'draft'"
                    :class="[
                      'p-4 rounded-xl border-2 text-left transition-all',
                      formData.status === 'draft'
                        ? 'border-[#3b5988] bg-[#3b5988]/5'
                        : 'border-slate-200',
                    ]"
                  >
                    <div class="flex items-center gap-2 mb-1">
                      <div
                        class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                        :class="
                          formData.status === 'draft'
                            ? 'border-[#3b5988]'
                            : 'border-slate-300'
                        "
                      >
                        <div
                          v-if="formData.status === 'draft'"
                          class="w-2 h-2 rounded-full bg-[#3b5988]"
                        ></div>
                      </div>
                      <span class="font-medium text-slate-900"
                        >Simpan Draft</span
                      >
                    </div>
                    <p class="text-xs text-slate-500">
                      Simpan untuk diedit nanti
                    </p>
                  </button>
                  <button
                    type="button"
                    @click="formData.status = 'waiting_kaprodi'"
                    :class="[
                      'p-4 rounded-xl border-2 text-left transition-all',
                      formData.status === 'waiting_kaprodi'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200',
                    ]"
                  >
                    <div class="flex items-center gap-2 mb-1">
                      <div
                        class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                        :class="
                          formData.status === 'waiting_kaprodi'
                            ? 'border-emerald-500'
                            : 'border-slate-300'
                        "
                      >
                        <div
                          v-if="formData.status === 'waiting_kaprodi'"
                          class="w-2 h-2 rounded-full bg-emerald-500"
                        ></div>
                      </div>
                      <span class="font-medium text-slate-900"
                        >Ajukan Sekarang</span
                      >
                    </div>
                    <p class="text-xs text-slate-500">Kirim untuk direview</p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions (sama) -->
          <div
            class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between"
          >
            <button
              v-if="currentStep > 1"
              type="button"
              @click="prevStep"
              class="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-white transition-all"
            >
              <Icon name="heroicons:arrow-left" class="w-5 h-5" /> Kembali
            </button>
            <div v-else></div>
            <div class="flex items-center gap-3">
              <button
                v-if="currentStep < 3"
                type="button"
                @click="nextStep"
                class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3b5988] text-white font-medium hover:bg-[#2d4570] transition-all shadow-lg shadow-[#3b5988]/25"
              >
                Lanjutkan <Icon name="heroicons:arrow-right" class="w-5 h-5" />
              </button>
              <button
                v-else
                type="submit"
                :disabled="isSubmitting"
                class="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-70"
              >
                <Icon
                  v-if="isSubmitting"
                  name="heroicons:arrow-path"
                  class="w-5 h-5 animate-spin"
                />
                <Icon v-else name="heroicons:paper-airplane" class="w-5 h-5" />
                {{
                  isSubmitting
                    ? "Mengirim..."
                    : formData.status === "draft"
                      ? "Simpan Draft"
                      : "Ajukan RAB"
                }}
              </button>
            </div>
          </div>
        </div>

        <!-- Help Card -->
        <div class="bg-[#d1a82a]/10 rounded-2xl p-6 border border-[#d1a82a]/20">
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-xl bg-[#d1a82a] flex items-center justify-center flex-shrink-0"
            >
              <Icon
                name="heroicons:question-mark-circle"
                class="w-6 h-6 text-white"
              />
            </div>
            <div>
              <p class="font-medium text-slate-900">
                Perhatikan kelengkapan dokumen!
              </p>
              <p class="text-sm text-slate-600">
                Pastikan file RAB dan TOR sudah diupload, tanggal kegiatan
                valid, dan total anggaran sesuai dengan rencana.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Success Modal (sama) -->
    <Teleport to="body">
      <Transition name="modal-fade" appear>
        <div v-if="showSuccessModal" class="fixed inset-0 z-50 overflow-y-auto">
          <div
            class="fixed inset-0 bg-black/40 backdrop-blur-sm"
            @click="showSuccessModal = false"
          />
          <div class="flex min-h-full items-center justify-center p-4">
            <Transition name="modal-zoom" appear>
              <div
                v-if="showSuccessModal"
                class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-center p-8 shadow-xl"
              >
                <div
                  class="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center"
                >
                  <Icon
                    name="heroicons:check-badge"
                    class="w-10 h-10 text-emerald-600"
                  />
                </div>
                <h3 class="text-2xl font-bold text-slate-900 mb-2">
                  Berhasil!
                </h3>
                <p class="text-slate-600 mb-6">
                  Pengajuan RAB
                  <span class="font-mono font-medium text-[#3b5988]">{{
                    submittedNomor
                  }}</span>
                  telah
                  {{
                    formData.status === "draft"
                      ? "disimpan sebagai draft"
                      : "diajukan"
                  }}.
                </p>
                <div class="space-y-3">
                  <button
                    @click="resetForm"
                    class="w-full px-6 py-3 rounded-xl bg-[#3b5988] text-white font-medium hover:bg-[#2d4570] transition-all"
                  >
                    Buat Pengajuan Baru
                  </button>
                  <button
                    @click="goToDashboard"
                    class="w-full px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from "vue";
  import { useAuthStore } from "~/stores/auth";

  const authStore = useAuthStore();
  const { user } = authStore;

  const steps = ["Informasi Dasar", "Upload Dokumen", "Review & Submit"];
  const currentStep = ref(1);
  const isDraggingRAB = ref(false);
  const isDraggingTOR = ref(false);
  const isSubmitting = ref(false);
  const showSuccessModal = ref(false);
  const submittedNomor = ref("");

  const formData = reactive({
    nomor_pengajuan: "",
    users_id: null,
    judul_kegiatan: "",
    deskripsi: "",
    file_rab: null,
    file_name: "",
    file_size: "",
    file_tor: null,
    tor_name: "",
    tor_size: "",
    total_anggaran: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    status: "draft",
  });

  const errors = reactive({
    judul_kegiatan: "",
    file_rab: "",
    file_tor: "",
    total_anggaran: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });

  // Generate nomor otomatis
  onMounted(() => {
    generateNomorPengajuan();
    formData.users_id = user?.id;
  });

  const generateNomorPengajuan = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);
    formData.nomor_pengajuan = `RAB/${year}/${month}/${random}`;
  };

  // Currency formatter
  const formattedAnggaran = computed({
    get() {
      if (!formData.total_anggaran) return "";
      return new Intl.NumberFormat("id-ID").format(
        parseInt(formData.total_anggaran),
      );
    },
    set(value) {
      const numeric = value.replace(/[^0-9]/g, "");
      formData.total_anggaran = numeric;
    },
  });

  const formatCurrency = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    formData.total_anggaran = value;
  };

  // File handling untuk RAB dan TOR
  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) processFile(file, type);
  };

  const handleFileDrop = (e, type) => {
    if (type === "rab") isDraggingRAB.value = false;
    else isDraggingTOR.value = false;
    const file = e.dataTransfer.files[0];
    if (file) processFile(file, type);
  };

  const processFile = (file, type) => {
    if (file.size > 10 * 1024 * 1024) {
      errors[`file_${type}`] = "Ukuran file maksimal 10MB";
      return;
    }
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      errors[`file_${type}`] = "Format file harus PDF, Word, atau Excel";
      return;
    }
    errors[`file_${type}`] = "";
    if (type === "rab") {
      formData.file_rab = file;
      formData.file_name = file.name;
      formData.file_size = formatFileSize(file.size);
    } else {
      formData.file_tor = file;
      formData.tor_name = file.name;
      formData.tor_size = formatFileSize(file.size);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const removeFile = (type) => {
    if (type === "rab") {
      formData.file_rab = null;
      formData.file_name = "";
      formData.file_size = "";
      if (typeof $refs !== "undefined" && $refs.fileInputRAB)
        $refs.fileInputRAB.value = "";
    } else {
      formData.file_tor = null;
      formData.tor_name = "";
      formData.tor_size = "";
      if (typeof $refs !== "undefined" && $refs.fileInputTOR)
        $refs.fileInputTOR.value = "";
    }
  };

  // Validasi per step
  const validateStep = () => {
    let isValid = true;
    if (currentStep.value === 1) {
      if (!formData.judul_kegiatan.trim()) {
        errors.judul_kegiatan = "Judul kegiatan wajib diisi";
        isValid = false;
      } else if (formData.judul_kegiatan.length < 10) {
        errors.judul_kegiatan = "Judul minimal 10 karakter";
        isValid = false;
      } else {
        errors.judul_kegiatan = "";
      }
      if (!formData.tanggal_mulai) {
        errors.tanggal_mulai = "Tanggal mulai wajib diisi";
        isValid = false;
      } else {
        errors.tanggal_mulai = "";
      }
      if (!formData.tanggal_selesai) {
        errors.tanggal_selesai = "Tanggal selesai wajib diisi";
        isValid = false;
      } else if (
        formData.tanggal_mulai &&
        formData.tanggal_selesai &&
        new Date(formData.tanggal_selesai) < new Date(formData.tanggal_mulai)
      ) {
        errors.tanggal_selesai =
          "Tanggal selesai tidak boleh kurang dari tanggal mulai";
        isValid = false;
      } else {
        errors.tanggal_selesai = "";
      }
    }
    if (currentStep.value === 2) {
      if (!formData.file_rab) {
        errors.file_rab = "File RAB wajib diupload";
        isValid = false;
      } else {
        errors.file_rab = "";
      }
      if (!formData.file_tor) {
        errors.file_tor = "File TOR wajib diupload";
        isValid = false;
      } else {
        errors.file_tor = "";
      }
    }
    if (currentStep.value === 3) {
      if (!formData.total_anggaran) {
        errors.total_anggaran = "Total anggaran wajib diisi";
        isValid = false;
      } else if (parseInt(formData.total_anggaran) < 100000) {
        errors.total_anggaran = "Minimal anggaran Rp 100.000";
        isValid = false;
      } else {
        errors.total_anggaran = "";
      }
    }
    return isValid;
  };

  const nextStep = () => {
    if (validateStep()) currentStep.value++;
  };
  const prevStep = () => currentStep.value--;

  // Submit
  const submitForm = async () => {
    if (!validateStep()) return;
    isSubmitting.value = true;
    const formDataToSend = new FormData();
    formDataToSend.append("nomorPengajuan", formData.nomor_pengajuan);
    formDataToSend.append("usersId", formData.users_id);
    formDataToSend.append("judulKegiatan", formData.judul_kegiatan);
    formDataToSend.append("deskripsi", formData.deskripsi || "");
    formDataToSend.append("totalAnggaran", formData.total_anggaran);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("tanggalMulai", formData.tanggal_mulai);
    formDataToSend.append("tanggalSelesai", formData.tanggal_selesai);
    if (formData.file_rab) formDataToSend.append("file_rab", formData.file_rab);
    if (formData.file_tor) formDataToSend.append("file_tor", formData.file_tor);

    try {
      const response = await $fetch("/api/ormawa/Rab/PengajuanRab", {
        method: "post",
        body: formDataToSend,
      });
      submittedNomor.value = formData.nomor_pengajuan;
      showSuccessModal.value = true;
    } catch (error) {
      console.error("Error:", error);
    } finally {
      isSubmitting.value = false;
    }
  };

  const resetForm = () => {
    showSuccessModal.value = false;
    currentStep.value = 1;
    generateNomorPengajuan();
    formData.judul_kegiatan = "";
    formData.deskripsi = "";
    formData.file_rab = null;
    formData.file_name = "";
    formData.file_size = "";
    formData.file_tor = null;
    formData.tor_name = "";
    formData.tor_size = "";
    formData.total_anggaran = "";
    formData.tanggal_mulai = "";
    formData.tanggal_selesai = "";
    formData.status = "draft";
    formData.users_id = user?.id;
  };

  const goToDashboard = () => navigateTo("/dashboard/ormawa");
</script>
