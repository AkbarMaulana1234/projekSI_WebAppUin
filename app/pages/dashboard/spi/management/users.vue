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
          <h1 class="text-2xl font-bold text-slate-900">Manajemen User</h1>
          <p class="text-slate-500 text-sm">Tambah user baru dengan role spesifik</p>
        </div>
      </div>

      <!-- Form Tambah -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-bold text-slate-900 mb-4">Tambah User Baru</h2>

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
            <!-- Full Name -->
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Nama Lengkap</label>
              <input
                v-model="form.fullName"
                @input="errorMessage = ''"
                type="text"
                placeholder="Nama Lengkap"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                :class="{ 'border-red-300 bg-red-50/30': errorMessage && !form.fullName }"
                required
              />
            </div>
            <!-- Email -->
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Email</label>
              <input
                v-model="form.email"
                @input="errorMessage = ''"
                type="email"
                placeholder="email@univ.ac.id"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                :class="{ 'border-red-300 bg-red-50/30': errorMessage && (errorMessage.includes('Email') || errorMessage.includes('mirip')) }"
                required
              />
            </div>
            <!-- User ID (NIM/NIP) -->
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">User ID (NIM/NIP)</label>
              <input
                v-model="form.users_id"
                @input="errorMessage = ''"
                type="text"
                placeholder="ID User"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                :class="{ 'border-red-300 bg-red-50/30': errorMessage && (errorMessage.includes('User ID') || errorMessage.includes('mirip')) }"
                required
              />
            </div>
            <!-- Password -->
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Password</label>
              <input
                v-model="form.password"
                type="password"
                placeholder="********"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                required
              />
            </div>
            <!-- Role -->
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-700">Role</label>
              <select
                v-model="form.role"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                required
              >
                <option value="ormawa">Ormawa</option>
                <option value="kaprodi">Kaprodi</option>
                <option value="ppk">PPK</option>
                <option value="spi">SPI</option>
              </select>
            </div>

            <!-- Dynamic Fields based on Role -->
            <template v-if="form.role === 'kaprodi'">
              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-700">Pilih Prodi</label>
                <select
                  v-model="form.prodiId"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                  required
                >
                  <option value="" disabled>Pilih Prodi...</option>
                  <option v-for="p in prodiStore.prodi" :key="p.id" :value="p.id">
                    {{ p.nama }}
                  </option>
                </select>
              </div>
            </template>

            <template v-if="form.role === 'ormawa'">
              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-700">Pilih Ormawa</label>
                <select
                  v-model="form.ormawaId"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                  required
                >
                  <option value="" disabled>Pilih Ormawa...</option>
                  <option v-for="o in ormawaStore.ormawa" :key="o.id" :value="o.id">
                    {{ o.nama }}
                  </option>
                </select>
              </div>
            </template>

            <template v-if="form.role === 'ppk'">
              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-700">Pilih Fakultas</label>
                <select
                  v-model="form.fakultasId"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#c41e3a]/20 focus:border-[#c41e3a] outline-none transition-all"
                  required
                >
                  <option value="" disabled>Pilih Fakultas...</option>
                  <option v-for="f in fakultasStore.fakultas" :key="f.id" :value="f.id">
                    {{ f.nama }}
                  </option>
                </select>
              </div>
            </template>
          </div>

          <div class="flex justify-end pt-4">
            <button
              type="submit"
              :disabled="store.loading"
              class="px-6 py-2 bg-[#c41e3a] text-white rounded-lg font-semibold hover:bg-[#a01830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon v-if="store.loading" name="line-md:loading-twotone-loop" class="w-5 h-5" />
              Simpan User
            </button>
          </div>
        </form>
      </div>

      <!-- Info Card -->
      <div class="bg-blue-50 rounded-2xl border border-blue-100 p-6 flex items-start gap-4">
        <Icon name="heroicons:information-circle" class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="font-bold text-blue-900 mb-1">Panduan Pengisian</h3>
          <ul class="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li><strong>Kaprodi:</strong> Harus memilih Program Studi yang diampu.</li>
            <li><strong>Ormawa:</strong> Harus memilih Organisasi Mahasiswa yang diwakili.</li>
            <li><strong>PPK:</strong> Harus memilih Fakultas yang dinaungi.</li>
            <li><strong>SPI:</strong> Tidak memerlukan keterkaitan prodi/fakultas spesifik.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSpiUsersStore } from '~/stores/spi/users';
import { useSpiFakultasStore } from '~/stores/spi/fakultas';
import { useSpiProdiStore } from '~/stores/spi/prodi';
import { useSpiOrmawaStore } from '~/stores/spi/ormawa';

const store = useSpiUsersStore();
const fakultasStore = useSpiFakultasStore();
const prodiStore = useSpiProdiStore();
const ormawaStore = useSpiOrmawaStore();

const errorMessage = ref('');
const form = ref({
  fullName: '',
  email: '',
  users_id: '',
  password: '',
  role: 'ormawa',
  prodiId: '',
  ormawaId: '',
  fakultasId: ''
});

onMounted(() => {
  fakultasStore.fetchFakultas();
  prodiStore.fetchProdi();
  ormawaStore.fetchOrmawa();
});

const handleSubmit = async () => {
  errorMessage.value = '';
  const res = await store.addUser({ ...form.value });
  if (res.success) {
    form.value = {
      fullName: '',
      email: '',
      users_id: '',
      password: '',
      role: 'ormawa',
      prodiId: '',
      ormawaId: '',
      fakultasId: ''
    };
    alert('User berhasil ditambahkan!');
  } else {
    errorMessage.value = res.message || 'Gagal menambahkan user';
  }
};
</script>
