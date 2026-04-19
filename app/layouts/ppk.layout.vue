<template>
  <div class="app-shell">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar--collapsed': sidebarCollapsed, 'sidebar--open': mobileMenuOpen }">
      <!-- Logo -->
      <div class="sidebar__brand">
        <div class="sidebar__logo">
          <img src="~/assets/images/logouin.png" alt="UIN Logo" width="36" height="36" />
        </div>
        <transition name="fade">
          <div v-if="!sidebarCollapsed" class="sidebar__brand-text">
            <span class="sidebar__brand-name">FEBI Finance</span>
            <span class="sidebar__brand-sub">UIN Mahmud Yunus</span>
          </div>
        </transition>
      </div>

      <!-- Nav Items -->
      <nav class="sidebar__nav">
        <div class="sidebar__nav-section">
          <span v-if="!sidebarCollapsed" class="sidebar__nav-label">MENU UTAMA</span>
          <NuxtLink to="/dashboard" class="sidebar__nav-item" active-class="sidebar__nav-item--active" @click="mobileMenuOpen = false">
            <div class="sidebar__nav-icon">
              <Icon name="heroicons:squares-2x2" />
            </div>
            <span v-if="!sidebarCollapsed" class="sidebar__nav-text">Dashboard</span>
            <div v-if="!sidebarCollapsed" class="sidebar__nav-indicator" />
          </NuxtLink>

          <template v-if="authStore.user?.role === 'ppk'">
            <NuxtLink to="/ppk/verifikasi" class="sidebar__nav-item" active-class="sidebar__nav-item--active" @click="mobileMenuOpen = false">
              <div class="sidebar__nav-icon">
                <Icon name="heroicons:document-check" />
              </div>
              <span v-if="!sidebarCollapsed" class="sidebar__nav-text">Verifikasi Tagihan</span>
              <div v-if="!sidebarCollapsed" class="sidebar__nav-indicator" />
            </NuxtLink>
            <NuxtLink to="/ppk/pencairan" class="sidebar__nav-item" active-class="sidebar__nav-item--active" @click="mobileMenuOpen = false">
              <div class="sidebar__nav-icon">
                <Icon name="heroicons:banknotes" />
              </div>
              <span v-if="!sidebarCollapsed" class="sidebar__nav-text">Pencairan Dana</span>
              <div v-if="!sidebarCollapsed" class="sidebar__nav-indicator" />
            </NuxtLink>
            <NuxtLink to="/ppk/riwayat" class="sidebar__nav-item" active-class="sidebar__nav-item--active" @click="mobileMenuOpen = false">
              <div class="sidebar__nav-icon">
                <Icon name="heroicons:clock" />
              </div>
              <span v-if="!sidebarCollapsed" class="sidebar__nav-text">Riwayat</span>
              <div v-if="!sidebarCollapsed" class="sidebar__nav-indicator" />
            </NuxtLink>
          </template>

          <template v-if="authStore.user?.role === 'ormawa'">
            <NuxtLink to="/ormawa/pengajuan" class="sidebar__nav-item" active-class="sidebar__nav-item--active" @click="mobileMenuOpen = false">
              <div class="sidebar__nav-icon"><Icon name="heroicons:document-plus" /></div>
              <span v-if="!sidebarCollapsed" class="sidebar__nav-text">Pengajuan RAB</span>
              <div v-if="!sidebarCollapsed" class="sidebar__nav-indicator" />
            </NuxtLink>
            <NuxtLink to="/ormawa/kegiatan" class="sidebar__nav-item" active-class="sidebar__nav-item--active" @click="mobileMenuOpen = false">
              <div class="sidebar__nav-icon"><Icon name="heroicons:calendar-days" /></div>
              <span v-if="!sidebarCollapsed" class="sidebar__nav-text">Kegiatan Saya</span>
              <div v-if="!sidebarCollapsed" class="sidebar__nav-indicator" />
            </NuxtLink>
          </template>

          <template v-if="authStore.user?.role === 'kaprodi'">
            <NuxtLink to="/kaprodi/verifikasi" class="sidebar__nav-item" active-class="sidebar__nav-item--active" @click="mobileMenuOpen = false">
              <div class="sidebar__nav-icon"><Icon name="heroicons:clipboard-document-check" /></div>
              <span v-if="!sidebarCollapsed" class="sidebar__nav-text">Verifikasi RAB</span>
              <div v-if="!sidebarCollapsed" class="sidebar__nav-indicator" />
            </NuxtLink>
          </template>

          <template v-if="authStore.user?.role === 'spi'">
            <NuxtLink to="/spi/verifikasi" class="sidebar__nav-item" active-class="sidebar__nav-item--active" @click="mobileMenuOpen = false">
              <div class="sidebar__nav-icon"><Icon name="heroicons:shield-check" /></div>
              <span v-if="!sidebarCollapsed" class="sidebar__nav-text">Verifikasi LPJ</span>
              <div v-if="!sidebarCollapsed" class="sidebar__nav-indicator" />
            </NuxtLink>
          </template>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar__footer">
        <button class="sidebar__collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <Icon :name="sidebarCollapsed ? 'heroicons:chevron-right' : 'heroicons:chevron-left'" />
        </button>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false" />

    <!-- Main Content Area -->
    <div class="main-area" :class="{ 'main-area--expanded': sidebarCollapsed }">
      <!-- Top Header -->
      <header class="topbar">
        <!-- Mobile menu toggle -->
        <button class="topbar__mobile-toggle md:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
          <Icon name="heroicons:bars-3" class="h-5 w-5" />
        </button>

        <!-- Page Title via breadcrumb slot -->
        <div class="topbar__title">
          <div class="topbar__breadcrumb">
            <span class="topbar__breadcrumb-home">FEBI Finance</span>
            <Icon name="heroicons:chevron-right" class="topbar__breadcrumb-sep" />
            <span class="topbar__breadcrumb-current">Dashboard</span>
          </div>
        </div>

        <!-- Right side -->
        <div class="topbar__right">
          <!-- Notification Bell -->
          <button class="topbar__icon-btn">
            <Icon name="heroicons:bell" class="h-5 w-5" />
            <span class="topbar__notif-badge">3</span>
          </button>

          <!-- Divider -->
          <div class="topbar__divider" />

          <!-- User dropdown -->
          <div class="relative" ref="dropdownRef">
            <button @click="toggleDropdown" class="topbar__user-btn">
              <div class="topbar__avatar">
                {{ authStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <div class="topbar__user-info hidden sm:block">
                <span class="topbar__user-name">{{ authStore.user?.username }}</span>
                <span class="topbar__user-role">{{ authStore.user?.role }}</span>
              </div>
              <Icon name="heroicons:chevron-down" class="h-4 w-4 text-gray-400" />
            </button>

            <transition name="dropdown">
              <div v-if="dropdownOpen" class="user-dropdown">
                <div class="user-dropdown__header">
                  <div class="user-dropdown__avatar-lg">
                    {{ authStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
                  </div>
                  <div>
                    <p class="user-dropdown__name">{{ authStore.user?.username }}</p>
                    <p class="user-dropdown__role capitalize">{{ authStore.user?.role }}</p>
                  </div>
                </div>
                <div class="user-dropdown__divider" />
                <button @click="handleLogout" class="user-dropdown__logout">
                  <Icon name="heroicons:arrow-right-on-rectangle" class="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="page-footer">
        <div class="page-footer__inner">
          <div class="page-footer__left">
            <img src="~/assets/images/logouin.png" alt="" width="20" height="20" class="opacity-70" />
            <span>© {{ new Date().getFullYear() }} UIN Mahmud Yunus Batusangkar</span>
          </div>
          <div class="page-footer__links">
            <a href="tel:075271150">0752-71150</a>
            <span>·</span>
            <a href="mailto:info@uinmybatusangkar.ac.id">info@uinmybatusangkar.ac.id</a>
            <span>·</span>
            <a href="https://uinmybatusangkar.ac.id" target="_blank">uinmybatusangkar.ac.id</a>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const dropdownOpen = ref(false)
const mobileMenuOpen = ref(false)
const sidebarCollapsed = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => { dropdownOpen.value = !dropdownOpen.value }

const handleLogout = async () => {
  await authStore.logout()
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
/* ===================== CSS VARIABLES ===================== */
:root {
  --blue-900: #1a2f5a;
  --blue-800: #1e3a6e;
  --blue-700: #2d4f8e;
  --blue-600: #3b5988;
  --blue-500: #4a6fa5;
  --blue-400: #6b8fc7;
  --blue-100: #dce8f9;
  --blue-50: #eef4fd;

  --gold-500: #c9a227;
  --gold-400: #d4b044;
  --gold-300: #e4c96a;
  --gold-200: #f0dd9e;
  --gold-100: #faf3d8;

  --sidebar-width: 240px;
  --sidebar-collapsed: 68px;
  --topbar-height: 64px;
  --radius: 12px;
  --radius-sm: 8px;
}

/* ===================== LAYOUT SHELL ===================== */
.app-shell {
  display: flex;
  min-height: 100vh;
  background: #f0f4fb;
  font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
}

/* ===================== SIDEBAR ===================== */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--sidebar-width);
  background: linear-gradient(165deg, var(--blue-900) 0%, var(--blue-800) 60%, #1a3060 100%);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 24px rgba(27, 47, 90, 0.25);
  overflow: hidden;
}

.sidebar--collapsed {
  width: var(--sidebar-collapsed);
}

/* Decorative gold accent line */
.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, var(--gold-400) 0%, transparent 50%, var(--gold-400) 100%);
  opacity: 0.6;
}

/* Brand */
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  min-height: 72px;
  overflow: hidden;
}

.sidebar__logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(201, 162, 39, 0.15);
  border: 1.5px solid rgba(201, 162, 39, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar__brand-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  white-space: nowrap;
}

.sidebar__brand-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
  line-height: 1.2;
}

