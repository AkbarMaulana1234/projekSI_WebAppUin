import fs from "node:fs";
import path from "node:path";
import { pengajuanRabTable, usersTable } from "~~/server/db/schema";
import { useDrizzle } from "~~/server/db";
import { eq, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Ambil id dari parameter route
  const body = await readBody(event);
  const { rabId } = body;
  if (!rabId) {
    throw createError({ statusCode: 400, message: "ID RAB tidak valid" });
  }

  const { user } = event.context;

  const db = useDrizzle();
  const [rab] = await db
    .select()
    .from(pengajuanRabTable)
    .where(
      and(eq(pengajuanRabTable.id, Number(rabId)), eq(usersTable.id, user.id)),
    )
    .limit(1);

  if (!rab) {
    throw createError({ statusCode: 404, message: "RAB tidak ditemukan" });
  }

  // Otorisasi sama seperti di atas
  const isOwner = rab.usersId === user.id;
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) {
    throw createError({ statusCode: 403, message: "Akses ditolak" });
  }

  // Asumsikan fileRabUrl menyimpan path absolut atau relatif ke file di server
  // Contoh: "./uploads/rab_123.pdf" atau "/var/www/storage/rab_123.pdf"
  const filePath = path.resolve(rab.fileRabUrl);

  if (!fs.existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      message: "File fisik tidak ditemukan",
    });
  }

  // Tentukan MIME type berdasarkan ekstensi
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  const contentType = mimeTypes[ext] || "application/octet-stream";

  setHeader(event, "Content-Type", contentType);
  setHeader(
    event,
    "Content-Disposition",
    `inline; filename="${path.basename(filePath)}"`,
  );

  // Kirim file sebagai stream
  return sendStream(event, fs.createReadStream(filePath));
});
