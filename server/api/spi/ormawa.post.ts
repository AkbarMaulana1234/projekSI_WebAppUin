import { useDrizzle } from "~~/server/db/index";
import { ormawaTable } from "~~/server/db/schema/ormawaSchema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const body = await readBody(event);
    const { nama, kode, totalAnggaran, fakultasId, prodiId } = body;

    if (!nama?.trim() || !kode?.trim() || !fakultasId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nama, kode, dan Fakultas wajib diisi",
      });
    }

    const cleanKode = kode.trim().toUpperCase();

    // Check duplicate
    const existing = await db
      .select()
      .from(ormawaTable)
      .where(eq(ormawaTable.kode, cleanKode))
      .limit(1);

    if (existing.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Kode Ormawa "${cleanKode}" sudah digunakan oleh "${existing[0].nama}"`,
      });
    }

    await db.insert(ormawaTable).values({
      nama: nama.trim(),
      kode: cleanKode,
      totalAnggaran: totalAnggaran ? Number(totalAnggaran) : 0,
      fakultasId: Number(fakultasId),
      prodiId: prodiId ? Number(prodiId) : null,
    });

    return {
      success: true,
      message: "Ormawa berhasil ditambahkan",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menambahkan ormawa",
    };
  }
});
