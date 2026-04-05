import { useDrizzle } from "~~/server/db/index"; // Sesuaikan path utils Anda
import { usersTable } from "~~/server/db/schema/usersSchema";
import { eq, and } from "drizzle-orm";
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id_users, password, remember } = body;
  console.log(body);
  try {
    const user = await useDrizzle().query.usersTable.findFirst({
      where: eq(usersTable.id_users, id_users),
    });
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User tidak terdaftar",
        data: {
          success: false,
          message: "ID User (NIM/NIP) tidak ditemukan.",
        },
      });
    }
    console.log(user);
    if (user.password !== password) {
      return {
        success: false,
        message: "Password yang Anda masukkan salah.",
      };
    }

    const payload = {
      id: user.id,
      role: user.role,
    };
    const token = createJwt(payload);

    if (token == null) {
      throw new Error("Token creation failed");
    }

    setCookie(event, "jwt_token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
    });
    return {
      success: true,
      message: "Login berhasil!",
      data: {
        user: payload,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error || "Terjadi kesalahan pada server",
      error: error.data || null,
    };
  }
});
