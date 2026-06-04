<template>
  <div class="min-h-screen bg-slate-50 font-sans">
    <header class="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4">
      <div class="flex items-center justify-between gap-4">
        <button
          @click="$router.back()"
          class="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition font-medium"
        >
          <Icon name="heroicons:arrow-left" class="w-4 h-4" /> Kembali
        </button>
        <div class="bg-[#d1a82a] text-white text-xs font-bold px-4 py-2 rounded-full">
          {{ todayStr }}
        </div>
      </div>
    </header>

    <div v-if="pending" class="flex items-center justify-center py-32">
      <div class="flex flex-col items-center gap-3 text-slate-400">
        <div class="w-8 h-8 border-2 border-slate-200 border-t-[#3b5988] rounded-full animate-spin"></div>
        <p class="text-sm">Memuat detail pencairan...</p>
      </div>
    </div>

    <div v-else-if="!detail" class="flex items-center justify-center py-32 text-slate-400">
      <div class="text-center max-w-md px-4">
        <Icon name="heroicons:exclamation-circle" class="w-12 h-12 mx-auto mb-2 text-red-300" />
        <p class="font-medium text-slate-700">Detail pencairan tidak ditemukan</p>
        <p v-if="loadError" class="text-xs text-red-500 mt-2">{{ loadError }}</p>
        <p v-else class="text-xs text-slate-500 mt-2">Pastikan data upload barang/jasa sudah ada.</p>
        <button @click="$router.back()" class="mt-4 px-4 py-2 bg-slate-200 rounded-xl text-sm hover:bg-slate-300 transition">
          Kembali
        </button>
      </div>
    </div>

    <!-- Halaman ringkasan kegiatan: daftar upload barang/jasa -->
    <main v-else-if="isGroupView" class="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="font-bold text-slate-800 text-xl">{{ detail.kegiatan?.judulKegiatan }}</h2>
            <p class="text-sm text-slate-500 mt-1">{{ detail.ormawa?.nama }} · {{ detail.ormawa?.kode }}</p>
          </div>
          <span class="inline-flex text-xs font-semibold px-3 py-1 rounded-full" :class="statusClass(detail.statusTagihan)">
            {{ statusLabel(detail.statusTagihan) }}
          </span>
        </div>
        <p class="text-sm text-slate-600 mt-4">
          Pilih jenis pengajuan (barang/jasa) di bawah untuk meninjau kelengkapan persyaratan per upload.
        </p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800">Daftar Upload Barang & Jasa</h3>
          <span class="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
            {{ detail.rincianPengajuan?.length || 0 }} item
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left py-3 px-4 font-semibold text-slate-500">Jenis</th>
                <th class="text-left py-3 px-4 font-semibold text-slate-500">Penerima / Penyedia</th>
                <th class="text-left py-3 px-4 font-semibold text-slate-500">Rekening</th>
                <th class="text-center py-3 px-4 font-semibold text-slate-500">Status</th>
                <th class="text-center py-3 px-4 font-semibold text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in detail.rincianPengajuan || []"
                :key="item.dokumentasiId"
                class="border-b border-slate-100 hover:bg-slate-50"
              >
                <td class="py-3 px-4">
                  <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold" :class="typeClass(item.tipeTagihan)">
                    {{ item.tipeTagihan }}
                  </span>
                </td>
                <td class="py-3 px-4 font-medium text-slate-800">{{ item.namaPenerima || "-" }}</td>
                <td class="py-3 px-4 text-slate-600">{{ item.rekeningPenerima || "-" }}</td>
                <td class="py-3 px-4 text-center">
                  <span class="inline-flex text-xs font-semibold px-2 py-1 rounded-full" :class="statusClass(item.statusTagihan)">
                    {{ statusLabel(item.statusTagihan) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center">
                  <!-- encode dokumentasiId jadi "v{n}" agar aman di URL -->
                  <button
                    @click="goItemDetail(item.dokumentasiId)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3b5988] text-white hover:bg-[#2d4570] text-xs font-semibold transition"
                  >
                    <Icon name="heroicons:eye" class="w-4 h-4" /> Detail
                  </button>
                </td>
              </tr>
              <tr v-if="!detail.rincianPengajuan?.length">
                <td colspan="5" class="py-8 text-center text-slate-400 text-sm">Belum ada data upload barang/jasa.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Halaman detail per barang/jasa -->
    <main v-else class="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section class="lg:col-span-2 space-y-6">

        <!-- Info -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#3b5988]/5 to-transparent">
            <div class="w-10 h-10 rounded-xl bg-[#3b5988] text-white flex items-center justify-center">
              <Icon :name="detail.tipeTagihan === 'BARANG' ? 'heroicons:shopping-bag' : 'heroicons:user-group'" class="w-5 h-5" />
            </div>
            <div>
              <h2 class="font-bold text-slate-800 text-lg">{{ detail.kegiatan?.judulKegiatan }}</h2>
              <p class="text-xs text-slate-500">{{ detail.ormawa?.nama }} · {{ detail.tipeTagihan }}</p>
            </div>
            <span class="ml-auto inline-flex text-xs font-semibold px-3 py-1 rounded-full" :class="statusClass(detail.statusTagihan)">
              {{ statusLabel(detail.statusTagihan) }}
            </span>
          </div>
          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p class="text-xs font-semibold uppercase text-slate-400 mb-1">Jenis</p>
              <p class="font-medium text-slate-800">{{ detail.tipeTagihan }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase text-slate-400 mb-1">Nama Penerima</p>
              <p class="font-medium text-slate-800">{{ detail.namaPenerima || "-" }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase text-slate-400 mb-1">Nomor Rekening</p>
              <p class="font-medium text-slate-800">{{ detail.rekeningPenerima || "-" }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase text-slate-400 mb-1">
                {{ detail.tipeTagihan === "BARANG" ? "Nama Toko" : "Nama Penyedia Jasa" }}
              </p>
              <p class="font-medium text-slate-800">
                {{ detail.tipeTagihan === "BARANG"
                  ? detail.detailPenerima?.namaToko || "-"
                  : detail.detailPenerima?.namaPenyediaJasa || "-" }}
              </p>
            </div>
            <div class="sm:col-span-2">
              <p class="text-xs font-semibold uppercase text-slate-400 mb-1">Deskripsi</p>
              <p class="text-sm text-slate-700">{{ detail.deskripsi || "-" }}</p>
            </div>
          </div>
        </div>

        <!-- Persyaratan dari Ormawa -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <Icon name="heroicons:folder-open" class="w-5 h-5 text-[#d1a82a]" />
              Persyaratan dari Ormawa
            </h3>
            <p class="text-xs text-slate-500 mt-1">Periksa kelengkapan dokumen yang diunggah ormawa</p>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="doc in detail.dokumenUpload || []"
              :key="doc.id"
              class="border rounded-xl overflow-hidden"
              :class="doc.uploaded ? 'border-slate-200' : 'border-red-200 bg-red-50/30'"
            >
              <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <Icon :name="doc.uploaded ? 'heroicons:check-circle' : 'heroicons:x-circle'" class="w-5 h-5" :class="doc.uploaded ? 'text-emerald-600' : 'text-red-400'" />
                  <p class="font-semibold text-slate-800 text-sm">{{ doc.nama }}</p>
                </div>
                <a v-if="doc.uploaded && doc.url" :href="doc.url.startsWith('/') ? doc.url : '/' + doc.url" target="_blank" class="text-xs font-semibold text-[#3b5988] hover:underline">Lihat</a>
              </div>
              <div class="aspect-video bg-slate-100 flex items-center justify-center">
                <img v-if="doc.uploaded && doc.url && isImage(doc.url)" :src="doc.url.startsWith('/') ? doc.url : '/' + doc.url" :alt="doc.nama" class="w-full h-full object-contain" />
                <p v-else class="text-xs text-slate-400 px-4 text-center">
                  {{ doc.uploaded ? "Buka lewat tombol Lihat" : "Belum diunggah" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Dokumen PPK -->
        <div
          v-if="detail.dokumenPpk"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-800">Dokumen PPK (SPB & Kwitansi)</h3>
          </div>
          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="doc in [detail.dokumenPpk.spb, detail.dokumenPpk.kwitansi]"
              :key="doc.nama"
              class="border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <Icon :name="doc.uploaded ? 'heroicons:check-circle' : 'heroicons:x-circle'" class="w-5 h-5" :class="doc.uploaded ? 'text-emerald-600' : 'text-red-400'" />
                <span class="text-sm font-medium text-slate-700">{{ doc.nama }}</span>
              </div>
              <a v-if="doc.uploaded && doc.url" :href="doc.url" target="_blank" class="text-xs font-semibold text-[#3b5988]">Lihat</a>
              <span v-else class="text-xs text-slate-400">Belum ada</span>
            </div>
          </div>
        </div>

        <!-- Bukti Transfer -->
        <div v-if="detail.pembayaran?.buktiTransferUrl" class="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
            <h3 class="font-bold text-emerald-800">Bukti Transfer ke Ormawa</h3>
          </div>
          <div class="p-6">
            <a :href="detail.pembayaran.buktiTransferUrl" target="_blank" class="text-sm font-semibold text-[#3b5988] hover:underline">
              Lihat bukti transfer
            </a>
            <p v-if="detail.pembayaran.catatan" class="text-sm text-slate-600 mt-2">{{ detail.pembayaran.catatan }}</p>
          </div>
        </div>

        <!-- Riwayat Catatan -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100">
            <h3 class="font-bold text-slate-800">Riwayat Catatan Revisi</h3>
          </div>
          <div class="p-6">
            <div v-if="detail.riwayat?.length" class="space-y-4">
              <div v-for="log in detail.riwayat" :key="log.id" class="flex gap-3">
                <div class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:chat-bubble-left-right" class="w-4 h-4" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-800">Catatan dari PPK</p>
                  <p class="text-xs text-slate-500">{{ log.aktor?.nama || "PPK" }} · {{ formatDateTime(log.createdAt) }}</p>
                  <p v-if="log.catatan" class="mt-2 text-sm text-orange-800 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">{{ log.catatan }}</p>
                  <button
                    v-if="hasPencairanCompare(log)"
                    @click="openPencairanCompare(log)"
                    class="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#3b5988] hover:underline"
                  >
                    <Icon name="heroicons:arrows-right-left" class="w-4 h-4" />
                    Compare berkas pencairan
                  </button>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-slate-400 text-center py-4">Belum ada catatan revisi.</p>
          </div>
        </div>

      </section>

      <aside class="space-y-6">

        <!-- Ringkasan -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 class="font-bold text-slate-800 mb-3">Ringkasan Kelengkapan</h3>
          <div class="bg-[#3b5988] rounded-xl p-4 text-white mb-4">
            <p class="text-xs opacity-70">Dokumen Ormawa</p>
            <p class="text-xl font-bold">{{ uploadedDocs }}/{{ totalDocs }}</p>
          </div>
          <div class="space-y-2">
            <div v-for="doc in detail.dokumenUpload || []" :key="doc.id" class="flex items-center justify-between text-sm">
              <span class="text-slate-600">{{ doc.nama }}</span>
              <Icon :name="doc.uploaded ? 'heroicons:check-circle' : 'heroicons:x-circle'" class="w-5 h-5" :class="doc.uploaded ? 'text-emerald-600' : 'text-red-400'" />
            </div>
          </div>
        </div>

        <!-- Langkah 1: Verifikasi dokumen ormawa -->
        <div
          v-if="['WAITING_PEMBAYARAN', 'DIKEMBALIKAN'].includes(detail.statusTagihan)"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
        >
          <h3 class="font-bold text-slate-800">Langkah 1 — Verifikasi Ormawa</h3>
          <p class="text-xs text-slate-500">Pastikan semua persyaratan barang/jasa sudah benar dan lengkap.</p>
          <div v-if="!allDocsUploaded" class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Masih ada dokumen yang belum lengkap. Gunakan form revisi di bawah.
          </div>
          <button
            @click="submitVerifikasi"
            :disabled="loadingAction || !allDocsUploaded"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition"
          >
            <Icon name="heroicons:check-circle" class="w-5 h-5" />
            Dokumen Ormawa Lengkap
          </button>
        </div>

        <!-- Langkah 2: Upload SPB & Kwitansi -->
        <div
          v-if="detail.statusTagihan === 'DOKUMEN_LENGKAP' || (detail.statusTagihan === 'TERVERIFIKASI' && !spbKwitansiLengkap)"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
        >
          <h3 class="font-bold text-slate-800">Langkah 2 — SPB & Kwitansi</h3>
          <p class="text-xs text-slate-500">Kirim Surat Perintah Bayar dan kwitansi ke ormawa sebelum melakukan transfer.</p>
          <div>
            <label class="text-sm font-semibold text-slate-700 block mb-1">Surat Perintah Bayar</label>
            <input type="file" accept=".pdf,image/jpeg,image/png" @change="onSpbChange" class="w-full border border-slate-300 rounded-xl p-2 text-sm" />
          </div>
          <div>
            <label class="text-sm font-semibold text-slate-700 block mb-1">Kwitansi</label>
            <input type="file" accept=".pdf,image/jpeg,image/png" @change="onKwitansiChange" class="w-full border border-slate-300 rounded-xl p-2 text-sm" />
          </div>
          <button
            @click="submitDokumenPpk"
            :disabled="loadingAction || (!spbFile && !kwitansiFile)"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#d1a82a] hover:bg-[#b89224] disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition"
          >
            <Icon name="heroicons:document-arrow-up" class="w-5 h-5" />
            Simpan SPB & Kwitansi
          </button>
        </div>

        <!-- Langkah 3: Konfirmasi transfer -->
        <div
          v-if="detail.statusTagihan === 'TERVERIFIKASI' && spbKwitansiLengkap"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
        >
          <h3 class="font-bold text-slate-800">Langkah 3 — Transfer Dana</h3>
          <p class="text-xs text-slate-500">
            SPB dan kwitansi sudah dikirim ke ormawa. Lakukan transfer ke rekening
            <strong>{{ detail.rekeningPenerima }}</strong> ({{ detail.namaPenerima }}), lalu konfirmasi di sini.
          </p>
          <button
            @click="submitTransfer"
            :disabled="loadingAction"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#3b5988] hover:bg-[#2d4570] disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition"
          >
            <Icon name="heroicons:banknotes" class="w-5 h-5" />
            Konfirmasi Sudah Transfer
          </button>
        </div>

        <!-- Langkah 4: Bukti pembayaran ke ormawa -->
        <div
          v-if="detail.statusTagihan === 'TRANSFER_DILAKUKAN'"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
        >
          <h3 class="font-bold text-slate-800">Langkah 4 — Bukti Pembayaran</h3>
          <p class="text-xs text-slate-500">Unggah bukti transfer agar ormawa dapat melihat bukti pembayaran.</p>
          <input type="file" accept=".pdf,image/jpeg,image/png" @change="handleBuktiTransferChange" class="w-full border border-slate-300 rounded-xl p-2 text-sm" />
          <textarea
            v-model="catatanPembayaran"
            rows="3"
            class="w-full border border-slate-300 rounded-xl p-3 text-sm resize-none"
            placeholder="Catatan pembayaran (opsional)"
          ></textarea>
          <button
            @click="submitPembayaran"
            :disabled="loadingAction || !buktiTransferFile"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition"
          >
            <Icon name="heroicons:document-arrow-up" class="w-5 h-5" />
            Kirim Bukti ke Ormawa
          </button>
        </div>

        <!-- Selesai -->
        <div v-if="detail.statusTagihan === 'SELESAI'" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <p class="text-sm font-semibold text-emerald-800">Pencairan selesai</p>
          <p class="text-xs text-emerald-700 mt-1">Bukti transfer telah dikirim dan dapat dilihat ormawa.</p>
        </div>

        <!-- Revisi -->
        <div
          v-if="detail.statusTagihan !== 'SELESAI'"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
        >
          <h3 class="font-bold text-slate-800">Minta Revisi ke Ormawa</h3>
          <textarea
            v-model="catatan"
            rows="4"
            class="w-full border border-slate-300 rounded-xl p-3 text-sm resize-none"
            placeholder="Contoh: Mohon lengkapi foto struk dan unggah ulang SK yang lebih jelas."
          ></textarea>
          <button
            @click="submitRevisi"
            :disabled="loadingAction || !catatan.trim()"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition"
          >
            <Icon name="heroicons:paper-airplane" class="w-5 h-5" />
            Kirim Catatan Revisi
          </button>
        </div>

        <p v-if="successMsg" class="text-center text-xs text-emerald-600 font-semibold px-2">{{ successMsg }}</p>
        <p v-if="errorMsg" class="text-center text-xs text-red-500 px-2">{{ errorMsg }}</p>

      </aside>
    </main>

    <div
      v-if="compareOpen"
      class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center"
    >
      <div class="w-full max-w-6xl h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h3 class="font-bold text-slate-900">Compare Berkas Pencairan</h3>
            <p class="text-xs text-slate-500">Snapshot sebelum dan setelah revisi.</p>
          </div>
          <button
            @click="closePencairanCompare"
            class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-auto">
          <div class="border-b lg:border-b-0 lg:border-r border-slate-200 min-h-0">
            <div class="sticky top-0 px-4 py-2 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700">Sebelum Revisi</div>
            <div class="p-4 grid gap-4">
              <div v-for="doc in compareBeforeDocs" :key="doc.id" class="border border-slate-200 rounded-xl overflow-hidden">
                <div class="px-3 py-2 border-b border-slate-100 text-sm font-semibold text-slate-700">{{ doc.nama }}</div>
                <img v-if="isImage(doc.url)" :src="docUrl(doc.url)" :alt="doc.nama" class="w-full max-h-[320px] object-contain bg-slate-50" />
                <iframe v-else-if="doc.url" :src="docUrl(doc.url)" class="w-full h-[320px]" frameborder="0"></iframe>
                <div v-else class="h-32 flex items-center justify-center text-sm text-slate-400">Belum ada file.</div>
              </div>
            </div>
          </div>
          <div class="min-h-0">
            <div class="sticky top-0 px-4 py-2 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-700">Sesudah Revisi</div>
            <div class="p-4 grid gap-4">
              <div v-for="doc in compareAfterDocs" :key="doc.id" class="border border-slate-200 rounded-xl overflow-hidden">
                <div class="px-3 py-2 border-b border-slate-100 text-sm font-semibold text-slate-700">{{ doc.nama }}</div>
                <img v-if="isImage(doc.url)" :src="docUrl(doc.url)" :alt="doc.nama" class="w-full max-h-[320px] object-contain bg-slate-50" />
                <iframe v-else-if="doc.url" :src="docUrl(doc.url)" class="w-full h-[320px]" frameborder="0"></iframe>
                <div v-else class="h-32 flex items-center justify-center text-sm text-slate-400">Belum ada file.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const GROUP_OFFSET = 1_000_000;

// ✅ FIX: decode urlId dari string aman ke angka yang dipakai API
// "v5"    → -5        (dokumentasi virtual)
// "g3"    → -1000003  (group dokumentasi)
// "5"     → 5         (tagihan positif)
const decodeUrlId = (param: string): number => {
  if (param.startsWith("g")) return -(GROUP_OFFSET + Number(param.slice(1)));
  if (param.startsWith("v")) return -Number(param.slice(1));
  return Number(param);
};

const rawParam = String(route.params.id);
const id = decodeUrlId(rawParam);

// ✅ FIX: useFetch pakai id langsung (bukan computed), karena halaman ini tidak
// berganti id tanpa navigasi ulang
// Pakai rawParam (v5, g1) agar URL API tidak memakai angka negatif yang error di path
const apiPathId = rawParam;

const { data, pending, refresh, error: fetchError } = await useFetch<{ data: any }>(
  () => `/api/ppk/pencairan/${apiPathId}`,
);

const detail = computed(() => data.value?.data || null);
const isGroupView = computed(() => id <= -GROUP_OFFSET);
const loadError = computed(
  () => (fetchError.value as any)?.data?.statusMessage || (fetchError.value as any)?.message || null,
);

const catatan = ref("");
const catatanPembayaran = ref("");
const buktiTransferFile = ref<File | null>(null);
const spbFile = ref<File | null>(null);
const kwitansiFile = ref<File | null>(null);
const loadingAction = ref(false);
const successMsg = ref("");
const errorMsg = ref("");
const compareOpen = ref(false);
const compareBeforeDocs = ref<any[]>([]);
const compareAfterDocs = ref<any[]>([]);

const todayStr = new Date().toLocaleDateString("id-ID", {
  day: "numeric", month: "long", year: "numeric",
});

const totalDocs = computed(() => detail.value?.dokumenUpload?.length || 0);
const uploadedDocs = computed(() =>
  (detail.value?.dokumenUpload || []).filter((doc: any) => doc.uploaded).length,
);
const allDocsUploaded = computed(
  () => detail.value?.allDocsUploaded ?? (totalDocs.value > 0 && uploadedDocs.value === totalDocs.value),
);
const spbKwitansiLengkap = computed(
  () => detail.value?.dokumenPpk?.spb?.uploaded && detail.value?.dokumenPpk?.kwitansi?.uploaded,
);

const clearMessages = () => {
  successMsg.value = "";
  errorMsg.value = "";
};

// ✅ FIX: encode dokumentasiId ke urlId yang aman lalu navigasi
// dokumentasiId dari rincianPengajuan adalah angka positif (id dari tabel dokumentasi_kegiatan)
// perlu di-encode ke "v{n}" agar tidak jadi path negatif di URL
const encodeUrlId = (numId: number): string => {
  if (numId <= -GROUP_OFFSET) return `g${Math.abs(numId) - GROUP_OFFSET}`;
  if (numId < 0) return `v${Math.abs(numId)}`;
  return String(numId);
};

const goItemDetail = (dokumentasiId: number) => {
  // dokumentasiId positif dari DB → perlu jadi id negatif (virtual) untuk API
  const apiId = -Math.abs(dokumentasiId);
  const urlId = encodeUrlId(apiId);
  navigateTo(`/dashboard/ppk/detailPencairan/${urlId}`);
};

const submitRevisi = async () => {
  if (!catatan.value.trim()) return;
  loadingAction.value = true;
  clearMessages();
  try {
    await $fetch(`/api/ppk/pencairan/${apiPathId}/kembalikan`, {
      method: "POST",
      body: { catatan: catatan.value },
    });
    successMsg.value = "Catatan revisi berhasil dikirim ke ormawa.";
    catatan.value = "";
    await refresh();
  } catch (error: any) {
    errorMsg.value = error?.data?.statusMessage || "Gagal mengirim catatan revisi.";
  } finally {
    loadingAction.value = false;
  }
};

const submitVerifikasi = async () => {
  if (!allDocsUploaded.value) return;
  loadingAction.value = true;
  clearMessages();
  try {
    await $fetch(`/api/ppk/pencairan/${apiPathId}/verifikasi`, {
      method: "POST",
      body: { keputusan: "terverifikasi" },
    });
    successMsg.value = "Dokumen ormawa lengkap. Unggah SPB dan kwitansi.";
    await refresh();
  } catch (error: any) {
    errorMsg.value = error?.data?.statusMessage || "Gagal memverifikasi dokumen.";
  } finally {
    loadingAction.value = false;
  }
};

const onSpbChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  spbFile.value = input.files?.[0] || null;
};

const onKwitansiChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  kwitansiFile.value = input.files?.[0] || null;
};

const submitDokumenPpk = async () => {
  if (!spbFile.value && !kwitansiFile.value) return;
  loadingAction.value = true;
  clearMessages();
  try {
    const formData = new FormData();
    if (spbFile.value) formData.append("surat_perintah_bayar", spbFile.value);
    if (kwitansiFile.value) formData.append("kwitansi", kwitansiFile.value);
    await $fetch(`/api/ppk/pencairan/${apiPathId}/dokumen-ppk`, {
      method: "POST",
      body: formData,
    });
    successMsg.value = "SPB dan kwitansi berhasil disimpan.";
    spbFile.value = null;
    kwitansiFile.value = null;
    await refresh();
  } catch (error: any) {
    errorMsg.value = error?.data?.statusMessage || "Gagal menyimpan dokumen PPK.";
  } finally {
    loadingAction.value = false;
  }
};

const handleBuktiTransferChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  buktiTransferFile.value = input.files?.[0] || null;
};

const submitTransfer = async () => {
  loadingAction.value = true;
  clearMessages();
  try {
    await $fetch(`/api/ppk/pencairan/${apiPathId}/transfer`, { method: "POST" });
    successMsg.value = "Transfer dicatat. Unggah bukti pembayaran untuk ormawa.";
    await refresh();
  } catch (error: any) {
    errorMsg.value = error?.data?.statusMessage || "Gagal mencatat transfer.";
  } finally {
    loadingAction.value = false;
  }
};

const submitPembayaran = async () => {
  if (!buktiTransferFile.value) return;
  loadingAction.value = true;
  clearMessages();
  try {
    const formData = new FormData();
    formData.append("bukti_transfer", buktiTransferFile.value);
    formData.append("catatan", catatanPembayaran.value);
    await $fetch(`/api/ppk/pencairan/${apiPathId}/bayar`, {
      method: "POST",
      body: formData,
    });
    successMsg.value = "Bukti pembayaran berhasil dikirim ke ormawa. Pencairan selesai.";
    buktiTransferFile.value = null;
    catatanPembayaran.value = "";
    await refresh();
  } catch (error: any) {
    errorMsg.value = error?.data?.statusMessage || "Gagal menyimpan bukti transfer.";
  } finally {
    loadingAction.value = false;
  }
};

const isImage = (url?: string) => /\.(png|jpe?g|gif|webp)$/i.test(url || "");
const docUrl = (url?: string | null) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith("/") ? url : `/${url}`;
};

const hasPencairanCompare = (log: any) =>
  Boolean(log?.oldData?.dokumenUpload?.length || log?.newData?.dokumenUpload?.length);

const openPencairanCompare = (log: any) => {
  compareBeforeDocs.value = log?.oldData?.dokumenUpload || [];
  compareAfterDocs.value = log?.newData?.dokumenUpload || [];
  compareOpen.value = true;
};

const closePencairanCompare = () => {
  compareOpen.value = false;
  compareBeforeDocs.value = [];
  compareAfterDocs.value = [];
};

const typeClass = (type: string) =>
  type === "BARANG" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700";

const statusClass = (status?: string) => {
  const map: Record<string, string> = {
    WAITING_PEMBAYARAN: "bg-amber-100 text-amber-700",
    DOKUMEN_LENGKAP: "bg-sky-100 text-sky-700",
    TERVERIFIKASI: "bg-blue-100 text-blue-700",
    TRANSFER_DILAKUKAN: "bg-indigo-100 text-indigo-700",
    DIKEMBALIKAN: "bg-orange-100 text-orange-700",
    SELESAI: "bg-emerald-100 text-emerald-700",
  };
  return map[status || ""] || "bg-slate-100 text-slate-600";
};

const statusLabel = (status?: string) => {
  const map: Record<string, string> = {
    WAITING_PEMBAYARAN: "Menunggu Verifikasi",
    DOKUMEN_LENGKAP: "Menunggu SPB & Kwitansi",
    TERVERIFIKASI: "Siap Transfer",
    TRANSFER_DILAKUKAN: "Menunggu Bukti",
    DIKEMBALIKAN: "Perlu Revisi",
    SELESAI: "Selesai",
  };
  return map[status || ""] || status || "-";
};

const formatDateTime = (date?: string) =>
  date ? new Date(date).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }) : "-";
</script>