.sidebar__brand-sub {
  font-size: 10px;
  color: var(--gold-300);
  letter-spacing: 0.4px;
  margin-top: 2px;
}

/* Nav */
.sidebar__nav {
  flex: 1;
  padding: 16px 10px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.sidebar__nav::-webkit-scrollbar { display: none; }

.sidebar__nav-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(255,255,255,0.35);
  letter-spacing: 1.2px;
  padding: 0 8px;
  display: block;
  margin-bottom: 8px;
  margin-top: 4px;
  white-space: nowrap;
}

.sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: var(--radius-sm);
  color: rgba(255,255,255,0.65);
  text-decoration: none;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.sidebar__nav-item:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}

.sidebar__nav-item--active {
  background: linear-gradient(90deg, rgba(201, 162, 39, 0.2) 0%, rgba(201, 162, 39, 0.05) 100%);
  color: var(--gold-300) !important;
  border: 1px solid rgba(201, 162, 39, 0.25);
}

.sidebar__nav-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  height: 60%;
  width: 3px;
  background: var(--gold-400);
  border-radius: 0 4px 4px 0;
}

.sidebar__nav-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
  font-size: 18px;
}

.sidebar__nav-text {
  font-size: 13px;
  font-weight: 500;
  flex: 1;
}

.sidebar__nav-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
  transition: background 0.2s;
}

