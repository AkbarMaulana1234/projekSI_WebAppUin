<template>
  <div class="pengajuan-page">

    <!-- Page Header -->
    <div class="ph">
      <div class="ph__left">
        <div class="ph__icon"><Icon name="heroicons:document-check" class="w-6 h-6"/></div>
        <div>
          <h1 class="ph__title">Pengajuan Kegiatan</h1>
          <p class="ph__sub">Verifikasi proposal kegiatan ormawa se-fakultas</p>
        </div>
      </div>
      <!-- Filter & Search -->
      <div class="ph__actions">
        <div class="search-wrap">
          <Icon name="heroicons:magnifying-glass" class="search-icon w-4 h-4"/>
          <input v-model="searchQuery" class="search-input" placeholder="Cari kegiatan..."/>
        </div>
        <select v-model="filterStatus" class="filter-select">
          <option value="">Semua Status</option>
          <option value="menunggu">Menunggu</option>
          <option value="disetujui">Disetujui</option>
          <option value="revisi">Revisi</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="nav-tabs-ppk">
      <button class="nav-tab" :class="{ 'nav-tab--active': $route.path === '/dashboard/ppk' }" @click="$router.push('/dashboard/ppk')">
        <Icon name="heroicons:chart-bar-square" class="w-4 h-4"/>
        Dashboard
      </button>
      <button class="nav-tab" :class="{ 'nav-tab--active': $route.path === '/dashboard/ppk/pengajuan' }" @click="$router.push('/dashboard/ppk/pengajuan')">
        <Icon name="heroicons:document-check" class="w-4 h-4"/>
        Pengajuan
      </button>
      <button class="nav-tab" :class="{ 'nav-tab--active': $route.path === '/dashboard/ppk/pencairan' }" @click="$router.push('/dashboard/ppk/pencairan')">
        <Icon name="heroicons:banknotes" class="w-4 h-4"/>
        Pencairan
      </button>
    </div>

    <!-- Summary Chips -->
    <div class="chips">
      <div class="chip chip--blue">
        <Icon name="heroicons:document-text" class="w-4 h-4"/>
        <span>{{ totalKegiatan }} Total</span>
      </div>
      <div class="chip chip--amber">
        <Icon name="heroicons:clock" class="w-4 h-4"/>
        <span>{{ countByStatus('menunggu') }} Menunggu</span>
      </div>
      <div class="chip chip--green">
        <Icon name="heroicons:check-circle" class="w-4 h-4"/>
        <span>{{ countByStatus('disetujui') }} Disetujui</span>
      </div>
      <div class="chip chip--red">
        <Icon name="heroicons:x-circle" class="w-4 h-4"/>
        <span>{{ countByStatus('ditolak') }} Ditolak</span>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="tbl-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Kegiatan</th>
              <th>Ormawa</th>
              <th>Tanggal Pengajuan</th>
              <th class="text-right">Dana Diajukan</th>
              <th class="text-center">Status</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredList" :key="item.id">
              <td>
                <p class="tbl__name">{{ item.namaKegiatan }}</p>
                <p class="tbl__meta">{{ item.jenisKegiatan }}</p>
              </td>
              <td>
                <div class="tbl__ormawa">
                  <div class="tbl__avatar" :style="{ background: item.color }">{{ item.kodeOrmawa.charAt(0) }}</div>
                  <div>
                    <p class="tbl__oname">{{ item.namaOrmawa }}</p>
                    <p class="tbl__okode">{{ item.kodeOrmawa }}</p>
                  </div>
                </div>
              </td>
              <td class="tbl__date">{{ formatDate(item.tanggalPengajuan) }}</td>
              <td class="tbl__rp text-right">{{ formatRp(item.totalDana) }}</td>
              <td class="text-center">
                <span class="badge" :class="badgeClass(item.status)">{{ statusLabel(item.status) }}</span>
              </td>
              <td class="text-center">
                <button class="btn-detail" @click="openDetail(item)">
                  <Icon name="heroicons:eye" class="w-4 h-4"/>
                  Detail
                </button>
              </td>
            </tr>
            <tr v-if="filteredList.length === 0">
              <td colspan="6" class="tbl__empty">
                <Icon name="heroicons:document-magnifying-glass" class="w-10 h-10" style="color:#c5d3e8"/>
                <p>Tidak ada data kegiatan</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── MODAL DETAIL ── -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">

        <!-- Modal Header -->
        <div class="modal__header">
          <div class="modal__header-left">
            <div class="modal__icon"><Icon name="heroicons:document-check" class="w-5 h-5"/></div>
            <div>
              <h2 class="modal__title">{{ selected?.namaKegiatan }}</h2>
              <p class="modal__sub">{{ selected?.namaOrmawa }} · {{ selected?.kodeOrmawa }}</p>
            </div>
          </div>
          <button class="modal__close" @click="closeModal">
            <Icon name="heroicons:x-mark" class="w-5 h-5"/>
          </button>
        </div>

        <!-- Modal Tabs -->
        <div class="modal__tabs">
          <button
            v-for="tab in tabs" :key="tab.key"
            class="modal__tab"
            :class="{ 'modal__tab--active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <Icon :name="tab.icon" class="w-4 h-4"/>
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab: Info Kegiatan -->
        <div v-if="activeTab === 'info'" class="modal__body">
          <div class="info-grid">
            <div class="info-item">
              <p class="info-item__lbl">Nama Kegiatan</p>
              <p class="info-item__val">{{ selected?.namaKegiatan }}</p>
            </div>
            <div class="info-item">
              <p class="info-item__lbl">Jenis Kegiatan</p>
              <p class="info-item__val">{{ selected?.jenisKegiatan }}</p>
            </div>
            <div class="info-item">
              <p class="info-item__lbl">Tanggal Kegiatan</p>
              <p class="info-item__val">{{ formatDate(selected?.tanggalKegiatan) }}</p>
            </div>
            <div class="info-item">
              <p class="info-item__lbl">Lokasi</p>
              <p class="info-item__val">{{ selected?.lokasi }}</p>
            </div>
            <div class="info-item">
              <p class="info-item__lbl">Peserta</p>
              <p class="info-item__val">{{ selected?.jumlahPeserta }} orang</p>
            </div>
            <div class="info-item">
              <p class="info-item__lbl">Dana Diajukan</p>
              <p class="info-item__val info-item__val--blue">{{ formatRp(selected?.totalDana) }}</p>
            </div>
            <div class="info-item info-item--full">
              <p class="info-item__lbl">Deskripsi Kegiatan</p>
              <p class="info-item__val">{{ selected?.deskripsi }}</p>
            </div>
            <div class="info-item">
              <p class="info-item__lbl">Diajukan oleh</p>
              <p class="info-item__val">{{ selected?.pengaju }}</p>
            </div>
            <div class="info-item">
              <p class="info-item__lbl">Tanggal Pengajuan</p>
              <p class="info-item__val">{{ formatDate(selected?.tanggalPengajuan) }}</p>
            </div>
          </div>

          <!-- RAB Preview -->
          <div class="rab-section">
            <p class="rab-section__title">Rincian Anggaran Biaya (RAB)</p>
            <table class="rab-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Harga Satuan</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rab in (selected?.rabItems || [])" :key="rab.id">
                  <td>{{ rab.nama }}</td>
                  <td class="text-right">{{ rab.qty }}</td>
                  <td class="text-right">{{ formatRp(rab.harga) }}</td>
                  <td class="text-right font-semibold">{{ formatRp(rab.qty * rab.harga) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-right font-bold">Total</td>
                  <td class="text-right font-bold rab-total">{{ formatRp(selected?.totalDana) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Tab: Dokumen Proposal -->
        <div v-if="activeTab === 'dokumen'" class="modal__body">
          <div class="doc-list">
            <div v-for="doc in (selected?.dokumen || [])" :key="doc.id" class="doc-item">
              <div class="doc-item__icon">
                <Icon name="heroicons:document-text" class="w-6 h-6"/>
              </div>
              <div class="doc-item__info">
                <p class="doc-item__name">{{ doc.nama }}</p>
                <p class="doc-item__meta">{{ doc.tipe }} · {{ doc.ukuran }}</p>
              </div>
              <div class="doc-item__actions">
                <a :href="doc.url" target="_blank" class="btn-doc btn-doc--view">
                  <Icon name="heroicons:eye" class="w-4 h-4"/>
                  Lihat
                </a>
                <a :href="doc.url" download class="btn-doc btn-doc--dl">
                  <Icon name="heroicons:arrow-down-tray" class="w-4 h-4"/>
                  Unduh
                </a>
              </div>
            </div>
            <div v-if="!selected?.dokumen?.length" class="doc-empty">
              <Icon name="heroicons:folder-open" class="w-10 h-10" style="color:#c5d3e8"/>
              <p>Belum ada dokumen dilampirkan</p>
            </div>
          </div>
        </div>

        <!-- Tab: Keputusan -->
        <div v-if="activeTab === 'keputusan'" class="modal__body">
          <!-- Status Saat Ini -->
          <div class="current-status">
            <p class="current-status__lbl">Status Saat Ini</p>
            <span class="badge badge--lg" :class="badgeClass(selected?.status)">{{ statusLabel(selected?.status) }}</span>
          </div>

          <!-- Riwayat -->
          <div v-if="selected?.riwayat?.length" class="riwayat">
            <p class="riwayat__title">Riwayat Keputusan</p>
            <div v-for="rw in selected?.riwayat" :key="rw.id" class="riwayat__item">
              <div class="riwayat__dot" :class="'riwayat__dot--' + rw.status"/>
              <div class="riwayat__body">
                <p class="riwayat__action">{{ rw.keterangan }}</p>
                <p class="riwayat__by">{{ rw.oleh }} · {{ formatDate(rw.tanggal) }}</p>
              </div>
            </div>
          </div>

          <!-- Catatan PPK -->
          <div v-if="selected?.status === 'menunggu'" class="decision-form">
            <label class="decision-form__label">Catatan / Alasan (opsional)</label>
            <textarea
              v-model="catatanPPK"
              class="decision-form__textarea"
              rows="3"
              placeholder="Masukkan catatan atau alasan keputusan..."
            />
            <div class="decision-btns">
              <button class="btn-decision btn-decision--approve" @click="handleDecision('disetujui')" :disabled="loadingAction">
                <Icon name="heroicons:check-circle" class="w-5 h-5"/>
                Setujui — Teruskan ke SPI
              </button>
              <button class="btn-decision btn-decision--revisi" @click="handleDecision('revisi')" :disabled="loadingAction">
                <Icon name="heroicons:arrow-path" class="w-5 h-5"/>
                Minta Revisi
              </button>
              <button class="btn-decision btn-decision--tolak" @click="handleDecision('ditolak')" :disabled="loadingAction">
                <Icon name="heroicons:x-circle" class="w-5 h-5"/>
                Tolak
              </button>
            </div>
          </div>

          <!-- Sudah diputuskan -->
          <div v-else class="decided-notice">
            <Icon name="heroicons:information-circle" class="w-5 h-5"/>
            <span>Keputusan telah diberikan. Hubungi admin untuk perubahan.</span>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const { data: kegiatanData } = await useFetch('/api/ppk/kegiatan')

const searchQuery  = ref('')
const filterStatus = ref('')
const showModal    = ref(false)
const selected     = ref(null)
const activeTab    = ref('info')
const catatanPPK   = ref('')
const loadingAction = ref(false)

const tabs = [
  { key: 'info',      label: 'Info Kegiatan', icon: 'heroicons:information-circle' },
  { key: 'dokumen',   label: 'Dokumen',       icon: 'heroicons:document-text' },
  { key: 'keputusan', label: 'Keputusan',     icon: 'heroicons:scale' },
]

const kegiatanList = computed(() => kegiatanData.value?.data || [])
const totalKegiatan = computed(() => kegiatanList.value.length)
const countByStatus = (s) => kegiatanList.value.filter(k => k.status === s).length

const filteredList = computed(() => {
  return kegiatanList.value.filter(item => {
    const matchSearch = !searchQuery.value ||
      item.namaKegiatan.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.namaOrmawa.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

const openDetail = (item) => {
  selected.value = item
  activeTab.value = 'info'
  catatanPPK.value = ''
  showModal.value = true
}
const closeModal = () => { showModal.value = false; selected.value = null }

const handleDecision = async (keputusan) => {
  if (!selected.value) return
  loadingAction.value = true
  try {
    await $fetch(`/api/ppk/kegiatan/${selected.value.id}/keputusan`, {
      method: 'POST',
      body: { status: keputusan, catatan: catatanPPK.value }
    })
    selected.value.status = keputusan
    if (keputusan === 'disetujui') activeTab.value = 'keputusan'
    await refreshNuxtData()
  } catch (e) { console.error(e) }
  finally { loadingAction.value = false }
}

// Helpers
const colors = ['#3b5988','#c9a227','#16a34a','#7c3aed','#dc2626','#0891b2']
const colorMap = {}
let ci = 0

const formatRp   = n => 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0)
const formatDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '-'

const badgeClass  = s => ({
  'badge--green': s === 'disetujui',
  'badge--amber': s === 'menunggu' || s === 'revisi',
  'badge--red':   s === 'ditolak',
  'badge--blue':  s === 'dikirim_spi',
})
const statusLabel = s => ({
  menunggu: 'Menunggu', disetujui: 'Disetujui',
  revisi: 'Revisi', ditolak: 'Ditolak', dikirim_spi: 'Dikirim ke SPI',
}[s] || s)
</script>

<style scoped>
.pengajuan-page { padding:0; }

/* PAGE HEADER */
.ph { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:20px; }
.ph__left { display:flex;align-items:center;gap:14px; }
.ph__icon { width:48px;height:48px;border-radius:13px;background:linear-gradient(135deg,#085041,#1D9E75);color:#fff;display:flex;align-items:center;justify-content:center; }
.ph__title { font-size:20px;font-weight:700;color:var(--blue-900); }
.ph__sub   { font-size:12px;color:var(--blue-500);margin-top:3px; }
.ph__actions { display:flex;align-items:center;gap:10px;flex-wrap:wrap; }

.search-wrap { position:relative;display:flex;align-items:center; }
.search-icon { position:absolute;left:10px;color:#9db5d5; }
.search-input { padding:8px 12px 8px 32px;border-radius:10px;border:1.5px solid #e2eaf6;font-size:13px;font-family:inherit;color:var(--blue-900);width:200px;transition:border .15s; }
.search-input:focus { outline:none;border-color:var(--blue-500); }
.filter-select { padding:8px 30px 8px 12px;border-radius:10px;border:1.5px solid #e2eaf6;background:#fff;font-size:13px;font-family:inherit;color:var(--blue-900);cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234a6fa5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;background-size:15px; }
.filter-select:focus { outline:none;border-color:var(--blue-500); }

/* NAVIGATION TABS */
.nav-tabs-ppk { display:flex;gap:0;border-bottom:2px solid #e2eaf6;margin-bottom:20px; }
.nav-tab { display:flex;align-items:center;gap:6px;padding:12px 16px;font-size:13px;font-weight:600;color:#9db5d5;border-bottom:2px solid transparent;cursor:pointer;transition:all .2s;border:none;background:none;position:relative;bottom:-2px; }
.nav-tab:hover { color:var(--blue-600); }
.nav-tab--active { color:var(--blue-700);border-bottom-color:var(--blue-600); }

/* CHIPS */
.chips { display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px; }
.chip { display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600; }
.chip--blue  { background:var(--blue-50); color:var(--blue-700);border:1px solid var(--blue-100); }
.chip--amber { background:var(--gold-100);color:#92400e;border:1px solid var(--gold-200); }
.chip--green { background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0; }
.chip--red   { background:#fef2f2;color:#dc2626;border:1px solid #fecaca; }

/* CARD */
.card { background:#fff;border-radius:14px;border:1px solid #e2eaf6;overflow:hidden; }

/* TABLE */
.tbl-wrap { overflow-x:auto; }
.tbl { width:100%;border-collapse:collapse;font-size:13px; }
.tbl thead tr { background:#f8fafd; }
.tbl th { padding:11px 16px;text-align:left;font-size:10px;font-weight:700;color:#7c93b4;letter-spacing:.8px;text-transform:uppercase;border-bottom:1px solid #eef2f9;white-space:nowrap; }
.tbl td { padding:13px 16px;border-top:1px solid #f4f7fd;vertical-align:middle; }
.tbl tbody tr:hover { background:#fafcff; }
.tbl__name { font-size:13px;font-weight:600;color:var(--blue-900); }
.tbl__meta { font-size:11px;color:#9db5d5;margin-top:2px; }
.tbl__ormawa { display:flex;align-items:center;gap:9px; }
.tbl__avatar { width:30px;height:30px;border-radius:8px;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.tbl__oname { font-size:12px;font-weight:600;color:var(--blue-900); }
.tbl__okode { font-size:10px;color:#9db5d5; }
.tbl__date  { font-size:12px;color:#7c93b4;white-space:nowrap; }
.tbl__rp    { font-size:13px;font-weight:700;color:var(--blue-800);white-space:nowrap; }
.tbl__empty { padding:40px;text-align:center;color:#9db5d5;font-size:13px; }
.text-right  { text-align:right; }
.text-center { text-align:center; }
.font-semibold { font-weight:600; }
.font-bold { font-weight:700; }

/* BADGES */
.badge { display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700; }
.badge--lg  { font-size:13px;padding:5px 16px; }
.badge--green { background:#f0fdf4;color:#16a34a; }
.badge--amber { background:var(--gold-100);color:#92400e; }
.badge--red   { background:#fef2f2;color:#dc2626; }
.badge--blue  { background:var(--blue-50);color:var(--blue-700); }

/* DETAIL BUTTON */
.btn-detail { display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;border:1.5px solid #e2eaf6;background:#fff;font-size:12px;font-weight:600;color:var(--blue-700);cursor:pointer;transition:all .15s; }
.btn-detail:hover { background:var(--blue-50);border-color:var(--blue-400); }

/* ─── MODAL ─── */
.modal-backdrop { position:fixed;inset:0;background:rgba(10,20,50,.45);backdrop-filter:blur(4px);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px; }
.modal { background:#fff;border-radius:18px;width:100%;max-width:720px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(15,31,61,.22); }

.modal__header { display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #f0f4fb;flex-shrink:0;background:linear-gradient(135deg,var(--blue-50),#fff); }
.modal__header-left { display:flex;align-items:center;gap:14px; }
.modal__icon { width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,var(--blue-800),var(--blue-600));color:#fff;display:flex;align-items:center;justify-content:center; }
.modal__title { font-size:16px;font-weight:700;color:var(--blue-900); }
.modal__sub   { font-size:11px;color:#9db5d5;margin-top:2px; }
.modal__close { width:32px;height:32px;border-radius:8px;border:1px solid #e2eaf6;background:#fff;color:var(--blue-700);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s; }
.modal__close:hover { background:#f8fafd; }

.modal__tabs { display:flex;border-bottom:1px solid #f0f4fb;padding:0 24px;flex-shrink:0; }
.modal__tab { display:flex;align-items:center;gap:6px;padding:12px 16px;font-size:13px;font-weight:500;color:#9db5d5;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;background:none;border-top:none;border-left:none;border-right:none; }
.modal__tab:hover { color:var(--blue-600); }
.modal__tab--active { color:var(--blue-800);font-weight:700;border-bottom-color:var(--blue-700); }

.modal__body { flex:1;overflow-y:auto;padding:24px; }

/* INFO GRID */
.info-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px; }
.info-item { display:flex;flex-direction:column;gap:4px; }
.info-item--full { grid-column:1/-1; }
.info-item__lbl { font-size:10px;font-weight:700;color:#9db5d5;text-transform:uppercase;letter-spacing:.6px; }
.info-item__val { font-size:14px;font-weight:500;color:var(--blue-900); }
.info-item__val--blue { color:var(--blue-700);font-weight:700; }

/* RAB TABLE */
.rab-section { border:1px solid #e2eaf6;border-radius:12px;overflow:hidden; }
.rab-section__title { padding:12px 16px;font-size:12px;font-weight:700;color:var(--blue-900);background:#f8fafd;border-bottom:1px solid #e2eaf6; }
.rab-table { width:100%;border-collapse:collapse;font-size:13px; }
.rab-table th { padding:9px 14px;font-size:10px;font-weight:700;color:#7c93b4;letter-spacing:.6px;text-transform:uppercase;background:#f8fafd; }
.rab-table td { padding:10px 14px;border-top:1px solid #f4f7fd; }
.rab-table tfoot td { background:#f8fafd;border-top:2px solid #e2eaf6; }
.rab-total { color:var(--blue-800); }

/* DOC LIST */
.doc-list { display:flex;flex-direction:column;gap:10px; }
.doc-item { display:flex;align-items:center;gap:14px;padding:14px;border:1px solid #e2eaf6;border-radius:12px;transition:border .15s; }
.doc-item:hover { border-color:var(--blue-400); }
.doc-item__icon { width:44px;height:44px;border-radius:11px;background:var(--blue-50);color:var(--blue-600);display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.doc-item__info { flex:1; }
.doc-item__name { font-size:13px;font-weight:600;color:var(--blue-900); }
.doc-item__meta { font-size:11px;color:#9db5d5;margin-top:2px; }
.doc-item__actions { display:flex;gap:8px; }
.btn-doc { display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;transition:all .15s; }
.btn-doc--view { background:var(--blue-50);color:var(--blue-700);border:1px solid var(--blue-100); }
.btn-doc--view:hover { background:var(--blue-100); }
.btn-doc--dl   { background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0; }
.btn-doc--dl:hover { background:#dcfce7; }
.doc-empty { text-align:center;padding:40px;color:#9db5d5;font-size:13px;display:flex;flex-direction:column;align-items:center;gap:8px; }

/* KEPUTUSAN */
.current-status { display:flex;align-items:center;gap:12px;margin-bottom:20px;padding:16px;background:#f8fafd;border-radius:12px; }
.current-status__lbl { font-size:12px;font-weight:600;color:#9db5d5; }

.riwayat { margin-bottom:24px; }
.riwayat__title { font-size:12px;font-weight:700;color:#9db5d5;letter-spacing:.6px;text-transform:uppercase;margin-bottom:12px; }
.riwayat__item { display:flex;gap:12px;padding-bottom:14px;position:relative; }
.riwayat__item:not(:last-child)::before { content:'';position:absolute;left:6px;top:16px;bottom:0;width:1px;background:#e2eaf6; }
.riwayat__dot { width:14px;height:14px;border-radius:50%;flex-shrink:0;margin-top:3px; }
.riwayat__dot--disetujui { background:#16a34a; }
.riwayat__dot--revisi    { background:#d4b044; }
.riwayat__dot--ditolak   { background:#dc2626; }
.riwayat__dot--menunggu  { background:#e2eaf6; }
.riwayat__action { font-size:13px;font-weight:600;color:var(--blue-900); }
.riwayat__by     { font-size:11px;color:#9db5d5;margin-top:2px; }

.decision-form { background:#f8fafd;border-radius:12px;padding:18px; }
.decision-form__label { font-size:12px;font-weight:700;color:var(--blue-800);display:block;margin-bottom:8px; }
.decision-form__textarea { width:100%;padding:10px 12px;border-radius:9px;border:1.5px solid #e2eaf6;font-size:13px;font-family:inherit;color:var(--blue-900);resize:vertical;min-height:80px;margin-bottom:14px;transition:border .15s; }
.decision-form__textarea:focus { outline:none;border-color:var(--blue-500); }

.decision-btns { display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px; }
.btn-decision { display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;border-radius:10px;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:all .15s; }
.btn-decision:disabled { opacity:.6;cursor:not-allowed; }
.btn-decision--approve { background:linear-gradient(135deg,#15803d,#16a34a);color:#fff; }
.btn-decision--approve:hover:not(:disabled) { filter:brightness(1.08); }
.btn-decision--revisi  { background:var(--gold-100);color:#92400e;border:1.5px solid var(--gold-200); }
.btn-decision--revisi:hover:not(:disabled)  { background:var(--gold-200); }
.btn-decision--tolak   { background:#fef2f2;color:#dc2626;border:1.5px solid #fecaca; }
.btn-decision--tolak:hover:not(:disabled)   { background:#fee2e2; }

.decided-notice { display:flex;align-items:center;gap:8px;padding:14px;background:#f8fafd;border-radius:10px;font-size:13px;color:#9db5d5;border:1px solid #e2eaf6; }

/* RESPONSIVE */
@media (max-width:600px) {
  .info-grid { grid-template-columns:1fr; }
  .decision-btns { grid-template-columns:1fr; }
  .modal { max-height:100vh;border-radius:0; }
}
</style>