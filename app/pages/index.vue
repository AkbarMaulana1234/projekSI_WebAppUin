<template>
  <div v-if="data">
    <p>{{ data }}</p>
  </div>
</template>
<script setup>
  definePageMeta({
    title: "Home",
    middleware: "auth",
  });
  const { data } = await useFetch("/api/helloWorld");
</script>
