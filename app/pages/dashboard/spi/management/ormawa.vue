<template>
  <div class="min-h-screen bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <NuxtLink to="/dashboard/spi" class="text-sm text-[#c41e3a] hover:underline flex items-center gap-1 mb-2">
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            Kembali ke Dashboard
          </NuxtLink>
          <h1 class="text-2xl font-bold text-slate-900">Manajemen Ormawa</h1>
          <p class="text-slate-500 text-sm">Tambah dan kelola data Organisasi Mahasiswa</p>
        </div>
      </div>

      <!-- Form Tambah -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-bold text-slate-900 mb-4">Tambah Ormawa Baru</h2>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
          <Icon name="heroicons:exclamation-circle" class="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-red-800">Kesalahan Input</p>
            <p class="text-sm opacity-90">{{ errorMessage }}</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Nama Ormawa</label>
              <input
                v-model="form.nama"
                @input="errorMessage = ''"
                type="text"
                placeholder="Contoh: Himpunan Mahasiswa Teknik"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                :class="{ 'border-red-300 bg-red-50/30': errorMessage && !form.nama }"
                required
              />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Kode Ormawa</label>
              <input
                v-model="form.kode"
                @input="errorMessage = ''"
                type="text"
                placeholder="Contoh: HMTI"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                :class="{ 'border-red-300 bg-red-50/30': errorMessage && (errorMessage.includes('Kode') || errorMessage.includes('Ormawa')) }"
                required
              />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Pilih Fakultas</label>
              <select
                v-model="selectedFakultasId"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                required
              >
                <option value="" disabled>Pilih Fakultas...</option>
                <option v-for="f in fakultasStore.fakultas" :key="f.id" :value="f.id">
                  {{ f.nama }}
                </option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Pilih Program Studi (Opsional)</label>
              <select
                v-model="form.prodiId"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                :disabled="!selectedFakultasId"
              >
                <option value="">Pilih Prodi (Kosongkan jika Ormawa Fakultas)</option>
                <option v-for="p in filteredProdi" :key="p.id" :value="p.id">
                  {{ p.nama }}
                </option>
              </select>
            </div>
            <div class="space-y-1 md:col-span-2">
              <label class="text-sm font-medium text-slate-700">Total Anggaran Tahunan (Rp)</label>
              <input
                v-model="form.totalAnggaran"
                type="number"
                placeholder="Contoh: 10000000"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                required
              />
            </div>
          </div>
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="store.loading"
              class="px-6 py-2 bg-[#c41e3a] text-white rounded-lg font-semibold hover:bg-[#a01830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon v-if="store.loading" name="line-md:loading-twotone-loop" class="w-5 h-5" />
              Simpan Ormawa
            </button>
          </div>
        </form>
      </div>

      <!-- Tabel Data -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <h2 class="text-lg font-bold text-slate-900">Daftar Ormawa</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-600 text-sm font-semibold">
                <th class="px-6 py-4 border-b">No</th>
                <th class="px-6 py-4 border-b">Nama Ormawa</th>
                <th class="px-6 py-4 border-b">Fakultas / Prodi</th>
                <th class="px-6 py-4 border-b">Anggaran</th>
                <th class="px-6 py-4 border-b">Kode</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(item, index) in store.ormawa" :key="item.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 text-sm text-slate-600">{{ index + 1 }}</td>
                <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ item.nama }}</td>
                <td class="px-6 py-4 text-sm text-slate-600">
                  <div class="text-xs text-slate-400 uppercase font-semibold">{{ item.namaFakultas }}</div>
                  <div :class="!item.namaProdi ? 'text-slate-400 italic text-xs' : ''">
                    {{ item.namaProdi || 'Tingkat Fakultas' }}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-900 font-semibold">{{ formatRp(item.totalAnggaran) }}</td>
                <td class="px-6 py-4 text-sm text-slate-600">
                  <span class="px-2 py-1 bg-slate-100 rounded text-xs font-mono uppercase">{{ item.kode }}</span>
                </td>
              </tr>
              <tr v-if="store.ormawa.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-slate-500 italic">Belum ada data ormawa</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSpiOrmawaStore } from '~/stores/spi/ormawa';
import { useSpiFakultasStore } from '~/stores/spi/fakultas';
import { useSpiProdiStore } from '~/stores/spi/prodi';

const store = useSpiOrmawaStore();
const fakultasStore = useSpiFakultasStore();
const prodiStore = useSpiProdiStore();

const errorMessage = ref('');
const selectedFakultasId = ref('');
const form = ref({
  nama: '',
  kode: '',
  totalAnggaran: 0,
  prodiId: '' as any
});

const filteredProdi = computed(() => {
  if (!selectedFakultasId.value) return [];
  return prodiStore.prodi.filter(p => p.fakultasId === Number(selectedFakultasId.value));
});

onMounted(() => {
  store.fetchOrmawa();
  fakultasStore.fetchFakultas();
  prodiStore.fetchProdi();
});

const formatRp = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const handleSubmit = async () => {
  errorMessage.value = '';
  const res = await store.addOrmawa({ 
    nama: form.value.nama,
    kode: form.value.kode,
    totalAnggaran: Number(form.value.totalAnggaran),
    fakultasId: Number(selectedFakultasId.value),
    prodiId: form.value.prodiId ? Number(form.value.prodiId) : null
  });
  
  if (res.success) {
    form.value = { nama: '', kode: '', totalAnggaran: 0, prodiId: '' };
    selectedFakultasId.value = '';
    alert('Ormawa berhasil ditambahkan!');
  } else {
    errorMessage.value = res.message || 'Gagal menambahkan ormawa';
  }
};
</script>
