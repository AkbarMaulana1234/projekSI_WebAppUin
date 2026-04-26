import { defineEventHandler, readMultipartFormData, createError } from "h3";
import { writeFile, mkdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { existsSync } from "node:fs";
import { useDrizzle } from "../../../db/index";
import {
  pengajuanRabTable,
  statusEnum,
  type StatusEnum,
} from "../../../db/schema/pengajuanRabSchema";
// Asumsi fungsi createFilePath sudah didefinisikan di tempat lain (misal utils)
// Jika belum, kita tulis ulang di sini untuk kelengkapan
async function createFilePath(
  category: string,
  status: string,
): Promise<string> {
  const rootPath = join(process.cwd(), "uploads");
  const targetPath = join(rootPath, category, status);
  await mkdir(targetPath, { recursive: true });
  return targetPath;
}

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
    // Ambil kategori (misal dari form, default "Rab")
    const category = getField("category") || "Rab"; // bisa "Rab" atau "Lpg"

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

    // Tentukan subfolder berdasarkan status
    const subFolder = statusRaw === "draft" ? "draft" : "sedangDiAjukan";
    // Buat folder lengkap: uploads/{category}/{subFolder}
    const uploadBaseDir = await createFilePath(category, subFolder);

    // Simpan file
    const originalName = fileField.filename || "file_rab";
    const safeName = originalName.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const uniqueFilename = `${Date.now()}_${safeName}`;
    const absolutePath = join(uploadBaseDir, uniqueFilename);
    await writeFile(absolutePath, fileField.data);

    // Buat path relatif dari root proyek (tanpa leading slash) untuk disimpan di database
    // Contoh: "uploads/Rab/sedangDiAjukan/123456_filename.docx"
    const relativePath = relative(process.cwd(), absolutePath).replace(
      /\\/g,
      "/",
    );

    const db = useDrizzle();
    const result = await db
      .insert(pengajuanRabTable)
      .values({
        nomorPengajuan,
        usersId: String(users_id),
        judulKegiatan,
        deskripsi: deskripsi || null,
        fileRabUrl: relativePath, // ← path yang benar dengan kategori
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
        folder: `${category}/${subFolder}`,
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
