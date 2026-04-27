import { defineEventHandler, readMultipartFormData, createError } from "h3";
import { writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { useDrizzle } from "../../../db/index";
import {
  pengajuanRabTable,
  statusEnum,
  type StatusEnum,
} from "../../../db/schema/pengajuanRabSchema";
import { createFilePath } from "#imports";

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
    const tanggalMulai = getField("tanggalMulai");
    const tanggalSelesai = getField("tanggalSelesai");
    const deskripsi = getField("deskripsi");
    const totalAnggaran = getField("totalAnggaran");
    const statusRaw = getField("status") || "draft";

    // Validasi input wajib
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
    if (!tanggalMulai)
      throw createError({
        statusCode: 400,
        message: "Tanggal mulai wajib diisi",
      });
    if (!tanggalSelesai)
      throw createError({
        statusCode: 400,
        message: "Tanggal selesai wajib diisi",
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

    const fileRabField = formData.find((f) => f.name === "file_rab");
    if (!fileRabField || !fileRabField.data || fileRabField.data.length === 0) {
      throw createError({
        statusCode: 400,
        message: "File RAB wajib diupload",
      });
    }
    if (fileRabField.type !== "application/pdf") {
      throw createError({
        statusCode: 400,
        message: "File RAB wajib berformat PDF",
      });
    }
    if (fileRabField.data.length > 10 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        message: "Ukuran file RAB maksimal 10MB",
      });
    }

    const fileTorField = formData.find((f) => f.name === "file_tor");
    if (!fileTorField || !fileTorField.data || fileTorField.data.length === 0) {
      throw createError({
        statusCode: 400,
        message: "File TOR wajib diupload",
      });
    }
    if (fileTorField.type !== "application/pdf") {
      throw createError({
        statusCode: 400,
        message: "File TOR wajib berformat PDF",
      });
    }
    if (fileTorField.data.length > 10 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        message: "Ukuran file TOR maksimal 10MB",
      });
    }

    // Penentuan subfolder berdasarkan status
    const subFolder = statusRaw === "draft" ? "draft" : "sedangDiAjukan";

    // Create direktori tujuan menggunakan createFilePath
    const uploadBaseDirRab = await createFilePath("Rab", subFolder);
    const uploadBaseDirTor = await createFilePath("Tor", subFolder);

    const timestamp = Date.now();

    // Simpan File RAB
    const originalNameRab = fileRabField.filename || "file_rab.pdf";
    const safeNameRab = originalNameRab.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const uniqueFilenameRab = `${timestamp}_${safeNameRab}`;
    const absolutePathRab = join(uploadBaseDirRab, uniqueFilenameRab);
    await writeFile(absolutePathRab, fileRabField.data);
    const relativePathRab = relative(process.cwd(), absolutePathRab).replace(
      /\\/g,
      "/",
    );

    // Simpan File TOR
    const originalNameTor = fileTorField.filename || "file_tor.pdf";
    const safeNameTor = originalNameTor.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const uniqueFilenameTor = `${timestamp}_${safeNameTor}`;
    const absolutePathTor = join(uploadBaseDirTor, uniqueFilenameTor);
    await writeFile(absolutePathTor, fileTorField.data);
    const relativePathTor = relative(process.cwd(), absolutePathTor).replace(
      /\\/g,
      "/",
    );

    // ==========================================
    // INSERT KE DATABASE
    // ==========================================
    const db = useDrizzle();
    const result = await db
      .insert(pengajuanRabTable)
      .values({
        nomorPengajuan,
        usersId: String(users_id),
        judulKegiatan,
        tanggalMulai: new Date(tanggalMulai), // Pastikan format schema Drizzle mendukung Date
        tanggalSelesai: new Date(tanggalSelesai),
        deskripsi: deskripsi || null,
        fileRabUrl: relativePathRab,
        fileTorUrl: relativePathTor, // Field baru untuk menyimpan path TOR
        totalAnggaran,
        status: statusRaw as StatusEnum,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .$returningId();

    return {
      success: true,
      message: "Pengajuan RAB dan TOR berhasil disimpan",
      data: {
        id: result,
        nomorPengajuan,
        fileRab: uniqueFilenameRab,
        fileTor: uniqueFilenameTor,
        status: statusRaw,
      },
    };
  } catch (error: any) {
    console.error("Error upload RAB & TOR:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
});
