import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwindcss.css"],
  modules: ["@pinia/nuxt", "@nuxt/icon"],
  vite: {
    plugins: [tailwindcss()],
  },
  pinia: {
    storesDirs: ["@/stores/**"],
  },
  runtimeConfig: {
    SecretJwtKey: process.env.SecretJwtKey,
  },
});
