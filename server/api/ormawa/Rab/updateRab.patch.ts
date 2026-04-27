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

  const rabId = getFieldText("rabId");
  const editJudul = getFieldText("editJudul");
  const anggaranBaru = getFieldText("anggaranBaru");
  const tanggalMulai = getFieldText("tanggalMulai");
  const tanggalSelesai = getFieldText("tanggalSelesai");

  const editFileRabBuffer = getFileBuffer("fileRab");
  const editFileTorBuffer = getFileBuffer("fileTor");

  if (!rabId) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID RAB tidak boleh kosong.",
    });
  }

  const db = useDrizzle();

  const [existingRab] = await db
    .select()
    .from(pengajuanRabTable)
    .where(eq(pengajuanRabTable.id, Number(rabId)));

  if (!existingRab) {
    throw createError({
      statusCode: 404,
      statusMessage: "Data pengajuan tidak ditemukan.",
    });
  }

  const formatToYYYYMMDD = (dateStr: any) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  const existingTanggalMulai = formatToYYYYMMDD(existingRab.tanggalMulai);
  const existingTanggalSelesai = formatToYYYYMMDD(existingRab.tanggalSelesai);

  const isJudulSama = existingRab.judulKegiatan === editJudul;
  const isAnggaranSama = existingRab.totalAnggaran === anggaranBaru;
  const isTanggalMulaiSama = existingTanggalMulai === tanggalMulai;
  const isTanggalSelesaiSama = existingTanggalSelesai === tanggalSelesai;

  const hasFileRab = !!editFileRabBuffer;
  const hasFileTor = !!editFileTorBuffer;

  if (
    isJudulSama &&
    isAnggaranSama &&
    isTanggalMulaiSama &&
    isTanggalSelesaiSama &&
    !hasFileRab &&
    !hasFileTor
  ) {
    return {
      success: false,
      message: "Tidak ada perubahan data yang dilakukan.",
    };
  }

  try {
    await db
      .update(pengajuanRabTable)
      .set({
        judulKegiatan: editJudul,
        totalAnggaran: anggaranBaru,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        status: "waiting_kaprodi", // Ubah status agar divalidasi ulang oleh Kaprodi
        updatedAt: new Date(),
      })
      .where(eq(pengajuanRabTable.id, Number(rabId)));
  } catch (error) {
    console.error("Error DB Update:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal memperbarui data di database.",
    });
  }

  // Tulis ulang file secara sinkron jika ada file baru
  try {
    if (hasFileRab && existingRab.fileRabUrl) {
      const filePathRab = path.resolve(process.cwd(), existingRab.fileRabUrl);
      await fs.writeFile(filePathRab, editFileRabBuffer!);
    }

    if (hasFileTor && existingRab.fileTorUrl) {
      const filePathTor = path.resolve(process.cwd(), existingRab.fileTorUrl);
      await fs.writeFile(filePathTor, editFileTorBuffer!);
    }
  } catch (err) {
    console.error("Gagal menimpa file:", err);
    throw createError({
      statusCode: 500,
      statusMessage:
        "Data berhasil diupdate, tetapi server gagal menyimpan dokumen fisik yang baru.",
    });
  }

  return {
    success: true,
    message: "Pengajuan dan dokumen berhasil diperbarui.",
  };
});
