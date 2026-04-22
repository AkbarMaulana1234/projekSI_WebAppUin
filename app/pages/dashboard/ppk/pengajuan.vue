<template>
  <div class="pgj-page">

    <!-- Animated background -->
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
          <h1 class="ph__title">Pengajuan <span class="ph__title--glow">Kegiatan</span></h1>
          <p class="ph__sub">✦ Verifikasi proposal kegiatan ormawa se-fakultas</p>
        </div>
      </div>
      <div class="ph__right">
        <div class="glass-chip">
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4" style="color:var(--yellow)"/>
          <input v-model="searchQuery" class="glass-input" placeholder="Cari kegiatan..."/>
        </div>
        <div class="glass-chip">
          <Icon name="heroicons:funnel" class="w-4 h-4" style="color:var(--yellow)"/>
          <select v-model="filterStatus" class="glass-select">
            <option value="">Semua Status</option>
            <option value="menunggu">Menunggu</option>
            <option value="disetujui">Disetujui</option>
            <option value="revisi">Revisi</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
        <div class="date-chip">{{ todayStr }}</div>
      </div>
    </div>

   
    <!-- ══ STAT CARDS ══ -->
    <div class="sc-grid">
      <div class="sc" style="--i:0">
        <div class="sc__glow sc__glow--blue"/>
        <div class="sc__watermark">TOTAL</div>
        <div class="sc__icon-wrap"><Icon name="heroicons:document-text" class="w-5 h-5"/></div>
        <p class="sc__val sc__val--blue">{{ totalKegiatan }}</p>
        <p class="sc__lbl">Total Kegiatan</p>
        <span class="sc__tag">Semua proposal</span>
      </div>
      <div class="sc" style="--i:1">
        <div class="sc__glow sc__glow--yellow"/>
        <div class="sc__watermark">WAIT</div>
        <div class="sc__icon-wrap"><Icon name="heroicons:clock" class="w-5 h-5"/></div>
        <p class="sc__val sc__val--yellow">{{ countByStatus('menunggu') }}</p>
        <p class="sc__lbl">Menunggu</p>
        <span class="sc__tag sc__tag--yellow">Perlu ditinjau</span>
      </div>
      <div class="sc" style="--i:2">
        <div class="sc__glow sc__glow--mint"/>
        <div class="sc__watermark">ACC</div>
        <div class="sc__icon-wrap"><Icon name="heroicons:check-circle" class="w-5 h-5"/></div>
        <p class="sc__val sc__val--mint">{{ countByStatus('disetujui') }}</p>
        <p class="sc__lbl">Disetujui</p>
        <span class="sc__tag sc__tag--mint">Lanjut SPI</span>
      </div>
      <div class="sc" style="--i:3">
        <div class="sc__glow sc__glow--coral"/>
        <div class="sc__watermark">REJECT</div>
        <div class="sc__icon-wrap"><Icon name="heroicons:x-circle" class="w-5 h-5"/></div>
        <p class="sc__val sc__val--coral">{{ countByStatus('ditolak') }}</p>
        <p class="sc__lbl">Ditolak</p>
        <span class="sc__tag sc__tag--coral">Tidak diproses</span>
      </div>
    </div>

    <!-- ══ TABLE PANEL ══ -->
    <div class="glass-panel tbl-panel" style="--i:4">
      <div class="tbl-panel__head">
        <div>
          <h2 class="tbl-panel__title">Daftar Pengajuan</h2>
          <p class="tbl-panel__sub">{{ filteredList.length }} kegiatan ditampilkan</p>
        </div>
        <span class="panel__pill">{{ totalKegiatan }} total</span>
      </div>

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
            <tr v-for="(item, idx) in filteredList" :key="item.id" class="tbl__row" :style="{'--ri': idx}">
              <td>
                <p class="tbl__name">{{ item.namaKegiatan }}</p>
                <p class="tbl__meta">{{ item.jenisKegiatan }}</p>
              </td>
              <td>
                <div class="tbl__ormawa">
                  <div class="tbl__avatar" :style="{ background: item.color }">{{ item.kodeOrmawa?.charAt(0) }}</div>
                  <div>
                    <p class="tbl__oname">{{ item.namaOrmawa }}</p>
                    <p class="tbl__okode">{{ item.kodeOrmawa }}</p>
                  </div>
                </div>
              </td>
              <td class="tbl__date">{{ formatDate(item.tanggalPengajuan) }}</td>
              <td class="tbl__rp text-right">{{ formatRp(item.totalDana) }}</td>
              <td class="text-center">
                <span class="status-badge" :class="'status-badge--' + statusColor(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
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
                <Icon name="heroicons:document-magnifying-glass" class="w-10 h-10" style="color:rgba(255,255,255,.2)"/>
                <p>Tidak ada data kegiatan</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══ MODAL ══ -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">

        <!-- Modal Header -->
        <div class="modal__header">
          <div class="modal__header-left">
            <div class="modal__icon">
              <Icon name="heroicons:document-check" class="w-5 h-5"/>
            </div>
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
          <div class="m-info-grid">
            <div class="m-info-item">
              <p class="m-info-item__lbl">Nama Kegiatan</p>
              <p class="m-info-item__val">{{ selected?.namaKegiatan }}</p>
            </div>
            <div class="m-info-item">
              <p class="m-info-item__lbl">Jenis Kegiatan</p>
              <p class="m-info-item__val">{{ selected?.jenisKegiatan }}</p>
            </div>
            <div class="m-info-item">
              <p class="m-info-item__lbl">Tanggal Kegiatan</p>
              <p class="m-info-item__val">{{ formatDate(selected?.tanggalKegiatan) }}</p>
            </div>
            <div class="m-info-item">
              <p class="m-info-item__lbl">Lokasi</p>
              <p class="m-info-item__val">{{ selected?.lokasi }}</p>
            </div>
            <div class="m-info-item">
              <p class="m-info-item__lbl">Peserta</p>
              <p class="m-info-item__val">{{ selected?.jumlahPeserta }} orang</p>
            </div>
            <div class="m-info-item">
              <p class="m-info-item__lbl">Dana Diajukan</p>
              <p class="m-info-item__val" style="color:#1e3a80;font-weight:800">{{ formatRp(selected?.totalDana) }}</p>
            </div>
            <div class="m-info-item m-info-item--full">
              <p class="m-info-item__lbl">Deskripsi Kegiatan</p>
              <p class="m-info-item__val">{{ selected?.deskripsi }}</p>
            </div>
            <div class="m-info-item">
              <p class="m-info-item__lbl">Diajukan oleh</p>
              <p class="m-info-item__val">{{ selected?.pengaju }}</p>
            </div>
            <div class="m-info-item">
              <p class="m-info-item__lbl">Tanggal Pengajuan</p>
              <p class="m-info-item__val">{{ formatDate(selected?.tanggalPengajuan) }}</p>
            </div>
          </div>

          <!-- RAB -->
          <div class="m-rab">
            <div class="m-rab__header">
              <Icon name="heroicons:calculator" class="w-4 h-4"/>
              Rincian Anggaran Biaya (RAB)
            </div>
            <table class="m-rab__table">
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
                  <td class="text-right" style="font-weight:600">{{ formatRp(rab.qty * rab.harga) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-right" style="font-weight:700">Total</td>
                  <td class="text-right m-rab__total">{{ formatRp(selected?.totalDana) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Tab: Dokumen -->
        <div v-if="activeTab === 'dokumen'" class="modal__body">
          <p class="m-section-lbl">Lampiran Dokumen Proposal</p>
          <div class="m-doc-list">
            <div v-for="doc in (selected?.dokumen || [])" :key="doc.id" class="m-doc-item">
              <div class="m-doc-item__icon">
                <Icon name="heroicons:document-text" class="w-6 h-6"/>
              </div>
              <div class="m-doc-item__info">
                <p class="m-doc-item__name">{{ doc.nama }}</p>
                <p class="m-doc-item__meta">{{ doc.tipe }} · {{ doc.ukuran }}</p>
              </div>
              <div class="m-doc-item__actions">
                <a :href="doc.url" target="_blank" class="m-btn-doc m-btn-doc--view">
                  <Icon name="heroicons:eye" class="w-4 h-4"/> Lihat
                </a>
                <a :href="doc.url" download class="m-btn-doc m-btn-doc--dl">
                  <Icon name="heroicons:arrow-down-tray" class="w-4 h-4"/> Unduh
                </a>
              </div>
            </div>
            <div v-if="!selected?.dokumen?.length" class="m-doc-empty">
              <Icon name="heroicons:folder-open" class="w-10 h-10" style="color:#c5d3e8"/>
              <p>Belum ada dokumen dilampirkan</p>
            </div>
          </div>
        </div>

        <!-- Tab: Keputusan -->
        <div v-if="activeTab === 'keputusan'" class="modal__body">

          <!-- Status saat ini -->
          <div class="m-cur-status">
            <p class="m-section-lbl" style="margin-bottom:0">Status Saat Ini</p>
            <span class="status-badge status-badge--lg" :class="'status-badge--' + statusColor(selected?.status)">
              {{ statusLabel(selected?.status) }}
            </span>
          </div>

          <!-- Riwayat -->
          <div v-if="selected?.riwayat?.length" class="m-riwayat">
            <p class="m-section-lbl">Riwayat Keputusan</p>
            <div v-for="rw in selected?.riwayat" :key="rw.id" class="m-riwayat__item">
              <div class="m-riwayat__dot" :class="'m-riwayat__dot--' + rw.status"/>
              <div>
                <p class="m-riwayat__action">{{ rw.keterangan }}</p>
                <p class="m-riwayat__by">{{ rw.oleh }} · {{ formatDate(rw.tanggal) }}</p>
              </div>
            </div>
          </div>

          <!-- Form keputusan (hanya jika menunggu) -->
          <div v-if="selected?.status === 'menunggu'" class="m-decision-form">
            <label class="m-label">Catatan / Alasan (opsional)</label>
            <textarea
              v-model="catatanPPK"
              class="m-textarea"
              rows="3"
              placeholder="Masukkan catatan atau alasan keputusan..."
            />
            <div class="m-decision-btns">
              <button class="m-btn m-btn--approve" @click="handleDecision('disetujui')" :disabled="loadingAction">
                <Icon name="heroicons:check-circle" class="w-5 h-5"/>
                Setujui — Teruskan ke SPI
              </button>
              <button class="m-btn m-btn--revisi" @click="handleDecision('revisi')" :disabled="loadingAction">
                <Icon name="heroicons:arrow-path" class="w-5 h-5"/>
                Minta Revisi
              </button>
              <button class="m-btn m-btn--tolak" @click="handleDecision('ditolak')" :disabled="loadingAction">
                <Icon name="heroicons:x-circle" class="w-5 h-5"/>
                Tolak
              </button>
            </div>
          </div>

          <!-- Sudah diputuskan -->
          <div v-else class="m-decided">
            <Icon name="heroicons:information-circle" class="w-5 h-5" style="color:#9db5d5;flex-shrink:0"/>
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

const searchQuery   = ref('')
const filterStatus  = ref('')
const showModal     = ref(false)
const selected      = ref(null)
const activeTab     = ref('info')
const catatanPPK    = ref('')
const loadingAction = ref(false)

const tabs = [
  { key: 'info',      label: 'Info Kegiatan', icon: 'heroicons:information-circle' },
  { key: 'dokumen',   label: 'Dokumen',       icon: 'heroicons:document-text' },
  { key: 'keputusan', label: 'Keputusan',     icon: 'heroicons:scale' },
]

const todayStr = new Date().toLocaleDateString('id-ID', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })

const kegiatanList  = computed(() => kegiatanData.value?.data || [])
const totalKegiatan = computed(() => kegiatanList.value.length)
const countByStatus = s => kegiatanList.value.filter(k => k.status === s).length

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
  } catch(e) { console.error(e) }
  finally { loadingAction.value = false }
}

const statusColor = s => ({
  menunggu:    'yellow',
  disetujui:   'mint',
  revisi:      'orange',
  ditolak:     'coral',
  dikirim_spi: 'blue',
}[s] || 'blue')

const statusLabel = s => ({
  menunggu: 'Menunggu', disetujui: 'Disetujui',
  revisi: 'Revisi', ditolak: 'Ditolak', dikirim_spi: 'Dikirim ke SPI',
}[s] || s)

const formatRp   = n => 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0)
const formatDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '-'
</script>

