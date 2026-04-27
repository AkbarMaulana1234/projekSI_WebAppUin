import { useDrizzle } from "~~/server/db";
import { pengajuanRabTable } from "~~/server/db/schema";
import { eq, and } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";

export default defineEventHandler(async (event) => {
  // 1. Validasi input
  const body = await readBody(event);
  const { rabId } = body;

  if (!rabId || (typeof rabId !== "string" && typeof rabId !== "number")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "rabId harus disertakan dan berupa angka",
    });
  }

  const id = Number(rabId);
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: "rabId harus berupa angka valid",
    });
  }

  const { user } = event.context;
  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const db = useDrizzle();

  // 2. Ambil path RAB dan TOR dari database
  const [rab] = await db
    .select({
      rabPath: pengajuanRabTable.fileRabUrl,
      torPath: pengajuanRabTable.fileTorUrl, // Menambahkan fetch path TOR
    })
    .from(pengajuanRabTable)
    .where(
      and(eq(pengajuanRabTable.id, id), eq(pengajuanRabTable.usersId, user.id)),
    );

  if (!rab) {
    throw createError({
      statusCode: 404,
      message: "Data pengajuan tidak ditemukan atau bukan milik Anda",
    });
  }

  const uploadsDir = path.resolve(process.cwd(), "uploads"); // pastikan ini sesuai dengan path folder uploads utama Anda

  // 3. Helper function untuk memvalidasi dan menghapus file secara aman
  const deletePhysicalFile = async (filePath: string | null) => {
    if (!filePath) return;

    const resolvedPath = path.resolve(process.cwd(), filePath);
    const normalizedPath = path.normalize(resolvedPath);

    // Keamanan: Cegah Directory Traversal
    if (!normalizedPath.startsWith(uploadsDir)) {
      console.error(
        `Security: Attempt to delete file outside uploads directory: ${normalizedPath}`,
      );
      throw createError({
        statusCode: 403,
        message: "Akses penghapusan file tidak diizinkan",
      });
    }

    try {
      await fs.unlink(resolvedPath);
    } catch (error: any) {
      // Abaikan error ENOENT jika file fisik ternyata sudah tidak ada di folder
      if (error.code !== "ENOENT") {
        console.error(`Gagal menghapus file di ${resolvedPath}:`, error);
        throw createError({
          statusCode: 500,
          message: "Gagal menghapus file dokumen",
          data: { path: filePath },
        });
      }
    }
  };

  // 4. Hapus kedua file fisik (RAB dan TOR)
  await deletePhysicalFile(rab.rabPath);
  await deletePhysicalFile(rab.torPath);

  // 5. Hapus record dari database
  const deleteResult = await db
    .delete(pengajuanRabTable)
    .where(
      and(eq(pengajuanRabTable.id, id), eq(pengajuanRabTable.usersId, user.id)),
    );

  const rowCount = deleteResult?.rowCount ?? 0;
  if (rowCount === 0) {
    console.warn(
      `Record RAB dengan id ${id} tidak ditemukan saat penghapusan setelah file dihapus.`,
    );
  }

  return {
    status: "success",
    message: "Pengajuan kegiatan beserta dokumen RAB dan TOR berhasil dihapus",
  };
});
