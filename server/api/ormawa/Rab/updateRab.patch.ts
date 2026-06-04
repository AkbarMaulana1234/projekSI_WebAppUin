import { useDrizzle } from "~~/server/db";
import { eq } from "drizzle-orm";
import { pengajuanRabTable } from "~~/server/db/schema";
import fs from "node:fs/promises";
import path from "node:path";
import { saveRevisionArchiveEntry } from "~~/server/utils/revisionArchive";

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
  const getFileName = (name: string) => {
    const field = formdata.find((f) => f.name === name);
    return field?.filename || `${name}.pdf`;
  };

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

  const revisionDir = path.join("uploads", "revision-archive", String(rabId));
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const newFileRabUrl = hasFileRab
    ? path
        .join(
          revisionDir,
          `${uniqueSuffix}-rab-${path.basename(getFileName("fileRab"))}`,
        )
        .replace(/\\/g, "/")
    : existingRab.fileRabUrl;
  const newFileTorUrl = hasFileTor
    ? path
        .join(
          revisionDir,
          `${uniqueSuffix}-tor-${path.basename(getFileName("fileTor"))}`,
        )
        .replace(/\\/g, "/")
    : existingRab.fileTorUrl;

  try {
    await db
      .update(pengajuanRabTable)
      .set({
        judulKegiatan: editJudul,
        totalAnggaran: anggaranBaru,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        fileRabUrl: newFileRabUrl,
        fileTorUrl: newFileTorUrl,
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

  // Simpan file baru sebagai versi baru agar versi sebelum revisi tetap bisa dibandingkan.
  try {
    await fs.mkdir(path.resolve(process.cwd(), revisionDir), {
      recursive: true,
    });

    if (hasFileRab) {
      const filePathRab = path.resolve(process.cwd(), newFileRabUrl);
      await fs.writeFile(filePathRab, editFileRabBuffer!);
    }

    if (hasFileTor) {
      const filePathTor = path.resolve(process.cwd(), newFileTorUrl);
      await fs.writeFile(filePathTor, editFileTorBuffer!);
    }

    await saveRevisionArchiveEntry(Number(rabId), {
      rab: {
        before: existingRab.fileRabUrl,
        after: newFileRabUrl,
      },
      tor: {
        before: existingRab.fileTorUrl,
        after: newFileTorUrl,
      },
    });
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
