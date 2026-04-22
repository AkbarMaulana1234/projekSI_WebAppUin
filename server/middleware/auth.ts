import jwt from "jsonwebtoken";
import { usersTable } from "../db/schema";
import { useDrizzle } from "../db";
import { eq } from "drizzle-orm";
import { User } from "../interface/userInterface";

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "jwt_token");

  if (!token) return;
  try {
    const decoded = jwt.verify(token, process.env.SecretJwtKey!) as User;

    const db = useDrizzle();
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, Number(decoded.id)),
    });

    if (!user) {
      console.warn("User tidak ditemukan di database");
    }
    event.context.user = decoded;
  } catch (err) {
    console.warn("Token invalid atau expired");
  }
});
