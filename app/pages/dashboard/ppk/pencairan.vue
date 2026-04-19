<template>
  <div class="pencairan-page">

    <!-- Page Header -->
    <div class="ph">
      <div class="ph__left">
        <div class="ph__icon"><Icon name="heroicons:banknotes" class="w-6 h-6"/></div>
        <div>
          <h1 class="ph__title">Pencairan Dana</h1>
          <p class="ph__sub">Verifikasi kelengkapan dokumen dan proses pencairan</p>
        </div>
      </div>
      <div class="ph__actions">
        <div class="search-wrap">
          <Icon name="heroicons:magnifying-glass" class="search-icon w-4 h-4"/>
          <input v-model="searchQuery" class="search-input" placeholder="Cari ormawa / kegiatan..."/>
        </div>
        <select v-model="filterStatus" class="filter-select">
          <option value="">Semua Status</option>
          <option value="menunggu_dokumen">Menunggu Dokumen</option>
          <option value="dokumen_lengkap">Dokumen Lengkap</option>
          <option value="spb_dikirim">SPB Dikirim</option>
          <option value="proses_pencairan">Proses Pencairan</option>
          <option value="selesai">Selesai</option>
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

    <!-- Chips -->
    <div class="chips">
      <div class="chip chip--amber">
        <Icon name="heroicons:clock" class="w-4 h-4"/>
        <span>{{ countByStatus('menunggu_dokumen') }} Menunggu Dokumen</span>
      </div>
      <div class="chip chip--blue">
        <Icon name="heroicons:document-check" class="w-4 h-4"/>
        <span>{{ countByStatus('dokumen_lengkap') }} Dokumen Lengkap</span>
      </div>
      <div class="chip chip--purple">
        <Icon name="heroicons:paper-airplane" class="w-4 h-4"/>
        <span>{{ countByStatus('spb_dikirim') }} SPB Dikirim</span>
      </div>
      <div class="chip chip--green">
        <Icon name="heroicons:check-circle" class="w-4 h-4"/>
        <span>{{ countByStatus('selesai') }} Selesai</span>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="pencairan-grid">
      <div v-for="item in filteredList" :key="item.id" class="pcr-card" @click="openDetail(item)">
        <!-- Card Header -->
        <div class="pcr-card__header">
          <div class="pcr-card__left">
            <div class="pcr-card__avatar" :style="{ background: item.color }">{{ item.kodeOrmawa.charAt(0) }}</div>
            <div>
              <p class="pcr-card__keg">{{ item.namaKegiatan }}</p>
              <p class="pcr-card__orm">{{ item.namaOrmawa }} · {{ item.kodeOrmawa }}</p>
            </div>
          </div>
          <span class="badge" :class="badgeClass(item.statusPencairan)">{{ statusLabel(item.statusPencairan) }}</span>
        </div>

        <!-- Dana Info -->
        <div class="pcr-card__dana">
          <div class="pcr-dana-item">
            <p class="pcr-dana-item__lbl">Dana Disetujui</p>
            <p class="pcr-dana-item__val">{{ formatRp(item.totalDana) }}</p>
          </div>
          <div class="pcr-dana-item">
            <p class="pcr-dana-item__lbl">Tanggal Kegiatan</p>
            <p class="pcr-dana-item__val">{{ formatDate(item.tanggalKegiatan) }}</p>
          </div>
        </div>

        <!-- Dokumen Checklist -->
        <div class="pcr-card__docs">
          <p class="pcr-card__docs-title">Kelengkapan Dokumen</p>
          <div class="doc-checks">
            <div v-for="doc in item.syaratDokumen" :key="doc.id" class="doc-check" :class="{ 'doc-check--ok': doc.uploaded }">
              <Icon :name="doc.uploaded ? 'heroicons:check-circle' : 'heroicons:x-circle'" class="w-4 h-4"/>
              <span>{{ doc.nama }}</span>
            </div>
          </div>
          <div class="pcr-card__prog">
            <div class="pcr-prog-track">
              <div class="pcr-prog-fill" :style="{ width: docPct(item) + '%', background: docPct(item) === 100 ? '#16a34a' : '#d4b044' }"/>
            </div>
            <span class="pcr-prog-txt" :style="{ color: docPct(item) === 100 ? '#16a34a' : '#d4b044' }">
              {{ item.syaratDokumen.filter(d => d.uploaded).length }}/{{ item.syaratDokumen.length }} dokumen
            </span>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="pcr-card__footer">
          <span class="pcr-card__date">Diajukan {{ formatDate(item.tanggalPengajuan) }}</span>
          <button class="btn-detail" @click.stop="openDetail(item)">
            Kelola
            <Icon name="heroicons:arrow-right" class="w-4 h-4"/>
          </button>
        </div>
      </div>

      <div v-if="filteredList.length === 0" class="empty-state">
        <Icon name="heroicons:banknotes" class="w-12 h-12" style="color:#c5d3e8"/>
        <p class="empty-state__title">Tidak ada data pencairan</p>
        <p class="empty-state__sub">Pencairan akan muncul setelah kegiatan disetujui</p>
      </div>
    </div>

    <!-- ── MODAL PENCAIRAN ── -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <!-- Header -->
        <div class="modal__header">
          <div class="modal__header-left">
            <div class="modal__icon"><Icon name="heroicons:banknotes" class="w-5 h-5"/></div>
            <div>
              <h2 class="modal__title">{{ selected?.namaKegiatan }}</h2>
              <p class="modal__sub">{{ selected?.namaOrmawa }} · {{ formatRp(selected?.totalDana) }}</p>
            </div>
          </div>
          <button class="modal__close" @click="closeModal"><Icon name="heroicons:x-mark" class="w-5 h-5"/></button>
        </div>

        <!-- Tabs -->
        <div class="modal__tabs">
          <button v-for="tab in tabs" :key="tab.key" class="modal__tab" :class="{ 'modal__tab--active': activeTab === tab.key }" @click="activeTab = tab.key">
            <Icon :name="tab.icon" class="w-4 h-4"/>
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab: Dokumen Syarat -->
        <div v-if="activeTab === 'dokumen'" class="modal__body">
          <p class="section-label">Kelengkapan Persyaratan Pencairan</p>
          <div class="syarat-list">
            <div v-for="doc in (selected?.syaratDokumen || [])" :key="doc.id" class="syarat-item" :class="{ 'syarat-item--ok': doc.uploaded }">
              <div class="syarat-item__status">
                <Icon :name="doc.uploaded ? 'heroicons:check-circle' : 'heroicons:clock'" class="w-5 h-5"/>
              </div>
              <div class="syarat-item__info">
                <p class="syarat-item__name">{{ doc.nama }}</p>
                <p class="syarat-item__meta">{{ doc.uploaded ? 'Sudah diunggah' : 'Belum diunggah' }}</p>
              </div>
              <div v-if="doc.uploaded" class="syarat-item__actions">
                <a :href="doc.url" target="_blank" class="btn-doc btn-doc--view">
                  <Icon name="heroicons:eye" class="w-4 h-4"/> Lihat
                </a>
              </div>
            </div>
          </div>

          <!-- Action: lengkap atau kembalikan -->
          <div class="doc-action-box">
            <div v-if="allDocsComplete" class="action-complete">
              <div class="action-complete__icon"><Icon name="heroicons:check-badge" class="w-6 h-6"/></div>
              <div>
                <p class="action-complete__title">Dokumen Lengkap!</p>
                <p class="action-complete__sub">Semua persyaratan telah terpenuhi. Lanjutkan ke pengiriman SPB.</p>
              </div>
              <button class="btn-action btn-action--green" @click="activeTab = 'spb'" :disabled="loadingAction">
                Lanjut ke SPB
                <Icon name="heroicons:arrow-right" class="w-4 h-4"/>
              </button>
            </div>
            <div v-else class="action-incomplete">
              <Icon name="heroicons:exclamation-triangle" class="w-5 h-5" style="color:#d4b044;flex-shrink:0"/>
              <div style="flex:1">
                <p style="font-size:13px;font-weight:600;color:#92400e">Dokumen Belum Lengkap</p>
                <p style="font-size:12px;color:#9db5d5;margin-top:2px">Kembalikan ke ormawa untuk melengkapi persyaratan</p>
                <textarea v-model="catatanKembalikan" class="decision-form__textarea" rows="2" placeholder="Tuliskan dokumen yang perlu dilengkapi..." style="margin-top:10px"/>
              </div>
              <button class="btn-action btn-action--amber" @click="handleKembalikan" :disabled="loadingAction">
                <Icon name="heroicons:arrow-uturn-left" class="w-4 h-4"/>
                Kembalikan
              </button>
            </div>
          </div>
        </div>

        <!-- Tab: SPB -->
        <div v-if="activeTab === 'spb'" class="modal__body">
          <p class="section-label">Surat Perintah Bayar (SPB)</p>

          <div v-if="selected?.statusPencairan === 'dokumen_lengkap'" class="spb-form">
            <div class="spb-info-grid">
              <div class="spb-info-item">
                <p class="spb-info-item__lbl">Nama Ormawa</p>
                <p class="spb-info-item__val">{{ selected?.namaOrmawa }}</p>
              </div>
              <div class="spb-info-item">
                <p class="spb-info-item__lbl">Nama Kegiatan</p>
                <p class="spb-info-item__val">{{ selected?.namaKegiatan }}</p>
              </div>
              <div class="spb-info-item">
                <p class="spb-info-item__lbl">Jumlah Dana</p>
                <p class="spb-info-item__val" style="color:var(--blue-700);font-weight:700">{{ formatRp(selected?.totalDana) }}</p>
              </div>
              <div class="spb-info-item">
                <p class="spb-info-item__lbl">Tanggal SPB</p>
                <p class="spb-info-item__val">{{ todayStr }}</p>
              </div>
            </div>
            <div class="spb-form__note">
              <label class="spb-form__label">Catatan SPB (opsional)</label>
              <textarea v-model="catatanSPB" class="decision-form__textarea" rows="2" placeholder="Catatan tambahan untuk SPB..."/>
            </div>
            <div class="spb-action">
              <button class="btn-action btn-action--blue" @click="handleKirimSPB" :disabled="loadingAction">
                <Icon name="heroicons:paper-airplane" class="w-5 h-5"/>
                Kirim SPB ke Ormawa
              </button>
              <p class="spb-action__note">SPB akan dikirim ke ormawa untuk ditandatangani</p>
            </div>
          </div>

          <div v-else-if="selected?.statusPencairan === 'spb_dikirim'" class="spb-sent">
            <div class="spb-sent__icon"><Icon name="heroicons:check-badge" class="w-8 h-8"/></div>
            <p class="spb-sent__title">SPB Telah Dikirim</p>
            <p class="spb-sent__sub">Menunggu tanda tangan ormawa. Setelah ditandatangani, lanjutkan proses pencairan.</p>
            <div class="spb-sent__actions">
              <button class="btn-action btn-action--green" @click="handleProsesPencairan" :disabled="loadingAction">
                <Icon name="heroicons:banknotes" class="w-5 h-5"/>
                SPB Ditandatangani — Proses Pencairan
              </button>
            </div>
          </div>

          <div v-else class="spb-unavail">
            <Icon name="heroicons:lock-closed" class="w-10 h-10" style="color:#c5d3e8"/>
            <p>Lengkapi dokumen terlebih dahulu sebelum mengirim SPB.</p>
          </div>
        </div>

        <!-- Tab: Bukti Transfer -->
        <div v-if="activeTab === 'bukti'" class="modal__body">
          <p class="section-label">Bukti Transfer Pencairan</p>

          <div v-if="selected?.statusPencairan === 'proses_pencairan' || selected?.statusPencairan === 'selesai'">
            <div v-if="selected?.buktiBayar" class="bukti-preview">
              <div class="bukti-preview__icon"><Icon name="heroicons:receipt-percent" class="w-6 h-6"/></div>
              <div class="bukti-preview__info">
                <p class="bukti-preview__name">{{ selected.buktiBayar.nama }}</p>
                <p class="bukti-preview__meta">Dikirim {{ formatDate(selected.buktiBayar.tanggal) }}</p>
              </div>
              <a :href="selected.buktiBayar.url" target="_blank" class="btn-doc btn-doc--view">
                <Icon name="heroicons:eye" class="w-4 h-4"/> Lihat
              </a>
            </div>

            <div v-if="selected?.statusPencairan === 'proses_pencairan'" class="bukti-upload">
              <p class="section-label" style="margin-bottom:12px">Upload Bukti Transfer</p>
              <div class="upload-area" @click="$refs.buktiInput.click()">
                <Icon name="heroicons:arrow-up-tray" class="w-8 h-8" style="color:#c5d3e8"/>
                <p class="upload-area__txt">Klik untuk upload bukti transfer</p>
                <p class="upload-area__sub">PDF, JPG, PNG (maks. 5MB)</p>
                <input ref="buktiInput" type="file" accept=".pdf,.jpg,.jpeg,.png" style="display:none" @change="onBuktiSelected"/>
              </div>
              <p v-if="buktiFIle" class="selected-file">
                <Icon name="heroicons:document" class="w-4 h-4"/> {{ buktiFile?.name }}
              </p>
              <button class="btn-action btn-action--blue" @click="handleKirimBukti" :disabled="loadingAction || !buktiFile" style="margin-top:14px">
                <Icon name="heroicons:paper-airplane" class="w-5 h-5"/>
                Kirim Bukti Transfer ke Ormawa
              </button>
            </div>

            <div v-if="selected?.statusPencairan === 'selesai'" class="selesai-notice">
              <div class="selesai-notice__icon"><Icon name="heroicons:check-badge" class="w-8 h-8"/></div>
              <p class="selesai-notice__title">Pencairan Selesai</p>
              <p class="selesai-notice__sub">Bukti transfer telah dikirimkan kepada ormawa.</p>
            </div>
          </div>

          <div v-else class="spb-unavail">
            <Icon name="heroicons:lock-closed" class="w-10 h-10" style="color:#c5d3e8"/>
            <p>Proses SPB terlebih dahulu sebelum mengirim bukti transfer.</p>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const { data: pencairanData, refresh } = await useFetch('/api/ppk/pencairan')