.sidebar__nav-item--active .sidebar__nav-indicator {
  background: var(--gold-400);
}

/* Sidebar Footer */
.sidebar__footer {
  padding: 12px 10px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  justify-content: center;
}

.sidebar__collapse-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar__collapse-btn:hover {
  background: rgba(255,255,255,0.12);
  color: #fff;
}

/* ===================== MOBILE OVERLAY ===================== */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 20, 50, 0.55);
  z-index: 99;
  backdrop-filter: blur(2px);
}

/* ===================== MAIN AREA ===================== */
.main-area {
  margin-left: var(--sidebar-width);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-area--expanded {
  margin-left: var(--sidebar-collapsed);
}

/* ===================== TOPBAR ===================== */
.topbar {
  height: var(--topbar-height);
  background: #fff;
  border-bottom: 1px solid #e8eef8;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 12px rgba(59, 89, 136, 0.06);
}

.topbar__mobile-toggle {
  padding: 8px;
  border-radius: 8px;
  color: var(--blue-700);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.topbar__mobile-toggle:hover { background: var(--blue-50); }

.topbar__title {
  flex: 1;
}

.topbar__breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
}

.topbar__breadcrumb-home {
  font-size: 12px;
  color: var(--blue-400);
  font-weight: 500;
}

.topbar__breadcrumb-sep {
  width: 12px;
  height: 12px;
  color: #c5d3e8;
}

.topbar__breadcrumb-current {
  font-size: 13px;
  font-weight: 600;
  color: var(--blue-800);
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar__icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e8eef8;
  background: var(--blue-50);
  color: var(--blue-600);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}
.topbar__icon-btn:hover {
  background: var(--blue-100);
  border-color: var(--blue-400);
}

.topbar__notif-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: var(--gold-500);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.topbar__divider {
  width: 1px;
  height: 28px;
  background: #e8eef8;
  margin: 0 4px;
}

.topbar__user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  border-radius: 12px;
  border: 1px solid #e8eef8;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}
.topbar__user-btn:hover {
  background: var(--blue-50);
  border-color: var(--blue-200);
}

.topbar__avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--blue-700), var(--blue-500));
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--gold-400);
}

