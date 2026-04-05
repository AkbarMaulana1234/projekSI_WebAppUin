async function isAuthenticated(): Promise<boolean> {
  try {
    const headers = useRequestHeaders(["cookie"]);

    const response = await $fetch<{ valid: boolean }>("/api/auth/verify", {
      headers,
    });
    return response.valid === true;
  } catch (error) {
    return false;
  }
}
export default defineNuxtRouteMiddleware(async (to, from) => {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    if (to.path !== "/registrasi/login") {
      return navigateTo("/registrasi/login");
    }
  }
});