const searchQuery       = ref('')
const filterStatus      = ref('')
const showModal         = ref(false)
const selected          = ref(null)
const activeTab         = ref('dokumen')
const catatanKembalikan = ref('')
const catatanSPB        = ref('')
const buktiFile         = ref(null)
const loadingAction     = ref(false)

const tabs = [
  { key: 'dokumen', label: 'Dokumen Syarat', icon: 'heroicons:folder-open' },
  { key: 'spb',     label: 'SPB',            icon: 'heroicons:document-arrow-up' },
  { key: 'bukti',   label: 'Bukti Transfer', icon: 'heroicons:receipt-percent' },
]

const todayStr = new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })

const pencairanList = computed(() => pencairanData.value?.data || [])
const countByStatus = s => pencairanList.value.filter(p => p.statusPencairan === s).length

const filteredList = computed(() => {
  return pencairanList.value.filter(item => {
    const q = searchQuery.value.toLowerCase()
    const matchSearch = !q || item.namaKegiatan.toLowerCase().includes(q) || item.namaOrmawa.toLowerCase().includes(q)
    const matchStatus = !filterStatus.value || item.statusPencairan === filterStatus.value
    return matchSearch && matchStatus
  })
})

const allDocsComplete = computed(() =>
  selected.value?.syaratDokumen?.every(d => d.uploaded) ?? false
)

