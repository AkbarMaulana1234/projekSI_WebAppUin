<template>
  <div class="ppk-dash">

    <!-- Animated mesh background -->
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
          <h1 class="ph__title">Dashboard <span class="ph__title--glow">PPK</span></h1>
          <p class="ph__sub">✦ Monitoring keuangan ormawa — {{ selectedOrmawa?.nama || 'Semua Ormawa' }}</p>
        </div>
      </div>
      <div class="ph__right">
        <div class="glass-chip">
          <span class="glass-chip__icon">⊞</span>
          <select v-model="selectedOrmawaId" class="glass-chip__select" @change="onOrmawaChange">
            <option value="">Semua Ormawa</option>
            <optgroup v-for="fak in ormawaList" :key="fak.id" :label="fak.nama">
              <option v-for="orm in fak.ormawa" :key="orm.id" :value="orm.id">
                {{ orm.nama }} ({{ orm.kode }})
              </option>
            </optgroup>
          </select>
        </div>
        <div class="date-chip">{{ todayStr }}</div>
      </div>
    </div>

    <!-- ══ STAT CARDS ══ -->
    <div class="sc-grid">

      <div class="sc" style="--i:0">
        <div class="sc__glow sc__glow--blue" />
        <div class="sc__watermark">BUDGET</div>
        <div class="sc__icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </svg>
        </div>
        <p class="sc__val">{{ formatRp(currentData.totalAnggaran) }}</p>
        <p class="sc__lbl">Total Anggaran</p>
        <span class="sc__tag">↗ Dana aktif</span>
      </div>

      <div class="sc sc--yellow" style="--i:1">
        <div class="sc__glow sc__glow--yellow" />
        <div class="sc__watermark">SPENT</div>
        <div class="sc__icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <p class="sc__val">{{ formatRp(currentData.terpakai) }}</p>
        <p class="sc__lbl">Terpakai</p>
        <span class="sc__tag">{{ usedPct }}% dari total</span>
      </div>

      <div class="sc sc--mint" style="--i:2">
        <div class="sc__glow sc__glow--mint" />
        <div class="sc__watermark">LEFT</div>
        <div class="sc__icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p class="sc__val">{{ formatRp(currentData.sisa) }}</p>
        <p class="sc__lbl">Sisa Anggaran</p>
        <span class="sc__tag">{{ 100 - usedPct }}% tersisa</span>
      </div>

      <div class="sc sc--coral" style="--i:3">
        <div class="sc__glow sc__glow--coral" />
        <div class="sc__watermark">EVENTS</div>
        <div class="sc__icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
          </svg>
        </div>
        <p class="sc__val">{{ currentData.totalKegiatan }}</p>
        <p class="sc__lbl">Total Kegiatan</p>
        <span class="sc__tag">Proposal aktif</span>
      </div>

    </div>

    <!-- ══ BUDGET HERO ══ -->
    <div class="budget-hero glass-panel" style="--i:4">
      <div class="budget-hero__left">
        <span class="budget-hero__eyebrow">PENGGUNAAN ANGGARAN</span>
        <div class="budget-hero__pct-wrap">
          <span class="budget-hero__pct" :class="usedPct>=90?'danger':usedPct>=70?'warn':''">
            {{ usedPct }}<span class="budget-hero__sym">%</span>
          </span>
          <span class="budget-hero__label">terpakai</span>
        </div>
      </div>
      <div class="budget-hero__bar-area">
        <div class="budget-hero__track">
          <div class="budget-hero__fill" :style="{ width: usedPct + '%', background: budgetFill }" />
          <div v-if="usedPct > 5" class="budget-hero__pin" :style="{ left: usedPct + '%' }">
            <span>{{ usedPct }}%</span>
          </div>
        </div>
        <div class="budget-hero__range">
          <span>Rp 0</span>
          <span>{{ formatRp(currentData.totalAnggaran) }}</span>
        </div>
      </div>
    </div>

    <!-- ══ CHARTS ══ -->
    <div class="charts-grid">

      <!-- Bar chart -->
      <div class="glass-panel" style="--i:5">
        <div class="panel__head">
          <div>
            <h2 class="panel__title">Anggaran per Ormawa</h2>
            <p class="panel__sub">Komparasi anggaran &amp; penggunaan</p>
          </div>
          <span class="panel__pill">{{ barData.length }} ormawa</span>
        </div>
        <div class="bars-wrap">
          <div v-for="(bar, i) in barData" :key="i" class="bar-item" :style="{'--di': i}">
            <div class="bar-item__meta">
              <span class="bar-item__kode">{{ bar.kode }}</span>
              <span class="bar-item__rp">{{ formatRpShort(bar.terpakai) }} / {{ formatRpShort(bar.anggaran) }}</span>
            </div>
            <div class="bar-item__track">
              <div class="bar-item__bg"   :style="{ width: bar.totalPct + '%' }" />
              <div class="bar-item__used" :style="{ width: bar.usedPct  + '%' }" />
            </div>
          </div>
        </div>
        <div class="bar-legend">
          <span class="bar-legend__swatch bar-legend__swatch--a" /><span class="bar-legend__txt">Tersedia</span>
          <span class="bar-legend__swatch bar-legend__swatch--u" /><span class="bar-legend__txt">Terpakai</span>
        </div>
      </div>

      <!-- Right col -->
      <div class="panel-col">

        <!-- Status -->
        <div class="glass-panel" style="--i:6">
          <div class="panel__head">
            <div>
              <h2 class="panel__title">Status Kegiatan</h2>
              <p class="panel__sub">Rekap seluruh proposal</p>
            </div>
            <span class="panel__pill">{{ currentData.totalKegiatan }} total</span>
          </div>
          <div class="status-grid">
            <div v-for="st in statusData" :key="st.label" class="status-card" :style="{'--sc':st.color,'--di':st.di}">
              <div class="status-card__top">
                <span class="status-card__dot" />
                <span class="status-card__lbl">{{ st.label }}</span>
              </div>
              <div class="status-card__num">{{ st.count }}</div>
              <div class="status-card__track">
                <div class="status-card__fill" :style="{ width: st.pct + '%' }" />
              </div>
              <span class="status-card__pct">{{ st.pct }}%</span>
            </div>
          </div>
        </div>

        <!-- Mini table -->
        <div class="glass-panel" style="--i:7">
          <div class="panel__head">
            <h2 class="panel__title">Progress Ormawa</h2>
            <p class="panel__sub">Kegiatan disetujui</p>
          </div>
          <table class="mtbl">
            <thead>
              <tr>
                <th>Ormawa</th><th>Kegiatan</th><th>✓ ACC</th><th>Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in ormawaRows" :key="row.id" class="mtbl__row">
                <td class="mtbl__kode">{{ row.kode }}</td>
                <td class="mtbl__num">{{ row.kegiatan }}</td>
                <td class="mtbl__ok">{{ row.disetujui }}</td>
                <td class="mtbl__prog">
                  <div class="mtbl__track"><div class="mtbl__fill" :style="{ width: row.progPct+'%' }" /></div>
                  <span class="mtbl__pct">{{ row.progPct }}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const { data: dashData }   = await useFetch('/api/ppk/dashboard')
