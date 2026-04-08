export default defineEventHandler((event) => {
  deleteCookie(event, "jwt_token", {
    path: "/",
  });
  return {
    message: "logout berhasil",
  };
});
