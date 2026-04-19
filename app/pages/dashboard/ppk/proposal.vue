<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Daftar Proposal</h1>

    <div v-for="item in proposals" :key="item.id" class="bg-white shadow p-4 mb-3 rounded">
      <h2 class="font-bold">{{ item.judul_kegiatan }}</h2>
      <p>Status: {{ item.status_rab }}</p>

      <NuxtLink
        :to="`/ppk/proposal/${item.id}`"
        class="text-blue-600 underline"
      >
        Lihat Detail
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { data } = await useFetch('/api/ppk/proposal')
const proposals = computed(() => data.value || [])
</script>