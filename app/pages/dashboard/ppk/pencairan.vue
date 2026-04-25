<template>
  <div class="pcr-page">

    <!-- Animated background (sama persis dengan dashboard) -->
    <div class="bg-mesh" />
    <div class="bg-orbs">
      <div class="orb orb--1" />
      <div class="orb orb--2" />
      <div class="orb orb--3" />
      <div class="orb orb--4" />
    </div>
    <div class="bg-grid" />

    <!-- ══ PAGE HEADER ══ -->
    <div class="ph">
      <div class="ph__left">
        <div class="ph__badge">PPK</div>
        <div>
          <h1 class="ph__title">Pencairan <span class="ph__title--glow">Dana</span></h1>
          <p class="ph__sub">✦ Verifikasi dokumen dan proses pencairan ormawa</p>
        </div>
      </div>
      <div class="ph__right">
        <div class="glass-chip">
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4" style="color:var(--yellow)"/>
          <input v-model="searchQuery" class="glass-input" placeholder="Cari ormawa / kegiatan..."/>
        </div>
        <div class="glass-chip glass-chip--select">
          <Icon name="heroicons:funnel" class="w-4 h-4" style="color:var(--yellow)"/>
          <select v-model="filterStatus" class="glass-select">
            <option value="">Semua Status</option>
            <option value="menunggu_dokumen">Menunggu Dokumen</option>
            <option value="dokumen_lengkap">Dokumen Lengkap</option>
            <option value="spb_dikirim">SPB Dikirim</option>
            <option value="proses_pencairan">Proses Pencairan</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
        <div class="date-chip">{{ todayStr }}</div>
      </div>
    </div>

  
    <!-- ══ STAT CHIPS ══ -->
    <div class="sc-grid">
      <div class="sc" style="--i:0">
        <div class="sc__glow sc__glow--yellow"/>
        <div class="sc__watermark">WAIT</div>
        <div class="sc__icon-wrap">
          <Icon name="heroicons:clock" class="w-5 h-5"/>
        </div>
        <p class="sc__val sc__val--yellow">{{ countByStatus('menunggu_dokumen') }}</p>
        <p class="sc__lbl">Menunggu Dokumen</p>
        <span class="sc__tag sc__tag--yellow">Perlu tindakan</span>
      </div>
      <div class="sc" style="--i:1">
        <div class="sc__glow sc__glow--blue"/>
        <div class="sc__watermark">DOCS</div>
        <div class="sc__icon-wrap">
          <Icon name="heroicons:document-check" class="w-5 h-5"/>
        </div>
        <p class="sc__val sc__val--blue">{{ countByStatus('dokumen_lengkap') }}</p>
        <p class="sc__lbl">Dokumen Lengkap</p>
        <span class="sc__tag">Siap SPB</span>
      </div>
      <div class="sc" style="--i:2">
        <div class="sc__glow sc__glow--purple"/>
        <div class="sc__watermark">SPB</div>
        <div class="sc__icon-wrap">
          <Icon name="heroicons:paper-airplane" class="w-5 h-5"/>
        </div>
        <p class="sc__val sc__val--purple">{{ countByStatus('spb_dikirim') }}</p>
        <p class="sc__lbl">SPB Dikirim</p>
        <span class="sc__tag">Menunggu TTD</span>
      </div>
      <div class="sc" style="--i:3">
        <div class="sc__glow sc__glow--mint"/>
        <div class="sc__watermark">DONE</div>
        <div class="sc__icon-wrap">
          <Icon name="heroicons:check-circle" class="w-5 h-5"/>
        </div>
        <p class="sc__val sc__val--mint">{{ countByStatus('selesai') }}</p>
        <p class="sc__lbl">Selesai</p>
        <span class="sc__tag sc__tag--mint">Dicairkan</span>
      </div>
    </div>

    <!-- ══ CARDS GRID ══ -->
    <div class="pcr-grid">
      <div
        v-for="(item, idx) in filteredList"
        :key="item.id"
        class="pcr-card glass-panel"
        :style="{'--i': idx + 4}"
        @click="openDetail(item)"
      >
        <!-- Top stripe warna status -->
        <div class="pcr-card__stripe" :class="'pcr-card__stripe--' + statusColor(item.statusPencairan)"/>

        <!-- Header -->
        <div class="pcr-card__header">
          <div class="pcr-card__avatar" :style="{ background: item.color }">
            {{ item.kodeOrmawa?.charAt(0) }}
          </div>
          <div class="pcr-card__info">
            <p class="pcr-card__keg">{{ item.namaKegiatan }}</p>
            <p class="pcr-card__orm">{{ item.namaOrmawa }} · {{ item.kodeOrmawa }}</p>
          </div>
          <span class="status-badge" :class="'status-badge--' + statusColor(item.statusPencairan)">
            {{ statusLabel(item.statusPencairan) }}
          </span>
        </div>

        <!-- Dana -->
        <div class="pcr-card__dana">
          <div class="pcr-dana-box">
            <p class="pcr-dana-box__lbl">Dana Disetujui</p>
            <p class="pcr-dana-box__val">{{ formatRp(item.totalDana) }}</p>
          </div>
          <div class="pcr-dana-box">
            <p class="pcr-dana-box__lbl">Tanggal Kegiatan</p>
            <p class="pcr-dana-box__val">{{ formatDate(item.tanggalKegiatan) }}</p>
          </div>
        </div>

        <!-- Dokumen Progress -->
        <div class="pcr-card__docs">
          <div class="pcr-card__docs-header">
            <span class="pcr-card__docs-lbl">Kelengkapan Dokumen</span>
            <span class="pcr-card__docs-pct" :style="{ color: docPct(item) === 100 ? '#4ade80' : '#f5c518' }">
              {{ item.syaratDokumen?.filter(d => d.uploaded).length }}/{{ item.syaratDokumen?.length }}
            </span>
          </div>
          <div class="doc-checks">
            <div
              v-for="doc in item.syaratDokumen"
              :key="doc.id"
              class="doc-check"
              :class="{ 'doc-check--ok': doc.uploaded }"
            >
              <Icon :name="doc.uploaded ? 'heroicons:check-circle' : 'heroicons:x-circle'" class="w-3.5 h-3.5"/>
              <span>{{ doc.nama }}</span>
            </div>
          </div>
          <div class="pcr-prog">
            <div class="pcr-prog__track">
              <div
                class="pcr-prog__fill"
                :style="{
                  width: docPct(item) + '%',
                  background: docPct(item) === 100
                    ? 'linear-gradient(90deg,#16a34a,#4ade80)'
                    : 'linear-gradient(90deg,rgba(255,255,255,.6),#f5c518)'
                }"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="pcr-card__footer">
          <span class="pcr-card__date">Diajukan {{ formatDate(item.tanggalPengajuan) }}</span>
          <button class="btn-kelola" @click.stop="openDetail(item)">
            Kelola
            <Icon name="heroicons:arrow-right" class="w-4 h-4"/>
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredList.length === 0" class="empty-state glass-panel" style="--i:4">
        <Icon name="heroicons:banknotes" class="w-14 h-14" style="color:rgba(255,255,255,.2)"/>
        <p class="empty-state__title">Tidak ada data pencairan</p>
        <p class="empty-state__sub">Pencairan akan muncul setelah kegiatan disetujui</p>
      </div>
    </div>

    <!-- ══ MODAL ══ -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">

        <!-- Modal Header -->
        <div class="modal__header">
          <div class="modal__header-left">
            <div class="modal__icon">
              <Icon name="heroicons:banknotes" class="w-5 h-5"/>
            </div>
            <div>
              <h2 class="modal__title">{{ selected?.namaKegiatan }}</h2>
              <p class="modal__sub">{{ selected?.namaOrmawa }} · {{ formatRp(selected?.totalDana) }}</p>
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

        <!-- Tab: Dokumen -->
        <div v-if="activeTab === 'dokumen'" class="modal__body">
          <p class="m-section-lbl">Kelengkapan Persyaratan Pencairan</p>
          <div class="m-syarat-list">
            <div
              v-for="doc in (selected?.syaratDokumen || [])"
              :key="doc.id"
              class="m-syarat-item"
              :class="{ 'm-syarat-item--ok': doc.uploaded }"
            >
              <div class="m-syarat-item__icon">
                <Icon :name="doc.uploaded ? 'heroicons:check-circle' : 'heroicons:clock'" class="w-5 h-5"/>
              </div>
              <div class="m-syarat-item__info">
                <p class="m-syarat-item__name">{{ doc.nama }}</p>
                <p class="m-syarat-item__meta">{{ doc.uploaded ? 'Sudah diunggah' : 'Belum diunggah' }}</p>
              </div>
              <a v-if="doc.uploaded" :href="doc.url" target="_blank" class="m-btn-view">
                <Icon name="heroicons:eye" class="w-4 h-4"/> Lihat
              </a>
            </div>
          </div>

          <!-- Action box -->
          <div v-if="allDocsComplete" class="m-action-box m-action-box--green">
            <div class="m-action-box__icon" style="background:#dcfce7;color:#16a34a">
              <Icon name="heroicons:check-badge" class="w-6 h-6"/>
            </div>
            <div class="m-action-box__text">
              <p class="m-action-box__title" style="color:#15803d">Dokumen Lengkap!</p>
              <p class="m-action-box__sub">Semua persyaratan terpenuhi. Lanjutkan ke pengiriman SPB.</p>
            </div>
            <button class="m-btn m-btn--green" @click="activeTab = 'spb'" :disabled="loadingAction">
              Lanjut ke SPB <Icon name="heroicons:arrow-right" class="w-4 h-4"/>
            </button>
          </div>
          <div v-else class="m-action-box m-action-box--amber">
            <Icon name="heroicons:exclamation-triangle" class="w-5 h-5" style="color:#d4b044;flex-shrink:0;margin-top:2px"/>
            <div style="flex:1">
              <p class="m-action-box__title" style="color:#92400e">Dokumen Belum Lengkap</p>
              <p class="m-action-box__sub">Kembalikan ke ormawa untuk melengkapi persyaratan</p>
              <textarea v-model="catatanKembalikan" class="m-textarea" rows="2" placeholder="Tuliskan dokumen yang perlu dilengkapi..." style="margin-top:10px"/>
            </div>
            <button class="m-btn m-btn--amber" @click="handleKembalikan" :disabled="loadingAction">
              <Icon name="heroicons:arrow-uturn-left" class="w-4 h-4"/> Kembalikan
            </button>
          </div>
        </div>

        <!-- Tab: SPB -->
        <div v-if="activeTab === 'spb'" class="modal__body">
          <p class="m-section-lbl">Surat Perintah Bayar (SPB)</p>

          <div v-if="selected?.statusPencairan === 'dokumen_lengkap'" class="m-spb-form">
            <div class="m-info-grid">
              <div class="m-info-item">
                <p class="m-info-item__lbl">Nama Ormawa</p>
                <p class="m-info-item__val">{{ selected?.namaOrmawa }}</p>
              </div>
              <div class="m-info-item">
                <p class="m-info-item__lbl">Nama Kegiatan</p>
                <p class="m-info-item__val">{{ selected?.namaKegiatan }}</p>
              </div>
              <div class="m-info-item">
                <p class="m-info-item__lbl">Jumlah Dana</p>
                <p class="m-info-item__val" style="color:#1e3a80;font-weight:800">{{ formatRp(selected?.totalDana) }}</p>
              </div>
              <div class="m-info-item">
                <p class="m-info-item__lbl">Tanggal SPB</p>
                <p class="m-info-item__val">{{ todayStr }}</p>
              </div>
            </div>
            <label class="m-label">Catatan SPB (opsional)</label>
            <textarea v-model="catatanSPB" class="m-textarea" rows="2" placeholder="Catatan tambahan untuk SPB..."/>
            <button class="m-btn m-btn--navy" @click="handleKirimSPB" :disabled="loadingAction">
              <Icon name="heroicons:paper-airplane" class="w-5 h-5"/>
              Kirim SPB ke Ormawa
            </button>
            <p style="font-size:11px;color:#9db5d5;margin-top:6px">SPB akan dikirim ke ormawa untuk ditandatangani</p>
          </div>

          <div v-else-if="selected?.statusPencairan === 'spb_dikirim'" class="m-center-state">
            <div class="m-center-state__icon" style="background:#f5f3ff;color:#7c3aed">
              <Icon name="heroicons:check-badge" class="w-8 h-8"/>
            </div>
            <p class="m-center-state__title">SPB Telah Dikirim</p>
            <p class="m-center-state__sub">Menunggu tanda tangan ormawa. Setelah ditandatangani, lanjutkan proses pencairan.</p>
            <button class="m-btn m-btn--green" @click="handleProsesPencairan" :disabled="loadingAction">
              <Icon name="heroicons:banknotes" class="w-5 h-5"/>
              SPB Ditandatangani — Proses Pencairan
            </button>
          </div>

          <div v-else class="m-center-state">
            <Icon name="heroicons:lock-closed" class="w-10 h-10" style="color:#c5d3e8"/>
            <p style="font-size:13px;color:#9db5d5">Lengkapi dokumen terlebih dahulu sebelum mengirim SPB.</p>
          </div>
        </div>

        <!-- Tab: Bukti Transfer -->
        <div v-if="activeTab === 'bukti'" class="modal__body">
          <p class="m-section-lbl">Bukti Transfer Pencairan</p>

          <template v-if="selected?.statusPencairan === 'proses_pencairan' || selected?.statusPencairan === 'selesai'">
            <div v-if="selected?.buktiBayar" class="m-bukti-preview">
              <div class="m-bukti-preview__icon">
                <Icon name="heroicons:receipt-percent" class="w-6 h-6"/>
              </div>
              <div style="flex:1">
                <p class="m-info-item__val">{{ selected.buktiBayar.nama }}</p>
                <p class="m-info-item__lbl" style="margin-top:2px">Dikirim {{ formatDate(selected.buktiBayar.tanggal) }}</p>
              </div>
              <a :href="selected.buktiBayar.url" target="_blank" class="m-btn-view">
                <Icon name="heroicons:eye" class="w-4 h-4"/> Lihat
              </a>
            </div>

            <div v-if="selected?.statusPencairan === 'proses_pencairan'">
              <p class="m-section-lbl" style="margin:16px 0 10px">Upload Bukti Transfer</p>
              <div class="m-upload-area" @click="$refs.buktiInput.click()">
                <Icon name="heroicons:arrow-up-tray" class="w-8 h-8" style="color:#c5d3e8"/>
                <p style="font-size:13px;font-weight:600;color:#4a6fa5">Klik untuk upload bukti transfer</p>
                <p style="font-size:11px;color:#9db5d5">PDF, JPG, PNG (maks. 5MB)</p>
                <input ref="buktiInput" type="file" accept=".pdf,.jpg,.jpeg,.png" style="display:none" @change="onBuktiSelected"/>
              </div>
              <p v-if="buktiFile" style="display:flex;align-items:center;gap:6px;font-size:12px;color:#4a6fa5;margin-top:8px">
                <Icon name="heroicons:document" class="w-4 h-4"/> {{ buktiFile?.name }}
              </p>
              <button class="m-btn m-btn--navy" @click="handleKirimBukti" :disabled="loadingAction || !buktiFile" style="margin-top:14px">
                <Icon name="heroicons:paper-airplane" class="w-5 h-5"/>
                Kirim Bukti Transfer ke Ormawa
              </button>
            </div>

            <div v-if="selected?.statusPencairan === 'selesai'" class="m-center-state">
              <div class="m-center-state__icon" style="background:#f0fdf4;color:#16a34a">
                <Icon name="heroicons:check-badge" class="w-8 h-8"/>
              </div>
              <p class="m-center-state__title" style="color:#15803d">Pencairan Selesai</p>
              <p class="m-center-state__sub">Bukti transfer telah dikirimkan kepada ormawa.</p>
            </div>
          </template>

          <div v-else class="m-center-state">
            <Icon name="heroicons:lock-closed" class="w-10 h-10" style="color:#c5d3e8"/>
            <p style="font-size:13px;color:#9db5d5">Proses SPB terlebih dahulu sebelum mengirim bukti transfer.</p>
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

