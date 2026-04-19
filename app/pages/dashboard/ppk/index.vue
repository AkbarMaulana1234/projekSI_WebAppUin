<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Dashboard PPK</h1>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white shadow rounded p-4">
        <p class="text-gray-500">Total Proposal</p>
        <h2 class="text-xl font-bold">{{ totalProposal }}</h2>
      </div>

      <div class="bg-white shadow rounded p-4">
        <p class="text-gray-500">Disetujui</p>
        <h2 class="text-xl font-bold text-green-600">{{ disetujui }}</h2>
      </div>

      <div class="bg-white shadow rounded p-4">
        <p class="text-gray-500">Revisi</p>
        <h2 class="text-xl font-bold text-yellow-600">{{ revisi }}</h2>
      </div>

      <div class="bg-white shadow rounded p-4">
        <p class="text-gray-500">Total Fakultas</p>
        <h2 class="text-xl font-bold text-blue-600">{{ summary.totalFakultas }}</h2>
      </div>
    </div>

    <!-- Anggaran Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white shadow rounded p-4">
        <p class="text-gray-500">Total Anggaran</p>
        <h2 class="text-xl font-bold text-green-600">
          Rp {{ formatCurrency(summary.totalAnggaranKeseluruhan) }}
        </h2>
      </div>

      <div class="bg-white shadow rounded p-4">
        <p class="text-gray-500">Anggaran Terpakai</p>
        <h2 class="text-xl font-bold text-red-600">
          Rp {{ formatCurrency(summary.totalTerpakaiKeseluruhan) }}
        </h2>
      </div>

      <div class="bg-white shadow rounded p-4">
        <p class="text-gray-500">Sisa Anggaran</p>
        <h2 class="text-xl font-bold text-blue-600">
          Rp {{ formatCurrency(summary.totalSisaKeseluruhan) }}
        </h2>
      </div>
    </div>

    <!-- Fakultas dan Ormawa -->
    <div class="space-y-6">
      <h2 class="text-xl font-bold">Anggaran per Fakultas</h2>

      <div v-for="fakultas in ormawaData" :key="fakultas.fakultas.id" class="bg-white shadow rounded p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">{{ fakultas.fakultas.nama }}</h3>
          <div class="text-sm text-gray-600">
            <span class="font-medium">{{ fakultas.ormawa.length }}</span> Ormawa
          </div>
        </div>

        <!-- Fakultas Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded">
          <div>
            <p class="text-sm text-gray-600">Total Anggaran</p>
            <p class="font-semibold text-green-600">
              Rp {{ formatCurrency(fakultas.totalAnggaranFakultas) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Terpakai</p>
            <p class="font-semibold text-red-600">
              Rp {{ formatCurrency(fakultas.totalTerpakaiFakultas) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Sisa</p>
            <p class="font-semibold text-blue-600">
              Rp {{ formatCurrency(fakultas.totalSisaFakultas) }}
            </p>
          </div>
        </div>

        <!-- Ormawa List -->
        <div class="space-y-3">
          <h4 class="font-medium text-gray-700">Ormawa:</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="ormawa in fakultas.ormawa"
              :key="ormawa.id"
              class="border rounded p-4 bg-white"
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h5 class="font-medium">{{ ormawa.nama }}</h5>
                  <p class="text-sm text-gray-600">{{ ormawa.programStudi.nama }}</p>
                </div>
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {{ ormawa.kode }}
                </span>
              </div>

              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Total:</span>
                  <span class="font-medium text-green-600">
                    Rp {{ formatCurrency(ormawa.anggaran.total) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Terpakai:</span>
                  <span class="font-medium text-red-600">
                    Rp {{ formatCurrency(ormawa.anggaran.terpakai) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Sisa:</span>
                  <span class="font-medium text-blue-600">
                    Rp {{ formatCurrency(ormawa.anggaran.sisa) }}
                  </span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mt-3">
                <div class="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>
                    {{ Math.round((ormawa.anggaran.terpakai / ormawa.anggaran.total) * 100) }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${Math.min((ormawa.anggaran.terpakai / ormawa.anggaran.total) * 100, 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabel Ormawa per Fakultas -->
    <div class="mt-8">
      <h2 class="text-xl font-bold mb-4">Tabel Ormawa per Fakultas</h2>

      <!-- Desktop Table -->
      <div class="hidden md:block bg-white shadow rounded overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fakultas
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kode Ormawa
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Ormawa
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program Studi
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Anggaran
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Terpakai
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sisa
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-for="fakultas in ormawaData" :key="fakultas.fakultas.id">
              <tr v-for="(ormawa, index) in fakultas.ormawa" :key="ormawa.id" :class="index === 0 ? 'border-t-2 border-gray-300' : ''">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" :rowspan="fakultas.ormawa.length" v-if="index === 0">
                  <div>
                    <div class="font-semibold">{{ fakultas.fakultas.nama }}</div>
                    <div class="text-xs text-gray-500">{{ fakultas.ormawa.length }} Ormawa</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ ormawa.kode }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ ormawa.nama }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ ormawa.programStudi.nama }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                  Rp {{ formatCurrency(ormawa.anggaran.total) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                  Rp {{ formatCurrency(ormawa.anggaran.terpakai) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                  Rp {{ formatCurrency(ormawa.anggaran.sisa) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <div class="flex items-center justify-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        :style="{ width: `${Math.min((ormawa.anggaran.terpakai / ormawa.anggaran.total) * 100, 100)}%` }"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-600 w-8">
                      {{ Math.round((ormawa.anggaran.terpakai / ormawa.anggaran.total) * 100) }}%
                    </span>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden space-y-4">
        <div v-for="fakultas in ormawaData" :key="fakultas.fakultas.id" class="bg-white shadow rounded p-4">
          <h3 class="text-lg font-semibold mb-3">{{ fakultas.fakultas.nama }}</h3>
          <div class="space-y-3">
            <div v-for="ormawa in fakultas.ormawa" :key="ormawa.id" class="border rounded p-3 bg-gray-50">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h4 class="font-medium">{{ ormawa.nama }}</h4>
                  <p class="text-sm text-gray-600">{{ ormawa.programStudi.nama }}</p>
                </div>
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {{ ormawa.kode }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-sm mb-2">
                <div>
                  <span class="text-gray-600">Total:</span>
                  <span class="font-medium text-green-600 ml-1">
                    Rp {{ formatCurrency(ormawa.anggaran.total) }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-600">Terpakai:</span>
                  <span class="font-medium text-red-600 ml-1">
                    Rp {{ formatCurrency(ormawa.anggaran.terpakai) }}
                  </span>
                </div>
                <div class="col-span-2">
                  <span class="text-gray-600">Sisa:</span>
                  <span class="font-medium text-blue-600 ml-1">
                    Rp {{ formatCurrency(ormawa.anggaran.sisa) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center">
                <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${Math.min((ormawa.anggaran.terpakai / ormawa.anggaran.total) * 100, 100)}%` }"
                  ></div>
                </div>
                <span class="text-xs text-gray-600">
                  {{ Math.round((ormawa.anggaran.terpakai / ormawa.anggaran.total) * 100) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data: dashboardData } = await useFetch('/api/ppk/dashboard')
const { data: ormawaAnggaranData } = await useFetch('/api/ppk/ormawa-anggaran')

const totalProposal = computed(() => dashboardData.value?.total || 0)
const disetujui = computed(() => dashboardData.value?.disetujui || 0)
const revisi = computed(() => dashboardData.value?.revisi || 0)

const ormawaData = computed(() => ormawaAnggaranData.value?.data || [])
const summary = computed(() => ormawaAnggaranData.value?.summary || {
  totalFakultas: 0,
  totalOrmawa: 0,
  totalAnggaranKeseluruhan: 0,
  totalTerpakaiKeseluruhan: 0,
  totalSisaKeseluruhan: 0,
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount || 0)
}
</script>
