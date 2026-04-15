import { defineEventHandler, readMultipartFormData, createError } from "h3";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { useDrizzle } from "../../db/index";
import { pengajuanRabTable } from "../../db/schema/pengajuanRabSchema";
import { log } from "node:console";

export default defineEventHandler(async (event) => {
  try {
    // 1. Baca multipart form data
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: "Tidak ada data yang dikirim",
      });
    }

    // Helper ambil nilai field teks dari Buffer
    const getField = (name: string): string => {
      const field = formData.find((f) => f.name === name);
      if (!field || !field.data) return "";
      return Buffer.from(field.data).toString("utf-8");
    };

    // 2. Ekstrak field teks
    const nomor_pengajuan = getField("nomor_pengajuan");
    const users_id_str = getField("users_id");
    const judul_kegiatan = getField("judul_kegiatan");
    const deskripsi = getField("deskripsi");
    const total_anggaran = getField("total_anggaran");
    const status = getField("status") || "draft";

    // 3. Validasi field wajib
    if (!nomor_pengajuan)
      throw createError({
        statusCode: 400,
        message: "Nomor pengajuan wajib diisi",
      });
    if (!users_id_str)
      throw createError({ statusCode: 400, message: "User ID wajib diisi" });
    if (!judul_kegiatan)
      throw createError({
        statusCode: 400,
        message: "Judul kegiatan wajib diisi",
      });
    if (!total_anggaran)
      throw createError({
        statusCode: 400,
        message: "Total anggaran wajib diisi",
      });

    const users_id = parseInt(users_id_str);
    if (isNaN(users_id))
      throw createError({ statusCode: 400, message: "User ID tidak valid" });

    // 4. Ekstrak file
    const fileField = formData.find((f) => f.name === "file_rab");
    if (!fileField || !fileField.data || fileField.data.length === 0) {
      throw createError({
        statusCode: 400,
        message: "File RAB wajib diupload",
      });
    }

    // Validasi tipe MIME (PDF, Word, Excel)
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const fileMime = fileField.type || "";
    if (!allowedMimes.includes(fileMime)) {
      throw createError({
        statusCode: 400,
        message: "Tipe file tidak diizinkan. Hanya PDF, Word, atau Excel",
      });
    }

    // Batasi ukuran (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (fileField.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        message: "Ukuran file maksimal 10MB",
      });
    }

    // 5. Simpan file ke disk
    const uploadDir = join(process.cwd(), "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Sanitasi nama file
    const originalName = fileField.filename || "file_rab";
    const safeName = originalName.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const uniqueFilename = `${Date.now()}_${safeName}`;
    const filePath = join(uploadDir, uniqueFilename);
    await writeFile(filePath, fileField.data);

    // Path yang disimpan ke database (relatif dari root)
    const filePathForDb = `uploads/${uniqueFilename}`;

    // 6. Insert ke database menggunakan Drizzle
    const db = useDrizzle();
    const result = await db
      .insert(pengajuanRabTable)
      .values({
        nomor_pengajuan,
        users_id,
        judul_kegiatan,
        deskripsi: deskripsi || null,
        file_rab: filePathForDb,
        total_anggaran,
        status,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .$returningId();
    console.log(result);
    // 7. Return response sukses
    return {
      success: true,
      message: "Pengajuan RAB berhasil disimpan",
      data: {
        id: result, // atau result[0].insertId tergantung driver
        nomor_pengajuan,
        file: uniqueFilename,
      },
    };
  } catch (error: any) {
    console.error("Error upload RAB:", error);
    // Jika error sudah dari createError, lempar ulang
    if (error.statusCode) throw error;
    // Error lain jadi 500
    throw createError({
      statusCode: 500,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
});
