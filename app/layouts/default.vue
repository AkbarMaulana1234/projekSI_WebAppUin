<template>
  <header class="bg-white shadow-md sticky top-0 z-50">
    <nav class="mx-auto flex items-center justify-between px-4 py-3 md:px-8">
      <!-- Logo dan Nama -->
      <div class="flex items-center space-x-2">
        <img src="~~/assets/images/logouin.png" alt="" height="32" width="32" />
        <span class="text-lg font-bold text-gray-800 hidden sm:inline">
          UIN Mahmud Yunus
        </span>
      </div>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center space-x-6">
        <NuxtLink
          to="/dashboard"
          class="text-gray-700 hover:text-primary font-medium transition"
        >
          Dashboard
        </NuxtLink>
        <template v-if="authStore.user?.role === 'ormawa'">
          <NuxtLink
            to="/ormawa/pengajuan"
            class="text-gray-700 hover:text-primary font-medium transition"
          >
            Pengajuan RAB
          </NuxtLink>
          <NuxtLink
            to="/ormawa/kegiatan"
            class="text-gray-700 hover:text-primary font-medium transition"
          >
            Kegiatan Saya
          </NuxtLink>
        </template>
        <template v-if="authStore.user?.role === 'kaprodi'">
          <NuxtLink
            to="/kaprodi/verifikasi"
            class="text-gray-700 hover:text-primary font-medium transition"
          >
            Verifikasi RAB
          </NuxtLink>
        </template>
        <template v-if="authStore.user?.role === 'ppk'">
          <NuxtLink
            to="/ppk/verifikasi"
            class="text-gray-700 hover:text-primary font-medium transition"
          >
            Verifikasi Tagihan
          </NuxtLink>
        </template>
        <template v-if="authStore.user?.role === 'spi'">
          <NuxtLink
            to="/spi/verifikasi"
            class="text-gray-700 hover:text-primary font-medium transition"
          >
            Verifikasi LPG
          </NuxtLink>
        </template>
      </div>

      <!-- User Dropdown (Desktop) -->
      <div class="hidden md:flex items-center space-x-4">
        <div class="relative" ref="dropdownRef">
          <button
            @click="toggleDropdown"
            class="flex items-center space-x-2 focus:outline-none"
          >
            <div
              class="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold"
            >
              {{ authStore.user?.username?.charAt(0).toUpperCase() || "U" }}
            </div>
            <span class="text-gray-700 font-medium">{{
              authStore.user?.username
            }}</span>
            <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-500" />
          </button>
          <div
            v-if="dropdownOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border"
          >
            <div class="px-4 py-2 border-b text-sm text-gray-700">
              <p class="font-semibold">{{ authStore.user?.username }}</p>
              <p class="text-xs text-gray-500 capitalize">
                {{ authStore.user?.role }}
              </p>
            </div>
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <div class="md:hidden">
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="text-gray-700 focus:outline-none"
        >
          <Icon
            v-if="!mobileMenuOpen"
            name="heroicons:bars-3"
            class="h-6 w-6"
          />
          <Icon v-else name="heroicons:x-mark" class="h-6 w-6" />
        </button>
      </div>
    </nav>

    <!-- Mobile Menu Panel -->
    <div
      v-if="mobileMenuOpen"
      class="md:hidden bg-white border-t px-4 pb-3 pt-2 shadow-lg"
    >
      <div class="space-y-2">
        <NuxtLink
          to="/dashboard"
          class="block py-2 text-gray-700 hover:text-primary font-medium"
          @click="mobileMenuOpen = false"
        >
          Dashboard
        </NuxtLink>
        <template v-if="authStore.user?.role === 'ormawa'">
          <NuxtLink
            to="/ormawa/pengajuan"
            class="block py-2 text-gray-700 hover:text-primary font-medium"
            @click="mobileMenuOpen = false"
          >
            Pengajuan RAB
          </NuxtLink>
          <NuxtLink
            to="/ormawa/kegiatan"
            class="block py-2 text-gray-700 hover:text-primary font-medium"
            @click="mobileMenuOpen = false"
          >
            Kegiatan Saya
          </NuxtLink>
        </template>
        <template v-if="authStore.user?.role === 'kaprodi'">
          <NuxtLink
            to="/kaprodi/verifikasi"
            class="block py-2 text-gray-700 hover:text-primary font-medium"
            @click="mobileMenuOpen = false"
          >
            Verifikasi RAB
          </NuxtLink>
        </template>
        <template v-if="authStore.user?.role === 'ppk'">
          <NuxtLink
            to="/ppk/verifikasi"
            class="block py-2 text-gray-700 hover:text-primary font-medium"
            @click="mobileMenuOpen = false"
          >
            Verifikasi Tagihan
          </NuxtLink>
        </template>
        <template v-if="authStore.user?.role === 'spi'">
          <NuxtLink
            to="/spi/verifikasi"
            class="block py-2 text-gray-700 hover:text-primary font-medium"
            @click="mobileMenuOpen = false"
          >
            Verifikasi LPG
          </NuxtLink>
        </template>
        <hr class="my-2" />
        <div class="pt-2">
          <p class="text-sm text-gray-500">
            {{ authStore.user?.username }} ({{ authStore.user?.role }})
          </p>
          <button
            @click="handleLogout"
            class="mt-2 w-full rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
  <div>
    <slot />
  </div>
  <footer class="bg-primary text-white">
    <!-- Bagian atas footer dengan beberapa kolom -->
    <div class="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <!-- Kolom Alamat -->
        <div>
          <h3 class="mb-3 text-lg font-semibold text-secondary">Alamat</h3>
          <p class="text-sm leading-relaxed text-white/80">
            Jl. Sudirman No.137 Lima Kaum, <br />
            Batusangkar, Tanah Datar, <br />
            Sumatera Barat, Indonesia
          </p>
        </div>

        <!-- Kolom Kontak -->
        <div>
          <h3 class="mb-3 text-lg font-semibold text-secondary">Kontak Kami</h3>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center gap-2">
              <Icon name="proicons:phone" class="h-5 w-5 text-secondary" />
              <a href="tel:075271150" class="hover:text-secondary transition">
                0752-71150
              </a>
            </li>
            <li class="flex items-center gap-2">
              <Icon name="proicons:email" class="h-5 w-5 text-secondary" />
              <a
                href="mailto:info@uinmybatusangkar.ac.id"
                class="hover:text-secondary transition"
              >
                info@uinmybatusangkar.ac.id
              </a>
            </li>
            <li class="flex items-center gap-2">
              <Icon name="proicons:globe" class="h-5 w-5 text-secondary" />
              <a
                href="https://uinmybatusangkar.ac.id"
                target="_blank"
                class="hover:text-secondary transition"
              >
                uinmybatusangkar.ac.id
              </a>
            </li>
          </ul>
        </div>

        <!-- Kolom Sosial Media (opsional) -->
        <div>
          <h3 class="mb-3 text-lg font-semibold text-secondary">Ikuti Kami</h3>
          <div class="flex space-x-4">
            <a
              href="#"
              class="rounded-full bg-white/10 p-2 transition hover:bg-secondary"
            >
              <Icon name="mdi:facebook" class="h-5 w-5" />
            </a>
            <a
              href="#"
              class="rounded-full bg-white/10 p-2 transition hover:bg-secondary"
            >
              <Icon name="mdi:instagram" class="h-5 w-5" />
            </a>
            <a
              href="#"
              class="rounded-full bg-white/10 p-2 transition hover:bg-secondary"
            >
              <Icon name="mdi:youtube" class="h-5 w-5" />
            </a>
            <a
              href="#"
              class="rounded-full bg-white/10 p-2 transition hover:bg-secondary"
            >
              <Icon name="mdi:twitter" class="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Bagian copyright -->
    <div
      class="border-t border-white/20 py-4 text-center text-xs text-white/70"
    >
      <p>
        &copy; {{ new Date().getFullYear() }} Universitas Islam Negeri Mahmud
        Yunus Batusangkar.
        <br class="block sm:hidden" />
        All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue";
  import { useAuthStore } from "~/stores/auth";

  const authStore = useAuthStore();
  const dropdownOpen = ref(false);
  const mobileMenuOpen = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);

  const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
  };

  const handleLogout = async () => {
    await authStore.logout();
    // Redirect sudah ditangani di store logout
  };

  // Close dropdown saat klik di luar
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.value &&
      !dropdownRef.value.contains(event.target as Node)
    ) {
      dropdownOpen.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<style scoped>
  /* Warna primary sesuai tema */
  .bg-primary {
    background-color: #3b5988;
  }
  .text-primary {
    color: #3b5988;
  }
  .hover\:text-primary:hover {
    color: #3b5988;
  }
  .border-primary {
    border-color: #3b5988;
  }
</style>
