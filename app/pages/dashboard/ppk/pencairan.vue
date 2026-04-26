<template>
  <div class="min-h-screen bg-slate-50 font-sans">
    <!-- Main Content -->
    <div class="transition-all duration-300">
      <!-- Header -->
      <header
        class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4"
      >
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div>
              <h2 class="text-xl font-bold text-slate-900">
                Pencairan <span class="text-[#d1a82a]">Dana</span>
              </h2>
              <p class="text-sm text-slate-500">
                Verifikasi dokumen dan proses pencairan ormawa
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <!-- Search & Filter -->
            <div
              class="flex items-center gap-2 bg-white rounded-full border border-slate-200 px-4 py-2 shadow-sm"
            >
              <Icon
                name="heroicons:magnifying-glass"
                class="w-4 h-4 text-slate-400"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari ormawa / kegiatan..."
                class="bg-transparent border-none text-sm text-slate-700 focus:outline-none w-40 sm:w-56"
              />
            </div>
            <div
              class="flex items-center gap-2 bg-white rounded-full border border-slate-200 px-4 py-2 shadow-sm"
            >
              <Icon name="heroicons:funnel" class="w-4 h-4 text-[#d1a82a]" />
              <select
                v-model="filterStatus"
                class="bg-transparent border-none text-sm text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="menunggu_dokumen">Menunggu Dokumen</option>
                <option value="dokumen_lengkap">Dokumen Lengkap</option>
                <option value="spb_dikirim">SPB Dikirim</option>
                <option value="proses_pencairan">Proses Pencairan</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
            <div
              class="bg-[#d1a82a] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md"
            >
              {{ todayStr }}
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="p-4 sm:p-6 lg:p-8 space-y-6">
        <!-- Stats Cards (mirip dashboard ormawa) -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          <!-- Menunggu Dokumen -->
          <div
            class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                  <Icon name="heroicons:clock" class="w-6 h-6" />
                </div>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">
                {{ countByStatus("menunggu_dokumen") }}
              </h3>
              <p class="text-sm text-slate-500">Menunggu Dokumen</p>
              <span
                class="inline-block mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"
                >Perlu tindakan</span
              >
            </div>
          </div>

          <!-- Dokumen Lengkap -->
          <div
            class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                  <Icon name="heroicons:document-check" class="w-6 h-6" />
                </div>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">
                {{ countByStatus("dokumen_lengkap") }}
              </h3>
              <p class="text-sm text-slate-500">Dokumen Lengkap</p>
              <span class="inline-block mt-1 text-xs text-slate-400"
                >Siap SPB</span
              >
            </div>
          </div>

          <!-- SPB Dikirim -->
          <div
            class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-xl bg-purple-500/10 text-purple-600">
                  <Icon name="heroicons:paper-airplane" class="w-6 h-6" />
                </div>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">
                {{ countByStatus("spb_dikirim") }}
              </h3>
              <p class="text-sm text-slate-500">SPB Dikirim</p>
              <span class="inline-block mt-1 text-xs text-slate-400"
                >Menunggu TTD</span
              >
            </div>
          </div>

          <!-- Selesai -->
          <div
            class="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 p-6 group hover:shadow-lg transition-all duration-300"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"
            ></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Icon name="heroicons:check-circle" class="w-6 h-6" />
                </div>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-1">
                {{ countByStatus("selesai") }}
              </h3>
              <p class="text-sm text-slate-500">Selesai</p>
              <span
                class="inline-block mt-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
                >Dicairkan</span
              >
            </div>
          </div>
        </div>

        <!-- Cards Grid (Daftar Pencairan) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(item, idx) in filteredList"
            :key="item.id"
            class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
            @click="openDetail(item)"
          >
            <!-- Top stripe berdasarkan status -->
            <div
              class="h-1.5"
              :class="{
                'bg-amber-400': statusColor(item.statusPencairan) === 'yellow',
                'bg-blue-400': statusColor(item.statusPencairan) === 'blue',
                'bg-purple-400': statusColor(item.statusPencairan) === 'purple',
                'bg-orange-400': statusColor(item.statusPencairan) === 'orange',
                'bg-emerald-400': statusColor(item.statusPencairan) === 'mint',
              }"
            ></div>

            <div class="p-5">
              <!-- Header Card -->
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  :style="{ backgroundColor: item.color || '#3b5988' }"
                >
                  {{ item.kodeOrmawa?.charAt(0) || "O" }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-slate-800 truncate">
                    {{ item.namaKegiatan }}
                  </h3>
                  <p class="text-xs text-slate-500">
                    {{ item.namaOrmawa }} · {{ item.kodeOrmawa }}
                  </p>
                </div>
                <span
                  class="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap"
                  :class="{
                    'bg-amber-100 text-amber-700':
                      statusColor(item.statusPencairan) === 'yellow',
                    'bg-blue-100 text-blue-700':
                      statusColor(item.statusPencairan) === 'blue',
                    'bg-purple-100 text-purple-700':
                      statusColor(item.statusPencairan) === 'purple',
                    'bg-orange-100 text-orange-700':
                      statusColor(item.statusPencairan) === 'orange',
                    'bg-emerald-100 text-emerald-700':
                      statusColor(item.statusPencairan) === 'mint',
                  }"
                >
                  {{ statusLabel(item.statusPencairan) }}
                </span>
              </div>

              <!-- Dana & Tanggal -->
              <div
                class="grid grid-cols-2 gap-3 mt-4 p-3 bg-slate-50 rounded-xl"
              >
                <div>
                  <p class="text-[10px] font-semibold uppercase text-slate-400">
                    Dana Disetujui
                  </p>
                  <p class="text-sm font-bold text-slate-800">
                    {{ formatRp(item.totalDana) }}
                  </p>
                </div>
                <div>
                  <p class="text-[10px] font-semibold uppercase text-slate-400">
                    Tanggal Kegiatan
                  </p>
                  <p class="text-sm font-medium text-slate-700">
                    {{ formatDate(item.tanggalKegiatan) }}
                  </p>
                </div>
              </div>

              <!-- Dokumen Progress -->
              <div class="mt-4">
                <div class="flex justify-between text-xs mb-1">
                  <span class="font-semibold text-slate-500"
                    >Kelengkapan Dokumen</span
                  >
                  <span
                    :class="
                      docPct(item) === 100
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    "
                  >
                    {{
                      item.syaratDokumen?.filter((d) => d.uploaded).length
                    }}/{{ item.syaratDokumen?.length }}
                  </span>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">
                  <div
                    v-for="doc in item.syaratDokumen"
                    :key="doc.id"
                    class="flex items-center gap-1 text-xs"
                    :class="doc.uploaded ? 'text-emerald-600' : 'text-red-400'"
                  >
                    <Icon
                      :name="
                        doc.uploaded
                          ? 'heroicons:check-circle'
                          : 'heroicons:x-circle'
                      "
                      class="w-3 h-3"
                    />
                    <span class="text-slate-600">{{ doc.nama }}</span>
                  </div>
                </div>
                <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :style="{
                      width: docPct(item) + '%',
                      backgroundColor:
                        docPct(item) === 100 ? '#10b981' : '#d1a82a',
                    }"
                  ></div>
                </div>
              </div>

              <!-- Footer -->
              <div
                class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100"
              >
                <span class="text-xs text-slate-400"
                  >Diajukan {{ formatDate(item.tanggalPengajuan) }}</span
                >
                <button
                  class="text-sm font-semibold text-[#3b5988] hover:text-[#2d4570] flex items-center gap-1"
                >
                  Kelola <Icon name="heroicons:arrow-right" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="filteredList.length === 0"
            class="col-span-full bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center"
          >
            <Icon
              name="heroicons:banknotes"
              class="w-16 h-16 mx-auto text-slate-300"
            />
            <p class="mt-3 font-semibold text-slate-600">
              Tidak ada data pencairan
            </p>
            <p class="text-sm text-slate-400">
              Pencairan akan muncul setelah kegiatan disetujui
            </p>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Detail (Tailwind version) -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-[#3b5988]/5 to-transparent"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-[#3b5988] text-white flex items-center justify-center"
            >
              <Icon name="heroicons:banknotes" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800">
                {{ selected?.namaKegiatan }}
              </h3>
              <p class="text-xs text-slate-500">
                {{ selected?.namaOrmawa }} · {{ formatRp(selected?.totalDana) }}
              </p>
            </div>
          </div>
          <button
            @click="closeModal"
            class="p-1 rounded-full hover:bg-slate-100"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-slate-200 px-5">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-all"
            :class="
              activeTab === tab.key
                ? 'border-[#d1a82a] text-[#3b5988]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            "
          >
            <Icon :name="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Modal Body (scrollable) -->
        <div class="flex-1 overflow-y-auto p-5 space-y-5">
          <!-- TAB DOKUMEN -->
          <div v-if="activeTab === 'dokumen'">
            <h4 class="text-xs font-bold uppercase text-slate-400 mb-3">
              Kelengkapan Persyaratan Pencairan
            </h4>
            <div class="space-y-2">
              <div
                v-for="doc in selected?.syaratDokumen || []"
                :key="doc.id"
                class="flex items-center justify-between p-3 rounded-xl border"
                :class="
                  doc.uploaded
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-red-200 bg-red-50/30'
                "
              >
                <div class="flex items-center gap-3">
                  <div
                    :class="doc.uploaded ? 'text-emerald-600' : 'text-red-400'"
                  >
                    <Icon
                      :name="
                        doc.uploaded
                          ? 'heroicons:check-circle'
                          : 'heroicons:clock'
                      "
                      class="w-5 h-5"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-slate-800">{{ doc.nama }}</p>
                    <p class="text-xs text-slate-500">
                      {{ doc.uploaded ? "Sudah diunggah" : "Belum diunggah" }}
                    </p>
                  </div>
                </div>
                <a
                  v-if="doc.uploaded"
                  :href="doc.url"
                  target="_blank"
                  class="text-sm text-[#3b5988] hover:underline flex items-center gap-1"
                >
                  <Icon name="heroicons:eye" class="w-4 h-4" /> Lihat
                </a>
              </div>
            </div>

            <!-- Action Box (complete) -->
            <div
              v-if="allDocsComplete"
              class="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"
                >
                  <Icon name="heroicons:check-badge" class="w-6 h-6" />
                </div>
                <div>
                  <p class="font-bold text-emerald-800">Dokumen Lengkap!</p>
                  <p class="text-xs text-emerald-600">
                    Semua persyaratan terpenuhi. Lanjutkan ke pengiriman SPB.
                  </p>
                </div>
              </div>
              <button
                @click="activeTab = 'spb'"
                :disabled="loadingAction"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2"
              >
                Lanjut ke SPB
                <Icon name="heroicons:arrow-right" class="w-4 h-4" />
              </button>
            </div>

            <!-- Action Box (incomplete) -->
            <div
              v-else
              class="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200"
            >
              <div class="flex flex-col sm:flex-row gap-3">
                <Icon
                  name="heroicons:exclamation-triangle"
                  class="w-5 h-5 text-amber-600 flex-shrink-0"
                />
                <div class="flex-1">
                  <p class="font-bold text-amber-800">Dokumen Belum Lengkap</p>
                  <p class="text-xs text-amber-700">
                    Kembalikan ke ormawa untuk melengkapi persyaratan
                  </p>
                  <textarea
                    v-model="catatanKembalikan"
                    rows="2"
                    class="mt-2 w-full border border-amber-300 rounded-lg p-2 text-sm"
                    placeholder="Tuliskan dokumen yang perlu dilengkapi..."
                  ></textarea>
                </div>
                <button
                  @click="handleKembalikan"
                  :disabled="loadingAction"
                  class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 self-start"
                >
                  <Icon name="heroicons:arrow-uturn-left" class="w-4 h-4" />
                  Kembalikan
                </button>
              </div>
            </div>
          </div>

          <!-- TAB SPB -->
          <div v-if="activeTab === 'spb'">
            <h4 class="text-xs font-bold uppercase text-slate-400 mb-3">
              Surat Perintah Bayar (SPB)
            </h4>

            <div
              v-if="selected?.statusPencairan === 'dokumen_lengkap'"
              class="space-y-4"
            >
              <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <p class="text-[10px] text-slate-400">Nama Ormawa</p>
                  <p class="font-medium">{{ selected?.namaOrmawa }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-slate-400">Nama Kegiatan</p>
                  <p class="font-medium">{{ selected?.namaKegiatan }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-slate-400">Jumlah Dana</p>
                  <p class="font-bold text-[#3b5988]">
                    {{ formatRp(selected?.totalDana) }}
                  </p>
                </div>
                <div>
                  <p class="text-[10px] text-slate-400">Tanggal SPB</p>
                  <p class="font-medium">{{ todayStr }}</p>
                </div>
              </div>
              <label class="block text-sm font-semibold text-slate-700"
                >Catatan SPB (opsional)</label
              >
              <textarea
                v-model="catatanSPB"
                rows="2"
                class="w-full border border-slate-300 rounded-lg p-2 text-sm"
                placeholder="Catatan tambahan untuk SPB..."
              ></textarea>
              <button
                @click="handleKirimSPB"
                :disabled="loadingAction"
                class="w-full py-2.5 bg-[#3b5988] hover:bg-[#2d4570] text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition"
              >
                <Icon name="heroicons:paper-airplane" class="w-5 h-5" /> Kirim
                SPB ke Ormawa
              </button>
              <p class="text-xs text-slate-400 text-center">
                SPB akan dikirim ke ormawa untuk ditandatangani
              </p>
            </div>

            <div
              v-else-if="selected?.statusPencairan === 'spb_dikirim'"
              class="text-center py-6 space-y-3"
            >
              <div
                class="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"
              >
                <Icon name="heroicons:check-badge" class="w-8 h-8" />
              </div>
              <p class="font-bold text-slate-800">SPB Telah Dikirim</p>
              <p class="text-sm text-slate-500">
                Menunggu tanda tangan ormawa. Setelah ditandatangani, lanjutkan
                proses pencairan.
              </p>
              <button
                @click="handleProsesPencairan"
                :disabled="loadingAction"
                class="mt-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto"
              >
                <Icon name="heroicons:banknotes" class="w-5 h-5" /> SPB
                Ditandatangani — Proses Pencairan
              </button>
            </div>

            <div v-else class="text-center py-8 text-slate-400">
              <Icon
                name="heroicons:lock-closed"
                class="w-12 h-12 mx-auto mb-2"
              />
              <p class="text-sm">
                Lengkapi dokumen terlebih dahulu sebelum mengirim SPB.
              </p>
            </div>
          </div>

          <!-- TAB BUKTI TRANSFER -->
          <div v-if="activeTab === 'bukti'">
            <h4 class="text-xs font-bold uppercase text-slate-400 mb-3">
              Bukti Transfer Pencairan
            </h4>

            <div
              v-if="
                selected?.statusPencairan === 'proses_pencairan' ||
                selected?.statusPencairan === 'selesai'
              "
            >
              <div
                v-if="selected?.buktiBayar"
                class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4"
              >
                <div
                  class="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"
                >
                  <Icon name="heroicons:receipt-percent" class="w-5 h-5" />
                </div>
                <div class="flex-1">
                  <p class="font-medium">{{ selected.buktiBayar.nama }}</p>
                  <p class="text-xs text-slate-500">
                    Dikirim {{ formatDate(selected.buktiBayar.tanggal) }}
                  </p>
                </div>
                <a
                  :href="selected.buktiBayar.url"
                  target="_blank"
                  class="text-sm text-[#3b5988] hover:underline flex items-center gap-1"
                >
                  <Icon name="heroicons:eye" class="w-4 h-4" /> Lihat
                </a>
              </div>

              <div v-if="selected?.statusPencairan === 'proses_pencairan'">
                <label class="block text-sm font-semibold text-slate-700 mb-1"
                  >Upload Bukti Transfer</label
                >
                <div
                  class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 transition"
                  @click="$refs.buktiInput.click()"
                >
                  <Icon
                    name="heroicons:arrow-up-tray"
                    class="w-8 h-8 mx-auto text-slate-400"
                  />
                  <p class="text-sm font-medium mt-1">
                    Klik untuk upload bukti transfer
                  </p>
                  <p class="text-xs text-slate-400">
                    PDF, JPG, PNG (maks. 5MB)
                  </p>
                  <input
                    ref="buktiInput"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="hidden"
                    @change="onBuktiSelected"
                  />
                </div>
                <p
                  v-if="buktiFile"
                  class="text-sm text-slate-600 mt-2 flex items-center gap-1"
                >
                  <Icon name="heroicons:document" class="w-4 h-4" />
                  {{ buktiFile.name }}
                </p>
                <button
                  @click="handleKirimBukti"
                  :disabled="loadingAction || !buktiFile"
                  class="mt-4 w-full py-2.5 bg-[#3b5988] hover:bg-[#2d4570] text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Icon name="heroicons:paper-airplane" class="w-5 h-5" /> Kirim
                  Bukti Transfer ke Ormawa
                </button>
              </div>

              <div
                v-if="selected?.statusPencairan === 'selesai'"
                class="text-center py-6"
              >
                <div
                  class="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"
                >
                  <Icon name="heroicons:check-badge" class="w-8 h-8" />
                </div>
                <p class="font-bold text-emerald-800 mt-2">Pencairan Selesai</p>
                <p class="text-sm text-slate-500">
                  Bukti transfer telah dikirimkan kepada ormawa.
                </p>
              </div>
            </div>

            <div v-else class="text-center py-8 text-slate-400">
              <Icon
                name="heroicons:lock-closed"
                class="w-12 h-12 mx-auto mb-2"
              />
              <p class="text-sm">
                Proses SPB terlebih dahulu sebelum mengirim bukti transfer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive } from "vue";

  // Types
  interface SyaratDokumen {
    id: number;
    nama: string;
    uploaded: boolean;
    url?: string;
  }

  interface BuktiBayar {
    nama: string;
    tanggal: string;
    url: string;
  }

  interface PencairanItem {
    id: number;
    namaKegiatan: string;
    namaOrmawa: string;
    kodeOrmawa: string;
    totalDana: number;
    tanggalKegiatan: string;
    tanggalPengajuan: string;
    statusPencairan:
      | "menunggu_dokumen"
      | "dokumen_lengkap"
      | "spb_dikirim"
      | "proses_pencairan"
      | "selesai";
    syaratDokumen: SyaratDokumen[];
    buktiBayar?: BuktiBayar;
    color?: string;
  }

  // API call
  const { data: pencairanData, refresh } = await useFetch<{
    data: PencairanItem[];
  }>("/api/ppk/pencairan");

  // State
  const searchQuery = ref("");
  const filterStatus = ref("");
  const showModal = ref(false);
  const selected = ref<PencairanItem | null>(null);
  const activeTab = ref<"dokumen" | "spb" | "bukti">("dokumen");
  const catatanKembalikan = ref("");
  const catatanSPB = ref("");
  const buktiFile = ref<File | null>(null);
  const loadingAction = ref(false);

  // Tabs definition
  const tabs = [
    {
      key: "dokumen" as const,
      label: "Dokumen Syarat",
      icon: "heroicons:folder-open",
    },
    { key: "spb" as const, label: "SPB", icon: "heroicons:document-arrow-up" },
    {
      key: "bukti" as const,
      label: "Bukti Transfer",
      icon: "heroicons:receipt-percent",
    },
  ];

  // Helpers
  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pencairanList = computed(() => pencairanData.value?.data || []);
  const countByStatus = (status: string) =>
    pencairanList.value.filter((p) => p.statusPencairan === status).length;

  const filteredList = computed(() => {
    return pencairanList.value.filter((item) => {
      const q = searchQuery.value.toLowerCase();
      const matchSearch =
        !q ||
        item.namaKegiatan.toLowerCase().includes(q) ||
        item.namaOrmawa.toLowerCase().includes(q);
      const matchStatus =
        !filterStatus.value || item.statusPencairan === filterStatus.value;
      return matchSearch && matchStatus;
    });
  });

  const allDocsComplete = computed(
    () => selected.value?.syaratDokumen?.every((d) => d.uploaded) ?? false,
  );

  const docPct = (item: PencairanItem) => {
    if (!item.syaratDokumen?.length) return 0;
    return Math.round(
      (item.syaratDokumen.filter((d) => d.uploaded).length /
        item.syaratDokumen.length) *
        100,
    );
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      menunggu_dokumen: "yellow",
      dokumen_lengkap: "blue",
      spb_dikirim: "purple",
      proses_pencairan: "orange",
      selesai: "mint",
    };
    return map[s] || "blue";
  };

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      menunggu_dokumen: "Menunggu Dokumen",
      dokumen_lengkap: "Dokumen Lengkap",
      spb_dikirim: "SPB Dikirim",
      proses_pencairan: "Proses Pencairan",
      selesai: "Selesai",
    };
    return map[s] || s;
  };

  // Modal actions
  const openDetail = (item: PencairanItem) => {
    selected.value = item;
    activeTab.value = "dokumen";
    catatanKembalikan.value = "";
    catatanSPB.value = "";
    buktiFile.value = null;
    showModal.value = true;
  };
  const closeModal = () => {
    showModal.value = false;
    selected.value = null;
  };

  const handleKembalikan = async () => {
    if (!selected.value) return;
    loadingAction.value = true;
    try {
      await $fetch(`/api/ppk/pencairan/${selected.value.id}/kembalikan`, {
        method: "POST",
        body: { catatan: catatanKembalikan.value },
      });
      selected.value.statusPencairan = "menunggu_dokumen";
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      loadingAction.value = false;
    }
  };

  const handleKirimSPB = async () => {
    if (!selected.value) return;
    loadingAction.value = true;
    try {
      await $fetch(`/api/ppk/pencairan/${selected.value.id}/spb`, {
        method: "POST",
        body: { catatan: catatanSPB.value },
      });
      selected.value.statusPencairan = "spb_dikirim";
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      loadingAction.value = false;
    }
  };

  const handleProsesPencairan = async () => {
    if (!selected.value) return;
    loadingAction.value = true;
    try {
      await $fetch(`/api/ppk/pencairan/${selected.value.id}/proses`, {
        method: "POST",
      });
      selected.value.statusPencairan = "proses_pencairan";
      activeTab.value = "bukti";
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      loadingAction.value = false;
    }
  };

  const onBuktiSelected = (e: Event) => {
    const target = e.target as HTMLInputElement;
    buktiFile.value = target.files?.[0] || null;
  };

  const handleKirimBukti = async () => {
    if (!selected.value || !buktiFile.value) return;
    loadingAction.value = true;
    try {
      const form = new FormData();
      form.append("bukti", buktiFile.value);
      await $fetch(`/api/ppk/pencairan/${selected.value.id}/bukti`, {
        method: "POST",
        body: form,
      });
      selected.value.statusPencairan = "selesai";
      await refresh();
      closeModal();
    } catch (e) {
      console.error(e);
    } finally {
      loadingAction.value = false;
    }
  };

  // Format helpers
  const formatRp = (n?: number) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(n || 0);
  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";
</script>

<style scoped>
  /* Custom scrollbar untuk modal (opsional, sama seperti dokumen pertama) */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
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
