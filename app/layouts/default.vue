<template>
  <div style="display:flex; flex-direction:column; min-height:100vh;">

    <!-- Header -->
    <header
      style="background: linear-gradient(135deg, #0f1f3d 0%, #1e3a6e 60%, #2d4f8e 100%); box-shadow: 0 2px 16px rgba(15,31,61,.35); border-bottom: 2px solid rgba(201,162,39,0.35); position: sticky; top: 0; z-index: 50;"
    >
      <nav class="mx-auto flex items-center justify-between px-4 py-3 md:px-8">
        <!-- Logo dan Nama -->
        <div class="flex items-center space-x-2">
          <img src="~~/assets/images/logouin.png" alt="" height="32" width="32" />
          <span class="text-lg font-bold hidden sm:inline" style="color:#fff;">
            UIN Mahmud Yunus
          </span>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-1">
          <NuxtLink to="/dashboard" class="nav-link">
            Dashboard
          </NuxtLink>
          <template v-if="authStore.user?.role === 'ormawa'">
            <NuxtLink to="/ormawa/pengajuanRab" class="nav-link">
              Pengajuan RAB
            </NuxtLink>
            <NuxtLink to="/ormawa/kegiatan" class="nav-link">
              Kegiatan Saya
            </NuxtLink>
          </template>
          <template v-if="authStore.user?.role === 'kaprodi'">
            <NuxtLink to="/kaprodi/verifikasi" class="nav-link">
              Verifikasi RAB
            </NuxtLink>
          </template>
          <template v-if="authStore.user?.role === 'ppk'">
            <NuxtLink to="/dashboard/ppk/pengajuan" class="nav-link">
              Pengajuan
            </NuxtLink>
            <NuxtLink to="/dashboard/ppk/pencairan" class="nav-link">
              Pencairan
            </NuxtLink>
          </template>
          <template v-if="authStore.user?.role === 'spi'">
            <NuxtLink to="/spi/verifikasi" class="nav-link">
              Verifikasi LPJ
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
                style="height:34px;width:34px;border-radius:9px;background:rgba(201,162,39,0.2);border:1.5px solid rgba(201,162,39,0.5);display:flex;align-items:center;justify-content:center;color:#e4c96a;font-weight:700;font-size:13px;"
              >
                {{ authStore.user?.username?.charAt(0).toUpperCase() || "U" }}
              </div>
              <span style="color:rgba(255,255,255,0.9);font-weight:500;font-size:14px;">
                {{ authStore.user?.username }}
              </span>
              <Icon name="heroicons:chevron-down" class="h-4 w-4" style="color:rgba(255,255,255,0.5);" />
            </button>
            <div
              v-if="dropdownOpen"
              style="position:absolute;right:0;margin-top:8px;width:192px;background:#fff;border-radius:12px;box-shadow:0 12px 36px rgba(15,31,61,.18);border:1px solid #e2eaf6;overflow:hidden;z-index:10;"
            >
              <div style="padding:12px 16px;border-bottom:1px solid #f0f4fb;">
                <p style="font-size:13px;font-weight:600;color:#1a2f5a;">{{ authStore.user?.username }}</p>
                <p style="font-size:11px;color:#7c93b4;margin-top:2px;text-transform:capitalize;">
                  {{ authStore.user?.role }}
                </p>
              </div>
              <button
                @click="handleLogout"
                style="width:100%;text-align:left;padding:10px 16px;font-size:13px;color:#dc2626;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:8px;"
                onmouseover="this.style.background='#fff5f5'"
                onmouseout="this.style.background='none'"
              >
                <Icon name="heroicons:arrow-right-on-rectangle" class="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="focus:outline-none"
            style="color:#fff;"
          >
            <Icon v-if="!mobileMenuOpen" name="heroicons:bars-3" class="h-6 w-6" />
            <Icon v-else name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>
      </nav>

      <!-- Mobile Menu Panel -->
      <div
        v-if="mobileMenuOpen"
        style="background:rgba(10,20,50,0.6);backdrop-filter:blur(8px);border-top:1px solid rgba(255,255,255,0.1);padding:8px 16px 12px;"
        class="md:hidden"
      >
        <div class="space-y-1">
          <NuxtLink to="/dashboard" class="mobile-nav-link" @click="mobileMenuOpen = false">
            Dashboard
          </NuxtLink>
          <template v-if="authStore.user?.role === 'ormawa'">
            <NuxtLink to="/ormawa/pengajuanRab" class="mobile-nav-link" @click="mobileMenuOpen = false">
              Pengajuan RAB
            </NuxtLink>
            <NuxtLink to="/ormawa/kegiatan" class="mobile-nav-link" @click="mobileMenuOpen = false">
              Kegiatan Saya
            </NuxtLink>
          </template>
          <template v-if="authStore.user?.role === 'kaprodi'">
            <NuxtLink to="/kaprodi/verifikasi" class="mobile-nav-link" @click="mobileMenuOpen = false">
              Verifikasi RAB
            </NuxtLink>
          </template>
          <template v-if="authStore.user?.role === 'ppk'">
            <NuxtLink to="/ppk/pengajuan" class="mobile-nav-link" @click="mobileMenuOpen = false">
              Pengajuan
            </NuxtLink>
            <NuxtLink to="/ppk/pencairan" class="mobile-nav-link" @click="mobileMenuOpen = false">
              Pencairan
            </NuxtLink>
          </template>
          <template v-if="authStore.user?.role === 'spi'">
            <NuxtLink to="/spi/verifikasi" class="mobile-nav-link" @click="mobileMenuOpen = false">
              Verifikasi LPJ
            </NuxtLink>
          </template>
          <hr style="margin:8px 0;border-color:rgba(255,255,255,0.1);" />
          <div style="padding-top:8px;">
            <p style="font-size:13px;color:rgba(255,255,255,0.5);">
              {{ authStore.user?.username }} ({{ authStore.user?.role }})
            </p>
            <button
              @click="handleLogout"
              style="margin-top:8px;width:100%;border-radius:8px;background:rgba(255,255,255,0.1);padding:8px 12px;font-size:13px;font-weight:500;color:#fff;border:none;cursor:pointer;"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div style="flex:1;">
      <slot />
    </div>

    <!-- Footer -->
    <footer style="background: linear-gradient(135deg, #0f1f3d 0%, #1e3a6e 60%, #2d4f8e 100%); color:#fff; border-top: 2px solid rgba(201,162,39,0.35);">
      <!-- Bagian atas footer -->
      <div class="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <!-- Kolom Alamat -->
          <div>
            <h3 class="mb-3 text-lg font-semibold" style="color:#e4c96a;">Alamat</h3>
            <p class="text-sm leading-relaxed" style="color:rgba(255,255,255,0.8);">
              Jl. Sudirman No.137 Lima Kaum, <br />
              Batusangkar, Tanah Datar, <br />
              Sumatera Barat, Indonesia
            </p>
          </div>

          <!-- Kolom Kontak -->
          <div>
            <h3 class="mb-3 text-lg font-semibold" style="color:#e4c96a;">Kontak Kami</h3>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <Icon name="proicons:phone" class="h-5 w-5" style="color:#e4c96a;" />
                <a href="tel:075271150" style="color:rgba(255,255,255,0.8);" class="hover:text-secondary transition">
                  0752-71150
                </a>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="proicons:email" class="h-5 w-5" style="color:#e4c96a;" />
                <a
                  href="mailto:info@uinmybatusangkar.ac.id"
                  style="color:rgba(255,255,255,0.8);"
                  class="hover:text-secondary transition"
                >
                  info@uinmybatusangkar.ac.id
                </a>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="proicons:globe" class="h-5 w-5" style="color:#e4c96a;" />
                <a
                  href="https://uinmybatusangkar.ac.id"
                  target="_blank"
                  style="color:rgba(255,255,255,0.8);"
                  class="hover:text-secondary transition"
                >
                  uinmybatusangkar.ac.id
                </a>
              </li>
            </ul>
          </div>

          <!-- Kolom Sosial Media -->
          <div>
            <h3 class="mb-3 text-lg font-semibold" style="color:#e4c96a;">Ikuti Kami</h3>
            <div class="flex space-x-4">
              <a href="#" style="border-radius:9999px;background:rgba(255,255,255,0.1);padding:8px;display:inline-flex;transition:background .15s;" onmouseover="this.style.background='rgba(201,162,39,0.5)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                <Icon name="mdi:facebook" class="h-5 w-5" />
              </a>
              <a href="#" style="border-radius:9999px;background:rgba(255,255,255,0.1);padding:8px;display:inline-flex;transition:background .15s;" onmouseover="this.style.background='rgba(201,162,39,0.5)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                <Icon name="mdi:instagram" class="h-5 w-5" />
              </a>
              <a href="#" style="border-radius:9999px;background:rgba(255,255,255,0.1);padding:8px;display:inline-flex;transition:background .15s;" onmouseover="this.style.background='rgba(201,162,39,0.5)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                <Icon name="mdi:youtube" class="h-5 w-5" />
              </a>
              <a href="#" style="border-radius:9999px;background:rgba(255,255,255,0.1);padding:8px;display:inline-flex;transition:background .15s;" onmouseover="this.style.background='rgba(201,162,39,0.5)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                <Icon name="mdi:twitter" class="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div style="border-top:1px solid rgba(255,255,255,0.15);padding:16px;text-align:center;font-size:12px;color:rgba(255,255,255,0.6);">
        <p>
          &copy; {{ new Date().getFullYear() }} Universitas Islam Negeri Mahmud Yunus Batusangkar.
          <br class="block sm:hidden" />
          All rights reserved.
        </p>
      </div>
    </footer>

  </div>
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
  };

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
  /* Nav links desktop */
  .nav-link {
    color: rgba(255, 255, 255, 0.72);
    font-weight: 500;
    font-size: 14px;
    padding: 6px 14px;
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
  }
  .nav-link:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
  .nav-link.router-link-active {
    color: #e4c96a;
    background: rgba(201, 162, 39, 0.15);
    font-weight: 600;
  }

  /* Mobile nav links */
  .mobile-nav-link {
    display: block;
    padding: 9px 12px;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    font-size: 14px;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
  }
  .mobile-nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  .mobile-nav-link.router-link-active {
    color: #e4c96a;
    background: rgba(201, 162, 39, 0.12);
  }
</style>