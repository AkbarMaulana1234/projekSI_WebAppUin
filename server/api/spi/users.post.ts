import { useDrizzle } from "~~/server/db/index";
import {
  usersTable,
  ormawaTable,
  programStudiTable,
} from "~~/server/db/schema/index";
import { eq, or } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const body = await readBody(event);
    let {
      email,
      users_id,
      password,
      fullName,
      role,
      prodiId,
      ormawaId,
      fakultasId,
    } = body;

    if (
      !email?.trim() ||
      !users_id?.trim() ||
      !password ||
      !fullName?.trim() ||
      !role
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "Semua field wajib diisi",
      });
    }

    email = email.trim().toLowerCase();
    users_id = users_id.trim();

    // 1. Check similarity for security
    const emailPrefix = email.split("@")[0].toLowerCase();
    const idLower = users_id.toLowerCase();

    if (
      emailPrefix === idLower ||
      email.includes(idLower) ||
      idLower.includes(emailPrefix)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Email dan User ID terlalu mirip. Silahkan gunakan kombinasi yang berbeda untuk alasan keamanan.",
      });
    }

    // 2. Check for duplicates
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(or(eq(usersTable.email, email), eq(usersTable.users_id, users_id)))
      .limit(1);

    if (existingUser.length > 0) {
      const isEmailDup = existingUser[0].email === email;
      throw createError({
        statusCode: 400,
        statusMessage: isEmailDup
          ? "Email sudah digunakan oleh user lain"
          : "User ID sudah digunakan oleh user lain",
      });
    }

    // 3. Resolve IDs based on role
    if (role === "ormawa" && ormawaId) {
      const ormawa = await db
        .select()
        .from(ormawaTable)
        .where(eq(ormawaTable.id, Number(ormawaId)))
        .limit(1);

      if (ormawa.length > 0) {
        prodiId = ormawa[0].prodiId;
        const prodi = await db
          .select()
          .from(programStudiTable)
          .where(eq(programStudiTable.id, Number(prodiId)))
          .limit(1);
        if (prodi.length > 0) {
          fakultasId = prodi[0].fakultasId;
        }
      }
    } else if (role === "kaprodi" && prodiId) {
      const prodi = await db
        .select()
        .from(programStudiTable)
        .where(eq(programStudiTable.id, Number(prodiId)))
        .limit(1);
      if (prodi.length > 0) {
        fakultasId = prodi[0].fakultasId;
      }
    }

    await db.insert(usersTable).values({
      email,
      users_id,
      passwordHash: password,
      fullName: fullName.trim(),
      role,
      prodiId: prodiId ? Number(prodiId) : null,
      ormawaId: ormawaId ? Number(ormawaId) : null,
      fakultasId: fakultasId ? Number(fakultasId) : null,
      isActive: true,
    });

    return {
      success: true,
      message: "User berhasil ditambahkan",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.statusMessage || error.message || "Gagal menambahkan user",
    };
  }
});
