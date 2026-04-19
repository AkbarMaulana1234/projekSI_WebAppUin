<template>
  <div class="p-6">
    <h1 class="text-xl font-bold mb-4">Detail Proposal</h1>

    <div v-if="proposal">
      <p><b>Judul:</b> {{ proposal.judul_kegiatan }}</p>
      <p><b>Status:</b> {{ proposal.status_rab }}</p>
      <p><b>Deskripsi:</b> {{ proposal.deskripsi }}</p>

      <div class="mt-4 space-x-2">
        <button @click="approve" class="bg-green-600 text-white px-3 py-1 rounded">
          Approve
        </button>

        <button @click="revisi" class="bg-yellow-500 text-white px-3 py-1 rounded">
          Revisi
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()

const { data } = await useFetch('/api/ppk/proposal-detail', {
  query: { id: route.params.id }
})

const proposal = computed(() => data.value)

const approve = async () => {
  await $fetch('/api/ppk/approve', {
    method: 'POST',
    body: { id: route.params.id }
  })
}

const revisi = async () => {
  await $fetch('/api/ppk/revisi', {
    method: 'POST',
    body: { id: route.params.id }
  })
}
</script>