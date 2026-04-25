import { useDrizzle } from "~~/server/db";
import { eq } from "drizzle-orm";
import { pengajuanRabTable } from "~~/server/db/schema";
import fs from "node:fs/promises";
import path from "node:path";

export default defineEventHandler(async (event) => {
  const formdata = await readMultipartFormData(event);

  if (!formdata) {
    throw createError({
      statusCode: 400,
      statusMessage: "Form data tidak valid atau kosong.",
    });
  }

  const getFieldText = (name: string) => {
    const field = formdata.find((f) => f.name === name);
    return field && field.data ? field.data.toString("utf-8") : "";
  };

  const getFileBuffer = (name: string) => {
    const field = formdata.find((f) => f.name === name);

    if (field && field.data && field.data.length > 0 && field.filename) {
      return field.data;
    }

    return null;
  };

  const editJudul = getFieldText("editJudul");
  const rabId = getFieldText("rabId");
  const anggaranBaru = getFieldText("anggaranBaru");
  const editFileBuffer = getFileBuffer("file");
  if (!rabId) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID RAB tidak boleh kosong.",
    });
  }

  const db = useDrizzle();

  const [existingRab] = await db
    .select({ fileUrl: pengajuanRabTable.fileRabUrl })
    .from(pengajuanRabTable)
    .where(eq(pengajuanRabTable.id, Number(rabId)));

  if (!existingRab) {
    throw createError({
      statusCode: 404,
      statusMessage: "Data RAB tidak ditemukan.",
    });
  }

  try {
    await db
      .update(pengajuanRabTable)
      .set({
        judulKegiatan: editJudul,
        status: "waiting_kaprodi",
        updatedAt: new Date(),
        totalAnggaran: anggaranBaru,
      })
      .where(eq(pengajuanRabTable.id, Number(rabId)));
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal memperbarui judul di database.",
    });
  }

  if (editFileBuffer && existingRab.fileUrl) {
    const filePath = path.resolve(process.cwd(), existingRab.fileUrl);

    try {
      await fs.writeFile(filePath, editFileBuffer);
    } catch (err) {
      console.error("Gagal menimpa file:", err);
      throw createError({
        statusCode: 500,
        statusMessage:
          "Judul berhasil diupdate, tetapi server gagal menyimpan dokumen baru.",
      });
    }
  }

  const responseMessage = editFileBuffer
    ? "Judul dan dokumen RAB berhasil diperbarui."
    : "Judul RAB berhasil diperbarui (dokumen tetap sama).";

  return {
    success: true,
    message: responseMessage,
  };
});
