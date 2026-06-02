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
          <h1 class="text-2xl font-bold text-slate-900">Manajemen Program Studi</h1>
          <p class="text-slate-500 text-sm">Tambah dan kelola data program studi</p>
        </div>
      </div>

      <!-- Form Tambah -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-bold text-slate-900 mb-4">Tambah Prodi Baru</h2>

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
              <label class="text-sm font-medium text-slate-700">Nama Program Studi</label>
              <input
                v-model="form.nama"
                @input="errorMessage = ''"
                type="text"
                placeholder="Contoh: Teknik Informatika"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                :class="{ 'border-red-300 bg-red-50/30': errorMessage && !form.nama }"
                required
              />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Kode Prodi</label>
              <input
                v-model="form.kode"
                @input="errorMessage = ''"
                type="text"
                placeholder="Contoh: TI"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                :class="{ 'border-red-300 bg-red-50/30': errorMessage && (errorMessage.includes('Kode') || errorMessage.includes('Prodi')) }"
                required
              />
            </div>
            <div class="space-y-1 md:col-span-2">
              <label class="text-sm font-medium text-slate-700">Pilih Fakultas</label>
              <select
                v-model="form.fakultasId"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                required
              >
                <option value="" disabled>Pilih Fakultas...</option>
                <option v-for="f in fakultasStore.fakultas" :key="f.id" :value="f.id">
                  {{ f.nama }} ({{ f.kode }})
                </option>
              </select>
            </div>
          </div>
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="store.loading || fakultasStore.loading"
              class="px-6 py-2 bg-[#c41e3a] text-white rounded-lg font-semibold hover:bg-[#a01830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon v-if="store.loading" name="line-md:loading-twotone-loop" class="w-5 h-5" />
              Simpan Prodi
            </button>
          </div>
        </form>
      </div>

      <!-- Tabel Data -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <h2 class="text-lg font-bold text-slate-900">Daftar Program Studi</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-600 text-sm font-semibold">
                <th class="px-6 py-4 border-b">No</th>
                <th class="px-6 py-4 border-b">Nama Prodi</th>
                <th class="px-6 py-4 border-b">Fakultas</th>
                <th class="px-6 py-4 border-b">Kode</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(item, index) in store.prodi" :key="item.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 text-sm text-slate-600">{{ index + 1 }}</td>
                <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ item.nama }}</td>
                <td class="px-6 py-4 text-sm text-slate-600">{{ item.namaFakultas }}</td>
                <td class="px-6 py-4 text-sm text-slate-600">
                  <span class="px-2 py-1 bg-slate-100 rounded text-xs font-mono uppercase">{{ item.kode }}</span>
                </td>
              </tr>
              <tr v-if="store.prodi.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-slate-500 italic">Belum ada data program studi</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSpiProdiStore } from '~/stores/spi/prodi';
import { useSpiFakultasStore } from '~/stores/spi/fakultas';

const store = useSpiProdiStore();
const fakultasStore = useSpiFakultasStore();

const errorMessage = ref('');
const form = ref({
  nama: '',
  kode: '',
  fakultasId: '' as any
});

onMounted(() => {
  store.fetchProdi();
  fakultasStore.fetchFakultas();
});

const handleSubmit = async () => {
  errorMessage.value = '';
  const res = await store.addProdi({ 
    nama: form.value.nama,
    kode: form.value.kode,
    fakultasId: Number(form.value.fakultasId)
  });
  if (res.success) {
    form.value = { nama: '', kode: '', fakultasId: '' };
    alert('Program Studi berhasil ditambahkan!');
  } else {
    errorMessage.value = res.message || 'Gagal menambahkan program studi';
  }
};
</script>
