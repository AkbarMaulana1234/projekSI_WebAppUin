import { useDrizzle } from "~~/server/db";
import { eq } from "drizzle-orm";
import { dokumentasiKegiatanTable } from "~~/server/db/schema/dokumentasiSchema";
import { tagihanPencairanTable } from "~~/server/db/schema/TagihanPencairanSchema";
import { kegiatanTable } from "~~/server/db/schema/KegiatanSchema";
import { unlink } from "node:fs/promises";
import fs from "node:fs";

export default defineEventHandler(async (event) => {
  const db = useDrizzle();
  const body = await readBody(event);
  const { id } = body;

  if (!id) {
    throw createError({ statusCode: 400, message: "ID wajib disertakan" });
  }

  const idStr = String(id);
  const isDoc = idStr.startsWith("doc_");
  const isTagihan = idStr.startsWith("tagihan_");

  // Backward compatibility jika id murni angka
  const realId = isDoc || isTagihan ? Number(idStr.split("_")[1]) : Number(id);

  if (isTagihan) {
    const results = await db
      .select({
        tagihan: tagihanPencairanTable,
        statusKegiatan: kegiatanTable.statusKegiatan,
      })
      .from(tagihanPencairanTable)
      .innerJoin(
        kegiatanTable,
        eq(tagihanPencairanTable.kegiatanId, kegiatanTable.id),
      )
      .where(eq(tagihanPencairanTable.id, realId))
      .limit(1);

    const res = results[0];
    if (!res)
      throw createError({ statusCode: 404, message: "Data tidak ditemukan" });

    const doc = res.tagihan;
    const fileFields = [
      "skFileUrl",
      "spmtFileUrl",
      "amprahFileUrl",
      "npwpFileUrl",
      "ktpFileUrl",
      "bukuRekeningFileUrl",
      "strukFileUrl",
      "fotoBarangUrl",
    ];

    for (const field of fileFields) {
      const filePath = (doc as any)[field];
      if (filePath && fs.existsSync(filePath)) {
        await unlink(filePath).catch(() => {});
      }
    }

    await db
      .delete(tagihanPencairanTable)
      .where(eq(tagihanPencairanTable.id, realId));
  } else {
    const results = await db
      .select({
        dokumentasi: dokumentasiKegiatanTable,
        statusKegiatan: kegiatanTable.statusKegiatan,
      })
      .from(dokumentasiKegiatanTable)
      .innerJoin(
        kegiatanTable,
        eq(dokumentasiKegiatanTable.kegiatanId, kegiatanTable.id),
      )
      .where(eq(dokumentasiKegiatanTable.id, realId))
      .limit(1);

    const res = results[0];
    if (!res)
      throw createError({ statusCode: 404, message: "Data tidak ditemukan" });

    if (res.statusKegiatan === "SELESAI") {
      throw createError({
        statusCode: 403,
        message: "Kegiatan sudah selesai, data tidak dapat dihapus",
      });
    }

    if (res.dokumentasi.status === "DITERIMA") {
      throw createError({
        statusCode: 403,
        message: "Dokumentasi sudah diterima, data tidak dapat dihapus",
      });
    }

    const doc = res.dokumentasi;
    if (doc.fileUrl) {
      const paths = doc.fileUrl
        .split(";")
        .filter((p: string) => p.trim() !== "");
      for (const filePath of paths) {
        if (fs.existsSync(filePath)) {
          await unlink(filePath).catch(() => {});
        }
      }
    }

    await db
      .delete(dokumentasiKegiatanTable)
      .where(eq(dokumentasiKegiatanTable.id, realId));
  }

  return { success: true, message: "Data berhasil dihapus" };
});