const { data: ormawaData } = await useFetch('/api/ppk/ormawa-anggaran')

const selectedOrmawaId = ref('')
const selectedOrmawa   = ref(null)

const todayStr = computed(() =>
  new Date().toLocaleDateString('id-ID',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})
)

const ormawaList = computed(() =>
  ormawaData.value?.data?.map(fak => ({ id:fak.fakultas.id, nama:fak.fakultas.nama, ormawa:fak.ormawa })) || []
)
const allOrmawa = computed(() => ormawaList.value.flatMap(f => f.ormawa))

const onOrmawaChange = () => {
  if (!selectedOrmawaId.value) { selectedOrmawa.value = null; return }
  selectedOrmawa.value = allOrmawa.value.find(o => o.id == selectedOrmawaId.value)
}

const currentData = computed(() => {
  const s = ormawaData.value?.summary || {}
  if (!selectedOrmawa.value) return {
    totalAnggaran: s.totalAnggaranKeseluruhan || 0,
    terpakai:      s.totalTerpakaiKeseluruhan || 0,
    sisa:          s.totalSisaKeseluruhan     || 0,
    totalKegiatan: dashData.value?.total      || 0,
  }
  const o = selectedOrmawa.value
  return {
    totalAnggaran: o.anggaran?.total    || 0,
    terpakai:      o.anggaran?.terpakai || 0,
    sisa:          o.anggaran?.sisa     || 0,
    totalKegiatan: o.totalKegiatan      || 0,
  }
})

