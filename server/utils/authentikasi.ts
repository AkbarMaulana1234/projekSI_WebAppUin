import jwt from "jsonwebtoken";

export function createJwt(payload: object): string {
  const runtimeConfig = useRuntimeConfig(); // Pindahkan ke dalam fungsi agar aman
  return jwt.sign(payload, runtimeConfig.SecretJwtKey, {
    algorithm: "HS256",
    expiresIn: "1d",
  });
}

export function verifyJwt(token: string) {
  const runtimeConfig = useRuntimeConfig();
  try {
    return jwt.verify(token, runtimeConfig.SecretJwtKey, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    return null;
  }
}