const statusColor = s => ({
  menunggu_dokumen: 'yellow',
  dokumen_lengkap:  'blue',
  spb_dikirim:      'purple',
  proses_pencairan: 'orange',
  selesai:          'mint',
}[s] || 'blue')

const statusLabel = s => ({
  menunggu_dokumen: 'Menunggu Dokumen',
  dokumen_lengkap:  'Dokumen Lengkap',
  spb_dikirim:      'SPB Dikirim',
  proses_pencairan: 'Proses Pencairan',
  selesai:          'Selesai',
}[s] || s)

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

const formatRp   = n => 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0)
const formatDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '-'
</script>

<style scoped>
/* ══════════════════════════════════════════
   TOKENS — sama persis dengan dashboard
══════════════════════════════════════════ */
.pcr-page {
  --navy:       #0b1a3e;
  --navy2:      #162a5c;
  --yellow:     #f5c518;
  --yellow2:    #fde047;
  --glass-bg:   rgba(255,255,255,0.10);
  --glass-br:   rgba(255,255,255,0.20);
  --glass-sh:   0 8px 32px rgba(11,26,62,0.30);
  --txt-light:  rgba(255,255,255,0.95);
  --txt-dim:    rgba(255,255,255,0.60);
  --txt-faint:  rgba(255,255,255,0.32);
  --r:          18px;
  --r-sm:       12px;
  

  position: relative;
  isolation: isolate;
  padding: 28px 28px 56px;
  font-family: 'DM Sans','Segoe UI',sans-serif;
  overflow: hidden;
  color: var(--txt-light);
}

