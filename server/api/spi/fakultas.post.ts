import { useDrizzle } from "~~/server/db/index";
import { fakultasTable } from "~~/server/db/schema/fakultasSchema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const body = await readBody(event);
    const { nama, kode } = body;

    if (!nama?.trim() || !kode?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nama dan kode fakultas wajib diisi",
      });
    }

    const cleanKode = kode.trim().toUpperCase();

    // Check for duplicate kode
    const existing = await db
      .select()
      .from(fakultasTable)
      .where(eq(fakultasTable.kode, cleanKode))
      .limit(1);

    if (existing.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Kode Fakultas "${cleanKode}" sudah digunakan oleh "${existing[0].nama}"`,
      });
    }

    await db.insert(fakultasTable).values({
      nama: nama.trim(),
      kode: cleanKode,
    });

    return {
      success: true,
      message: "Fakultas berhasil ditambahkan",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menambahkan fakultas",
    };
  }
});
