import { useDrizzle } from "~~/server/db/index";
import { programStudiTable } from "~~/server/db/schema/programStudiSchema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const body = await readBody(event);
    const { nama, kode, fakultasId } = body;

    if (!nama?.trim() || !kode?.trim() || !fakultasId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nama, kode, dan fakultas wajib diisi",
      });
    }

    const cleanKode = kode.trim().toUpperCase();

    // Check duplicate
    const existing = await db
      .select()
      .from(programStudiTable)
      .where(eq(programStudiTable.kode, cleanKode))
      .limit(1);

    if (existing.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Kode Prodi "${cleanKode}" sudah digunakan oleh "${existing[0].nama}"`,
      });
    }

    await db.insert(programStudiTable).values({
      nama: nama.trim(),
      kode: cleanKode,
      fakultasId: Number(fakultasId),
    });

    return {
      success: true,
      message: "Program Studi berhasil ditambahkan",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menambahkan program studi",
    };
  }
});
