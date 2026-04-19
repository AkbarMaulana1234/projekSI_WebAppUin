import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SecretJwtKey || "your-secret-key-fallback";

export function createJwt(payload: object): string {
  return jwt.sign(payload, SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: "1d",
  });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    return null;
  }
}
