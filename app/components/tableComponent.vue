<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
  >
    <div
      class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h3 class="text-lg font-bold text-slate-900">Daftar Pengajuan RAB</h3>
        <p class="text-sm text-slate-500">
          Kelola dan monitor status pengajuan anggaran
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <Icon
            name="heroicons:magnifying-glass"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari RAB..."
            class="pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b5988]/20 focus:border-[#3b5988] w-full sm:w-64"
          />
        </div>
        <button
          class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Icon name="heroicons:funnel" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-50/50 border-b border-slate-200">
          <tr>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              ID RAB
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Nama Kegiatan
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Tanggal
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Total Anggaran
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              class="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="(rab, index) in rabList"
            :key="index"
            class="hover:bg-slate-50/50 transition-colors group"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="font-mono text-sm font-medium text-[#3b5988]">{{
                rab.id
              }}</span>
            </td>
            <td class="px-6 py-4">
              <div>
                <p class="text-sm font-semibold text-slate-900">
                  {{ rab.name }}
                </p>
                <p class="text-xs text-slate-500">{{ rab.department }}</p>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
              {{ rab.date }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm font-semibold text-slate-900"
                >Rp {{ rab.amount }}</span
              >
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium border',
                  rab.status === 'Selesai'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : rab.status === 'Ditolak'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : rab.status === 'Diproses'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200',
                ]"
              >
                {{ rab.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <button
                @click="openDetail(rab)"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#3b5988] bg-[#3b5988]/10 hover:bg-[#3b5988] hover:text-white transition-all group/btn"
              >
                <span>Detail</span>
                <Icon
                  name="heroicons:eye"
                  class="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      class="px-6 py-4 border-t border-slate-200 flex items-center justify-between"
    >
      <p class="text-sm text-slate-500">Menampilkan 1-5 dari 24 data</p>
      <div class="flex items-center gap-2">
        <button
          class="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-50"
          disabled
        >
          <Icon name="heroicons:chevron-left" class="w-5 h-5" />
        </button>
        <button
          class="w-10 h-10 rounded-lg bg-[#3b5988] text-white font-medium text-sm"
        >
          1
        </button>
        <button
          class="w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm"
        >
          2
        </button>
        <button
          class="w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm"
        >
          3
        </button>
        <button
          class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
        >
          <Icon name="heroicons:chevron-right" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
  const isSidebarOpen = ref(false);
  const isModalOpen = ref(false);
  const selectedRab = ref(null);

  const chartData = [
    { month: "Mei", value: 40, count: 8 },
    { month: "Jun", value: 65, count: 13 },
    { month: "Jul", value: 45, count: 9 },
    { month: "Agu", value: 80, count: 16 },
    { month: "Sep", value: 55, count: 11 },
    { month: "Okt", value: 70, count: 14 },
  ];

  const rabList = [
    {
      id: "RAB-2024-001",
      name: "Seminar Nasional Teknologi",
      department: "Himpunan Mahasiswa Teknik",
      date: "15 Okt 2024",
      amount: "25.000.000",
      status: "Selesai",
      pic: "Ahmad Rizky",
      notes:
        "Seminar telah berlangsung pada tanggal 10 Oktober 2024 dengan 500 peserta.",
    },
    {
      id: "RAB-2024-002",
      name: "Workshop Leadership",
      department: "BEM Fakultas",
      date: "18 Okt 2024",
      amount: "15.500.000",
      status: "Diproses",
      pic: "Sarah Amalia",
      notes: "Menunggu approval dari Dekanat.",
    },
    {
      id: "RAB-2024-003",
      name: "Festival Budaya Kampus",
      department: "UKM Seni",
      date: "20 Okt 2024",
      amount: "45.000.000",
      status: "Menunggu",
      pic: "Budi Santoso",
      notes: "Pengajuan awal, masih dalam review BEM.",
    },
    {
      id: "RAB-2024-004",
      name: "Kompetisi Robotik",
      department: "Robotic Club",
      date: "12 Okt 2024",
      amount: "30.000.000",
      status: "Ditolak",
      pic: "Citra Lestari",
      notes: "Anggaran melebihi batas maksimal untuk UKM.",
    },
    {
      id: "RAB-2024-005",
      name: "Bakti Sosial Desa",
      department: "KSR PMI",
      date: "22 Okt 2024",
      amount: "8.000.000",
      status: "Selesai",
      pic: "Dedi Pratama",
      notes: "Kegiatan sudah dilaksanakan tanggal 15-16 Oktober.",
    },
  ];

  const openDetail = (rab) => {
    selectedRab.value = rab;
    isModalOpen.value = true;
  };
</script>
