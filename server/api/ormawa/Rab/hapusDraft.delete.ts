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

  const [rab] = await db
    .select({ rabPath: pengajuanRabTable.fileRabUrl })
    .from(pengajuanRabTable)
    .where(
      and(eq(pengajuanRabTable.id, id), eq(pengajuanRabTable.usersId, user.id)),
    );

  if (!rab) {
    throw createError({
      statusCode: 404,
      message: "File RAB tidak ditemukan atau bukan milik Anda",
    });
  }

  const resolvedPath = path.resolve(process.cwd(), rab.rabPath);
  const normalizedPath = path.normalize(resolvedPath);
  const uploadsDir = path.resolve(process.cwd(), "uploads"); // contoh, sesuaikan
  if (!normalizedPath.startsWith(uploadsDir)) {
    console.error(
      `Security: Attempt to delete file outside uploads directory: ${normalizedPath}`,
    );
    throw createError({
      statusCode: 403,
      message: "Akses file tidak diizinkan",
    });
  }

  try {
    await fs.unlink(resolvedPath);
  } catch (error) {
    console.error(`Gagal menghapus file di ${resolvedPath}:`, error);
    throw createError({
      statusCode: 500,
      message: "Gagal menghapus file RAB",
      data: { path: rab.rabPath },
    });
  }

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
    message: "File RAB berhasil dihapus",
  };
});