/* ══ BACKGROUND — identik dengan dashboard ══ */
.bg-mesh {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: linear-gradient(
    135deg,
   #0a1a3a 0%,      /* biru sangat tua, lebih lembut dari #06102b */
  #12315e 25%,     /* biru gelap kalem */
  #1c4780 50%,     /* biru sedang, tidak terlalu terang */
  #2a5a9e 65%,     /* biru keabuan, mengurangi ngejreng */
  #8b6b2b 80%,     /* emas kecoklatan, tidak mencolok */
  #b88a2e 90%,     /* emas agak terang tapi masih earthy */
  #d9aa3a 100%     /* emas lembut, tidak kuning neon */
  );
}
.bg-orbs { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.orb {
  position: absolute; border-radius: 50%;
  filter: blur(100px); pointer-events: none;
  animation: orbFloat 16s ease-in-out infinite;
}
.orb--1 { width:560px;height:560px;top:-180px;left:-140px;background:radial-gradient(circle,rgba(42,91,215,.4) 0%,transparent 70%);animation-delay:0s; }
.orb--2 { width:460px;height:460px;bottom:-120px;right:-100px;background:radial-gradient(circle,rgba(245,197,24,.45) 0%,transparent 70%);animation-delay:-7s; }
.orb--3 { width:320px;height:320px;top:35%;left:25%;background:radial-gradient(circle,rgba(255,255,255,.05) 0%,transparent 70%);animation-delay:-12s; }
.orb--4 { width:240px;height:240px;top:15%;right:20%;background:radial-gradient(circle,rgba(245,197,24,.12) 0%,transparent 70%);animation-delay:-4s; }
@keyframes orbFloat {
  0%,100% { transform:translate(0,0) scale(1); }
  33%     { transform:translate(28px,-28px) scale(1.07); }
  66%     { transform:translate(-20px,20px) scale(.93); }
}
.bg-grid {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image: radial-gradient(circle,rgba(255,255,255,.06) 1px,transparent 1px);
  background-size: 30px 30px;
}

/* semua konten di atas bg */
.ph,.nav-tabs,.sc-grid,.pcr-grid,.glass-panel,.sc { position:relative;z-index:1; }

/* ══ GLASSMORPHISM BASE ══ */
.glass-panel {
  background: var(--glass-bg);
  border: 1px solid var(--glass-br);
  backdrop-filter: blur(22px) saturate(1.5);
  -webkit-backdrop-filter: blur(22px) saturate(1.5);
  border-radius: var(--r);
  box-shadow: var(--glass-sh), inset 0 1px 0 rgba(255,255,255,.16);
  animation: fadeUp .55s cubic-bezier(.22,1,.36,1) both;
  animation-delay: calc(var(--i,0) * 0.07s);
}
@keyframes fadeUp {
  from { opacity:0; transform:translateY(22px); }
  to   { opacity:1; transform:translateY(0); }
}

/* ══ PAGE HEADER ══ */
.ph {
  display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:14px;margin-bottom:20px;
}
.ph__left { display:flex;align-items:center;gap:16px; }
.ph__badge {
  font-size:11px;font-weight:900;letter-spacing:3px;
  color:var(--navy);background:var(--yellow);
  padding:12px 15px;border-radius:14px;
  box-shadow:0 0 0 3px rgba(245,197,24,.4),0 8px 28px rgba(245,197,24,.35);
}
.ph__title {
  font-size:28px;font-weight:800;color:#fff;
  line-height:1.1;letter-spacing:-.6px;
  text-shadow:0 2px 14px rgba(11,26,62,.5);
}
.ph__title--glow {
  color:var(--yellow);
  text-shadow:0 0 28px rgba(245,197,24,.7),0 2px 8px rgba(11,26,62,.4);
}
.ph__sub { font-size:12px;color:var(--txt-dim);margin-top:4px;font-weight:500; }
.ph__right { display:flex;align-items:center;gap:10px;flex-wrap:wrap; }

.glass-chip {
  display:flex;align-items:center;gap:8px;
  background:rgba(255,255,255,.1);
  border:1px solid rgba(255,255,255,.22);
  backdrop-filter:blur(16px);
  border-radius:40px;padding:9px 16px;
  box-shadow:0 4px 20px rgba(11,26,62,.2);
}
.glass-input {
  border:none;outline:none;
  font-size:13px;font-weight:600;
  color:#fff;background:transparent;
  width:180px;font-family:inherit;
}
.glass-input::placeholder { color:rgba(255,255,255,.4); }
.glass-select {
  border:none;outline:none;
  font-size:13px;font-weight:600;
  color:#fff;background:transparent;
  cursor:pointer;min-width:150px;font-family:inherit;
}
.glass-select option, .glass-select optgroup { color:var(--navy);background:#fff; }
.date-chip {
  background:var(--yellow);color:var(--navy);
  font-size:11px;font-weight:800;letter-spacing:.5px;
  padding:9px 16px;border-radius:40px;
  box-shadow:0 4px 18px rgba(245,197,24,.4);
}

/* ══ NAV TABS ══ */
.nav-tabs {
  display:flex;gap:4px;
  background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.14);
  border-radius:14px;padding:5px;
  margin-bottom:22px;
  width:fit-content;
  backdrop-filter:blur(16px);
}
.nav-tab {
  display:flex;align-items:center;gap:7px;
  padding:9px 16px;border-radius:10px;
  font-size:13px;font-weight:600;
  color:var(--txt-dim);
  border:none;background:transparent;cursor:pointer;
  transition:all .2s;
}
.nav-tab:hover { color:#fff;background:rgba(255,255,255,.1); }
.nav-tab--active {
  color:var(--navy);
  background:var(--yellow);
  font-weight:800;
  box-shadow:0 4px 14px rgba(245,197,24,.4);
}

/* ══ STAT CARDS ══ */
.sc-grid {
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(190px,1fr));
  gap:14px;margin-bottom:22px;
}
.sc {
  background:rgba(255,255,255,.09);
  border:1px solid rgba(255,255,255,.18);
  backdrop-filter:blur(22px) saturate(1.5);
  -webkit-backdrop-filter:blur(22px) saturate(1.5);
  border-radius:var(--r);padding:22px 22px 18px;
  position:relative;overflow:hidden;
  box-shadow:var(--glass-sh),inset 0 1px 0 rgba(255,255,255,.18);
  transition:transform .2s,box-shadow .2s;
  animation:fadeUp .55s cubic-bezier(.22,1,.36,1) both;
  animation-delay:calc(var(--i,0) * 0.08s);
}
.sc:hover { transform:translateY(-5px);box-shadow:0 18px 50px rgba(11,26,62,.4),inset 0 1px 0 rgba(255,255,255,.24); }
.sc::before {
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  border-radius:var(--r) var(--r) 0 0;
  background:linear-gradient(90deg,rgba(255,255,255,.45),rgba(255,255,255,.1));
}
.sc__glow {
  position:absolute;width:130px;height:130px;
  border-radius:50%;filter:blur(50px);pointer-events:none;
  top:-30px;right:-30px;opacity:.45;
}
.sc__glow--yellow { background:#f5c518; }
.sc__glow--blue   { background:#3b82f6; }
.sc__glow--purple { background:#a855f7; }
.sc__glow--mint   { background:#22c55e; }
.sc__watermark {
  position:absolute;bottom:14px;right:16px;
  font-size:10px;font-weight:900;letter-spacing:3px;
  color:rgba(255,255,255,.07);user-select:none;pointer-events:none;
}
.sc__icon-wrap {
  width:40px;height:40px;border-radius:10px;
  background:rgba(255,255,255,.14);
  border:1px solid rgba(255,255,255,.2);
  display:flex;align-items:center;justify-content:center;
  color:#fff;margin-bottom:14px;
}
.sc__val { font-size:28px;font-weight:900;line-height:1;margin-bottom:4px;letter-spacing:-1px; }
.sc__val--yellow { color:var(--yellow);text-shadow:0 0 18px rgba(245,197,24,.6); }
.sc__val--blue   { color:#93c5fd;text-shadow:0 0 14px rgba(147,197,253,.5); }
.sc__val--purple { color:#d8b4fe;text-shadow:0 0 14px rgba(216,180,254,.5); }
.sc__val--mint   { color:#86efac;text-shadow:0 0 14px rgba(134,239,172,.5); }
.sc__lbl { font-size:11px;color:var(--txt-dim);font-weight:600;margin-bottom:12px; }
.sc__tag {
  display:inline-block;font-size:10px;font-weight:700;
  padding:3px 10px;border-radius:20px;
  background:rgba(255,255,255,.1);
  border:1px solid rgba(255,255,255,.16);
  color:rgba(255,255,255,.82);
}
.sc__tag--yellow { background:rgba(245,197,24,.18);border-color:rgba(245,197,24,.32);color:#fde047; }
.sc__tag--mint   { background:rgba(74,222,128,.15);border-color:rgba(74,222,128,.3);color:#86efac; }

/* ══ CARDS GRID ══ */
.pcr-grid {
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
  gap:16px;
}

.pcr-card {
  padding:0;cursor:pointer;overflow:hidden;
  transition:transform .2s,box-shadow .2s;
}
.pcr-card:hover { transform:translateY(-4px);box-shadow:0 20px 56px rgba(11,26,62,.4),inset 0 1px 0 rgba(255,255,255,.22); }

/* Stripe warna di atas card */
.pcr-card__stripe { height:4px; }
.pcr-card__stripe--yellow { background:linear-gradient(90deg,#d4a008,#f5c518,#fde047); }
.pcr-card__stripe--blue   { background:linear-gradient(90deg,#1d4ed8,#60a5fa); }
.pcr-card__stripe--purple { background:linear-gradient(90deg,#7c3aed,#a78bfa); }
.pcr-card__stripe--orange { background:linear-gradient(90deg,#c2410c,#fb923c); }
.pcr-card__stripe--mint   { background:linear-gradient(90deg,#16a34a,#4ade80); }

.pcr-card__header {
  display:flex;align-items:flex-start;gap:10px;
  padding:16px 18px 12px;
}
.pcr-card__avatar {
  width:38px;height:38px;border-radius:10px;
  color:#fff;font-size:15px;font-weight:700;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.pcr-card__info { flex:1;min-width:0; }
.pcr-card__keg { font-size:13px;font-weight:700;color:#fff;line-height:1.3; }
.pcr-card__orm { font-size:11px;color:var(--txt-dim);margin-top:2px; }

/* Status badges */
.status-badge {
  display:inline-flex;align-items:center;
  padding:3px 10px;border-radius:20px;
  font-size:10px;font-weight:700;flex-shrink:0;
}
.status-badge--yellow { background:rgba(245,197,24,.2);color:#fde047;border:1px solid rgba(245,197,24,.35); }
.status-badge--blue   { background:rgba(96,165,250,.2);color:#93c5fd;border:1px solid rgba(96,165,250,.3); }
.status-badge--purple { background:rgba(167,139,250,.2);color:#d8b4fe;border:1px solid rgba(167,139,250,.3); }
.status-badge--orange { background:rgba(251,146,60,.2);color:#fdba74;border:1px solid rgba(251,146,60,.3); }
.status-badge--mint   { background:rgba(74,222,128,.2);color:#86efac;border:1px solid rgba(74,222,128,.3); }

.pcr-card__dana {
  display:grid;grid-template-columns:1fr 1fr;gap:10px;
  margin:0 18px 14px;padding:12px;
  background:rgba(255,255,255,.07);
  border-radius:10px;border:1px solid rgba(255,255,255,.1);
}
.pcr-dana-box__lbl {
  font-size:10px;color:var(--txt-faint);font-weight:600;
  text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;
}
.pcr-dana-box__val { font-size:13px;font-weight:700;color:#fff; }

.pcr-card__docs { padding:0 18px 14px; }
.pcr-card__docs-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:8px; }
.pcr-card__docs-lbl {
  font-size:10px;font-weight:700;color:var(--txt-faint);
  text-transform:uppercase;letter-spacing:.5px;
}
.pcr-card__docs-pct { font-size:11px;font-weight:800; }
.doc-checks { display:flex;flex-direction:column;gap:4px;margin-bottom:8px; }
.doc-check { display:flex;align-items:center;gap:6px;font-size:11px;color:#f87171; }
.doc-check--ok { color:#86efac; }
.pcr-prog { margin-top:6px; }
.pcr-prog__track {
  height:6px;border-radius:99px;
  background:rgba(255,255,255,.1);overflow:hidden;
}
.pcr-prog__fill { height:100%;border-radius:99px;transition:width .6s ease; }

.pcr-card__footer {
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 18px;
  border-top:1px solid rgba(255,255,255,.08);
}
.pcr-card__date { font-size:11px;color:var(--txt-faint); }
.btn-kelola {
  display:flex;align-items:center;gap:5px;
  padding:7px 14px;border-radius:8px;
  background:rgba(245,197,24,.18);
  border:1px solid rgba(245,197,24,.3);
  color:#fde047;font-size:12px;font-weight:700;
  cursor:pointer;transition:all .15s;
}
.btn-kelola:hover { background:rgba(245,197,24,.28); }

/* ══ EMPTY STATE ══ */
.empty-state {
  grid-column:1/-1;text-align:center;
  padding:60px;display:flex;flex-direction:column;
  align-items:center;gap:10px;
}
.empty-state__title { font-size:15px;font-weight:600;color:rgba(255,255,255,.7); }
.empty-state__sub   { font-size:12px;color:var(--txt-faint); }

/* ══ MODAL ══ */
.modal-backdrop {
  position:fixed;inset:0;
  background:rgba(6,16,43,.65);
  backdrop-filter:blur(6px);
  z-index:500;display:flex;
  align-items:center;justify-content:center;padding:16px;
}
.modal {
  background:linear-gradient(160deg,#fff 0%,#f8fafd 100%);
  border-radius:20px;width:100%;max-width:660px;
  max-height:90vh;overflow:hidden;
  display:flex;flex-direction:column;
  box-shadow:0 28px 90px rgba(11,26,62,.35),0 0 0 1px rgba(255,255,255,.5);
}

.modal__header {
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 24px;border-bottom:1px solid #f0f4fb;flex-shrink:0;
  background:linear-gradient(135deg,#fffbeb,#fff8e8,#fff);
}
.modal__header-left { display:flex;align-items:center;gap:14px; }
.modal__icon {
  width:44px;height:44px;border-radius:12px;
  background:linear-gradient(135deg,#412402,#c78b1a);
  color:#fff;display:flex;align-items:center;justify-content:center;
  box-shadow:0 6px 20px rgba(199,139,26,.35);
}
.modal__title { font-size:15px;font-weight:800;color:#0b1a3e; }
.modal__sub   { font-size:11px;color:#9db5d5;margin-top:2px; }
.modal__close {
  width:34px;height:34px;border-radius:9px;
  border:1.5px solid #e2eaf6;background:#fff;
  color:#4a6fa5;display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .15s;
}
.modal__close:hover { background:#f0f4fb;color:#0b1a3e; }

.modal__tabs {
  display:flex;border-bottom:2px solid #f0f4fb;
  padding:0 24px;flex-shrink:0;
}
.modal__tab {
  display:flex;align-items:center;gap:6px;
  padding:13px 14px;font-size:13px;font-weight:500;
  color:#9db5d5;border-bottom:2.5px solid transparent;
  cursor:pointer;transition:all .15s;
  background:none;border-top:none;border-left:none;border-right:none;
  position:relative;bottom:-2px;
}
.modal__tab:hover { color:#1e3a80; }
.modal__tab--active {
  color:#0b1a3e;font-weight:700;
  border-bottom-color:#f5c518;
}

.modal__body { flex:1;overflow-y:auto;padding:24px; }

/* Modal internals */
.m-section-lbl {
  font-size:10px;font-weight:800;color:#9db5d5;
  text-transform:uppercase;letter-spacing:.8px;margin-bottom:14px;
}
.m-syarat-list { display:flex;flex-direction:column;gap:8px;margin-bottom:20px; }
.m-syarat-item {
  display:flex;align-items:center;gap:12px;
  padding:13px;border:1.5px solid #fecaca;
  border-radius:11px;background:#fef9f9;
}
.m-syarat-item--ok { border-color:#bbf7d0;background:#f8fff9; }
.m-syarat-item__icon {
  width:34px;height:34px;border-radius:9px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.m-syarat-item:not(.m-syarat-item--ok) .m-syarat-item__icon { background:#fef2f2;color:#dc2626; }
.m-syarat-item--ok .m-syarat-item__icon { background:#f0fdf4;color:#16a34a; }
.m-syarat-item__info { flex:1; }
.m-syarat-item__name { font-size:13px;font-weight:600;color:#0b1a3e; }
.m-syarat-item__meta { font-size:11px;color:#9db5d5;margin-top:2px; }
.m-btn-view {
  display:flex;align-items:center;gap:5px;
  padding:7px 12px;border-radius:8px;
  background:#eff6ff;color:#1d4ed8;
  border:1px solid #bfdbfe;
  font-size:12px;font-weight:600;text-decoration:none;
  transition:all .15s;
}
.m-btn-view:hover { background:#dbeafe; }

.m-action-box {
  display:flex;align-items:flex-start;gap:14px;
  padding:16px;border-radius:13px;border:1px solid;
}
.m-action-box--green { background:#f0fdf4;border-color:#bbf7d0; }
.m-action-box--amber { background:#fffbeb;border-color:#fde68a; }
.m-action-box__icon {
  width:44px;height:44px;border-radius:11px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.m-action-box__text { flex:1; }
.m-action-box__title { font-size:14px;font-weight:700; }
.m-action-box__sub   { font-size:12px;color:#9db5d5;margin-top:2px; }

.m-spb-form { display:flex;flex-direction:column;gap:14px; }
.m-info-grid {
  display:grid;grid-template-columns:1fr 1fr;gap:12px;
  padding:16px;background:#f8fafd;border-radius:12px;
}
.m-info-item__lbl {
  font-size:10px;color:#9db5d5;font-weight:700;
  text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;
}
.m-info-item__val { font-size:13px;font-weight:600;color:#0b1a3e; }
.m-label { font-size:12px;font-weight:700;color:#1e3a80;display:block;margin-bottom:6px; }

.m-center-state {
  display:flex;flex-direction:column;align-items:center;
  gap:10px;padding:32px;text-align:center;
}
.m-center-state__icon {
  width:64px;height:64px;border-radius:18px;
  display:flex;align-items:center;justify-content:center;
}
.m-center-state__title { font-size:16px;font-weight:800;color:#0b1a3e; }
.m-center-state__sub   { font-size:13px;color:#9db5d5;max-width:320px;line-height:1.5; }

.m-bukti-preview {
  display:flex;align-items:center;gap:12px;
  padding:14px;border:1px solid #e2eaf6;
  border-radius:12px;margin-bottom:16px;background:#f8fafd;
}
.m-bukti-preview__icon {
  width:40px;height:40px;border-radius:10px;
  background:#fffbeb;color:#92400e;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.m-upload-area {
  border:2px dashed #e2eaf6;border-radius:12px;
  padding:32px;text-align:center;cursor:pointer;
  transition:all .15s;display:flex;
  flex-direction:column;align-items:center;gap:6px;
  background:#fafcff;
}
.m-upload-area:hover { border-color:#93c5fd;background:#eff6ff; }

/* ══ SHARED BUTTONS ══ */
.m-btn {
  display:inline-flex;align-items:center;gap:8px;
  padding:11px 18px;border-radius:10px;
  font-size:13px;font-weight:700;border:none;
  cursor:pointer;transition:all .15s;flex-shrink:0;
}
.m-btn:disabled { opacity:.55;cursor:not-allowed; }
.m-btn--navy  { background:linear-gradient(135deg,#0b1a3e,#1e3a80);color:#fff;box-shadow:0 4px 18px rgba(11,26,62,.25); }
.m-btn--navy:hover:not(:disabled) { filter:brightness(1.1); }
.m-btn--green { background:linear-gradient(135deg,#15803d,#22c55e);color:#fff;box-shadow:0 4px 14px rgba(34,197,94,.25); }
.m-btn--green:hover:not(:disabled) { filter:brightness(1.08); }
.m-btn--amber { background:#fffbeb;color:#92400e;border:1.5px solid #fde68a; }
.m-btn--amber:hover:not(:disabled) { background:#fef3c7; }

.m-textarea {
  width:100%;padding:10px 12px;border-radius:9px;
  border:1.5px solid #e2eaf6;font-size:13px;
  font-family:inherit;color:#0b1a3e;resize:vertical;
  box-sizing:border-box;
}
.m-textarea:focus { outline:none;border-color:#93c5fd; }

/* ══ RESPONSIVE ══ */
@media (max-width:900px) {
  .pcr-grid { grid-template-columns:1fr 1fr; }
}
@media (max-width:640px) {
  .pcr-page { padding:16px 14px 40px; }
  .sc-grid  { grid-template-columns:1fr 1fr; }
  .ph { flex-direction:column;align-items:flex-start; }
  .pcr-grid { grid-template-columns:1fr; }
  .m-info-grid { grid-template-columns:1fr; }
  .modal { max-height:100vh;border-radius:0; }
  .m-action-box { flex-direction:column; }
}
@media (max-width:420px) {
  .sc-grid { grid-template-columns:1fr; }
}
</style>