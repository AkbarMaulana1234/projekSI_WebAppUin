import { defineEventHandler, readMultipartFormData, createError } from "h3";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { useDrizzle } from "../../../db/index";
import {
  pengajuanRabTable,
  statusEnum,
  type StatusEnum,
} from "../../../db/schema/pengajuanRabSchema";

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: "Tidak ada data yang dikirim",
      });
    }

    const getField = (name: string): string => {
      const field = formData.find((f) => f.name === name);
      return field && field.data
        ? Buffer.from(field.data).toString("utf-8")
        : "";
    };

    const nomorPengajuan = getField("nomorPengajuan");
    const usersId = getField("usersId");
    const judulKegiatan = getField("judulKegiatan");
    const deskripsi = getField("deskripsi");
    const totalAnggaran = getField("totalAnggaran");
    const statusRaw = getField("status") || "draft";

    // Validasi wajib
    if (!nomorPengajuan)
      throw createError({
        statusCode: 400,
        message: "Nomor pengajuan wajib diisi",
      });
    if (!usersId)
      throw createError({ statusCode: 400, message: "User ID wajib diisi" });
    if (!judulKegiatan)
      throw createError({
        statusCode: 400,
        message: "Judul kegiatan wajib diisi",
      });
    if (!totalAnggaran)
      throw createError({
        statusCode: 400,
        message: "Total anggaran wajib diisi",
      });

    // Validasi status
    if (!statusEnum.includes(statusRaw as StatusEnum)) {
      throw createError({
        statusCode: 400,
        message: `Status tidak valid. Pilihan: ${statusEnum.join(", ")}`,
      });
    }
    const users_id = parseInt(usersId);
    if (isNaN(users_id))
      throw createError({ statusCode: 400, message: "User ID tidak valid" });

    // File
    const fileField = formData.find((f) => f.name === "file_rab");
    if (!fileField || !fileField.data || fileField.data.length === 0) {
      throw createError({
        statusCode: 400,
        message: "File RAB wajib diupload",
      });
    }

    // Validasi tipe & ukuran
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowedMimes.includes(fileField.type || "")) {
      throw createError({
        statusCode: 400,
        message: "Tipe file tidak diizinkan. Hanya PDF, Word, atau Excel",
      });
    }
    if (fileField.data.length > 10 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        message: "Ukuran file maksimal 10MB",
      });
    }

    // Tentukan folder berdasarkan status
    const folderName = statusRaw === "draft" ? "draft" : "sedangDiAjukan";
    const uploadBaseDir = await createFilePath("Rab", folderName);

    // Simpan file
    const originalName = fileField.filename || "file_rab";
    const safeName = originalName.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const uniqueFilename = `${Date.now()}_${safeName}`;
    const filePath = join(uploadBaseDir, uniqueFilename);
    await writeFile(filePath, fileField.data); // binary, tanpa encoding

    const filePathForDb = `/uploads/${folderName}/${uniqueFilename}`;

    const db = useDrizzle();
    const result = await db
      .insert(pengajuanRabTable)
      .values({
        nomorPengajuan,
        usersId: String(users_id),
        judulKegiatan,
        deskripsi: deskripsi || null,
        fileRabUrl: filePathForDb,
        totalAnggaran,
        status: statusRaw as StatusEnum,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .$returningId();

    return {
      success: true,
      message: "Pengajuan RAB berhasil disimpan",
      data: {
        id: result,
        nomorPengajuan,
        file: uniqueFilename,
        folder: folderName,
      },
    };
  } catch (error: any) {
    console.error("Error upload RAB:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
});
