<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
  import { Icon } from "@iconify/vue";
  definePageMeta({
    pageTransition: {
      name: "page",
      mode: "in-out",
    },
  });
</script>
<style></style>