const docPct = (item) => {
  if (!item.syaratDokumen?.length) return 0
  return Math.round((item.syaratDokumen.filter(d => d.uploaded).length / item.syaratDokumen.length) * 100)
}

const openDetail = (item) => {
  selected.value = item
  activeTab.value = 'dokumen'
  catatanKembalikan.value = ''
  catatanSPB.value = ''
  buktiFile.value = null
  showModal.value = true
}
const closeModal = () => { showModal.value = false; selected.value = null }

const handleKembalikan = async () => {
  loadingAction.value = true
  try {
    await $fetch(`/api/ppk/pencairan/${selected.value.id}/kembalikan`, {
      method: 'POST', body: { catatan: catatanKembalikan.value }
    })
    selected.value.statusPencairan = 'menunggu_dokumen'
    await refresh()
  } catch(e) { console.error(e) }
  finally { loadingAction.value = false }
}

const handleKirimSPB = async () => {
  loadingAction.value = true
  try {
    await $fetch(`/api/ppk/pencairan/${selected.value.id}/spb`, {
      method: 'POST', body: { catatan: catatanSPB.value }
    })
    selected.value.statusPencairan = 'spb_dikirim'
    await refresh()
  } catch(e) { console.error(e) }
  finally { loadingAction.value = false }
}

