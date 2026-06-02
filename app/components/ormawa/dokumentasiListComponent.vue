<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
  >
    <!-- Header -->
    <div
      class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h3 class="text-lg font-bold text-slate-900">Daftar Dokumentasi</h3>
        <p class="text-sm text-slate-500">
          Kelola dan monitor dokumentasi kegiatan yang telah diupload
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <Icon
            name="heroicons:magnifying-glass"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari dokumentasi..."
            class="pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b5988]/20 focus:border-[#3b5988] w-full sm:w-64"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="fetcher.loading" class="flex justify-center items-center py-12">
      <div class="flex flex-col items-center gap-3">
        <Icon
          name="heroicons:arrow-path"
          class="w-8 h-8 animate-spin text-[#3b5988]"
        />
        <p class="text-slate-500 text-sm">Memuat data dokumentasi...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredDocumentations.length === 0"
      class="flex justify-center items-center py-12"
    >
      <div class="flex flex-col items-center gap-3 text-center">
        <Icon name="heroicons:document-text" class="w-12 h-12 text-slate-300" />
        <p class="text-slate-500 text-sm">
          Belum ada dokumentasi yang diupload
        </p>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-50/50 border-b border-slate-200">
          <tr>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              No
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Deskripsi
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Tipe Dokumen
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Tanggal Upload
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              class="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="(doc, idx) in filteredDocumentations"
            :key="doc.id || idx"
            class="hover:bg-slate-50/50 transition-colors group"
          >
            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900"
            >
              {{ (fetcher.currentPage - 1) * fetcher.perPage + idx + 1 }}
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-slate-900 font-medium">
                {{ doc.deskripsi }}
              </p>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium border',
                  getTipeDocumenBadgeClass(doc.tipeDokumen),
                ]"
              >
                {{ doc.tipeDokumen }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
              {{ formatDate(doc.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                v-if="doc.tipeData === 'TAGIHAN'"
                :class="[
                  'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border',
                  doc.statusTagihan === 'SELESAI'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : doc.statusTagihan === 'DIKEMBALIKAN'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : doc.statusTagihan === 'DITOLAK'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : doc.statusTagihan === 'TERVERIFIKASI'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200',
                ]"
              >
                {{
                  doc.statusTagihan === "SELESAI"
                    ? "Lunas"
                    : doc.statusTagihan === "DIKEMBALIKAN"
                      ? "Revisi"
                      : doc.statusTagihan === "DITOLAK"
                        ? "Ditolak"
                        : doc.statusTagihan === "TERVERIFIKASI"
                          ? "Terverifikasi"
                          : "Menunggu"
                }}
              </span>
              <span
                v-else
                :class="[
                  'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border',
                  doc.status === 'DITERIMA'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : doc.status === 'REVISI'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : doc.status === 'DITOLAK'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200',
                ]"
              >
                {{
                  doc.status === "DITERIMA"
                    ? "Diterima"
                    : doc.status === "REVISI"
                      ? "Revisi"
                      : doc.status === "DITOLAK"
                        ? "Ditolak"
                        : "Menunggu"
                }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="handleView(doc)"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Icon name="heroicons:eye" class="w-4 h-4" />
                </button>

                <!-- Edit Button: Only for REVISI/DIKEMBALIKAN -->

                <button
                  v-if="
                    doc.status === 'REVISI' ||
                    doc.status === 'DITOLAK' ||
                    doc.statusTagihan === 'DIKEMBALIKAN'
                  "
                  @click="handleEdit(doc)"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white transition-all"
                >
                  <Icon name="heroicons:pencil" class="w-4 h-4" />
                </button>

                <!-- Delete Button: For REVISI/DIKEMBALIKAN or DITOLAK -->
                <button
                  v-if="
                    doc.status === 'REVISI' ||
                    doc.status === 'DITOLAK' ||
                    doc.statusTagihan === 'DIKEMBALIKAN'
                  "
                  @click="handleDelete(doc)"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all"
                >
                  <Icon name="heroicons:trash" class="w-4 h-4" />
                </button>

                <!-- Bukti Pembayaran Button -->
                <button
                  v-if="
                    doc.tipeData === 'TAGIHAN' &&
                    doc.statusTagihan === 'SELESAI'
                  "
                  @click="handleViewBukti(doc)"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all"
                >
                  <Icon name="heroicons:credit-card" class="w-4 h-4" />
                  <span class="hidden sm:inline">Bukti Bayar</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div
      class="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div class="text-sm text-slate-500">
        Menampilkan {{ startIndex + 1 }} - {{ endIndex }} dari
        {{ fetcher.totalItems }} dokumentasi
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500">Tampil</span>
          <select
            :value="fetcher.perPage"
            @change="changePerPage"
            class="px-2 py-1 border border-slate-200 rounded-lg text-sm"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          <span class="text-sm text-slate-500">data</span>
        </div>
        <div class="flex gap-1">
          <button
            @click="prevPage"
            :disabled="fetcher.currentPage <= 1"
            class="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="heroicons:chevron-left" class="w-4 h-4" />
          </button>
          <span class="px-3 py-1 text-sm">
            Halaman {{ fetcher.currentPage }} dari
            {{ fetcher.totalPages || 1 }}
          </span>
          <button
            @click="nextPage"
            :disabled="fetcher.currentPage >= fetcher.totalPages"
            class="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="heroicons:chevron-right" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal View -->
    <div
      v-if="showViewModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showViewModal = false"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <!-- Modal Header -->
        <div
          class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"
        >
          <div>
            <h3 class="text-xl font-bold text-slate-900">Detail Dokumentasi</h3>
            <p class="text-sm text-slate-500">
              Informasi lengkap dan berkas pendukung
            </p>
          </div>
          <button
            @click="showViewModal = false"
            class="p-2 rounded-xl hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-8">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Sidebar Info -->
            <div class="lg:col-span-4 space-y-6">
              <div
                class="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4"
              >
                <div>
                  <label
                    class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1"
                    >Deskripsi</label
                  >
                  <p class="text-slate-900 font-medium leading-relaxed">
                    {{ selectedDoc?.deskripsi }}
                  </p>
                </div>
                <div>
                  <label
                    class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1"
                    >Tipe Dokumen</label
                  >
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold border inline-block',
                      getTipeDocumenBadgeClass(selectedDoc?.tipeDokumen),
                    ]"
                  >
                    {{ selectedDoc?.tipeDokumen }}
                  </span>
                </div>
                <div>
                  <label
                    class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1"
                    >Tanggal Upload</label
                  >
                  <p class="text-slate-900 text-sm flex items-center gap-2">
                    <Icon
                      name="heroicons:calendar"
                      class="w-4 h-4 text-slate-400"
                    />
                    {{ formatDate(selectedDoc?.createdAt) }}
                  </p>
                </div>
              </div>

              <!-- Detail Spesifik Barang -->
              <div
                v-if="selectedDoc?.tipeDokumen === 'BARANG'"
                class="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4"
              >
                <h4 class="font-bold text-blue-900 flex items-center gap-2">
                  <Icon name="heroicons:shopping-bag" class="w-5 h-5" />
                  Informasi Tagihan Barang
                </h4>
                <div class="space-y-3">
                  <div>
                    <label
                      class="text-xs font-bold text-blue-400 uppercase block"
                      >Nama Toko</label
                    >
                    <p class="text-sm text-blue-900 font-medium">
                      {{ selectedDoc?.tokoNama || "-" }}
                    </p>
                  </div>
                  <div>
                    <label
                      class="text-xs font-bold text-blue-400 uppercase block"
                      >Alamat Toko</label
                    >
                    <p class="text-sm text-blue-900 font-medium">
                      {{ selectedDoc?.tokoAlamat || "-" }}
                    </p>
                  </div>
                  <div>
                    <label
                      class="text-xs font-bold text-blue-400 uppercase block"
                      >Nominal</label
                    >
                    <p class="text-sm text-blue-900 font-medium">
                      Rp {{ selectedDoc?.nominal || "0" }}
                    </p>
                  </div>
                  <div class="border-t border-blue-100 pt-3">
                    <label
                      class="text-xs font-bold text-blue-400 uppercase block"
                      >Bank Penerima</label
                    >
                    <p class="text-sm text-blue-900 font-medium">
                      {{ selectedDoc?.bankPenerima || "-" }}
                    </p>
                  </div>
                  <div>
                    <label
                      class="text-xs font-bold text-blue-400 uppercase block"
                      >Nomor Rekening</label
                    >
                    <p class="text-sm text-blue-900 font-medium">
                      {{ selectedDoc?.rekeningPenerima || "-" }}
                    </p>
                  </div>
                  <div>
                    <label
                      class="text-xs font-bold text-blue-400 uppercase block"
                      >Atas Nama</label
                    >
                    <p class="text-sm text-blue-900 font-medium">
                      {{ selectedDoc?.namaPenerima || "-" }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Detail Spesifik Jasa -->
              <div
                v-if="selectedDoc?.tipeDokumen === 'JASA'"
                class="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 space-y-4"
              >
                <h4 class="font-bold text-purple-900 flex items-center gap-2">
                  <Icon name="heroicons:user-group" class="w-5 h-5" />
                  Informasi Tagihan Jasa
                </h4>
                <div class="space-y-3">
                  <div>
                    <label
                      class="text-xs font-bold text-purple-400 uppercase block"
                      >Nama Penyedia</label
                    >
                    <p class="text-sm text-purple-900 font-medium">
                      {{ selectedDoc?.namaPenerima || "-" }}
                    </p>
                  </div>
                  <div>
                    <label
                      class="text-xs font-bold text-purple-400 uppercase block"
                      >Nomor SK</label
                    >
                    <p class="text-sm text-purple-900 font-medium">
                      {{ selectedDoc?.skNomor || "-" }}
                    </p>
                  </div>
                  <div>
                    <label
                      class="text-xs font-bold text-purple-400 uppercase block"
                      >Nominal</label
                    >
                    <p class="text-sm text-purple-900 font-medium">
                      Rp {{ selectedDoc?.nominal || "0" }}
                    </p>
                  </div>
                  <div class="border-t border-purple-100 pt-3">
                    <label
                      class="text-xs font-bold text-purple-400 uppercase block"
                      >Bank Penerima</label
                    >
                    <p class="text-sm text-purple-900 font-medium">
                      {{ selectedDoc?.bankPenerima || "-" }}
                    </p>
                  </div>
                  <div>
                    <label
                      class="text-xs font-bold text-purple-400 uppercase block"
                      >Nomor Rekening</label
                    >
                    <p class="text-sm text-purple-900 font-medium">
                      {{ selectedDoc?.rekeningPenerima || "-" }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Preview Berkas & Log -->
            <div class="lg:col-span-8 space-y-8">
              <!-- Berkas Terlampir -->
              <div class="space-y-6">
                <h4
                  class="text-lg font-bold text-slate-900 flex items-center gap-2"
                >
                  <Icon
                    name="heroicons:paper-clip"
                    class="w-5 h-5 text-[#3b5988]"
                  />
                  Berkas Terlampir
                </h4>

                <!-- Loading State for Files -->
                <div
                  v-if="filePreviewStore.loading"
                  class="flex justify-center items-center py-12"
                >
                  <div class="flex flex-col items-center gap-3">
                    <Icon
                      name="heroicons:arrow-path"
                      class="w-8 h-8 animate-spin text-[#3b5988]"
                    />
                    <p class="text-slate-500 text-sm">Memuat berkas...</p>
                  </div>
                </div>

                <!-- Empty State for Files -->
                <div
                  v-else-if="filePreviewStore.files.length === 0"
                  class="flex justify-center items-center py-12 border-2 border-dashed border-slate-200 rounded-2xl"
                >
                  <div class="flex flex-col items-center gap-3 text-center">
                    <Icon
                      name="heroicons:document-text"
                      class="w-12 h-12 text-slate-300"
                    />
                    <p class="text-slate-500 text-sm">
                      Tidak ada berkas yang dilampirkan
                    </p>
                  </div>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Loop through files from store -->
                  <ormawa-file-preview-card
                    v-for="(file, fIdx) in filePreviewStore.files"
                    :key="fIdx"
                    :label="file.label"
                    :url="file.url"
                    :type="file.type"
                  />
                </div>
              </div>

              <!-- Log Aktivitas -->
              <div class="space-y-6 pt-6 border-t border-slate-100">
                <h4
                  class="text-lg font-bold text-slate-900 flex items-center gap-2"
                >
                  <Icon name="heroicons:clock" class="w-5 h-5 text-[#3b5988]" />
                  Riwayat & Log Aktivitas
                </h4>

                <!-- Loading Logs -->
                <div v-if="logStore.loading" class="flex justify-center py-8">
                  <Icon
                    name="heroicons:arrow-path"
                    class="w-6 h-6 animate-spin text-slate-400"
                  />
                </div>

                <!-- Empty Logs -->
                <div
                  v-else-if="logStore.logs.length === 0"
                  class="bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-200"
                >
                  <p class="text-sm text-slate-500">
                    Belum ada riwayat aktivitas untuk item ini
                  </p>
                </div>

                <!-- Log List -->
                <div v-else class="space-y-4">
                  <div
                    v-for="log in logStore.logs"
                    :key="log.id"
                    class="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-[#3b5988]/20 transition-all"
                  >
                    <div class="flex-shrink-0">
                      <div
                        :class="[
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          log.action === 'approve'
                            ? 'bg-emerald-50 text-emerald-600'
                            : log.action === 'reject'
                              ? 'bg-red-50 text-red-600'
                              : log.action === 'review' ||
                                  log.action === 'revisi'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-blue-50 text-blue-600',
                        ]"
                      >
                        <Icon
                          :name="
                            log.action === 'approve'
                              ? 'heroicons:check-circle'
                              : log.action === 'reject'
                                ? 'heroicons:x-circle'
                                : log.action === 'review' ||
                                    log.action === 'revisi'
                                  ? 'heroicons:arrow-path'
                                  : 'heroicons:credit-card'
                          "
                          class="w-6 h-6"
                        />
                      </div>
                    </div>
                    <div class="flex-1 space-y-1">
                      <div class="flex justify-between items-start">
                        <div>
                          <p
                            class="text-sm font-bold text-slate-900 capitalize"
                          >
                            {{
                              log.action === "approve"
                                ? "Disetujui"
                                : log.action === "reject"
                                  ? "Ditolak"
                                  : log.action === "review"
                                    ? "Sedang Direview"
                                    : log.action === "revisi"
                                      ? "Perlu Revisi"
                                      : "Dibayarkan"
                            }}
                          </p>
                          <p class="text-xs text-slate-500">
                            Oleh: {{ log.user.fullname }}
                            <span class="font-semibold text-slate-700"
                              >({{ log.user.role?.toUpperCase() }})</span
                            >
                          </p>
                        </div>
                        <span class="text-[10px] font-medium text-slate-400">{{
                          formatDate(log.createdAt)
                        }}</span>
                      </div>
                      <div class="bg-slate-50 rounded-lg p-3 mt-2">
                        <p
                          class="text-sm text-slate-700 leading-relaxed italic"
                        >
                          "{{ log.komentar || "Tidak ada komentar" }}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end"
        >
          <button
            @click="showViewModal = false"
            class="px-6 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Edit -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showEditModal = false"
    >
      <div class="bg-white rounded-2xl shadow-lg max-w-2xl w-full">
        <div
          class="p-6 border-b border-slate-200 flex justify-between items-center"
        >
          <h3 class="text-lg font-bold">Edit Dokumentasi</h3>
          <button
            @click="showEditModal = false"
            class="p-1 rounded-lg hover:bg-slate-100"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>
        <div class="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          <div v-if="editForm.tipeDokumen === 'DOKUMENTASI'">
            <label class="block text-sm font-medium mb-1"
              >Deskripsi <span class="text-red-500">*</span></label
            >
            <textarea
              v-model="editForm.deskripsi"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3b5988] outline-none"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1"
              >Tipe Dokumen <span class="text-red-500">*</span></label
            >
            <select
              v-model="editForm.tipeDokumen"
              class="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 cursor-not-allowed"
              disabled
            >
              <option value="DOKUMENTASI">DOKUMENTASI</option>
              <option value="BARANG">BARANG</option>
              <option value="JASA">JASA</option>
            </select>
            <p class="text-xs text-slate-500 mt-1">
              Tipe dokumen tidak dapat diubah setelah diupload.
            </p>
          </div>

          <!-- Edit Field Dokumentasi (General) -->
          <div
            v-if="editForm.tipeDokumen === 'DOKUMENTASI'"
            class="pt-4 border-t space-y-4"
          >
            <div>
              <label class="block text-sm font-medium mb-1"
                >Ganti File Dokumentasi (Opsional)</label
              >
              <input
                type="file"
                @change="(e) => handleFileEdit(e, 'file')"
                class="w-full border border-slate-200 rounded-lg p-2 text-sm"
              />
              <p class="text-xs text-slate-500 mt-1">
                Kosongkan jika tidak ingin mengganti file.
              </p>
            </div>
          </div>

          <!-- Edit Field Barang -->
          <div
            v-if="editForm.tipeDokumen === 'BARANG'"
            class="pt-4 border-t space-y-4"
          >
            <h4 class="font-bold text-sm text-slate-700">Data Barang / Toko</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Nama Toko</label>
                <input
                  v-model="editForm.tokoNama"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3b5988] outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Nominal</label>
                <input
                  v-model="editForm.nominal"
                  type="number"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3b5988] outline-none"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Alamat Toko</label>
              <textarea
                v-model="editForm.tokoAlamat"
                rows="2"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3b5988] outline-none"
              ></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1"
                  >Bank Penerima</label
                >
                <input
                  v-model="editForm.bankPenerima"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3b5988] outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1"
                  >Nomor Rekening</label
                >
                <input
                  v-model="editForm.rekeningPenerima"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3b5988] outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Atas Nama</label>
                <input
                  v-model="editForm.namaPenerima"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3b5988] outline-none"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1 text-blue-600"
                  >Ganti Foto Barang (Opsional)</label
                >
                <input
                  type="file"
                  @change="(e) => handleFileEdit(e, 'fotoBarang')"
                  class="w-full border border-slate-200 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1 text-blue-600"
                  >Ganti Struk Belanja (Opsional)</label
                >
                <input
                  type="file"
                  @change="(e) => handleFileEdit(e, 'fotoStruk')"
                  class="w-full border border-slate-200 rounded-lg p-2 text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Edit Field Jasa -->
          <div
            v-if="editForm.tipeDokumen === 'JASA'"
            class="pt-4 border-t space-y-4"
          >
            <h4 class="font-bold text-sm text-slate-700">Data Penyedia Jasa</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1"
                  >Nama Penyedia</label
                >
                <input
                  v-model="editForm.namaPenerima"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3b5988] outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Nominal</label>
                <input
                  v-model="editForm.nominal"
                  type="number"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3b5988] outline-none"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1"
                  >Bank Penerima</label
                >
                <input
                  v-model="editForm.bankPenerima"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3b5988] outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1"
                  >Nomor Rekening</label
                >
                <input
                  v-model="editForm.rekeningPenerima"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#3b5988] outline-none"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div class="space-y-2">
                <label class="block text-sm font-medium">Nomor SK</label>
                <input
                  v-model="editForm.skNomor"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border text-sm"
                />
                <label class="block text-xs font-medium text-purple-600"
                  >Ganti File SK (Opsional)</label
                >
                <input
                  type="file"
                  @change="(e) => handleFileEdit(e, 'skFile')"
                  class="w-full border rounded-lg p-1.5 text-xs"
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium">Nomor SPMT</label>
                <input
                  v-model="editForm.spmtNomor"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border text-sm"
                />
                <label class="block text-xs font-medium text-purple-600"
                  >Ganti File SPMT (Opsional)</label
                >
                <input
                  type="file"
                  @change="(e) => handleFileEdit(e, 'spmtFile')"
                  class="w-full border rounded-lg p-1.5 text-xs"
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium">Nomor Amprah</label>
                <input
                  v-model="editForm.amprahNomor"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border text-sm"
                />
                <label class="block text-xs font-medium text-purple-600"
                  >Ganti File Amprah (Opsional)</label
                >
                <input
                  type="file"
                  @change="(e) => handleFileEdit(e, 'amprahFile')"
                  class="w-full border rounded-lg p-1.5 text-xs"
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium">Nomor NPWP</label>
                <input
                  v-model="editForm.npwpNomor"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border text-sm"
                />
                <label class="block text-xs font-medium text-purple-600"
                  >Ganti File NPWP (Opsional)</label
                >
                <input
                  type="file"
                  @change="(e) => handleFileEdit(e, 'npwpFile')"
                  class="w-full border rounded-lg p-1.5 text-xs"
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium">Nomor KTP</label>
                <input
                  v-model="editForm.ktpNomor"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border text-sm"
                />
                <label class="block text-xs font-medium text-purple-600"
                  >Ganti File KTP (Opsional)</label
                >
                <input
                  type="file"
                  @change="(e) => handleFileEdit(e, 'ktpFile')"
                  class="w-full border rounded-lg p-1.5 text-xs"
                />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium">Buku Rekening</label>
                <div class="h-9"></div>
                <!-- Spacer to align with text inputs -->
                <label class="block text-xs font-medium text-purple-600"
                  >Ganti File Buku Rekening (Opsional)</label
                >
                <input
                  type="file"
                  @change="(e) => handleFileEdit(e, 'bukuRekeningFile')"
                  class="w-full border rounded-lg p-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button
              @click="showEditModal = false"
              class="px-4 py-2 rounded-lg border hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              @click="submitEdit"
              class="px-4 py-2 rounded-lg bg-[#3b5988] text-white hover:bg-[#2d4570] transition"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Hapus -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showDeleteConfirm = false"
    >
      <div class="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center"
          >
            <Icon
              name="heroicons:exclamation-triangle"
              class="w-6 h-6 text-red-600"
            />
          </div>
          <h3 class="text-lg font-bold">Hapus Dokumentasi?</h3>
        </div>
        <p class="text-sm text-slate-600 mb-6">
          Apakah Anda yakin ingin menghapus dokumentasi "{{
            selectedDoc?.deskripsi
          }}"?
        </p>
        <div class="flex gap-3">
          <button
            @click="showDeleteConfirm = false"
            class="flex-1 px-4 py-2 rounded-lg border"
          >
            Batal
          </button>
          <button
            @click="submitDelete"
            class="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- Popup Notifikasi -->
    <Transition name="fade">
      <div
        v-if="showPopup"
        class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50"
        :class="{
          'border-l-4 border-emerald-500 bg-emerald-50':
            popupType === 'success',
          'border-l-4 border-red-500 bg-red-50': popupType === 'error',
        }"
      >
        <p
          :class="{
            'text-emerald-800': popupType === 'success',
            'text-red-800': popupType === 'error',
          }"
        >
          {{ popupMessage }}
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from "vue";
  import { useDokumentasiStore } from "~/stores/ormawa/allDokumen";
  import { useKegiatanStore } from "~/stores/ormawa/uploadDokumen";
  import { useFilePreviewStore } from "~/stores/ormawa/filePreview";
  import { useLogDokumentasiTagihanStore } from "~/stores/ormawa/logDokumentasiTagihan";

  const props = defineProps({
    kegiatanId: { type: Number, required: true },
  });

  const fetcher = useDokumentasiStore();
  const kegiatanStore = useKegiatanStore();
  const filePreviewStore = useFilePreviewStore();
  const logStore = useLogDokumentasiTagihanStore();

  // State lokal
  const searchQuery = ref("");
  const showViewModal = ref(false);
  const showEditModal = ref(false);
  const showDeleteConfirm = ref(false);
  const showPopup = ref(false);
  const selectedDoc = ref<any>(null);
  const popupMessage = ref("");
  const popupType = ref<"success" | "error">("success");

  const editForm = ref({
    id: "",
    deskripsi: "",
    tipeDokumen: "",
    // Tagihan fields
    tokoNama: "",
    tokoAlamat: "",
    namaPenerima: "",
    rekeningPenerima: "",
    bankPenerima: "",
    nominal: 0 as number | string,
    skNomor: "",
    spmtNomor: "",
    amprahNomor: "",
    npwpNomor: "",
    ktpNomor: "",
  });

  // Computed
  const filteredDocumentations = computed(() => {
    let docs = fetcher.dokumentasiList;
    if (searchQuery.value) {
      docs = docs.filter(
        (doc: any) =>
          doc.deskripsi
            ?.toLowerCase()
            .includes(searchQuery.value.toLowerCase()) ||
          doc.tipeDokumen
            ?.toLowerCase()
            .includes(searchQuery.value.toLowerCase()),
      );
    }
    return docs;
  });

  const startIndex = computed(
    () => (fetcher.currentPage - 1) * fetcher.perPage,
  );
  const endIndex = computed(
    () => startIndex.value + filteredDocumentations.value.length,
  );

  // Helper formatting
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTipeDocumenBadgeClass = (tipe: string) => {
    const baseClass = "px-3 py-1 rounded-full text-xs font-medium border";
    if (!tipe)
      return `${baseClass} bg-slate-50 text-slate-700 border-slate-200`;

    switch (tipe.toUpperCase()) {
      case "BARANG":
        return `${baseClass} bg-blue-50 text-blue-700 border-blue-200`;
      case "JASA":
        return `${baseClass} bg-purple-50 text-purple-700 border-purple-200`;
      case "DOKUMENTASI":
        return `${baseClass} bg-amber-50 text-amber-700 border-amber-200`;
      case "FOTO":
        return `${baseClass} bg-sky-50 text-sky-700 border-sky-200`;
      case "VIDEO":
        return `${baseClass} bg-indigo-50 text-indigo-700 border-indigo-200`;
      default:
        return `${baseClass} bg-slate-50 text-slate-700 border-slate-200`;
    }
  };

  // Pagination handlers
  const changePerPage = async (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const newLimit = parseInt(target.value, 10);
    await fetcher.changePerPage(props.kegiatanId, newLimit);
  };

  const prevPage = async () => {
    if (fetcher.currentPage > 1) {
      await fetcher.changePage(props.kegiatanId, fetcher.currentPage - 1);
    }
  };

  const nextPage = async () => {
    if (fetcher.currentPage < fetcher.totalPages) {
      await fetcher.changePage(props.kegiatanId, fetcher.currentPage + 1);
    }
  };

  const selectedFiles = ref<Record<string, File>>({});

  const handleFileEdit = (event: Event, field: string) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      selectedFiles.value[field] = target.files[0];
    }
  };

  // CRUD
  const handleView = async (doc: any) => {
    selectedDoc.value = doc;
    showViewModal.value = true;
    if (doc.id) {
      await Promise.all([
        filePreviewStore.fetchFiles(doc.id),
        logStore.fetchLogs(doc.id),
      ]);
    }
  };

  const handleEdit = (doc: any) => {
    selectedDoc.value = doc;
    selectedFiles.value = {}; // Reset files
    editForm.value = {
      id: doc.id,
      deskripsi: doc.deskripsi || "",
      tipeDokumen: doc.tipeDokumen || "",
      tokoNama: doc.tokoNama || "",
      tokoAlamat: doc.tokoAlamat || "",
      namaPenerima: doc.namaPenerima || "",
      rekeningPenerima: doc.rekeningPenerima || "",
      bankPenerima: doc.bankPenerima || "",
      nominal: doc.nominal || 0,
      skNomor: doc.skNomor || "",
      spmtNomor: doc.spmtNomor || "",
      amprahNomor: doc.amprahNomor || "",
      npwpNomor: doc.npwpNomor || "",
      ktpNomor: doc.ktpNomor || "",
    };
    showEditModal.value = true;
  };

  const handleViewBukti = async (doc: any) => {
    try {
      const res: any = await $fetch(
        "/api/ormawa/dokumentasi/getBuktiPembayaran",
        {
          method: "POST",
          body: { tagihanId: doc.realId },
        },
      );

      // if (res.success && res.data.id) {
      //   // Use fileView to stream the proof of payment
      //   const blobRes: any = await $fetch("/api/ormawa/dokumentasi/fileView", {
      //     method: "POST",
      //     body: { id: `pembayaran_${res.data.id}` },
      //     responseType: "blob",
      //   });

      //   const blob = blobRes as Blob;
      //   const url = URL.createObjectURL(blob);
      //   window.open(url, "_blank");
      // }
    } catch (error) {
      showPopupNotification(
        "Bukti pembayaran belum tersedia atau gagal dimuat",
        "error",
      );
    }
  };

  const submitEdit = async () => {
    if (!editForm.value.tipeDokumen) {
      showPopupNotification("Tipe dokumen tidak valid", "error");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("id", String(editForm.value.id));
      fd.append("deskripsi", editForm.value.deskripsi);
      fd.append("tipeDokumen", editForm.value.tipeDokumen);

      // Fields for Tagihan
      if (
        editForm.value.tipeDokumen === "BARANG" ||
        editForm.value.tipeDokumen === "JASA"
      ) {
        fd.append("namaPenerima", editForm.value.namaPenerima);
        fd.append("rekeningPenerima", editForm.value.rekeningPenerima);
        fd.append("bankPenerima", editForm.value.bankPenerima);
        fd.append("nominal", String(editForm.value.nominal));

        if (editForm.value.tipeDokumen === "BARANG") {
          fd.append("tokoNama", editForm.value.tokoNama);
          fd.append("tokoAlamat", editForm.value.tokoAlamat);
        } else if (editForm.value.tipeDokumen === "JASA") {
          fd.append("skNomor", editForm.value.skNomor);
          fd.append("spmtNomor", editForm.value.spmtNomor);
          fd.append("amprahNomor", editForm.value.amprahNomor);
          fd.append("npwpNomor", editForm.value.npwpNomor);
          fd.append("ktpNomor", editForm.value.ktpNomor);
        }
      }

      // Tambahkan file jika ada yang dipilih
      Object.keys(selectedFiles.value).forEach((key) => {
        fd.append(key, selectedFiles.value[key]);
      });

      const res = await kegiatanStore.updateDokumentasi(fd, props.kegiatanId);
      if (res.success) {
        showPopupNotification(kegiatanStore.popupMessage, "success");
        showEditModal.value = false;
      } else {
        showPopupNotification(kegiatanStore.popupMessage, "error");
      }
    } catch (error) {
      showPopupNotification("Gagal memperbarui dokumentasi", "error");
    }
  };

  const handleDelete = (doc: any) => {
    selectedDoc.value = doc;
    showDeleteConfirm.value = true;
  };

  const submitDelete = async () => {
    try {
      const res = await kegiatanStore.deleteUpload({
        id: selectedDoc.value.id,
        kegiatanId: props.kegiatanId,
      });

      if (res.success) {
        showPopupNotification(kegiatanStore.popupMessage, "success");
        showDeleteConfirm.value = false;
      } else {
        showPopupNotification(kegiatanStore.popupMessage, "error");
      }
    } catch (error) {
      showPopupNotification("Gagal menghapus dokumentasi", "error");
    }
  };

  const showPopupNotification = (
    message: string,
    type: "success" | "error",
  ) => {
    popupMessage.value = message;
    popupType.value = type;
    showPopup.value = true;
    setTimeout(() => {
      showPopup.value = false;
    }, 3000);
  };

  // Lifecycle
  onMounted(async () => {
    if (props.kegiatanId) {
      await fetcher.fetchDokumentasi(
        props.kegiatanId,
        fetcher.currentPage,
        fetcher.perPage,
      );
    }
  });

  watch(
    () => props.kegiatanId,
    async (newId, oldId) => {
      if (newId !== oldId && newId) {
        await fetcher.refreshDokumentasi(newId, 1, fetcher.perPage);
      }
    },
  );
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
