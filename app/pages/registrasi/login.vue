<template>
  <div
    class="flex justify-center h-screen items-center bg-gray-100 overflow-hidden"
  >
    <div
      class="border-4 border-primary rounded-2xl w-full max-w-[420px] bg-bgLogin p-6 shadow-2xl flex flex-col justify-center"
    >
      <section class="flex flex-col items-center mb-6">
        <div class="bg-white p-2.5 rounded-full shadow-sm mb-3">
          <img
            src="~/assets/images/logouin.png"
            alt="Logo UIN"
            width="70"
            height="85"
            class="object-contain"
          />
        </div>
        <h3
          class="text-[10px] font-bold text-center text-primary tracking-wider uppercase"
        >
          Sistem Informasi Organisasi
        </h3>
        <h1
          class="text-primary text-xl font-extrabold text-center leading-tight mt-1"
        >
          E-Organisasi <br />
          <span class="text-base font-bold">UIN Mahmud Yunus Batusangkar</span>
        </h1>
      </section>

      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-primary ml-1">Username</label>
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <Icon
                name="uil:user"
                class="text-primary/60 group-focus-within:text-primary transition-colors"
                size="18"
              />
            </div>
            <input
              v-model="form.id_users"
              type="number"
              required
              placeholder="Masukkan username"
              class="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-primary ml-1">Password</label>
          <div class="relative group">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <Icon
                name="uil:lock"
                class="text-primary/60 group-focus-within:text-primary transition-colors"
                size="18"
              />
            </div>
            <input
              v-model="form.password"
              type="password"
              required
              placeholder="Masukkan password"
              class="w-full h-10 pl-10 pr-10 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        <div class="flex items-start gap-2.5 mt-0.5 px-1">
          <div class="flex items-center h-4">
            <input
              id="remember"
              v-model="form.remember"
              type="checkbox"
              class="w-3.5 h-3.5 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
            />
          </div>
          <label
            for="remember"
            class="text-[10px] text-teal-950 leading-tight cursor-pointer select-none"
          >
            Ingat akun selama menggunakan browser ini.
          </label>
        </div>

        <button
          type="submit"
          :disabled="pending"
          class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg mt-2 transition-all shadow-md shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span v-if="pending">PROSES...</span>
          <template v-else>
            <span>MASUK SISTEM</span>
            <Icon name="uil:arrow-right" size="18" />
          </template>
        </button>

        <p
          v-if="errorMsg"
          class="text-red-500 text-[10px] text-center font-bold uppercase mt-1"
        >
          {{ errorMsg }}
        </p>
      </form>

      <footer class="mt-6 text-center">
        <p
          class="text-[9px] text-gray-400 font-medium uppercase tracking-widest"
        >
          &copy; {{ new Date().getFullYear() }} IT Support UIN MY Batusangkar
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from "vue";

  definePageMeta({
    layout: false,
  });

  const form = reactive({
    id_users: "",
    password: "",
    remember: false,
  });
  const pending = ref(false);
  const errorMsg = ref("");

  const handleLogin = async () => {
    pending.value = true;
    errorMsg.value = "";

    try {
      const response = await $fetch("/api/registrasi/login", {
        method: "POST",
        body: {
          id_users: form.id_users,
          password: form.password,
          remember: form.remember,
        },
      });
      if (response.success) {
        navigateTo("/");
      }
    } catch (err) {
      console.error("Login Gagal:", err);
      errorMsg.value = err.data?.message || "Username atau Password salah!";
    } finally {
      pending.value = false;
    }
  };
</script>