const handleProsesPencairan = async () => {
  loadingAction.value = true
  try {
    await $fetch(`/api/ppk/pencairan/${selected.value.id}/proses`, { method: 'POST' })
    selected.value.statusPencairan = 'proses_pencairan'
    activeTab.value = 'bukti'
    await refresh()
  } catch(e) { console.error(e) }
  finally { loadingAction.value = false }
}

const onBuktiSelected = (e) => { buktiFile.value = e.target.files[0] || null }

const handleKirimBukti = async () => {
  if (!buktiFile.value) return
  loadingAction.value = true
  try {
    const form = new FormData()
    form.append('bukti', buktiFile.value)
    await $fetch(`/api/ppk/pencairan/${selected.value.id}/bukti`, { method: 'POST', body: form })
    selected.value.statusPencairan = 'selesai'
    await refresh()
  } catch(e) { console.error(e) }
  finally { loadingAction.value = false }
}

// Helpers
const formatRp   = n => 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0)
const formatDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '-'

const badgeClass = s => ({
  'badge--amber':  s === 'menunggu_dokumen',
  'badge--blue':   s === 'dokumen_lengkap',
  'badge--purple': s === 'spb_dikirim',
  'badge--orange': s === 'proses_pencairan',
  'badge--green':  s === 'selesai',
})
const statusLabel = s => ({
  menunggu_dokumen: 'Menunggu Dokumen',
  dokumen_lengkap:  'Dokumen Lengkap',
  spb_dikirim:      'SPB Dikirim',
  proses_pencairan: 'Proses Pencairan',
  selesai:          'Selesai',
}[s] || s)
</script>