const usedPct = computed(() => {
  const t = currentData.value.totalAnggaran
  return t ? Math.min(Math.round((currentData.value.terpakai / t) * 100), 100) : 0
})

const budgetFill = computed(() =>
  usedPct.value >= 90 ? 'linear-gradient(90deg,#dc2626,#f87171)' :
  usedPct.value >= 70 ? 'linear-gradient(90deg,#d97706,#fbbf24)' :
  'linear-gradient(90deg,rgba(255,255,255,.8) 0%,rgba(255,255,255,.5) 40%,#f5c518 100%)'
)

const barData = computed(() => {
  const mx = Math.max(...allOrmawa.value.map(o => o.anggaran?.total || 0), 1)
  return allOrmawa.value.map(o => ({
    kode: o.kode,
    anggaran: o.anggaran?.total    || 0,
    terpakai: o.anggaran?.terpakai || 0,
    totalPct: Math.round(((o.anggaran?.total    || 0) / mx) * 100),
    usedPct:  Math.round(((o.anggaran?.terpakai || 0) / mx) * 100),
  }))
})

const statusData = computed(() => {
  const d = dashData.value || {}; const t = d.total || 1
  return [
    { label:'Disetujui', count:d.disetujui||0, color:'#4ade80', di:0, pct:Math.round(((d.disetujui||0)/t)*100) },
    { label:'Menunggu',  count:d.menunggu ||0, color:'#93c5fd', di:1, pct:Math.round(((d.menunggu ||0)/t)*100) },
    { label:'Revisi',    count:d.revisi   ||0, color:'#f5c518', di:2, pct:Math.round(((d.revisi   ||0)/t)*100) },
    { label:'Ditolak',   count:d.ditolak  ||0, color:'#f87171', di:3, pct:Math.round(((d.ditolak  ||0)/t)*100) },
  ]
})

const ormawaRows = computed(() => allOrmawa.value.map(o => ({
  id: o.id, kode: o.kode,
  kegiatan:  o.totalKegiatan   || 0,
  disetujui: o.disetujuiCount  || 0,
  progPct: o.totalKegiatan
    ? Math.round(((o.disetujuiCount||0) / o.totalKegiatan) * 100) : 0,
})))

const formatRp      = n => 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0)
const formatRpShort = n =>
  n >= 1e6 ? 'Rp '+(n/1e6).toFixed(1)+'jt' :
  n >= 1e3 ? 'Rp '+(n/1e3).toFixed(0)+'rb' : 'Rp '+n
</script>

<style scoped>
/* ══════════════════════════════════════════
   TOKENS
══════════════════════════════════════════ */
.ppk-dash {
  --navy:      #0b1a3e;
  --navy2:     #162a5c;
  --navy3:     #1e3a80;
  --blue:      #2a5bd7;
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
  /* 
    ✅ PERBAIKAN UTAMA:
    - Hapus min-height: 100vh agar tinggi menyesuaikan konten (bukan layar penuh)
    - Tambah isolation: isolate agar stacking context terisolasi di sini
    - overflow: hidden tetap agar orb tidak meluber keluar
  */
  isolation: isolate;
  padding: 28px 28px 56px;
  font-family: 'DM Sans','Segoe UI',sans-serif;
  overflow: hidden;
  color: var(--txt-light);
}

