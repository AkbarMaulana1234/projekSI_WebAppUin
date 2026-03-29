<template>
  <div class="bg-color-primary text-primary">akbar</div>
  <div v-if="data">
    <p>{{ data }}</p>
  </div>
</template>
<script setup>
  import { onMounted } from "vue";
  const data = await useFetch("/api/helloWorld");
  onMounted(() => {
    console.log("mounted");
  });
</script>
