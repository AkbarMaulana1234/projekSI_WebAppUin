<template>
  <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Tombol Kembali & Header -->
      <div class="mb-6 flex items-center gap-3">
        <button
          @click="goBack"
          class="p-2 rounded-lg hover:bg-slate-200 transition"
        >
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-slate-900">
            Upload Dokumentasi Kegiatan
          </h1>
          <p class="text-sm text-slate-500">
            Kelengkapan acara, bukti belanja, dan bukti jasa
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <Icon
          name="heroicons:arrow-path"
          class="w-8 h-8 animate-spin text-[#3b5988] mx-auto"
        />
        <p class="text-slate-500 mt-2">Memuat data...</p>
      </div>

      <div v-else>
        <!-- Informasi Kegiatan -->
        <div
          class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6"
        >
          <h2 class="text-lg font-bold text-slate-900 mb-2">
            {{ kegiatan?.judulKegiatan || "Kegiatan" }}
          </h2>
          <div class="flex flex-wrap gap-4 text-sm text-slate-500">
            <span class="flex items-center gap-1">
              <Icon name="heroicons:calendar" class="w-4 h-4" />
              {{ formatTanggal(kegiatan?.tanggalMulai) }} -
              {{ formatTanggal(kegiatan?.tanggalSelesai) }}
            </span>
            <span class="flex items-center gap-1">
              <Icon name="heroicons:document-text" class="w-4 h-4" />
              Status:
              <span :class="statusBadgeClass(kegiatan?.statusKegiatan)">{{
                formatStatusKegiatan(kegiatan?.statusKegiatan)
              }}</span>
            </span>
          </div>
        </div>

        <!-- TAB NAVIGATION -->
        <div class="flex border-b border-slate-200 mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="px-5 py-2.5 text-sm font-medium transition-all duration-200 border-b-2"
            :class="
              activeTab === tab.key
                ? 'border-[#3b5988] text-[#3b5988]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            "
          >
            <Icon :name="tab.icon" class="w-4 h-4 inline mr-1" />
            {{ tab.label }}
          </button>
        </div>

        <!-- ========== TAB DOKUMENTASI KEGIATAN ========== -->
        <div
          v-if="activeTab === 'dokumentasi'"
          class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8"
        >
          <h3
            class="text-md font-semibold text-slate-900 mb-4 flex items-center gap-2"
          >
            <Icon name="heroicons:camera" class="w-5 h-5 text-[#d1a82a]" />
            Dokumentasi Kegiatan
          </h3>
          <form @submit.prevent="submitDokumentasi" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Deskripsi <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="dokumentasiForm.deskripsi"
                rows="2"
                class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-[#3b5988] outline-none"
                placeholder="Contoh: Dokumentasi pembukaan kegiatan, sesi penyelenggaraan, penutupan, dll."
                required
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                File Dokumentasi <span class="text-red-500">*</span>
              </label>
              <input
                type="file"
                @change="handleDokumentasiFileChange"
                accept="image/*,application/pdf"
                class="w-full border border-slate-200 rounded-xl p-2"
                required
              />
              <p class="text-xs text-slate-500 mt-1">
                Foto atau PDF, maks 10MB
              </p>
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="dokumentasiUploading"
                class="px-6 py-2 rounded-xl bg-[#3b5988] text-white font-medium hover:bg-[#2d4570] transition disabled:opacity-50"
              >
                <Icon
                  v-if="dokumentasiUploading"
                  name="heroicons:arrow-path"
                  class="w-4 h-4 animate-spin inline mr-1"
                />
                {{
                  dokumentasiUploading ? "Mengupload..." : "Upload Dokumentasi"
                }}
              </button>
            </div>
          </form>
        </div>

        <!-- ========== TAB UPLOAD BARANG ========== -->
        <div
          v-if="activeTab === 'barang'"
          class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8"
        >
          <h3
            class="text-md font-semibold text-slate-900 mb-4 flex items-center gap-2"
          >
            <Icon
              name="heroicons:shopping-bag"
              class="w-5 h-5 text-[#d1a82a]"
            />
            Upload Barang (Foto Barang + Struk)
          </h3>
          <form @submit.prevent="submitBarang" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Nama Toko <span class="text-red-500">*</span></label
              >
              <input
                v-model="barangForm.namaToko"
                type="text"
                class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-[#3b5988] outline-none"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Nomor Rekening Toko <span class="text-red-500">*</span></label
              >
              <input
                v-model="barangForm.nomorRekeningToko"
                type="text"
                class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-[#3b5988] outline-none"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Nama Pemilik Rekening
                <span class="text-red-500">*</span></label
              >
              <input
                v-model="barangForm.namaPemilikRekening"
                type="text"
                class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-[#3b5988] outline-none"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Foto Barang <span class="text-red-500">*</span></label
              >
              <input
                type="file"
                @change="handleBarangFotoChange"
                accept="image/*,application/pdf"
                class="w-full border border-slate-200 rounded-xl p-2"
                required
              />
              <p class="text-xs text-slate-500 mt-1">Foto barang yang dibeli</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Foto Struk Belanja <span class="text-red-500">*</span></label
              >
              <input
                type="file"
                @change="handleBarangStrukChange"
                accept="image/*,application/pdf"
                class="w-full border border-slate-200 rounded-xl p-2"
                required
              />
              <p class="text-xs text-slate-500 mt-1">
                Foto atau scan struk belanja
              </p>
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="barangUploading"
                class="px-6 py-2 rounded-xl bg-[#3b5988] text-white font-medium hover:bg-[#2d4570] transition disabled:opacity-50"
              >
                <Icon
                  v-if="barangUploading"
                  name="heroicons:arrow-path"
                  class="w-4 h-4 animate-spin inline mr-1"
                />
                {{ barangUploading ? "Mengupload..." : "Upload Barang" }}
              </button>
            </div>
          </form>
        </div>

        <!-- ========== TAB UPLOAD JASA ========== -->
        <div
          v-if="activeTab === 'jasa'"
          class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8"
        >
          <h3
            class="text-md font-semibold text-slate-900 mb-4 flex items-center gap-2"
          >
            <Icon name="heroicons:user-group" class="w-5 h-5 text-[#d1a82a]" />
            Upload Jasa (Penyedia Jasa)
          </h3>
          <form @submit.prevent="submitJasa" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Nama Penyedia Jasa <span class="text-red-500">*</span></label
              >
              <input
                v-model="jasaForm.namaPenyedia"
                type="text"
                class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-[#3b5988] outline-none"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Nomor Rekening <span class="text-red-500">*</span></label
              >
              <input
                v-model="jasaForm.nomorRekening"
                type="text"
                class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-[#3b5988] outline-none"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Nama Pemilik Rekening
                <span class="text-red-500">*</span></label
              >
              <input
                v-model="jasaForm.namaPemilikRekening"
                type="text"
                class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-[#3b5988] outline-none"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Upload SK <span class="text-red-500">*</span></label
              >
              <input
                type="file"
                @change="handleJasaSKChange"
                accept="image/*,application/pdf"
                class="w-full border border-slate-200 rounded-xl p-2"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Upload SPMT <span class="text-red-500">*</span></label
              >
              <input
                type="file"
                @change="handleJasaSPMTChange"
                accept="image/*,application/pdf"
                class="w-full border border-slate-200 rounded-xl p-2"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Upload Amprah <span class="text-red-500">*</span></label
              >
              <input
                type="file"
                @change="handleJasaAmprahChange"
                accept="image/*,application/pdf"
                class="w-full border border-slate-200 rounded-xl p-2"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Upload NPWP (jika PNS)
                <span class="text-red-500">*</span></label
              >
              <input
                type="file"
                @change="handleJasaNPWPChange"
                accept="image/*,application/pdf"
                class="w-full border border-slate-200 rounded-xl p-2"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Upload KTP <span class="text-red-500">*</span></label
              >
              <input
                type="file"
                @change="handleJasaKTPChange"
                accept="image/*,application/pdf"
                class="w-full border border-slate-200 rounded-xl p-2"
                required
              />
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="jasaUploading"
                class="px-6 py-2 rounded-xl bg-[#3b5988] text-white font-medium hover:bg-[#2d4570] transition disabled:opacity-50"
              >
                <Icon
                  v-if="jasaUploading"
                  name="heroicons:arrow-path"
                  class="w-4 h-4 animate-spin inline mr-1"
                />
                {{ jasaUploading ? "Mengupload..." : "Upload Jasa" }}
              </button>
            </div>
          </form>
        </div>

        <!-- ========== RIWAYAT UPLOAD (GABUNGAN) ========== -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3
              class="text-md font-semibold text-slate-900 flex items-center gap-2"
            >
              <Icon
                name="heroicons:folder-open"
                class="w-5 h-5 text-[#d1a82a]"
              />
              Riwayat Upload
              <span
                class="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded-full"
                >{{ allUploads.length }}</span
              >
            </h3>
            <button
              @click="refreshData"
              class="text-sm text-[#3b5988] hover:underline"
            >
              Refresh
            </button>
          </div>

          <div
            v-if="allUploads.length === 0"
            class="text-center py-8 text-slate-500"
          >
            <Icon
              name="heroicons:document"
              class="w-12 h-12 mx-auto mb-2 text-slate-300"
            />
            <p>Belum ada upload apapun.</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="item in allUploads"
              :key="item.id"
              class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-start justify-between gap-3"
            >
              <div class="flex-1">
                <div class="flex items-center flex-wrap gap-2 mb-1">
                  <span
                    class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="{
                      'bg-blue-100 text-blue-700': item.jenis === 'dokumentasi',
                      'bg-green-100 text-green-700': item.jenis === 'barang',
                      'bg-purple-100 text-purple-700': item.jenis === 'jasa',
                    }"
                  >
                    {{ item.jenisLabel }}
                  </span>
                  <span class="text-xs text-slate-500">{{
                    formatDate(item.createdAt)
                  }}</span>
                </div>
                <!-- Deskripsi umum -->
                <p class="text-sm text-slate-600">
                  <span class="font-medium">Deskripsi:</span>
                  {{ item.deskripsi || "-" }}
                </p>
                <!-- Info Barang -->
                <template v-if="item.jenis === 'barang'">
                  <p class="text-sm text-slate-600">
                    <span class="font-medium">Toko:</span> {{ item.namaToko }}
                  </p>
                  <p class="text-sm text-slate-600">
                    <span class="font-medium">Rekening:</span>
                    {{ item.nomorRekeningToko }} a.n.
                    {{ item.namaPemilikRekening }}
                  </p>
                  <div class="flex gap-3 mt-1">
                    <a
                      :href="item.fotoBarangUrl"
                      target="_blank"
                      class="text-xs text-[#3b5988] hover:underline flex items-center gap-1"
                    >
                      <Icon name="heroicons:photo" class="w-3 h-3" /> Lihat Foto
                      Barang
                    </a>
                    <a
                      :href="item.fotoStrukUrl"
                      target="_blank"
                      class="text-xs text-[#3b5988] hover:underline flex items-center gap-1"
                    >
                      <Icon name="heroicons:receipt-percent" class="w-3 h-3" />
                      Lihat Struk
                    </a>
                  </div>
                </template>
                <!-- Info Jasa -->
                <template v-if="item.jenis === 'jasa'">
                  <p class="text-sm text-slate-600">
                    <span class="font-medium">Penyedia:</span>
                    {{ item.namaPenyedia }}
                  </p>
                  <p class="text-sm text-slate-600">
                    <span class="font-medium">Rekening:</span>
                    {{ item.nomorRekening }} a.n. {{ item.namaPemilikRekening }}
                  </p>
                  <div class="flex flex-wrap gap-3 mt-1">
                    <a
                      v-if="item.skUrl"
                      :href="item.skUrl"
                      target="_blank"
                      class="text-xs text-[#3b5988] hover:underline flex items-center gap-1"
                      >SK</a
                    >
                    <a
                      v-if="item.spmtUrl"
                      :href="item.spmtUrl"
                      target="_blank"
                      class="text-xs text-[#3b5988] hover:underline flex items-center gap-1"
                      >SPMT</a
                    >
                    <a
                      v-if="item.amprahUrl"
                      :href="item.amprahUrl"
                      target="_blank"
                      class="text-xs text-[#3b5988] hover:underline flex items-center gap-1"
                      >Amprah</a
                    >
                    <a
                      v-if="item.npwpUrl"
                      :href="item.npwpUrl"
                      target="_blank"
                      class="text-xs text-[#3b5988] hover:underline flex items-center gap-1"
                      >NPWP</a
                    >
                    <a
                      v-if="item.ktpUrl"
                      :href="item.ktpUrl"
                      target="_blank"
                      class="text-xs text-[#3b5988] hover:underline flex items-center gap-1"
                      >KTP</a
                    >
                  </div>
                </template>
                <!-- Untuk dokumentasi biasa -->
                <a
                  v-if="item.jenis === 'dokumentasi' && item.fileUrl"
                  :href="item.fileUrl"
                  target="_blank"
                  class="text-xs text-[#3b5988] hover:underline flex items-center gap-1 mt-1"
                >
                  <Icon name="heroicons:eye" class="w-3 h-3" /> Lihat File
                </a>
              </div>
              <button
                @click="deleteUpload(item)"
                class="text-red-500 hover:text-red-700 p-1 transition"
                title="Hapus"
              >
                <Icon name="heroicons:trash" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";

  const route = useRoute();
  const router = useRouter();

  const kegiatanId = computed(() => {
    const id = route.params.id;
    return id ? parseInt(id as string) : null;
  });

  const loading = ref(false);
  const kegiatan = ref<any>(null);

  const activeTab = ref("dokumentasi");
  const tabs = [
    {
      key: "dokumentasi",
      label: "Dokumentasi Kegiatan",
      icon: "heroicons:camera",
    },
    { key: "barang", label: "Upload Barang", icon: "heroicons:shopping-bag" },
    { key: "jasa", label: "Upload Jasa", icon: "heroicons:user-group" },
  ];

  // Data list
  const dokumentasiList = ref<any[]>([]);
  const barangList = ref<any[]>([]);
  const jasaList = ref<any[]>([]);

  const allUploads = computed(() => {
    const docs = dokumentasiList.value.map((d) => ({
      ...d,
      jenis: "dokumentasi",
      jenisLabel: "Dokumentasi Kegiatan",
    }));
    const bars = barangList.value.map((b) => ({
      ...b,
      jenis: "barang",
      jenisLabel: "Barang",
    }));
    const jas = jasaList.value.map((j) => ({
      ...j,
      jenis: "jasa",
      jenisLabel: "Jasa",
    }));
    return [...docs, ...bars, ...jas].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  });

  // Form Dokumentasi
  const dokumentasiForm = ref({ deskripsi: "", file: null as File | null });
  const dokumentasiUploading = ref(false);

  // Form Barang (dua file)
  const barangForm = ref({
    namaToko: "",
    nomorRekeningToko: "",
    namaPemilikRekening: "",
    fotoBarang: null as File | null,
    fotoStruk: null as File | null,
  });
  const barangUploading = ref(false);

  // Form Jasa (banyak file)
  const jasaForm = ref({
    namaPenyedia: "",
    nomorRekening: "",
    namaPemilikRekening: "",
    sk: null as File | null,
    spmt: null as File | null,
    amprah: null as File | null,
    npwp: null as File | null,
    ktp: null as File | null,
  });
  const jasaUploading = ref(false);

  // Helper functions
  const formatTanggal = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatStatusKegiatan = (status: string) => {
    const map: Record<string, string> = {
      belum_mulai: "Belum Mulai",
      berlangsung: "Sedang Berlangsung",
      selesai: "Selesai",
    };
    return map[status] || status;
  };
  const statusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      belum_mulai: "bg-slate-100 text-slate-700",
      berlangsung: "bg-blue-100 text-blue-700",
      selesai: "bg-emerald-100 text-emerald-700",
    };
    return `ml-1 px-2 py-0.5 rounded-full text-xs ${classes[status] || "bg-slate-100"}`;
  };

  // Fetch data

  const refreshData = () => null;

  // Dokumentasi
  const handleDokumentasiFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      if (target.files[0].size > 10 * 1024 * 1024) {
        alert("Maks 10MB");
        target.value = "";
        return;
      }
      dokumentasiForm.value.file = target.files[0];
    }
  };
  const submitDokumentasi = async () => {
    if (!dokumentasiForm.value.deskripsi || !dokumentasiForm.value.file)
      return alert("Lengkapi deskripsi dan file");
    dokumentasiUploading.value = true;
    const fd = new FormData();
    fd.append("kegiatanId", String(kegiatanId.value));
    fd.append("deskripsi", dokumentasiForm.value.deskripsi);
    fd.append("file", dokumentasiForm.value.file);
    try {
      await $fetch("/api/dokumentasi", { method: "POST", body: fd });
      await fetchData();
      dokumentasiForm.value = { deskripsi: "", file: null };
    } catch (err) {
      alert("Gagal upload");
    } finally {
      dokumentasiUploading.value = false;
    }
  };

  // Barang
  const handleBarangFotoChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      if (target.files[0].size > 10 * 1024 * 1024) {
        alert("Maks 10MB");
        target.value = "";
        return;
      }
      barangForm.value.fotoBarang = target.files[0];
    }
  };
  const handleBarangStrukChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      if (target.files[0].size > 10 * 1024 * 1024) {
        alert("Maks 10MB");
        target.value = "";
        return;
      }
      barangForm.value.fotoStruk = target.files[0];
    }
  };
  const submitBarang = async () => {
    if (
      !barangForm.value.namaToko ||
      !barangForm.value.nomorRekeningToko ||
      !barangForm.value.namaPemilikRekening ||
      !barangForm.value.fotoBarang ||
      !barangForm.value.fotoStruk
    ) {
      return alert("Semua field dan file wajib diisi");
    }
    barangUploading.value = true;
    const fd = new FormData();
    fd.append("kegiatanId", String(kegiatanId.value));
    fd.append("namaToko", barangForm.value.namaToko);
    fd.append("nomorRekeningToko", barangForm.value.nomorRekeningToko);
    fd.append("namaPemilikRekening", barangForm.value.namaPemilikRekening);
    fd.append("fotoBarang", barangForm.value.fotoBarang);
    fd.append("fotoStruk", barangForm.value.fotoStruk);
    try {
      await $fetch("/api/barang", { method: "POST", body: fd });
      await fetchData();
      barangForm.value = {
        namaToko: "",
        nomorRekeningToko: "",
        namaPemilikRekening: "",
        fotoBarang: null,
        fotoStruk: null,
      };
    } catch (err) {
      alert("Gagal upload barang");
    } finally {
      barangUploading.value = false;
    }
  };

  // Jasa
  const handleJasaSKChange = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t.files?.[0]) jasaForm.value.sk = t.files[0];
  };
  const handleJasaSPMTChange = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t.files?.[0]) jasaForm.value.spmt = t.files[0];
  };
  const handleJasaAmprahChange = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t.files?.[0]) jasaForm.value.amprah = t.files[0];
  };
  const handleJasaNPWPChange = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t.files?.[0]) jasaForm.value.npwp = t.files[0];
  };
  const handleJasaKTPChange = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t.files?.[0]) jasaForm.value.ktp = t.files[0];
  };
  const submitJasa = async () => {
    if (
      !jasaForm.value.namaPenyedia ||
      !jasaForm.value.nomorRekening ||
      !jasaForm.value.namaPemilikRekening ||
      !jasaForm.value.sk ||
      !jasaForm.value.spmt ||
      !jasaForm.value.amprah ||
      !jasaForm.value.npwp ||
      !jasaForm.value.ktp
    ) {
      return alert(
        "Semua field dan file (SK, SPMT, Amprah, NPWP, KTP) wajib diisi",
      );
    }
    jasaUploading.value = true;
    const fd = new FormData();
    fd.append("kegiatanId", String(kegiatanId.value));
    fd.append("namaPenyedia", jasaForm.value.namaPenyedia);
    fd.append("nomorRekening", jasaForm.value.nomorRekening);
    fd.append("namaPemilikRekening", jasaForm.value.namaPemilikRekening);
    fd.append("sk", jasaForm.value.sk);
    fd.append("spmt", jasaForm.value.spmt);
    fd.append("amprah", jasaForm.value.amprah);
    fd.append("npwp", jasaForm.value.npwp);
    fd.append("ktp", jasaForm.value.ktp);
    try {
      await $fetch("/api/jasa", { method: "POST", body: fd });
      await fetchData();
      jasaForm.value = {
        namaPenyedia: "",
        nomorRekening: "",
        namaPemilikRekening: "",
        sk: null,
        spmt: null,
        amprah: null,
        npwp: null,
        ktp: null,
      };
    } catch (err) {
      alert("Gagal upload jasa");
    } finally {
      jasaUploading.value = false;
    }
  };

  // Hapus
  const deleteUpload = async (item: any) => {
    if (!confirm(`Hapus ${item.jenisLabel} ini?`)) return;
    try {
      if (item.jenis === "dokumentasi")
        await $fetch(`/api/dokumentasi/${item.id}`, { method: "DELETE" });
      else if (item.jenis === "barang")
        await $fetch(`/api/barang/${item.id}`, { method: "DELETE" });
      else if (item.jenis === "jasa")
        await $fetch(`/api/jasa/${item.id}`, { method: "DELETE" });
      await fetchData();
    } catch (err) {
      alert("Gagal hapus");
    }
  };

  const goBack = () => router.back();

  onMounted(() => {});
</script>
