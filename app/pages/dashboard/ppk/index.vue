<template>
  <div class="ppk-dash">

    <!-- Page Header -->
    <div class="ph">
      <div class="ph__left">
        <div class="ph__icon"><Icon name="heroicons:chart-bar-square" class="w-6 h-6" /></div>
        <div>
          <h1 class="ph__title">Dashboard PPK</h1>
          <p class="ph__sub">Monitoring keuangan ormawa — {{ selectedOrmawa?.nama || 'Semua Ormawa' }}</p>
        </div>
      </div>
      <!-- Filter Ormawa -->
      <div class="ph__filter">
        <label class="filter-label">
          <Icon name="heroicons:building-office-2" class="w-4 h-4" />
          Filter Ormawa
        </label>
        <select v-model="selectedOrmawaId" class="filter-select" @change="onOrmawaChange">
          <option value="">Semua Ormawa</option>
          <optgroup v-for="fak in ormawaList" :key="fak.id" :label="fak.nama">
            <option v-for="orm in fak.ormawa" :key="orm.id" :value="orm.id">
              {{ orm.nama }} ({{ orm.kode }})
            </option>
          </optgroup>
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

    <!-- Stat Cards -->
    <div class="sc-grid">
      <div class="sc sc--blue">
        <div class="sc__top">
          <div class="sc__icon sc__icon--blue"><Icon name="heroicons:banknotes" class="w-5 h-5"/></div>
          <span class="sc__badge sc__badge--blue">Anggaran</span>
        </div>
        <p class="sc__val">{{ formatRp(currentData.totalAnggaran) }}</p>
        <p class="sc__lbl">Total Anggaran</p>
      </div>
      <div class="sc sc--red">
        <div class="sc__top">
          <div class="sc__icon sc__icon--red"><Icon name="heroicons:arrow-up-circle" class="w-5 h-5"/></div>
          <span class="sc__badge sc__badge--red">{{ usedPct }}%</span>
        </div>
        <p class="sc__val sc__val--red">{{ formatRp(currentData.terpakai) }}</p>
        <p class="sc__lbl">Terpakai</p>
      </div>
      <div class="sc sc--green">
        <div class="sc__top">
          <div class="sc__icon sc__icon--green"><Icon name="heroicons:arrow-down-circle" class="w-5 h-5"/></div>
          <span class="sc__badge sc__badge--green">{{ 100 - usedPct }}%</span>
        </div>
        <p class="sc__val sc__val--green">{{ formatRp(currentData.sisa) }}</p>
        <p class="sc__lbl">Sisa Anggaran</p>
      </div>
      <div class="sc sc--amber">
        <div class="sc__top">
          <div class="sc__icon sc__icon--amber"><Icon name="heroicons:document-text" class="w-5 h-5"/></div>
          <span class="sc__badge sc__badge--amber">Proposal</span>
        </div>
        <p class="sc__val sc__val--amber">{{ currentData.totalKegiatan }}</p>
        <p class="sc__lbl">Total Kegiatan</p>
      </div>
    </div>

    <!-- Progress Bar Anggaran Besar -->
    <div class="budget-bar-card">
      <div class="budget-bar-card__header">
        <span class="budget-bar-card__title">Penggunaan Anggaran</span>
        <span class="budget-bar-card__pct" :class="usedPct >= 90 ? 'danger' : usedPct >= 70 ? 'warn' : ''">
          {{ usedPct }}% terpakai
        </span>
      </div>
      <div class="budget-track">
        <div class="budget-fill" :style="{ width: usedPct + '%', background: budgetColor }" />
      </div>
      <div class="budget-bar-card__footer">
        <span>Rp 0</span>
        <span>{{ formatRp(currentData.totalAnggaran) }}</span>
      </div>
    </div>

    <!-- Chart Area -->
    <div class="chart-section">
      <!-- Chart per Ormawa (bar chart manual SVG) -->
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">Anggaran per Ormawa</h2>
          <p class="card__sub">Perbandingan anggaran seluruh ormawa di fakultas</p>
        </div>
        <div class="bar-chart-wrap">
          <div v-for="(bar, i) in barData" :key="i" class="bar-row">
            <div class="bar-row__label" :title="bar.nama">{{ bar.kode }}</div>
            <div class="bar-row__track">
              <div class="bar-row__bg" />
              <div class="bar-row__fill bar-row__fill--total" :style="{ width: bar.totalPct + '%' }" />
              <div class="bar-row__fill bar-row__fill--used" :style="{ width: bar.usedPct + '%' }" />
            </div>
            <div class="bar-row__vals">
              <span class="bar-row__rp">{{ formatRpShort(bar.terpakai) }}</span>
              <span class="bar-row__sep">/</span>
              <span class="bar-row__total">{{ formatRpShort(bar.anggaran) }}</span>
            </div>
          </div>
        </div>
        <div class="bar-legend">
          <span class="bar-legend__item bar-legend__item--total">Anggaran tersedia</span>
          <span class="bar-legend__item bar-legend__item--used">Terpakai</span>
        </div>
      </div>

      <!-- Doughnut-style breakdown -->
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">Status Kegiatan</h2>
          <p class="card__sub">Rekap status seluruh proposal kegiatan</p>
        </div>
        <div class="status-breakdown">
          <div v-for="st in statusData" :key="st.label" class="status-item">
            <div class="status-item__bar-wrap">
              <div class="status-item__track">
                <div class="status-item__fill" :style="{ width: st.pct + '%', background: st.color }" />
              </div>
              <span class="status-item__pct" :style="{ color: st.color }">{{ st.pct }}%</span>
            </div>
            <div class="status-item__meta">
              <span class="status-item__dot" :style="{ background: st.color }" />
              <span class="status-item__label">{{ st.label }}</span>
              <span class="status-item__count">{{ st.count }} kegiatan</span>
            </div>
          </div>
        </div>

        <!-- Per-ormawa table ringkas -->
        <div class="mini-table">
          <div class="mini-table__head">
            <span>Ormawa</span>
            <span>Kegiatan</span>
            <span>Disetujui</span>
            <span>Progress</span>
          </div>
          <div v-for="row in ormawaRows" :key="row.id" class="mini-table__row">
            <span class="mini-table__name">{{ row.kode }}</span>
            <span class="mini-table__num">{{ row.kegiatan }}</span>
            <span class="mini-table__num mini-table__num--green">{{ row.disetujui }}</span>
            <div class="mini-table__prog">
              <div class="mini-table__prog-track">
                <div class="mini-table__prog-fill" :style="{ width: row.progPct + '%' }" />
              </div>
              <span>{{ row.progPct }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

// API
const { data: dashData }   = await useFetch('/api/ppk/dashboard')
const { data: ormawaData } = await useFetch('/api/ppk/ormawa-anggaran')

// Filter state
const selectedOrmawaId = ref('')
const selectedOrmawa   = ref(null)

// Flatten ormawa list untuk dropdown
const ormawaList = computed(() => {
  return ormawaData.value?.data?.map(fak => ({
    id: fak.fakultas.id,
    nama: fak.fakultas.nama,
    ormawa: fak.ormawa,
  })) || []
})

const allOrmawa = computed(() => ormawaList.value.flatMap(f => f.ormawa))

const onOrmawaChange = () => {
  if (!selectedOrmawaId.value) { selectedOrmawa.value = null; return }
  selectedOrmawa.value = allOrmawa.value.find(o => o.id == selectedOrmawaId.value)
}

// Current data (filtered or total)
const currentData = computed(() => {
  const s = ormawaData.value?.summary || {}
  if (!selectedOrmawa.value) return {
    totalAnggaran: s.totalAnggaranKeseluruhan || 0,
    terpakai:      s.totalTerpakaiKeseluruhan || 0,
    sisa:          s.totalSisaKeseluruhan || 0,
    totalKegiatan: dashData.value?.total || 0,
  }
  const orm = selectedOrmawa.value
  return {
    totalAnggaran: orm.anggaran?.total || 0,
    terpakai:      orm.anggaran?.terpakai || 0,
    sisa:          orm.anggaran?.sisa || 0,
    totalKegiatan: orm.totalKegiatan || 0,
  }
})

const usedPct = computed(() => {
  const t = currentData.value.totalAnggaran
  if (!t) return 0
  return Math.min(Math.round((currentData.value.terpakai / t) * 100), 100)
})

const budgetColor = computed(() => {
  if (usedPct.value >= 90) return '#dc2626'
  if (usedPct.value >= 70) return '#d4b044'
  return 'linear-gradient(90deg, #1e3a6e, #4a6fa5)'
})

// Bar chart data
const barData = computed(() => {
  const maxAnggaran = Math.max(...allOrmawa.value.map(o => o.anggaran?.total || 0)) || 1
  return allOrmawa.value.map(orm => ({
    id: orm.id, kode: orm.kode, nama: orm.nama,
    anggaran: orm.anggaran?.total || 0,
    terpakai: orm.anggaran?.terpakai || 0,
    totalPct: Math.round(((orm.anggaran?.total || 0) / maxAnggaran) * 100),
    usedPct:  Math.round(((orm.anggaran?.terpakai || 0) / maxAnggaran) * 100),
  }))
})

// Status breakdown
const statusData = computed(() => {
  const d = dashData.value || {}
  const total = d.total || 1
  return [
    { label: 'Disetujui', count: d.disetujui || 0, color: '#16a34a', pct: Math.round(((d.disetujui||0)/total)*100) },
    { label: 'Menunggu',  count: d.menunggu  || 0, color: '#3b5988', pct: Math.round(((d.menunggu ||0)/total)*100) },
    { label: 'Revisi',    count: d.revisi    || 0, color: '#d4b044', pct: Math.round(((d.revisi   ||0)/total)*100) },
    { label: 'Ditolak',   count: d.ditolak   || 0, color: '#dc2626', pct: Math.round(((d.ditolak  ||0)/total)*100) },
  ]
})

// Mini table per ormawa
const ormawaRows = computed(() => allOrmawa.value.map(orm => ({
  id: orm.id, kode: orm.kode,
  kegiatan: orm.totalKegiatan || 0,
  disetujui: orm.disetujuiCount || 0,
  progPct: orm.totalKegiatan
    ? Math.round(((orm.disetujuiCount||0) / orm.totalKegiatan) * 100)
    : 0,
})))

// Helpers
const formatRp = n => 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0)
const formatRpShort = n => {
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1) + 'jt'
  if (n >= 1_000)     return 'Rp ' + (n / 1_000).toFixed(0) + 'rb'
  return 'Rp ' + n
}
</script>