<style scoped>
.pencairan-page { padding:0; }

/* PAGE HEADER */
.ph { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:20px; }
.ph__left { display:flex;align-items:center;gap:14px; }
.ph__icon { width:48px;height:48px;border-radius:13px;background:linear-gradient(135deg,#412402,#BA7517);color:#fff;display:flex;align-items:center;justify-content:center; }
.ph__title { font-size:20px;font-weight:700;color:var(--blue-900); }
.ph__sub   { font-size:12px;color:var(--blue-500);margin-top:3px; }
.ph__actions { display:flex;align-items:center;gap:10px;flex-wrap:wrap; }

.search-wrap { position:relative;display:flex;align-items:center; }
.search-icon { position:absolute;left:10px;color:#9db5d5; }
.search-input { padding:8px 12px 8px 32px;border-radius:10px;border:1.5px solid #e2eaf6;font-size:13px;font-family:inherit;color:var(--blue-900);width:200px; }
.search-input:focus { outline:none;border-color:var(--blue-500); }
.filter-select { padding:8px 30px 8px 12px;border-radius:10px;border:1.5px solid #e2eaf6;background:#fff;font-size:13px;font-family:inherit;color:var(--blue-900);cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234a6fa5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;background-size:15px; }
.filter-select:focus { outline:none;border-color:var(--blue-500); }

/* NAVIGATION TABS */
.nav-tabs-ppk { display:flex;gap:0;border-bottom:2px solid #e2eaf6;margin-bottom:20px; }
.nav-tab { display:flex;align-items:center;gap:6px;padding:12px 16px;font-size:13px;font-weight:600;color:#9db5d5;border-bottom:2px solid transparent;cursor:pointer;transition:all .2s;border:none;background:none;position:relative;bottom:-2px; }
.nav-tab:hover { color:var(--blue-600); }
.nav-tab--active { color:var(--blue-700);border-bottom-color:var(--blue-600); }

/* CHIPS */
.chips { display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px; }
.chip { display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600; }
.chip--amber  { background:var(--gold-100);color:#92400e;border:1px solid var(--gold-200); }
.chip--blue   { background:var(--blue-50);color:var(--blue-700);border:1px solid var(--blue-100); }
.chip--purple { background:#f5f3ff;color:#7c3aed;border:1px solid #ddd6fe; }
.chip--green  { background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0; }

/* CARDS GRID */
.pencairan-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px; }

.pcr-card { background:#fff;border-radius:14px;border:1px solid #e2eaf6;padding:18px;cursor:pointer;transition:all .15s; }
.pcr-card:hover { border-color:var(--blue-400);box-shadow:0 4px 20px rgba(59,89,136,.1);transform:translateY(-1px); }

.pcr-card__header { display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:14px; }
.pcr-card__left { display:flex;align-items:center;gap:10px; }
.pcr-card__avatar { width:38px;height:38px;border-radius:10px;color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.pcr-card__keg { font-size:13px;font-weight:700;color:var(--blue-900);line-height:1.3; }
.pcr-card__orm { font-size:11px;color:#9db5d5;margin-top:2px; }

.pcr-card__dana { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;padding:12px;background:#f8fafd;border-radius:10px; }
.pcr-dana-item__lbl { font-size:10px;color:#9db5d5;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px; }
.pcr-dana-item__val { font-size:13px;font-weight:700;color:var(--blue-800); }

.pcr-card__docs { margin-bottom:14px; }
.pcr-card__docs-title { font-size:11px;font-weight:700;color:#9db5d5;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px; }
.doc-checks { display:flex;flex-direction:column;gap:5px;margin-bottom:8px; }
.doc-check { display:flex;align-items:center;gap:6px;font-size:12px;color:#dc2626; }
.doc-check--ok { color:#16a34a; }
.pcr-card__prog { display:flex;align-items:center;gap:8px;margin-top:6px; }
.pcr-prog-track { flex:1;height:6px;background:#f0f4fb;border-radius:99px;overflow:hidden; }
.pcr-prog-fill  { height:100%;border-radius:99px;transition:width .5s; }
.pcr-prog-txt   { font-size:11px;font-weight:700;white-space:nowrap; }

.pcr-card__footer { display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f4f7fd;padding-top:12px; }
.pcr-card__date { font-size:11px;color:#9db5d5; }
.btn-detail { display:flex;align-items:center;gap:5px;padding:7px 14px;border-radius:8px;border:1.5px solid var(--blue-100);background:var(--blue-50);font-size:12px;font-weight:600;color:var(--blue-700);cursor:pointer;transition:all .15s; }
.btn-detail:hover { background:var(--blue-100); }

/* EMPTY STATE */
.empty-state { grid-column:1/-1;text-align:center;padding:60px;display:flex;flex-direction:column;align-items:center;gap:10px; }
.empty-state__title { font-size:15px;font-weight:600;color:var(--blue-800); }
.empty-state__sub   { font-size:12px;color:#9db5d5; }

/* BADGES */
.badge { display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700; }
.badge--amber  { background:var(--gold-100);color:#92400e; }
.badge--blue   { background:var(--blue-50);color:var(--blue-700); }
.badge--purple { background:#f5f3ff;color:#7c3aed; }
.badge--orange { background:#fff7ed;color:#c2410c; }
.badge--green  { background:#f0fdf4;color:#16a34a; }
.badge--red    { background:#fef2f2;color:#dc2626; }

/* ─── MODAL ─── */
.modal-backdrop { position:fixed;inset:0;background:rgba(10,20,50,.45);backdrop-filter:blur(4px);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px; }
.modal { background:#fff;border-radius:18px;width:100%;max-width:660px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(15,31,61,.22); }

.modal__header { display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #f0f4fb;flex-shrink:0;background:linear-gradient(135deg,#fff8e8,#fff); }
.modal__header-left { display:flex;align-items:center;gap:14px; }
.modal__icon { width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,#412402,#BA7517);color:#fff;display:flex;align-items:center;justify-content:center; }
.modal__title { font-size:15px;font-weight:700;color:var(--blue-900); }
.modal__sub   { font-size:11px;color:#9db5d5;margin-top:2px; }
.modal__close { width:32px;height:32px;border-radius:8px;border:1px solid #e2eaf6;background:#fff;color:var(--blue-700);display:flex;align-items:center;justify-content:center;cursor:pointer; }
.modal__close:hover { background:#f8fafd; }

.modal__tabs { display:flex;border-bottom:1px solid #f0f4fb;padding:0 24px;flex-shrink:0; }
.modal__tab { display:flex;align-items:center;gap:6px;padding:12px 14px;font-size:13px;font-weight:500;color:#9db5d5;border-bottom:2px solid transparent;cursor:pointer;transition:all .15s;background:none;border-top:none;border-left:none;border-right:none; }
.modal__tab:hover { color:var(--blue-600); }
.modal__tab--active { color:var(--blue-800);font-weight:700;border-bottom-color:var(--gold-500); }

.modal__body { flex:1;overflow-y:auto;padding:24px; }

/* SYARAT LIST */
.section-label { font-size:11px;font-weight:700;color:#9db5d5;text-transform:uppercase;letter-spacing:.7px;margin-bottom:14px; }
.syarat-list { display:flex;flex-direction:column;gap:8px;margin-bottom:20px; }
.syarat-item { display:flex;align-items:center;gap:12px;padding:13px;border:1.5px solid #fecaca;border-radius:11px;background:#fef9f9; }
.syarat-item--ok { border-color:#bbf7d0;background:#f8fff9; }
.syarat-item__status { width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center; }
.syarat-item:not(.syarat-item--ok) .syarat-item__status { background:#fef2f2;color:#dc2626; }
.syarat-item--ok .syarat-item__status { background:#f0fdf4;color:#16a34a; }
.syarat-item__info { flex:1; }
.syarat-item__name { font-size:13px;font-weight:600;color:var(--blue-900); }
.syarat-item__meta { font-size:11px;color:#9db5d5;margin-top:2px; }
.syarat-item__actions { display:flex;gap:6px; }

/* DOC ACTION BOX */
.doc-action-box { margin-top:8px; }
.action-complete { display:flex;align-items:center;gap:14px;padding:16px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0; }
.action-complete__icon { width:44px;height:44px;border-radius:11px;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.action-complete__title { font-size:14px;font-weight:700;color:#15803d; }
.action-complete__sub   { font-size:12px;color:#4ade80;margin-top:2px; }
.action-incomplete { display:flex;align-items:flex-start;gap:12px;padding:16px;background:#fffbeb;border-radius:12px;border:1px solid var(--gold-200); }

/* SPB */
.spb-form { display:flex;flex-direction:column;gap:16px; }
.spb-info-grid { display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:16px;background:#f8fafd;border-radius:12px; }
.spb-info-item__lbl { font-size:10px;color:#9db5d5;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px; }
.spb-info-item__val { font-size:13px;font-weight:600;color:var(--blue-900); }
.spb-form__label { font-size:12px;font-weight:700;color:var(--blue-800);display:block;margin-bottom:6px; }
.spb-action { display:flex;flex-direction:column;align-items:flex-start;gap:6px; }
.spb-action__note { font-size:11px;color:#9db5d5; }

.spb-sent { display:flex;flex-direction:column;align-items:center;gap:10px;padding:32px;text-align:center; }
.spb-sent__icon { width:60px;height:60px;border-radius:16px;background:#f5f3ff;color:#7c3aed;display:flex;align-items:center;justify-content:center; }
.spb-sent__title { font-size:16px;font-weight:700;color:var(--blue-900); }
.spb-sent__sub   { font-size:13px;color:#9db5d5;max-width:320px; }
.spb-sent__actions { margin-top:8px; }

.spb-unavail { display:flex;flex-direction:column;align-items:center;gap:10px;padding:40px;text-align:center;color:#9db5d5;font-size:13px; }

/* BUKTI */
.bukti-preview { display:flex;align-items:center;gap:12px;padding:14px;border:1px solid #e2eaf6;border-radius:12px;margin-bottom:16px; }
.bukti-preview__icon { width:40px;height:40px;border-radius:10px;background:var(--gold-100);color:#92400e;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.bukti-preview__name { font-size:13px;font-weight:600;color:var(--blue-900); }
.bukti-preview__meta { font-size:11px;color:#9db5d5;margin-top:2px; }
.bukti-upload { margin-top:4px; }
.upload-area { border:2px dashed #e2eaf6;border-radius:12px;padding:32px;text-align:center;cursor:pointer;transition:border .15s;display:flex;flex-direction:column;align-items:center;gap:6px; }
.upload-area:hover { border-color:var(--blue-400);background:var(--blue-50); }
.upload-area__txt { font-size:13px;font-weight:600;color:var(--blue-700); }
.upload-area__sub { font-size:11px;color:#9db5d5; }
.selected-file { display:flex;align-items:center;gap:6px;font-size:12px;color:var(--blue-700);margin-top:8px; }

.selesai-notice { display:flex;flex-direction:column;align-items:center;gap:10px;padding:32px;text-align:center; }
.selesai-notice__icon { width:60px;height:60px;border-radius:16px;background:#f0fdf4;color:#16a34a;display:flex;align-items:center;justify-content:center; }
.selesai-notice__title { font-size:16px;font-weight:700;color:#15803d; }
.selesai-notice__sub   { font-size:13px;color:#9db5d5; }

/* ACTION BUTTONS */
.btn-action { display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:10px;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:all .15s; }
.btn-action:disabled { opacity:.55;cursor:not-allowed; }
.btn-action--blue  { background:linear-gradient(135deg,var(--blue-800),var(--blue-600));color:#fff; }
.btn-action--blue:hover:not(:disabled)  { filter:brightness(1.08); }
.btn-action--green { background:linear-gradient(135deg,#15803d,#16a34a);color:#fff; }
.btn-action--green:hover:not(:disabled) { filter:brightness(1.08); }
.btn-action--amber { background:var(--gold-100);color:#92400e;border:1.5px solid var(--gold-200); }
.btn-action--amber:hover:not(:disabled) { background:var(--gold-200); }

/* SHARED */
.decision-form__textarea { width:100%;padding:10px 12px;border-radius:9px;border:1.5px solid #e2eaf6;font-size:13px;font-family:inherit;color:var(--blue-900);resize:vertical; }
.decision-form__textarea:focus { outline:none;border-color:var(--blue-500); }
.btn-doc { display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;transition:all .15s; }
.btn-doc--view { background:var(--blue-50);color:var(--blue-700);border:1px solid var(--blue-100); }
.btn-doc--view:hover { background:var(--blue-100); }

/* RESPONSIVE */
@media (max-width:600px) {
  .pencairan-grid { grid-template-columns:1fr; }
  .spb-info-grid { grid-template-columns:1fr; }
  .modal { max-height:100vh;border-radius:0; }
}
</style>