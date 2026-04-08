<template>
  <button @click="handleLogout">logout</button>
  <div v-if="data">
    <p>{{ data }}</p>
  </div>
</template>
<script setup>
  definePageMeta({
    title: "Home",
    middleware: "auth",
  });
  const handleLogout = async () => {
    const response = await $fetch("/api/registrasi/logout", {
      method: "POST",
    });
    navigateTo("/registrasi/login");
  };
  const { data } = await useFetch("/api/helloWorld");
</script>