.topbar__user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.topbar__user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--blue-900);
  line-height: 1.2;
}

.topbar__user-role {
  font-size: 10px;
  color: var(--blue-500);
  font-weight: 500;
  text-transform: capitalize;
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: #fff;
  border: 1px solid #e8eef8;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(30, 58, 110, 0.12);
  overflow: hidden;
  z-index: 200;
}

.user-dropdown__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, var(--blue-50) 0%, var(--gold-100) 100%);
}

.user-dropdown__avatar-lg {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--blue-700), var(--blue-500));
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--gold-400);
  flex-shrink: 0;
}

.user-dropdown__name {
  font-size: 13px;
  font-weight: 700;
  color: var(--blue-900);
}

.user-dropdown__role {
  font-size: 11px;
  color: var(--blue-500);
}

.user-dropdown__divider {
  height: 1px;
  background: #f0f4fb;
}

.user-dropdown__logout {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #e53e3e;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}
.user-dropdown__logout:hover { background: #fff5f5; }

/* ===================== PAGE CONTENT ===================== */
.page-content {
  flex: 1;
  padding: 28px 28px;
}

/* ===================== FOOTER ===================== */
.page-footer {
  background: #fff;
  border-top: 1px solid #e8eef8;
  padding: 12px 24px;
}

.page-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.page-footer__left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8ea8cc;
}

.page-footer__links {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #aabbdd;
}

.page-footer__links a {
  color: var(--blue-500);
  text-decoration: none;
  transition: color 0.2s;
}
.page-footer__links a:hover { color: var(--blue-700); }
.page-footer__links span { color: #d0dbed; }

/* ===================== TRANSITIONS ===================== */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateX(-4px); }

.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.2s, transform 0.2s; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px); }

/* ===================== MOBILE ===================== */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s;
  }
  .sidebar--open {
    transform: translateX(0);
    width: var(--sidebar-width) !important;
  }
  .main-area {
    margin-left: 0 !important;
  }
  .sidebar__collapse-btn { display: none; }
  .page-content { padding: 16px; }
  .page-footer__links { display: none; }
}
</style>