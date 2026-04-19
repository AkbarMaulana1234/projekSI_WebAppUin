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
        <!-- Main Form Card -->
        <div
          class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <!-- Progress Stepper -->
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
            <!-- Step 1: Informasi Dasar -->
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

              <!-- Nomor Pengajuan (Auto-generated) -->
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

              <!-- Ormawa Info (Read-only dari user login) -->
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label class="block text-sm font-medium text-slate-600 mb-2"
                  >Organisasi Mahasiswa</label
                >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-lg bg-[#3b5988] flex items-center justify-center text-white font-bold"
                  >
                    {{ user.username.charAt(0) || "O" }}
                  </div>
                  <div>
                    <p class="font-semibold text-slate-900">
                      {{ user.username || "Loading..." }}
                    </p>
                    <p class="text-xs text-slate-500">
                      {{ user.email || "" }}
                    </p>
                  </div>
                </div>
                <input type="hidden" v-model="formData.users_id" />
              </div>
            </div>

            <!-- Step 2: Upload Dokumen -->
            <div v-if="currentStep === 2" class="space-y-6 animate-fadeIn">
              <div class="flex items-center gap-2 mb-4">
                <Icon
                  name="heroicons:cloud-arrow-up"
                  class="w-5 h-5 text-[#d1a82a]"
                />
                <h2 class="text-lg font-bold text-slate-900">Dokumen RAB</h2>
              </div>

              <!-- File Upload Area -->
              <div
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleFileDrop"
                :class="[
                  'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer',
                  isDragging
                    ? 'border-[#3b5988] bg-[#3b5988]/5'
                    : formData.file_rab
                      ? 'border-emerald-400 bg-emerald-50/50'
                      : 'border-slate-300 hover:border-[#d1a82a] hover:bg-[#d1a82a]/5',
                ]"
                @click="$refs.fileInput.click()"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept=".pdf,.xlsx,.xls,.doc,.docx"
                  class="hidden"
                  @change="handleFileSelect"
                />

                <div v-if="!formData.file_rab" class="space-y-3">
                  <div
                    class="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center"
                  >
                    <Icon
                      name="heroicons:document-arrow-up"
                      class="w-8 h-8 text-slate-400"
                    />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-900">
                      <span class="text-[#3b5988]">Klik untuk upload</span> atau
                      drag and drop
                    </p>
                    <p class="text-xs text-slate-500 mt-1">
                      PDF, Excel, atau Word (Max. 10MB)
                    </p>
                  </div>
                </div>

                <div v-else class="space-y-3">
                  <div
                    class="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center"
                  >
                    <Icon
                      name="heroicons:document-check"
                      class="w-8 h-8 text-emerald-600"
                    />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-emerald-700">
                      {{ formData.file_name }}
                    </p>
                    <p class="text-xs text-emerald-600 mt-1">
                      {{ formData.file_size }}
                    </p>
                  </div>
                  <button
                    type="button"
                    @click.stop="removeFile"
                    class="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Hapus file
                  </button>
                </div>
              </div>

              <p
                v-if="errors.file_rab"
                class="text-sm text-red-500 flex items-center gap-1"
              >
                <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
                {{ errors.file_rab }}
              </p>

              <!-- Template Download -->
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
                      Download template RAB resmi kampus
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

            <!-- Step 3: Anggaran & Review -->
            <div v-if="currentStep === 3" class="space-y-6 animate-fadeIn">
              <div class="flex items-center gap-2 mb-4">
                <Icon
                  name="heroicons:currency-dollar"
                  class="w-5 h-5 text-[#d1a82a]"
                />
                <h2 class="text-lg font-bold text-slate-900">Total Anggaran</h2>
              </div>

              <!-- Total Anggaran Input -->
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
                    :class="{
                      'border-red-300 focus:border-red-500 focus:ring-red-200':
                        errors.total_anggaran,
                    }"
                    @input="formatCurrency"
                  />
                </div>
                <p
                  v-if="errors.total_anggaran"
                  class="mt-1 text-sm text-red-500 flex items-center gap-1"
                >
                  <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
                  {{ errors.total_anggaran }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  Masukkan nominal tanpa titik atau koma
                </p>
              </div>

              <!-- Preview Card -->
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
                    <span class="text-sm text-blue-100">Organisasi</span>
                    <span class="font-medium">{{ user.username || "-" }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-blue-100">Total Anggaran</span>
                    <span class="text-xl font-bold text-[#d1a82a]"
                      >Rp {{ formattedAnggaran || "0" }}</span
                    >
                  </div>
                </div>
              </div>

              <!-- Status Selection -->
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
                        : 'border-slate-200 hover:border-slate-300',
                    ]"
                  >
                    <div class="flex items-center gap-2 mb-1">
                      <div
                        :class="[
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                          formData.status === 'draft'
                            ? 'border-[#3b5988]'
                            : 'border-slate-300',
                        ]"
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
                        : 'border-slate-200 hover:border-slate-300',
                    ]"
                  >
                    <div class="flex items-center gap-2 mb-1">
                      <div
                        :class="[
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                          formData.status === 'waiting_kaprodi'
                            ? 'border-emerald-500'
                            : 'border-slate-300',
                        ]"
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

          <!-- Footer Actions -->
          <div
            class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between"
          >
            <button
              v-if="currentStep > 1"
              type="button"
              @click="prevStep"
              class="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-white transition-all"
            >
              <Icon name="heroicons:arrow-left" class="w-5 h-5" />
              Kembali
            </button>
            <div v-else></div>

            <div class="flex items-center gap-3">
              <button
                v-if="currentStep < 3"
                type="button"
                @click="nextStep"
                class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3b5988] text-white font-medium hover:bg-[#2d4570] transition-all shadow-lg shadow-[#3b5988]/25"
              >
                Lanjutkan
                <Icon name="heroicons:arrow-right" class="w-5 h-5" />
              </button>

              <button
                v-else
                type="submit"
                :disabled="isSubmitting"
                class="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
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
          </div>
        </div>
      </form>
    </div>

    <!-- Success Modal -->
    <Teleport to="body">
      <Transition name="modal-fade" appear>
        <div v-if="showSuccessModal" class="fixed inset-0 z-50 overflow-y-auto">
          <!-- Backdrop -->
          <div
            class="fixed inset-0 bg-black/40 backdrop-blur-sm"
            @click="showSuccessModal = false"
          />

          <!-- Modal Container -->
          <div class="flex min-h-full items-center justify-center p-4">
            <Transition name="modal-zoom" appear>
              <div
                v-if="showSuccessModal"
                class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-center p-8 shadow-xl"
              >
                <!-- Icon -->
                <div
                  class="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center"
                >
                  <Icon
                    name="heroicons:check-badge"
                    class="w-10 h-10 text-emerald-600"
                  />
                </div>

                <!-- Title -->
                <h3 class="text-2xl font-bold text-slate-900 mb-2">
                  Berhasil!
                </h3>

                <!-- Message -->
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

                <!-- Buttons -->
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
  console.log(user);
  const steps = ["Informasi Dasar", "Upload Dokumen", "Review & Submit"];
  const currentStep = ref(1);
  const isDragging = ref(false);
  const isSubmitting = ref(false);
  const showSuccessModal = ref(false);
  const submittedNomor = ref("");

  // Form Data sesuai schema
  const formData = reactive({
    nomor_pengajuan: "",
    users_id: null,
    judul_kegiatan: "",
    deskripsi: "",
    file_rab: null,
    file_name: "",
    file_size: "",
    total_anggaran: "",
    status: "draft",
  });

  const errors = reactive({
    judul_kegiatan: "",
    file_rab: "",
    total_anggaran: "",
  });

  // Generate nomor pengajuan otomatis
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
      return formatRupiah(formData.total_anggaran);
    },
    set(value) {
      const numeric = value.replace(/[^0-9]/g, "");
      formData.total_anggaran = numeric;
    },
  });

  const formatRupiah = (value) => {
    if (!value) return "";
    const number = value.toString().replace(/[^0-9]/g, "");
    return new Intl.NumberFormat("id-ID").format(number);
  };

  const formatCurrency = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    formData.total_anggaran = value;
  };

  // File handling
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleFileDrop = (e) => {
    isDragging.value = false;
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    // Validasi ukuran (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.file_rab = "Ukuran file maksimal 10MB";
      return;
    }

    // Validasi tipe file
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      errors.file_rab = "Format file harus PDF, Excel, atau Word";
      return;
    }

    errors.file_rab = "";
    formData.file_rab = file;
    formData.file_name = file.name;
    formData.file_size = formatFileSize(file.size);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const removeFile = () => {
    formData.file_rab = null;
    formData.file_name = "";
    formData.file_size = "";
    if ($refs.fileInput) $refs.fileInput.value = "";
  };

  // Validation
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
    }

    if (currentStep.value === 2) {
      if (!formData.file_rab) {
        errors.file_rab = "File RAB wajib diupload";
        isValid = false;
      } else {
        errors.file_rab = "";
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
    if (validateStep()) {
      currentStep.value++;
    }
  };

  const prevStep = () => {
    currentStep.value--;
  };

  // Submit
  const submitForm = async () => {
    if (!validateStep()) return;
    console.log(formData.file_rab);
    isSubmitting.value = true;
    console.log(formData);
    // Simulasi API call
    try {
      // Buat FormData, BUKAN object biasa
      const formDataToSend = new FormData();
      formDataToSend.append("nomorPengajuan", formData.nomor_pengajuan);
      formDataToSend.append("usersId", formData.users_id);
      formDataToSend.append("judulKegiatan", formData.judul_kegiatan);
      formDataToSend.append("deskripsi", formData.deskripsi);
      formDataToSend.append("totalAnggaran", formData.total_anggaran);
      formDataToSend.append("status", formData.status);

      if (formData.file_rab) {
        formDataToSend.append("file_rab", formData.file_rab);
      }

      const response = await $fetch("/api/ormawa/Rab/PengajuanRab", {
        method: "post",
        body: formDataToSend,
      });
      console.log(response);
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
    Object.assign(formData, {
      nomor_pengajuan: "",
      users_id: user?.id,
      judul_kegiatan: "",
      deskripsi: "",
      file_rab: null,
      file_name: "",
      file_size: "",
      total_anggaran: "",
      status: "draft",
    });
    generateNomorPengajuan();
  };

  const goToDashboard = () => {
    navigateTo("/dashboard/ormawa");
  };
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
