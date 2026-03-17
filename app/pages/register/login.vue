<script setup lang="ts">
  import { ref } from "vue";
  // Menggunakan ref untuk data binding
  const email = ref("");
  const password = ref("");
  const isLoading = ref(false);

  const handleLogin = () => {
    if (!email.value || !password.value) return;

    isLoading.value = true;
    // Simulasi proses login
    setTimeout(() => {
      isLoading.value = false;
      alert(`Login berhasil untuk: ${email.value}`);
    }, 1500);
  };
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6"
  >
    <!-- Logo/Brand Name -->
    <div class="mb-8 text-center"></div>

    <!-- Menggunakan BaseCard dengan variant primary -->
    <BaseCard
      title="Selamat Datang Kembali"
      subtitle="Silakan masukkan email dan password Anda"
      variant="primary"
      class="max-w-md w-full shadow-xl"
    >
      <form @submit.prevent="handleLogin" class="space-y-5 py-4">
        <!-- Menggunakan BaseInput untuk Email -->
        <BaseInput
          id="email"
          v-model="email"
          label="Alamat Email"
          type="email"
          placeholder="contoh@email.com"
          required
        />

        <!-- Menggunakan BaseInput untuk Password -->
        <div class="space-y-1">
          <BaseInput
            id="password"
            v-model="password"
            label="Kata Sandi"
            type="password"
            placeholder="••••••••"
            required
          />
          <div class="flex justify-end">
            <a
              href="#"
              class="text-xs text-primary hover:underline font-semibold"
            >
              Lupa kata sandi?
            </a>
          </div>
        </div>

        <!-- Checkbox sederhana -->
        <label class="flex items-center gap-2 cursor-pointer group w-fit">
          <input
            type="checkbox"
            class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/40 cursor-pointer"
          />
          <span
            class="text-sm text-gray-600 group-hover:text-gray-900 transition-colors"
            >Ingat saya</span
          >
        </label>

        <!-- Menggunakan BaseButton dengan variant primary -->
        <BaseButton
          type="submit"
          variant="primary"
          class="w-full h-11"
          :loading="isLoading"
        >
          Masuk Sekarang
        </BaseButton>
      </form>

      <!-- Slot footer BaseCard -->
      <template #footer>
        <p class="text-center text-sm text-gray-600">
          Belum punya akun?
          <NuxtLink
            to="/register/signup"
            class="text-primary hover:text-primary/80 underline font-bold transition-colors"
          >
            Daftar Gratis
          </NuxtLink>
        </p>
      </template>
    </BaseCard>

    <!-- Tombol kembali ke Home -->
    <NuxtLink
      to="/"
      class="mt-8 text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2"
    >
      <span>&larr;</span> Kembali ke Beranda
    </NuxtLink>
  </div>
</template>
