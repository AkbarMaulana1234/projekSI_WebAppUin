<template>
  <div class="flex flex-row w-full">
    <header>
      <h1>ini adalah header</h1>
      <button @click="authStore.logout()">logout</button>
    </header>
    <div class="flex-1">
      <slot class=""></slot>
    </div>
  </div>
  <footer
    class="bg-[#5C6BC0] text-white md:px-12 h-[58px] p-1 flex items-center justify-center"
  >
    <div class="text-center m-1 text-[12px] font-semibold">
      <span>Alamat: Jl. Sudirman No.137 Lima Kaum Batusangkar</span>

      <div class="flex gap-2 justify-center font-bold">
        <a href="tel:075271150">
          <Icon name="proicons:phone" width="22" height="22" />
          <span>075271150</span>
        </a>
        <a href="mailto:info@uinmybatusangkar.ac.id">
          <Icon name="proicons:email" width="22" height="22" />
          <span>info@uinmybatusangkar.ac.id</span>
        </a>
      </div>
      <span>
        Copyright 2026 Universitas Islam Negeri Mahmud Yunus Batusangkar
      </span>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import { useAuthStore } from "../stores/auth";
  const authStore = useAuthStore();
</script>