/* ══════════════════════════════════════════
   BACKGROUND — diagonal navy → yellow
   ✅ PERBAIKAN: position fixed → absolute
   Sekarang background hanya ada di dalam
   .ppk-dash, tidak bocor ke footer
══════════════════════════════════════════ */
.bg-mesh {
  position: absolute; inset: 0; z-index: 0; pointer-events: none; /* ✅ fixed → absolute */
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

.bg-orbs {
  position: absolute; inset: 0; z-index: 0; pointer-events: none; /* ✅ fixed → absolute */
}
.orb {
  position: absolute; border-radius: 50%;
  filter: blur(100px); pointer-events: none;
  animation: orbFloat 16s ease-in-out infinite;
}
.orb--1 {
  width: 560px; height: 560px; top: -180px; left: -140px;
  background: radial-gradient(circle, rgba(42,91,215,.4) 0%, transparent 70%);
  animation-delay: 0s;
}
.orb--2 {
  width: 460px; height: 460px; bottom: -120px; right: -100px;
  background: radial-gradient(circle, rgba(245,197,24,.45) 0%, transparent 70%);
  animation-delay: -7s;
}
.orb--3 {
  width: 320px; height: 320px; top: 35%; left: 25%;
  background: radial-gradient(circle, rgba(255,255,255,.05) 0%, transparent 70%);
  animation-delay: -12s;
}
.orb--4 {
  width: 240px; height: 240px; top: 15%; right: 20%;
  background: radial-gradient(circle, rgba(245,197,24,.12) 0%, transparent 70%);
  animation-delay: -4s;
}
@keyframes orbFloat {
  0%,100% { transform: translate(0,0) scale(1); }
  33%      { transform: translate(28px,-28px) scale(1.07); }
  66%      { transform: translate(-20px,20px) scale(.93); }
}

/* Dot grid — ✅ fixed → absolute */
.bg-grid {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image: radial-gradient(circle, rgba(255,255,255,.06) 1px, transparent 1px);
  background-size: 30px 30px;
}

/* All content layers above bg */
.ph, .sc-grid, .budget-hero,
.charts-grid, .glass-panel, .sc {
  position: relative; z-index: 1;
}

/* ══════════════════════════════════════════
   GLASSMORPHISM BASE
══════════════════════════════════════════ */
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

/* ══════════════════════════════════════════
   PAGE HEADER
══════════════════════════════════════════ */
.ph {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 14px; margin-bottom: 26px;
}
.ph__left { display: flex; align-items: center; gap: 16px; }

.ph__badge {
  font-size: 11px; font-weight: 900; letter-spacing: 3px;
  color: var(--navy); background: var(--yellow);
  padding: 12px 15px; border-radius: 14px;
  box-shadow: 0 0 0 3px rgba(245,197,24,.4), 0 8px 28px rgba(245,197,24,.35);
}

.ph__title {
  font-size: 28px; font-weight: 800; color: #fff;
  line-height: 1.1; letter-spacing: -.6px;
  text-shadow: 0 2px 14px rgba(11,26,62,.5);
}
.ph__title--glow {
  color: var(--yellow);
  text-shadow: 0 0 28px rgba(245,197,24,.7), 0 2px 8px rgba(11,26,62,.4);
}
.ph__sub {
  font-size: 12px; color: var(--txt-dim);
  margin-top: 4px; font-weight: 500;
}

.ph__right { display: flex; align-items: center; gap: 10px; }

.glass-chip {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.22);
  backdrop-filter: blur(16px);
  border-radius: 40px; padding: 9px 16px;
  box-shadow: 0 4px 20px rgba(11,26,62,.2);
}
.glass-chip__icon { font-size: 14px; color: var(--yellow); }
.glass-chip__select {
  border: none; outline: none;
  font-size: 13px; font-weight: 600;
  color: #fff; background: transparent;
  cursor: pointer; min-width: 180px; font-family: inherit;
}
.glass-chip__select option,
.glass-chip__select optgroup {
  color: var(--navy); background: #fff;
}

