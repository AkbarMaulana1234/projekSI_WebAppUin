<!-- pages/dashboard/ormawa/lpg/[id].vue -->
<template>
  <div class="p-6 max-w-5xl mx-auto min-h-screen pb-12">
    <!-- Header -->
    <div
      class="flex items-center justify-between mb-6 border-b border-gray-200 pb-4"
    >
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/dashboard/ormawa/lpg"
          class="p-2 text-gray-500 hover:text-gray-700 rounded-md"
        >
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div>
          <h1 class="text-xl font-bold text-gray-900">
            Laporan Pertanggungjawaban
          </h1>
          <p class="text-sm text-gray-500">Upload dan kelola LPG kegiatan</p>
        </div>
      </div>
      <div v-if="uploadLpjStore.lpg">
        <span
          :class="getStatusBadgeClass(uploadLpjStore.lpg.statusLpg)"
          class="inline-flex px-3 py-1 text-xs font-medium rounded-full"
        >
          {{ getStatusLabel(uploadLpjStore.lpg.statusLpg) }}
        </span>
      </div>
    </div>
    <!-- Loading -->
    <div
      v-if="rabStore.loading || uploadLpjStore.fetching"
      class="flex justify-center py-20"
    >
      <Icon
        name="heroicons:arrow-path"
        class="w-8 h-8 animate-spin text-blue-600"
      />
    </div>

    <div
      v-else-if="rabStore.detail"
      class="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <!-- Main area -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Informasi Kegiatan -->
        <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h2 class="text-base font-semibold text-gray-900 mb-3">
            {{ rabStore.detail.judulKegiatan }}
          </h2>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Nomor Pengajuan</span>
              <p class="font-medium">{{ rabStore.detail.nomorPengajuan }}</p>
            </div>
            <div>
              <span class="text-gray-500">Total Anggaran</span>
              <p class="font-medium text-green-600">
                {{ formatRupiah(rabStore.detail.totalAnggaran) }}
              </p>
            </div>
            <div>
              <span class="text-gray-500">Tanggal Mulai</span>
              <p>{{ formatDate(rabStore.detail.tanggalMulai) }}</p>
            </div>
            <div>
              <span class="text-gray-500">Tanggal Selesai</span>
              <p>{{ formatDate(rabStore.detail.tanggalSelesai) }}</p>
            </div>
          </div>
        </div>

        <!-- Form Upload (jika belum ada LPG atau status revisi) -->
        <div
          v-if="
            !uploadLpjStore.lpg || uploadLpjStore.lpg.statusLpg === 'REVISI_SPI'
          "
          class="bg-white border border-gray-200 rounded-lg p-6"
        >
          <h3 class="text-md font-semibold text-gray-900 mb-4">
            Upload File LPG
          </h3>
          <div class="space-y-4">
            <!-- Dropzone -->
            <div
              @dragover.prevent="dragover = true"
              @dragleave.prevent="dragover = false"
              @drop.prevent="onDrop"
              @click="$refs.fileInput.click()"
              :class="[
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition',
                dragover
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400',
                fileLpj ? 'bg-green-50 border-green-400' : '',
              ]"
            >
              <input
                type="file"
                ref="fileInput"
                class="hidden"
                accept=".pdf"
                @change="onFileChange"
              />
              <div v-if="!fileLpj">
                <Icon
                  name="heroicons:cloud-arrow-up"
                  class="w-10 h-10 text-gray-400 mx-auto mb-2"
                />
                <p class="text-sm text-gray-600">
                  Klik atau seret file PDF ke sini
                </p>
                <p class="text-xs text-gray-400 mt-1">Maksimal 10MB</p>
              </div>
              <div v-else class="flex items-center justify-center gap-3">
                <Icon
                  name="heroicons:document-text"
                  class="w-8 h-8 text-green-600"
                />
                <span class="text-sm font-medium">{{ fileLpj.name }}</span>
                <button
                  @click.stop="fileLpj = null"
                  class="text-red-500 text-xs"
                >
                  Hapus
                </button>
              </div>
            </div>

            <!-- Catatan -->

            <button
              @click="handleUpload"
              :disabled="uploadLpjStore.loading || !fileLpj"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition disabled:opacity-50"
            >
              <Icon
                v-if="uploadLpjStore.loading"
                name="heroicons:arrow-path"
                class="w-4 h-4 animate-spin inline mr-2"
              />
              {{ uploadLpjStore.lpg ? "Update LPG" : "Kirim LPG" }}
            </button>
          </div>
        </div>

        <!-- Status jika sudah dikirim -->
        <div
          v-else-if="uploadLpjStore.lpg"
          class="bg-gray-50 border border-gray-200 rounded-lg p-5"
        >
          <div class="flex items-center gap-3 mb-3">
            <Icon
              name="heroicons:document-check"
              class="w-6 h-6 text-green-600"
            />
            <h3 class="text-md font-semibold text-gray-900">
              Laporan Terkirim
            </h3>
          </div>
          <div class="text-sm text-gray-600 space-y-2">
            <p>
              <span class="font-medium">Dikirim:</span>
              {{ formatDate(uploadLpjStore.lpg.submittedAt) }}
            </p>
            <p>
              <span class="font-medium">File:</span>
              <a
                :href="`detail/${rabId}`"
                target="_blank"
                class="text-blue-600 hover:underline"
                >Lihat LPG</a
              >
            </p>
            <p v-if="uploadLpjStore.lpg.ormawaNotes">
              <span class="font-medium">Catatan:</span>
              {{ uploadLpjStore.lpg.ormawaNotes }}
            </p>
          </div>
        </div>

        <!-- Riwayat Catatan SPI -->
        <div
          v-if="uploadLpjStore.logs.length > 0"
          class="bg-white border border-gray-200 rounded-lg p-5"
        >
          <h3
            class="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2"
          >
            <Icon name="heroicons:chat-bubble-left-right" class="w-5 h-5" />
            Riwayat Review SPI
          </h3>
          <div class="space-y-3">
            <div
              v-for="log in uploadLpjStore.logs"
              :key="log.id"
              class="border-l-2 border-gray-200 pl-3 py-1"
            >
              <div class="flex justify-between text-xs text-gray-500">
                <span class="font-medium">{{
                  log.actor?.fullName || "SPI"
                }}</span>
                <span>{{ formatDate(log.createdAt) }}</span>
              </div>
              <p class="text-sm text-gray-700">{{ log.catatanRevisi }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-5">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h4 class="text-sm font-semibold text-blue-800 mb-2">Informasi</h4>
          <p class="text-xs text-blue-700">
            Pastikan file LPG berisi seluruh bukti pertanggungjawaban sesuai
            ketentuan SPI.
          </p>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg p-5">
          <h4 class="text-sm font-semibold text-gray-900 mb-2">Panduan</h4>
          <ul class="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Gabungkan semua dokumen jadi satu PDF</li>
            <li>Maksimal ukuran 10MB</li>
            <li>Hanya file PDF yang diterima</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUploadLpjStore } from "~/stores/ormawa/uploadLpj";
  import { useRabStore } from "~/stores/ormawa/DetailRab";

  const route = useRoute();
  const router = useRouter();
  const uploadLpjStore = useUploadLpjStore();
  const rabStore = useRabStore();

  const rabId = Number(route.params.id);
  const fileLpj = ref<File | null>(null);
  const ormawaNotes = ref("");
  const dragover = ref(false);

  onMounted(async () => {
    await Promise.all([
      rabStore.fetchFullRabData(rabId),
      uploadLpjStore.fetchLpgDetail(rabId),
    ]);
    if (uploadLpjStore.lpg?.ormawaNotes) {
      ormawaNotes.value = uploadLpjStore.lpg.ormawaNotes;
    }
  });

  const onFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      if (file.type !== "application/pdf") {
        alert("File harus berformat PDF");
        return;
      }
      fileLpj.value = file;
    }
  };

  const onDrop = (e: DragEvent) => {
    dragover.value = false;
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf") {
        alert("File harus berformat PDF");
        return;
      }
      fileLpj.value = file;
    }
  };

  const handleUpload = async () => {
    if (!fileLpj.value) {
      alert("Pilih file LPG terlebih dahulu");
      return;
    }
    try {
      await uploadLpjStore.uploadLpj(rabId, fileLpj.value, ormawaNotes.value);
      alert("LPG berhasil diupload!");
      fileLpj.value = null;
      await uploadLpjStore.fetchLpgDetail(rabId);
    } catch (error: any) {
      alert(error.message || "Gagal mengupload LPG");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const formatRupiah = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "WAITING_SPI":
        return "bg-blue-100 text-blue-700";
      case "DISETUJUI":
        return "bg-green-100 text-green-700";
      case "REVISI_SPI":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "WAITING_SPI":
        return "Menunggu SPI";
      case "DISETUJUI":
        return "Disetujui";
      case "REVISI_SPI":
        return "Revisi";
      default:
        return "Belum";
    }
  };
</script>