<style scoped>
/* ══════════════════════════════════════════
   TOKENS — identik dengan dashboard & pencairan
══════════════════════════════════════════ */
.pgj-page {
  --navy:      #0b1a3e;
  --yellow:    #f5c518;
  --yellow2:   #fde047;
  --glass-bg:  rgba(255,255,255,0.10);
  --glass-br:  rgba(255,255,255,0.20);
  --glass-sh:  0 8px 32px rgba(11,26,62,0.30);
  --txt-light: rgba(255,255,255,0.95);
  --txt-dim:   rgba(255,255,255,0.60);
  --txt-faint: rgba(255,255,255,0.32);
  --r:         18px;
  --r-sm:      12px;

  position: relative;
  isolation: isolate;
  padding: 28px 28px 56px;
  font-family: 'DM Sans','Segoe UI',sans-serif;
  overflow: hidden;
  color: var(--txt-light);
}

/* ══ BACKGROUND ══ */
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

.ph,.nav-tabs,.sc-grid,.tbl-panel,.glass-panel,.sc { position:relative;z-index:1; }

/* ══ GLASS PANEL ══ */
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
.ph__title { font-size:28px;font-weight:800;color:#fff;line-height:1.1;letter-spacing:-.6px;text-shadow:0 2px 14px rgba(11,26,62,.5); }
.ph__title--glow { color:var(--yellow);text-shadow:0 0 28px rgba(245,197,24,.7),0 2px 8px rgba(11,26,62,.4); }
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
  border:none;outline:none;font-size:13px;font-weight:600;
  color:#fff;background:transparent;width:160px;font-family:inherit;
}
.glass-input::placeholder { color:rgba(255,255,255,.4); }
.glass-select {
  border:none;outline:none;font-size:13px;font-weight:600;
  color:#fff;background:transparent;cursor:pointer;min-width:130px;font-family:inherit;
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
  margin-bottom:22px;width:fit-content;
  backdrop-filter:blur(16px);
}
.nav-tab {
  display:flex;align-items:center;gap:7px;
  padding:9px 16px;border-radius:10px;
  font-size:13px;font-weight:600;
  color:var(--txt-dim);
  border:none;background:transparent;cursor:pointer;transition:all .2s;
}
.nav-tab:hover { color:#fff;background:rgba(255,255,255,.1); }
.nav-tab--active { color:var(--navy);background:var(--yellow);font-weight:800;box-shadow:0 4px 14px rgba(245,197,24,.4); }

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
.sc__glow--blue   { background:#3b82f6; }
.sc__glow--yellow { background:#f5c518; }
.sc__glow--mint   { background:#22c55e; }
.sc__glow--coral  { background:#ef4444; }
.sc__watermark {
  position:absolute;bottom:14px;right:16px;font-size:10px;font-weight:900;
  letter-spacing:3px;color:rgba(255,255,255,.07);user-select:none;pointer-events:none;
}
.sc__icon-wrap {
  width:40px;height:40px;border-radius:10px;
  background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);
  display:flex;align-items:center;justify-content:center;color:#fff;margin-bottom:14px;
}
.sc__val { font-size:28px;font-weight:900;line-height:1;margin-bottom:4px;letter-spacing:-1px; }
.sc__val--blue  { color:#93c5fd;text-shadow:0 0 14px rgba(147,197,253,.5); }
.sc__val--yellow{ color:var(--yellow);text-shadow:0 0 18px rgba(245,197,24,.6); }
.sc__val--mint  { color:#86efac;text-shadow:0 0 14px rgba(134,239,172,.5); }
.sc__val--coral { color:#fca5a5;text-shadow:0 0 14px rgba(252,165,165,.5); }
.sc__lbl { font-size:11px;color:var(--txt-dim);font-weight:600;margin-bottom:12px; }
.sc__tag {
  display:inline-block;font-size:10px;font-weight:700;
  padding:3px 10px;border-radius:20px;
  background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);
  color:rgba(255,255,255,.82);
}
.sc__tag--yellow { background:rgba(245,197,24,.18);border-color:rgba(245,197,24,.32);color:#fde047; }
.sc__tag--mint   { background:rgba(74,222,128,.15);border-color:rgba(74,222,128,.3);color:#86efac; }
.sc__tag--coral  { background:rgba(252,165,165,.15);border-color:rgba(252,165,165,.3);color:#fca5a5; }

/* ══ TABLE PANEL ══ */
.tbl-panel { overflow:hidden; }
.tbl-panel__head {
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 20px 14px;
  border-bottom:1px solid rgba(255,255,255,.09);
}
.tbl-panel__title { font-size:14px;font-weight:800;color:#fff;letter-spacing:-.3px; }
.tbl-panel__sub   { font-size:11px;color:var(--txt-dim);margin-top:2px; }
.panel__pill {
  font-size:10px;font-weight:700;letter-spacing:.5px;
  background:rgba(245,197,24,.18);border:1px solid rgba(245,197,24,.3);
  color:#fde047;padding:4px 10px;border-radius:20px;flex-shrink:0;
}

/* ══ TABLE ══ */
.tbl-wrap { overflow-x:auto; }
.tbl { width:100%;border-collapse:collapse;font-size:13px; }
.tbl thead tr { background:rgba(255,255,255,.04); }
.tbl th {
  padding:11px 16px;text-align:left;
  font-size:10px;font-weight:700;color:var(--txt-faint);
  letter-spacing:.8px;text-transform:uppercase;
  border-bottom:1px solid rgba(255,255,255,.08);white-space:nowrap;
}
.tbl__row td {
  padding:13px 16px;
  border-top:1px solid rgba(255,255,255,.05);
  vertical-align:middle;
}
.tbl__row {
  animation: fadeUp .35s ease both;
  animation-delay: calc(0.45s + var(--ri,0) * 0.04s);
}
.tbl__row:hover td { background:rgba(255,255,255,.05); }
.tbl__name  { font-size:13px;font-weight:700;color:#fff; }
.tbl__meta  { font-size:11px;color:var(--txt-dim);margin-top:2px; }
.tbl__ormawa { display:flex;align-items:center;gap:9px; }
.tbl__avatar {
  width:30px;height:30px;border-radius:8px;
  color:#fff;font-size:12px;font-weight:700;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.tbl__oname { font-size:12px;font-weight:600;color:#fff; }
.tbl__okode { font-size:10px;color:var(--txt-dim); }
.tbl__date  { font-size:12px;color:var(--txt-dim);white-space:nowrap; }
.tbl__rp    { font-size:13px;font-weight:700;color:#fde047;white-space:nowrap; }
.tbl__empty {
  padding:50px;text-align:center;color:var(--txt-faint);
  font-size:13px;display:flex;flex-direction:column;
  align-items:center;gap:8px;
}
.text-right  { text-align:right; }
.text-center { text-align:center; }

/* ══ STATUS BADGES ══ */
.status-badge {
  display:inline-flex;align-items:center;
  padding:3px 10px;border-radius:20px;
  font-size:11px;font-weight:700;
}
.status-badge--lg { font-size:13px;padding:6px 16px; }
.status-badge--yellow { background:rgba(245,197,24,.2);color:#fde047;border:1px solid rgba(245,197,24,.35); }
.status-badge--mint   { background:rgba(74,222,128,.2);color:#86efac;border:1px solid rgba(74,222,128,.3); }
.status-badge--coral  { background:rgba(248,113,113,.2);color:#fca5a5;border:1px solid rgba(248,113,113,.3); }
.status-badge--orange { background:rgba(251,146,60,.2);color:#fdba74;border:1px solid rgba(251,146,60,.3); }
.status-badge--blue   { background:rgba(147,197,253,.2);color:#93c5fd;border:1px solid rgba(147,197,253,.3); }

/* ══ DETAIL BUTTON ══ */
.btn-detail {
  display:inline-flex;align-items:center;gap:5px;
  padding:6px 12px;border-radius:8px;
  background:rgba(245,197,24,.15);
  border:1px solid rgba(245,197,24,.28);
  color:#fde047;font-size:12px;font-weight:700;
  cursor:pointer;transition:all .15s;
}
.btn-detail:hover { background:rgba(245,197,24,.25); }

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
  border-radius:20px;width:100%;max-width:720px;
  max-height:90vh;overflow:hidden;display:flex;flex-direction:column;
  box-shadow:0 28px 90px rgba(11,26,62,.35),0 0 0 1px rgba(255,255,255,.5);
}

.modal__header {
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 24px;border-bottom:1px solid #f0f4fb;flex-shrink:0;
  background:linear-gradient(135deg,#eff6ff,#f0f9ff,#fff);
}
.modal__header-left { display:flex;align-items:center;gap:14px; }
.modal__icon {
  width:44px;height:44px;border-radius:12px;
  background:linear-gradient(135deg,#0b1a3e,#1e3a80);
  color:#fff;display:flex;align-items:center;justify-content:center;
  box-shadow:0 6px 20px rgba(11,26,62,.3);
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

.modal__tabs { display:flex;border-bottom:2px solid #f0f4fb;padding:0 24px;flex-shrink:0; }
.modal__tab {
  display:flex;align-items:center;gap:6px;
  padding:13px 14px;font-size:13px;font-weight:500;color:#9db5d5;
  border-bottom:2.5px solid transparent;cursor:pointer;transition:all .15s;
  background:none;border-top:none;border-left:none;border-right:none;
  position:relative;bottom:-2px;
}
.modal__tab:hover { color:#1e3a80; }
.modal__tab--active { color:#0b1a3e;font-weight:700;border-bottom-color:#f5c518; }

.modal__body { flex:1;overflow-y:auto;padding:24px; }

/* Modal internals */
.m-section-lbl {
  font-size:10px;font-weight:800;color:#9db5d5;
  text-transform:uppercase;letter-spacing:.8px;margin-bottom:14px;
}
.m-info-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px; }
.m-info-item { display:flex;flex-direction:column;gap:4px; }
.m-info-item--full { grid-column:1/-1; }
.m-info-item__lbl { font-size:10px;font-weight:700;color:#9db5d5;text-transform:uppercase;letter-spacing:.6px; }
.m-info-item__val { font-size:14px;font-weight:500;color:#0b1a3e; }

/* RAB */
.m-rab { border:1px solid #e2eaf6;border-radius:12px;overflow:hidden; }
.m-rab__header {
  display:flex;align-items:center;gap:7px;
  padding:12px 16px;font-size:12px;font-weight:700;
  color:#0b1a3e;background:#f8fafd;border-bottom:1px solid #e2eaf6;
}
.m-rab__table { width:100%;border-collapse:collapse;font-size:13px; }
.m-rab__table th { padding:9px 14px;font-size:10px;font-weight:700;color:#7c93b4;letter-spacing:.6px;text-transform:uppercase;background:#f8fafd; }
.m-rab__table td { padding:10px 14px;border-top:1px solid #f4f7fd;color:#0b1a3e; }
.m-rab__table tfoot td { background:#f8fafd;border-top:2px solid #e2eaf6;font-weight:700;color:#0b1a3e; }
.m-rab__total { color:#1e3a80;font-weight:800; }

/* Dokumen */
.m-doc-list { display:flex;flex-direction:column;gap:10px; }
.m-doc-item {
  display:flex;align-items:center;gap:14px;padding:14px;
  border:1px solid #e2eaf6;border-radius:12px;transition:border .15s;
}
.m-doc-item:hover { border-color:#93c5fd; }
.m-doc-item__icon {
  width:44px;height:44px;border-radius:11px;
  background:#eff6ff;color:#3b82f6;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.m-doc-item__info { flex:1; }
.m-doc-item__name { font-size:13px;font-weight:600;color:#0b1a3e; }
.m-doc-item__meta { font-size:11px;color:#9db5d5;margin-top:2px; }
.m-doc-item__actions { display:flex;gap:8px; }
.m-btn-doc {
  display:flex;align-items:center;gap:5px;padding:7px 12px;border-radius:8px;
  font-size:12px;font-weight:600;text-decoration:none;transition:all .15s;
}
.m-btn-doc--view { background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe; }
.m-btn-doc--view:hover { background:#dbeafe; }
.m-btn-doc--dl   { background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0; }
.m-btn-doc--dl:hover { background:#dcfce7; }
.m-doc-empty { text-align:center;padding:40px;color:#9db5d5;font-size:13px;display:flex;flex-direction:column;align-items:center;gap:8px; }

/* Keputusan */
.m-cur-status {
  display:flex;align-items:center;justify-content:space-between;
  padding:16px;background:#f8fafd;border-radius:12px;margin-bottom:20px;
  border:1px solid #e2eaf6;
}
.m-riwayat { margin-bottom:24px; }
.m-riwayat__item { display:flex;gap:12px;padding-bottom:14px;position:relative; }
.m-riwayat__item:not(:last-child)::before { content:'';position:absolute;left:6px;top:16px;bottom:0;width:1px;background:#e2eaf6; }
.m-riwayat__dot { width:14px;height:14px;border-radius:50%;flex-shrink:0;margin-top:3px; }
.m-riwayat__dot--disetujui { background:#16a34a; }
.m-riwayat__dot--revisi    { background:#d4b044; }
.m-riwayat__dot--ditolak   { background:#dc2626; }
.m-riwayat__dot--menunggu  { background:#e2eaf6; }
.m-riwayat__action { font-size:13px;font-weight:600;color:#0b1a3e; }
.m-riwayat__by     { font-size:11px;color:#9db5d5;margin-top:2px; }

.m-decision-form { background:#f8fafd;border-radius:12px;padding:18px;border:1px solid #e2eaf6; }
.m-label { font-size:12px;font-weight:700;color:#1e3a80;display:block;margin-bottom:8px; }
.m-textarea {
  width:100%;padding:10px 12px;border-radius:9px;
  border:1.5px solid #e2eaf6;font-size:13px;
  font-family:inherit;color:#0b1a3e;resize:vertical;
  min-height:80px;margin-bottom:14px;
  transition:border .15s;box-sizing:border-box;
}
.m-textarea:focus { outline:none;border-color:#93c5fd; }

.m-decision-btns { display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px; }
.m-btn {
  display:flex;align-items:center;justify-content:center;gap:8px;
  padding:12px 16px;border-radius:10px;
  font-size:13px;font-weight:700;
  border:none;cursor:pointer;transition:all .15s;
}
.m-btn:disabled { opacity:.6;cursor:not-allowed; }
.m-btn--approve { background:linear-gradient(135deg,#15803d,#22c55e);color:#fff;box-shadow:0 4px 14px rgba(34,197,94,.25); }
.m-btn--approve:hover:not(:disabled) { filter:brightness(1.08); }
.m-btn--revisi  { background:#fffbeb;color:#92400e;border:1.5px solid #fde68a; }
.m-btn--revisi:hover:not(:disabled)  { background:#fef3c7; }
.m-btn--tolak   { background:#fef2f2;color:#dc2626;border:1.5px solid #fecaca; }
.m-btn--tolak:hover:not(:disabled)   { background:#fee2e2; }

.m-decided {
  display:flex;align-items:center;gap:8px;
  padding:14px;background:#f8fafd;border-radius:10px;
  font-size:13px;color:#9db5d5;border:1px solid #e2eaf6;
}

/* ══ RESPONSIVE ══ */
@media (max-width:900px) {
  .tbl-wrap { font-size:12px; }
}
@media (max-width:640px) {
  .pgj-page { padding:16px 14px 40px; }
  .sc-grid  { grid-template-columns:1fr 1fr; }
  .ph { flex-direction:column;align-items:flex-start; }
  .m-info-grid { grid-template-columns:1fr; }
  .m-decision-btns { grid-template-columns:1fr; }
  .modal { max-height:100vh;border-radius:0; }
}
@media (max-width:420px) {
  .sc-grid { grid-template-columns:1fr; }
}
</style>