.date-chip {
  background: var(--yellow); color: var(--navy);
  font-size: 11px; font-weight: 800; letter-spacing: .5px;
  padding: 9px 16px; border-radius: 40px;
  box-shadow: 0 4px 18px rgba(245,197,24,.4);
}

/* ══════════════════════════════════════════
   STAT CARDS
══════════════════════════════════════════ */
.sc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px; margin-bottom: 18px;
}

.sc {
  background: rgba(255,255,255,.09);
  border: 1px solid rgba(255,255,255,.18);
  backdrop-filter: blur(22px) saturate(1.5);
  -webkit-backdrop-filter: blur(22px) saturate(1.5);
  border-radius: var(--r);
  padding: 22px 22px 18px;
  position: relative; overflow: hidden;
  box-shadow: var(--glass-sh), inset 0 1px 0 rgba(255,255,255,.18);
  transition: transform .2s, box-shadow .2s;
  animation: fadeUp .55s cubic-bezier(.22,1,.36,1) both;
  animation-delay: calc(var(--i,0) * 0.08s);
}
.sc:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 50px rgba(11,26,62,.4), inset 0 1px 0 rgba(255,255,255,.24);
}

/* Top stripe */
.sc::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  border-radius: var(--r) var(--r) 0 0;
  background: linear-gradient(90deg, rgba(255,255,255,.45), rgba(255,255,255,.1));
}
.sc--yellow::before { background: linear-gradient(90deg,#d4a008,var(--yellow),#fde047); }
.sc--mint::before   { background: linear-gradient(90deg,#16a34a,#4ade80); }
.sc--coral::before  { background: linear-gradient(90deg,#dc2626,#f87171); }

/* Glow spot */
.sc__glow {
  position: absolute; width: 130px; height: 130px;
  border-radius: 50%; filter: blur(50px); pointer-events: none;
  top: -30px; right: -30px; opacity: .45;
}
.sc__glow--blue   { background: #3b82f6; }
.sc__glow--yellow { background: #f5c518; }
.sc__glow--mint   { background: #22c55e; }
.sc__glow--coral  { background: #ef4444; }

.sc__watermark {
  position: absolute; bottom: 14px; right: 16px;
  font-size: 10px; font-weight: 900; letter-spacing: 3px;
  color: rgba(255,255,255,.07); user-select: none; pointer-events: none;
}

.sc__icon-wrap {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.2);
  display: flex; align-items: center; justify-content: center;
  color: #fff; margin-bottom: 14px;
}

.sc__val {
  font-size: 20px; font-weight: 800;
  color: #fff; line-height: 1.1;
  margin-bottom: 4px; letter-spacing: -.5px;
  text-shadow: 0 2px 10px rgba(0,0,0,.25);
}
.sc--yellow .sc__val { color: var(--yellow); text-shadow: 0 0 18px rgba(245,197,24,.6); }
.sc--mint   .sc__val { color: #86efac; text-shadow: 0 0 14px rgba(134,239,172,.5); }
.sc--coral  .sc__val { color: #fca5a5; text-shadow: 0 0 14px rgba(252,165,165,.5); }

.sc__lbl {
  font-size: 11px; color: var(--txt-dim);
  font-weight: 600; margin-bottom: 12px;
}

.sc__tag {
  display: inline-block; font-size: 10px; font-weight: 700;
  padding: 3px 10px; border-radius: 20px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.16);
  color: rgba(255,255,255,.82);
}
.sc--yellow .sc__tag {
  background: rgba(245,197,24,.18);
  border-color: rgba(245,197,24,.32);
  color: #fde047;
}

/* ══════════════════════════════════════════
   BUDGET HERO
══════════════════════════════════════════ */
.budget-hero {
  padding: 24px 28px; margin-bottom: 18px;
  display: flex; align-items: center; gap: 36px; flex-wrap: wrap;
}

.budget-hero__left { min-width: 160px; }
.budget-hero__eyebrow {
  display: block; font-size: 9px; font-weight: 800;
  letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--txt-faint); margin-bottom: 4px;
}
.budget-hero__pct-wrap { display: flex; align-items: baseline; gap: 8px; }
.budget-hero__pct {
  font-size: 58px; font-weight: 900;
  color: var(--yellow); line-height: 1;
  letter-spacing: -3px;
  text-shadow: 0 0 36px rgba(245,197,24,.55);
}
.budget-hero__pct.danger { color: #f87171; text-shadow: 0 0 32px rgba(248,113,113,.55); }
.budget-hero__pct.warn   { color: #fbbf24; text-shadow: 0 0 32px rgba(251,191,36,.55); }
.budget-hero__sym  { font-size: 30px; font-weight: 700; }
.budget-hero__label {
  font-size: 12px; color: var(--txt-dim); font-weight: 600; align-self: center;
}

.budget-hero__bar-area { flex: 1; min-width: 260px; }
.budget-hero__track {
  height: 18px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 99px; overflow: visible;
  position: relative; margin-bottom: 10px;
  box-shadow: inset 0 2px 6px rgba(0,0,0,.18);
}
.budget-hero__fill {
  height: 100%; border-radius: 99px;
  transition: width .9s cubic-bezier(.34,1.4,.64,1);
  position: relative;
}
.budget-hero__fill::after {
  content: ''; position: absolute; right: -1px; top: 50%;
  transform: translateY(-50%);
  width: 24px; height: 24px; border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(255,255,255,.22), 0 4px 14px rgba(0,0,0,.22);
}
.budget-hero__pin {
  position: absolute; top: -32px; transform: translateX(-50%);
}
.budget-hero__pin span {
  background: var(--yellow); color: var(--navy);
  font-size: 10px; font-weight: 900;
  padding: 3px 9px; border-radius: 20px;
  box-shadow: 0 4px 14px rgba(245,197,24,.45);
}
.budget-hero__range {
  display: flex; justify-content: space-between;
  font-size: 11px; color: var(--txt-faint); font-weight: 600;
}

/* ══════════════════════════════════════════
   CHARTS GRID
══════════════════════════════════════════ */
.charts-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
}
.panel-col { display: flex; flex-direction: column; gap: 16px; }

/* Panel shared header */
.panel__head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(255,255,255,.09);
}
.panel__title {
  font-size: 14px; font-weight: 800;
  color: #fff; letter-spacing: -.3px;
}
.panel__sub { font-size: 11px; color: var(--txt-dim); margin-top: 2px; }
.panel__pill {
  font-size: 10px; font-weight: 700; letter-spacing: .5px;
  background: rgba(245,197,24,.18);
  border: 1px solid rgba(245,197,24,.3);
  color: #fde047;
  padding: 4px 10px; border-radius: 20px; flex-shrink: 0;
}

/* ── Bar chart ── */
.bars-wrap {
  padding: 16px 20px; display: flex; flex-direction: column; gap: 14px;
}
.bar-item {
  animation: fadeUp .4s ease both;
  animation-delay: calc(0.38s + var(--di,0) * 0.06s);
}
.bar-item__meta {
  display: flex; justify-content: space-between; margin-bottom: 6px;
}
.bar-item__kode { font-size: 12px; font-weight: 800; color: #fff; }
.bar-item__rp   { font-size: 11px; color: var(--txt-dim); font-weight: 600; }
.bar-item__track {
  height: 8px; border-radius: 99px;
  background: rgba(255,255,255,.07);
  position: relative; overflow: hidden;
}
.bar-item__bg {
  position: absolute; left:0; top:0; height:100%;
  background: rgba(255,255,255,.12);
  border-radius: 99px; transition: width .6s ease;
}
.bar-item__used {
  position: absolute; left:0; top:0; height:100%;
  background: linear-gradient(90deg, rgba(255,255,255,.65) 0%, #f5c518 100%);
  border-radius: 99px;
  transition: width .75s cubic-bezier(.34,1.3,.64,1);
  box-shadow: 0 0 10px rgba(245,197,24,.4);
}
.bar-legend {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 20px 16px;
  font-size: 11px; color: var(--txt-dim); font-weight: 600;
}
.bar-legend__swatch {
  width: 10px; height: 10px; border-radius: 3px; display: inline-block; flex-shrink: 0;
}
.bar-legend__swatch--a { background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.2); }
.bar-legend__swatch--u { background: linear-gradient(135deg, rgba(255,255,255,.65), #f5c518); }
.bar-legend__txt { margin-right: 10px; }

/* ── Status cards ── */
.status-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 10px; padding: 14px 16px;
}
.status-card {
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: var(--r-sm); padding: 12px 14px;
  transition: background .2s, transform .15s;
  animation: fadeUp .4s ease both;
  animation-delay: calc(0.42s + var(--di,0) * 0.07s);
}
.status-card:hover {
  background: rgba(255,255,255,.12);
  transform: scale(1.02);
}
.status-card__top { display: flex; align-items: center; gap: 7px; margin-bottom: 6px; }
.status-card__dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--sc);
  box-shadow: 0 0 10px var(--sc);
  flex-shrink: 0;
}
.status-card__lbl { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.9); }
.status-card__num {
  font-size: 28px; font-weight: 900;
  color: var(--sc); line-height: 1;
  margin-bottom: 8px; letter-spacing: -1px;
  text-shadow: 0 0 18px var(--sc);
}
.status-card__track {
  height: 4px; background: rgba(255,255,255,.1);
  border-radius: 99px; overflow: hidden; margin-bottom: 4px;
}
.status-card__fill {
  height: 100%; border-radius: 99px;
  background: var(--sc); transition: width .7s ease;
}
.status-card__pct { font-size: 10px; font-weight: 700; color: var(--txt-faint); }

/* ── Mini table ── */
.mtbl { width: 100%; border-collapse: collapse; }
.mtbl thead th {
  padding: 10px 16px; text-align: left;
  font-size: 10px; font-weight: 800;
  letter-spacing: .8px; text-transform: uppercase;
  color: var(--txt-faint);
  background: rgba(255,255,255,.04);
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.mtbl__row td { padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,.05); }
.mtbl__row:last-child td { border-bottom: none; }
.mtbl__row:hover { background: rgba(255,255,255,.05); }
.mtbl__kode     { font-size: 12px; font-weight: 800; color: #fff; }
.mtbl__num      { font-size: 12px; font-weight: 600; color: var(--txt-dim); text-align: center; }
.mtbl__ok       {
  font-size: 12px; font-weight: 800;
  color: #86efac; text-align: center;
  text-shadow: 0 0 10px rgba(134,239,172,.5);
}
.mtbl__prog     { display: flex; align-items: center; gap: 8px; }
.mtbl__track    {
  flex: 1; height: 5px;
  background: rgba(255,255,255,.1);
  border-radius: 99px; overflow: hidden;
}
.mtbl__fill {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, rgba(255,255,255,.55), #f5c518);
  transition: width .5s ease;
}
.mtbl__pct { font-size: 10px; font-weight: 700; color: var(--txt-faint); white-space: nowrap; }

/* ══════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════ */
@media (max-width:900px) {
  .charts-grid { grid-template-columns: 1fr; }
}
@media (max-width:640px) {
  .ppk-dash  { padding: 16px 14px 40px; }
  .sc-grid   { grid-template-columns: 1fr 1fr; }
  .ph        { flex-direction: column; align-items: flex-start; }
  .budget-hero { flex-direction: column; gap: 16px; }
  .budget-hero__pct { font-size: 44px; }
  .status-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width:420px) {
  .sc-grid { grid-template-columns: 1fr; }
}
</style>