<style scoped>
.ppk-dash { padding: 0; }

/* PAGE HEADER */
.ph { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; margin-bottom:24px; }
.ph__left { display:flex; align-items:center; gap:14px; }
.ph__icon { width:48px;height:48px;border-radius:13px;background:linear-gradient(135deg,var(--blue-800),var(--blue-600));color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(30,58,110,.2); }
.ph__title { font-size:20px;font-weight:700;color:var(--blue-900);line-height:1.2; }
.ph__sub   { font-size:12px;color:var(--blue-500);margin-top:3px; }
.ph__filter { display:flex;align-items:center;gap:10px; }
.filter-label { display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--blue-700); }
.filter-select {
  padding:8px 32px 8px 12px;border-radius:10px;
  border:1.5px solid #e2eaf6;background:#fff;
  font-size:13px;font-weight:500;color:var(--blue-900);
  font-family:inherit;cursor:pointer;min-width:200px;
  appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234a6fa5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 10px center;background-size:16px;
}
.filter-select:focus { outline:none;border-color:var(--blue-500); }

/* NAVIGATION TABS */
.nav-tabs-ppk { display:flex;gap:0;border-bottom:2px solid #e2eaf6;margin-bottom:20px; }
.nav-tab { display:flex;align-items:center;gap:6px;padding:12px 16px;font-size:13px;font-weight:600;color:#9db5d5;border-bottom:2px solid transparent;cursor:pointer;transition:all .2s;border:none;background:none;position:relative;bottom:-2px; }
.nav-tab:hover { color:var(--blue-600); }
.nav-tab--active { color:var(--blue-700);border-bottom-color:var(--blue-600); }

/* STAT CARDS */
.sc-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:16px; }
.sc { background:#fff;border-radius:14px;padding:18px 20px;border:1px solid #e2eaf6;position:relative;overflow:hidden;transition:transform .15s; }
.sc:hover { transform:translateY(-2px); }
.sc::after { content:'';position:absolute;top:0;left:0;right:0;height:3px; }
.sc--blue::after  { background:linear-gradient(90deg,var(--blue-700),var(--blue-400)); }
.sc--red::after   { background:linear-gradient(90deg,#dc2626,#f87171); }
.sc--green::after { background:linear-gradient(90deg,#16a34a,#4ade80); }
.sc--amber::after { background:linear-gradient(90deg,var(--gold-500),var(--gold-300)); }
.sc__top { display:flex;align-items:center;justify-content:space-between;margin-bottom:12px; }
.sc__icon { width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center; }
.sc__icon--blue  { background:var(--blue-50); color:var(--blue-600); }
.sc__icon--red   { background:#fef2f2; color:#dc2626; }
.sc__icon--green { background:#f0fdf4; color:#16a34a; }
.sc__icon--amber { background:var(--gold-100); color:#92400e; }
.sc__badge { font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px; }
.sc__badge--blue  { background:var(--blue-50);color:var(--blue-700); }
.sc__badge--red   { background:#fef2f2;color:#dc2626; }
.sc__badge--green { background:#f0fdf4;color:#16a34a; }
.sc__badge--amber { background:var(--gold-100);color:#92400e; }
.sc__val { font-size:20px;font-weight:700;color:var(--blue-900);margin-bottom:4px;line-height:1.2; }
.sc__val--red   { color:#dc2626; }
.sc__val--green { color:#16a34a; }
.sc__val--amber { color:#b45309; }
.sc__lbl { font-size:11px;color:#7c93b4;font-weight:500; }

/* BUDGET BAR */
.budget-bar-card { background:#fff;border-radius:14px;border:1px solid #e2eaf6;padding:18px 22px;margin-bottom:20px; }
.budget-bar-card__header { display:flex;align-items:center;justify-content:space-between;margin-bottom:12px; }
.budget-bar-card__title { font-size:14px;font-weight:700;color:var(--blue-900); }
.budget-bar-card__pct { font-size:13px;font-weight:700;color:var(--blue-600); }
.budget-bar-card__pct.danger { color:#dc2626; }
.budget-bar-card__pct.warn   { color:#b45309; }
.budget-track { height:12px;background:#f0f4fb;border-radius:99px;overflow:hidden;margin-bottom:6px; }
.budget-fill  { height:100%;border-radius:99px;transition:width .6s ease; }
.budget-bar-card__footer { display:flex;justify-content:space-between;font-size:11px;color:#9db5d5; }

/* CHART SECTION */
.chart-section { display:grid;grid-template-columns:1fr 1fr;gap:16px; }

/* CARD */
.card { background:#fff;border-radius:14px;border:1px solid #e2eaf6;overflow:hidden; }
.card__header { padding:18px 20px 12px;border-bottom:1px solid #f4f7fd; }
.card__title  { font-size:14px;font-weight:700;color:var(--blue-900); }
.card__sub    { font-size:11px;color:#9db5d5;margin-top:2px; }

/* BAR CHART */
.bar-chart-wrap { padding:16px 20px;display:flex;flex-direction:column;gap:12px; }
.bar-row { display:grid;grid-template-columns:56px 1fr auto;align-items:center;gap:10px; }
.bar-row__label { font-size:11px;font-weight:700;color:var(--blue-700);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.bar-row__track { position:relative;height:10px;border-radius:99px;background:#f0f4fb;overflow:hidden; }
.bar-row__bg   { position:absolute;inset:0;background:#eef2f9; }
.bar-row__fill { position:absolute;top:0;left:0;height:100%;border-radius:99px;transition:width .6s ease; }
.bar-row__fill--total { background:#dce8f9;z-index:1; }
.bar-row__fill--used  { background:linear-gradient(90deg,var(--blue-700),var(--blue-500));z-index:2; }
.bar-row__vals { display:flex;align-items:center;gap:4px;font-size:11px;white-space:nowrap; }
.bar-row__rp   { font-weight:700;color:var(--blue-800); }
.bar-row__sep  { color:#c5d3e8; }
.bar-row__total { color:#9db5d5; }
.bar-legend { display:flex;gap:16px;padding:4px 20px 16px;font-size:11px; }
.bar-legend__item { display:flex;align-items:center;gap:5px;color:#7c93b4; }
.bar-legend__item::before { content:'';width:10px;height:10px;border-radius:2px; }
.bar-legend__item--total::before { background:#dce8f9;border:1px solid #b8cfe8; }
.bar-legend__item--used::before  { background:var(--blue-600); }

/* STATUS BREAKDOWN */
.status-breakdown { padding:16px 20px;display:flex;flex-direction:column;gap:10px; }
.status-item__bar-wrap { display:flex;align-items:center;gap:8px;margin-bottom:4px; }
.status-item__track { flex:1;height:7px;background:#f0f4fb;border-radius:99px;overflow:hidden; }
.status-item__fill  { height:100%;border-radius:99px;transition:width .5s ease; }
.status-item__pct { font-size:12px;font-weight:700;min-width:32px;text-align:right; }
.status-item__meta { display:flex;align-items:center;gap:6px; }
.status-item__dot  { width:7px;height:7px;border-radius:50%;flex-shrink:0; }
.status-item__label { font-size:12px;font-weight:600;color:var(--blue-900);flex:1; }
.status-item__count { font-size:11px;color:#9db5d5; }

/* MINI TABLE */
.mini-table { border-top:1px solid #f0f4fb;margin-top:8px; }
.mini-table__head { display:grid;grid-template-columns:2fr 1fr 1fr 2fr;padding:8px 20px;font-size:10px;font-weight:700;color:#9db5d5;letter-spacing:.6px;text-transform:uppercase;background:#f8fafd; }
.mini-table__row  { display:grid;grid-template-columns:2fr 1fr 1fr 2fr;padding:9px 20px;border-top:1px solid #f4f7fd;align-items:center; }
.mini-table__row:hover { background:#fafcff; }
.mini-table__name { font-size:12px;font-weight:700;color:var(--blue-800); }
.mini-table__num  { font-size:12px;font-weight:600;color:var(--blue-700); }
.mini-table__num--green { color:#16a34a; }
.mini-table__prog { display:flex;align-items:center;gap:6px;font-size:11px;color:#9db5d5; }
.mini-table__prog-track { flex:1;height:5px;background:#f0f4fb;border-radius:99px;overflow:hidden; }
.mini-table__prog-fill  { height:100%;border-radius:99px;background:linear-gradient(90deg,var(--blue-700),var(--blue-400));transition:width .5s; }

/* RESPONSIVE */
@media (max-width:860px) { .chart-section { grid-template-columns:1fr; } }
@media (max-width:600px) {
  .sc-grid { grid-template-columns:1fr 1fr; }
  .ph { flex-direction:column;align-items:flex-start; }
  .filter-select { min-width:160px; }
}
</style>