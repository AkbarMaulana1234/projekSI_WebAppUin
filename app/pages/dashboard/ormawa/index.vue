<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard Ormawa
        </h1>
        <div class="mt-2 flex items-center justify-between">
          <p class="text-gray-600">
            Selamat datang,
            <span class="font-semibold">{{ user?.fullName }}</span> ({{
              user?.role
            }})
          </p>
          <button
            @click="logout"
            class="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <!-- Ringkasan statistik (mock) -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg bg-white p-4 shadow">
          <p class="text-sm text-gray-500">Total Pengajuan</p>
          <p class="text-2xl font-bold">{{ stats.totalPengajuan }}</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow">
          <p class="text-sm text-gray-500">Disetujui SPI</p>
          <p class="text-2xl font-bold">{{ stats.disetujui }}</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow">
          <p class="text-sm text-gray-500">Pencairan Selesai</p>
          <p class="text-2xl font-bold">{{ stats.pencairanSelesai }}</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow">
          <p class="text-sm text-gray-500">LPG Tersimpan</p>
          <p class="text-2xl font-bold">{{ stats.lpgTersimpan }}</p>
        </div>
      </div>

      <!-- Tombol buat pengajuan baru -->
      <div class="mt-8 flex justify-end">
        <button
          @click="openNewRabModal"
          class="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          + Pengajuan RAB Baru
        </button>
      </div>

      <!-- Tabel daftar RAB -->
      <div class="mt-6 overflow-x-auto rounded-lg bg-white shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                No. Pengajuan
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Judul Kegiatan
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Total Anggaran
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="rab in rabList" :key="rab.id">
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {{ rab.nomorPengajuan }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ rab.judulKegiatan }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                Rp {{ formatNumber(rab.totalAnggaran) }}
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span
                  :class="statusBadgeClass(rab.statusRab)"
                  class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
                >
                  {{ formatStatus(rab.statusRab) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm">
                <button
                  @click="viewDetail(rab)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Detail
                </button>
                <button
                  v-if="rab.statusRab === 'DISETUJUI'"
                  @click="openDokumentasiModal(rab)"
                  class="ml-3 text-green-600 hover:text-green-900"
                >
                  Upload Dok
                </button>
                <button
                  v-if="rab.statusRab === 'DISETUJUI' && rab.kegiatanSelesai"
                  @click="openTagihanModal(rab)"
                  class="ml-3 text-blue-600 hover:text-blue-900"
                >
                  Tagihan
                </button>
                <button
                  v-if="
                    rab.statusRab === 'DISETUJUI' && rab.semuaPencairanSelesai
                  "
                  @click="openLpgModal(rab)"
                  class="ml-3 text-purple-600 hover:text-purple-900"
                >
                  Upload LPG
                </button>
                <button
                  @click="viewApprovalLog(rab)"
                  class="ml-3 text-gray-600 hover:text-gray-900"
                >
                  Log
                </button>
              </td>
            </tr>
            <tr v-if="rabList.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                Belum ada pengajuan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal Buat RAB -->
    <div
      v-if="showNewRabModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/90"
    >
      <div class="w-full max-w-2xl rounded-lg bg-white p-6">
        <h2 class="text-xl font-bold">Pengajuan RAB Baru</h2>
        <form @submit.prevent="submitNewRab" class="mt-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Judul Kegiatan</label
            >
            <input
              v-model="newRab.judulKegiatan"
              type="text"
              required
              class="mt-1 w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Deskripsi</label
            >
            <textarea
              v-model="newRab.deskripsi"
              rows="3"
              class="mt-1 w-full rounded-md border p-2"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Total Anggaran (Rp)</label
            >
            <input
              v-model.number="newRab.totalAnggaran"
              type="number"
              required
              class="mt-1 w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >File RAB (PDF/Excel)</label
            >
            <input
              type="file"
              @change="handleRabFile"
              accept=".pdf,.xlsx,.xls"
              required
              class="mt-1 w-full"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="closeNewRabModal"
              class="rounded-md bg-gray-300 px-4 py-2"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="rounded-md bg-indigo-600 px-4 py-2 text-white"
            >
              {{ submitting ? "Mengirim..." : "Ajukan" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Upload Dokumentasi Kegiatan -->
    <div
      v-if="showDokumentasiModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-6">
        <h2 class="text-xl font-bold">Upload Dokumentasi Kegiatan</h2>
        <p class="text-sm text-gray-500">
          Kegiatan: {{ selectedRab?.judulKegiatan }}
        </p>
        <form @submit.prevent="submitDokumentasi" class="mt-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Tipe Dokumen</label
            >
            <select
              v-model="dokumen.tipe"
              required
              class="mt-1 w-full rounded-md border p-2"
            >
              <option value="foto_kegiatan">Foto Kegiatan</option>
              <option value="daftar_hadir">Daftar Hadir</option>
              <option value="materi">Materi</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Deskripsi</label
            >
            <input
              v-model="dokumen.deskripsi"
              class="mt-1 w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">File</label>
            <input
              type="file"
              @change="handleDokumenFile"
              required
              class="mt-1 w-full"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="closeDokumentasiModal"
              class="rounded-md bg-gray-300 px-4 py-2"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submittingDok"
              class="rounded-md bg-green-600 px-4 py-2 text-white"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Upload Tagihan Pencairan -->
    <div
      v-if="showTagihanModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="w-full max-w-lg rounded-lg bg-white p-6">
        <h2 class="text-xl font-bold">Upload Tagihan Pencairan</h2>
        <p class="text-sm text-gray-500">
          Kegiatan: {{ selectedRab?.judulKegiatan }}
        </p>
        <form @submit.prevent="submitTagihan" class="mt-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Tipe Tagihan</label
            >
            <select
              v-model="tagihan.tipe"
              required
              class="mt-1 w-full rounded-md border p-2"
            >
              <option value="jasa">Jasa (SK)</option>
              <option value="barang">Barang (Toko)</option>
            </select>
          </div>
          <div v-if="tagihan.tipe === 'jasa'">
            <div>
              <label>Nomor SK</label>
              <input
                v-model="tagihan.skNomor"
                class="w-full rounded-md border p-2"
              />
            </div>
            <div>
              <label>File SK</label>
              <input type="file" @change="handleSkFile" />
            </div>
            <div>
              <label>Nama Penerima (Jasa)</label>
              <input
                v-model="tagihan.namaPenerima"
                required
                class="w-full rounded-md border p-2"
              />
            </div>
            <div>
              <label>Rekening Penerima</label>
              <input
                v-model="tagihan.rekening"
                required
                class="w-full rounded-md border p-2"
              />
            </div>
            <div>
              <label>Bank</label>
              <input
                v-model="tagihan.bank"
                class="w-full rounded-md border p-2"
              />
            </div>
          </div>
          <div v-if="tagihan.tipe === 'barang'">
            <div>
              <label>Nama Toko</label>
              <input
                v-model="tagihan.tokoNama"
                required
                class="w-full rounded-md border p-2"
              />
            </div>
            <div>
              <label>Alamat Toko</label>
              <input
                v-model="tagihan.tokoAlamat"
                class="w-full rounded-md border p-2"
              />
            </div>
            <div>
              <label>File Struk</label>
              <input type="file" @change="handleStrukFile" required />
            </div>
          </div>
          <div>
            <label>Nominal (Rp)</label>
            <input
              v-model.number="tagihan.nominal"
              type="number"
              required
              class="w-full rounded-md border p-2"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="closeTagihanModal"
              class="rounded-md bg-gray-300 px-4 py-2"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submittingTagihan"
              class="rounded-md bg-blue-600 px-4 py-2 text-white"
            >
              Kirim Tagihan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Upload LPG -->
    <div
      v-if="showLpgModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-6">
        <h2 class="text-xl font-bold">
          Upload Laporan Pertanggungjawaban (LPG)
        </h2>
        <p class="text-sm text-gray-500">
          Kegiatan: {{ selectedRab?.judulKegiatan }}
        </p>
        <form @submit.prevent="submitLpg" class="mt-4 space-y-4">
          <div>
            <label>File LPG (PDF)</label>
            <input
              type="file"
              @change="handleLpgFile"
              required
              class="mt-1 w-full"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="closeLpgModal"
              class="rounded-md bg-gray-300 px-4 py-2"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="submittingLpg"
              class="rounded-md bg-purple-600 px-4 py-2 text-white"
            >
              Upload LPG
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Detail RAB + Approval Log -->
    <div
      v-if="showDetailModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="w-full max-w-2xl rounded-lg bg-white p-6">
        <h2 class="text-xl font-bold">Detail Pengajuan</h2>
        <div class="mt-4 space-y-2">
          <p><strong>Nomor:</strong> {{ detailRab?.nomorPengajuan }}</p>
          <p><strong>Judul:</strong> {{ detailRab?.judulKegiatan }}</p>
          <p><strong>Deskripsi:</strong> {{ detailRab?.deskripsi }}</p>
          <p>
            <strong>Total Anggaran:</strong> Rp
            {{ formatNumber(detailRab?.totalAnggaran) }}
          </p>
          <p>
            <strong>Status:</strong> {{ formatStatus(detailRab?.statusRab) }}
          </p>
          <p>
            <strong>File RAB:</strong>
            <a
              :href="detailRab?.fileRabUrl"
              target="_blank"
              class="text-indigo-600"
              >Lihat</a
            >
          </p>
        </div>
        <h3 class="mt-6 text-lg font-semibold">Riwayat Approval</h3>
        <div v-if="approvalLogs.length === 0" class="text-gray-500">
          Belum ada log.
        </div>
        <ul class="mt-2 space-y-2">
          <li
            v-for="log in approvalLogs"
            :key="log.id"
            class="rounded bg-gray-50 p-2 text-sm"
          >
            <span class="font-medium">{{ log.roleActor }}</span> -
            <span
              :class="
                log.action === 'setuju'
                  ? 'text-green-600'
                  : log.action === 'revisi'
                    ? 'text-yellow-600'
                    : 'text-red-600'
              "
            >
              {{ log.action }}
            </span>
            <span class="text-gray-500">
              pada {{ formatDate(log.createdAt) }}</span
            >
            <p v-if="log.catatanRevisi" class="mt-1 italic text-gray-600">
              Catatan: {{ log.catatanRevisi }}
            </p>
          </li>
        </ul>
        <div class="mt-6 flex justify-end">
          <button
            @click="closeDetailModal"
            class="rounded-md bg-gray-300 px-4 py-2"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";

  // --- Data user (dari session) ---
  const user = ref<any>(null);
  const router = useRouter();

  // --- Data dashboard ---
  const rabList = ref<any[]>([]);
  const stats = ref({
    totalPengajuan: 0,
    disetujui: 0,
    pencairanSelesai: 0,
    lpgTersimpan: 0,
  });

  // --- Modal states ---
  const showNewRabModal = ref(false);
  const showDokumentasiModal = ref(false);
  const showTagihanModal = ref(false);
  const showLpgModal = ref(false);
  const showDetailModal = ref(false);
  const selectedRab = ref<any>(null);
  const detailRab = ref<any>(null);
  const approvalLogs = ref<any[]>([]);

  // --- Form states ---
  const newRab = ref({
    judulKegiatan: "",
    deskripsi: "",
    totalAnggaran: 0,
    fileRab: null as File | null,
  });
  const submitting = ref(false);

  const dokumen = ref({
    tipe: "foto_kegiatan",
    deskripsi: "",
    file: null as File | null,
  });
  const submittingDok = ref(false);

  const tagihan = ref({
    tipe: "jasa",
    skNomor: "",
    skFile: null as File | null,
    namaPenerima: "",
    rekening: "",
    bank: "",
    tokoNama: "",
    tokoAlamat: "",
    strukFile: null as File | null,
    nominal: 0,
  });
  const submittingTagihan = ref(false);

  const lpgFile = ref<File | null>(null);
  const submittingLpg = ref(false);

  // --- Helper functions ---
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };
  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      DRAFT: "Draft",
      WAITING_KAPRODI: "Menunggu Kaprodi",
      REVISI_KAPRODI: "Revisi Kaprodi",
      WAITING_PPK: "Menunggu PPK",
      REVISI_PPK: "Revisi PPK",
      WAITING_SPI: "Menunggu SPI",
      DITOLAK_SPI: "Ditolak SPI",
      DISETUJUI: "Disetujui",
    };
    return map[status] || status;
  };
  const statusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      WAITING_KAPRODI: "bg-yellow-100 text-yellow-800",
      REVISI_KAPRODI: "bg-orange-100 text-orange-800",
      WAITING_PPK: "bg-yellow-100 text-yellow-800",
      REVISI_PPK: "bg-orange-100 text-orange-800",
      WAITING_SPI: "bg-yellow-100 text-yellow-800",
      DITOLAK_SPI: "bg-red-100 text-red-800",
      DISETUJUI: "bg-green-100 text-green-800",
    };
    return classes[status] || "bg-gray-100 text-gray-800";
  };
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("id-ID");
  };

  // --- API calls (mock, ganti dengan endpoint nyata) ---
  const fetchUser = async () => {
    // Ganti dengan endpoint session
    const { data } = await useFetch("/api/auth/me");
    user.value = data.value;
  };
  const fetchRabList = async () => {
    const { data } = await useFetch("/api/ormawa/rab-list");
    rabList.value = data.value || [];
    // Hitung stat sederhana
    stats.value.totalPengajuan = rabList.value.length;
    stats.value.disetujui = rabList.value.filter(
      (r) => r.statusRab === "DISETUJUI",
    ).length;
    // Untuk pencairan & lpg butuh data tambahan, mock dulu
  };
  const logout = async () => {
    await useFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // --- RAB baru ---
  const openNewRabModal = () => {
    newRab.value = {
      judulKegiatan: "",
      deskripsi: "",
      totalAnggaran: 0,
      fileRab: null,
    };
    showNewRabModal.value = true;
  };
  const closeNewRabModal = () => {
    showNewRabModal.value = false;
  };
  const handleRabFile = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) newRab.value.fileRab = target.files[0];
  };
  const submitNewRab = async () => {
    submitting.value = true;
    try {
      const formData = new FormData();
      formData.append("judulKegiatan", newRab.value.judulKegiatan);
      formData.append("deskripsi", newRab.value.deskripsi);
      formData.append("totalAnggaran", String(newRab.value.totalAnggaran));
      if (newRab.value.fileRab)
        formData.append("fileRab", newRab.value.fileRab);
      await $fetch("/api/ormawa/rab", { method: "POST", body: formData });
      await fetchRabList();
      closeNewRabModal();
    } catch (err) {
      console.error(err);
      alert("Gagal mengajukan RAB");
    } finally {
      submitting.value = false;
    }
  };

  // --- Dokumentasi ---
  const openDokumentasiModal = (rab: any) => {
    selectedRab.value = rab;
    dokumen.value = { tipe: "foto_kegiatan", deskripsi: "", file: null };
    showDokumentasiModal.value = true;
  };
  const closeDokumentasiModal = () => {
    showDokumentasiModal.value = false;
  };
  const handleDokumenFile = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) dokumen.value.file = target.files[0];
  };
  const submitDokumentasi = async () => {
    submittingDok.value = true;
    try {
      const formData = new FormData();
      formData.append(
        "kegiatanId",
        selectedRab.value.kegiatanId || selectedRab.value.id,
      ); // sesuaikan
      formData.append("tipe", dokumen.value.tipe);
      formData.append("deskripsi", dokumen.value.deskripsi);
      if (dokumen.value.file) formData.append("file", dokumen.value.file);
      await $fetch("/api/ormawa/dokumentasi", {
        method: "POST",
        body: formData,
      });
      closeDokumentasiModal();
      alert("Upload berhasil");
    } catch (err) {
      alert("Gagal upload dokumentasi");
    } finally {
      submittingDok.value = false;
    }
  };

  // --- Tagihan ---
  const openTagihanModal = (rab: any) => {
    selectedRab.value = rab;
    tagihan.value = {
      tipe: "jasa",
      skNomor: "",
      skFile: null,
      namaPenerima: "",
      rekening: "",
      bank: "",
      tokoNama: "",
      tokoAlamat: "",
      strukFile: null,
      nominal: 0,
    };
    showTagihanModal.value = true;
  };
  const closeTagihanModal = () => {
    showTagihanModal.value = false;
  };
  const handleSkFile = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) tagihan.value.skFile = target.files[0];
  };
  const handleStrukFile = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) tagihan.value.strukFile = target.files[0];
  };
  const submitTagihan = async () => {
    submittingTagihan.value = true;
    try {
      const formData = new FormData();
      formData.append(
        "kegiatanId",
        selectedRab.value.kegiatanId || selectedRab.value.id,
      );
      formData.append("tipeTagihan", tagihan.value.tipe);
      formData.append("nominal", String(tagihan.value.nominal));
      if (tagihan.value.tipe === "jasa") {
        formData.append("skNomor", tagihan.value.skNomor);
        formData.append("namaPenerima", tagihan.value.namaPenerima);
        formData.append("rekeningPenerima", tagihan.value.rekening);
        formData.append("bankPenerima", tagihan.value.bank);
        if (tagihan.value.skFile)
          formData.append("skFile", tagihan.value.skFile);
      } else {
        formData.append("tokoNama", tagihan.value.tokoNama);
        formData.append("tokoAlamat", tagihan.value.tokoAlamat);
        if (tagihan.value.strukFile)
          formData.append("strukFile", tagihan.value.strukFile);
      }
      await $fetch("/api/ormawa/tagihan", { method: "POST", body: formData });
      closeTagihanModal();
      alert("Tagihan dikirim ke PPK");
    } catch (err) {
      alert("Gagal mengirim tagihan");
    } finally {
      submittingTagihan.value = false;
    }
  };

  // --- LPG ---
  const openLpgModal = (rab: any) => {
    selectedRab.value = rab;
    lpgFile.value = null;
    showLpgModal.value = true;
  };
  const closeLpgModal = () => {
    showLpgModal.value = false;
  };
  const handleLpgFile = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) lpgFile.value = target.files[0];
  };
  const submitLpg = async () => {
    submittingLpg.value = true;
    try {
      const formData = new FormData();
      formData.append(
        "kegiatanId",
        selectedRab.value.kegiatanId || selectedRab.value.id,
      );
      if (lpgFile.value) formData.append("fileLpg", lpgFile.value);
      await $fetch("/api/ormawa/lpg", { method: "POST", body: formData });
      closeLpgModal();
      alert("LPG berhasil diupload, menunggu review SPI");
    } catch (err) {
      alert("Gagal upload LPG");
    } finally {
      submittingLpg.value = false;
    }
  };

  // --- Detail & Approval Log ---
  const viewDetail = async (rab: any) => {
    detailRab.value = rab;
    // Ambil approval logs
    const { data } = await useFetch(`/api/approval-log/${rab.id}`);
    approvalLogs.value = data.value || [];
    showDetailModal.value = true;
  };
  const viewApprovalLog = viewDetail;
  const closeDetailModal = () => {
    showDetailModal.value = false;
  };

  onMounted(async () => {
    await fetchUser();
    await fetchRabList();
  });
</script>
