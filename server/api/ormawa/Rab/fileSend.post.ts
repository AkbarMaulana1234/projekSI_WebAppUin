import fs from "node:fs";
import path from "node:path";
import { pengajuanRabTable } from "~~/server/db/schema";
import { useDrizzle } from "~~/server/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Tambahkan parameter documentType (default ke 'rab' agar tidak merusak sistem lama)
  const { rabId, documentType = "rab" } = body;

  if (!rabId)
    throw createError({ statusCode: 400, message: "ID pengajuan tidak valid" });

  // Validasi tipe dokumen yang diminta
  if (!["rab", "tor"].includes(documentType)) {
    throw createError({
      statusCode: 400,
      message: "Tipe dokumen tidak valid. Gunakan 'rab' atau 'tor'.",
    });
  }

  const { user } = event.context;
  const db = useDrizzle();

  const rab = await db.query.pengajuanRabTable.findFirst({
    where: eq(pengajuanRabTable.id, Number(rabId)),
  });

  if (!rab)
    throw createError({
      statusCode: 404,
      message: "Data pengajuan tidak ditemukan",
    });

  if (rab.usersId !== user.id && user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Akses ditolak" });
  }

  // Tentukan path URL berdasarkan file yang diminta oleh frontend
  const fileUrl = documentType === "tor" ? rab.fileTorUrl : rab.fileRabUrl;

  if (!fileUrl) {
    throw createError({
      statusCode: 404,
      message: `File ${documentType.toUpperCase()} belum diunggah untuk pengajuan ini`,
    });
  }

  const filePath = path.resolve(process.cwd(), fileUrl.trim());
  const parentDir = path.dirname(filePath);

  try {
    const files = fs.readdirSync(parentDir);
    const targetFile = path.basename(filePath);
  } catch (err: any) {
    console.error("Gagal baca parent directory:", err.message);
  }

  if (!fs.existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      message: `File tidak ditemukan secara fisik: ${filePath}`,
    });
  }

  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
  };
  const contentType = mimeTypes[ext] || "application/octet-stream";

  setHeader(event, "Content-Type", contentType);
  setHeader(
    event,
    "Content-Disposition",
    `inline; filename="${path.basename(filePath)}"`,
  );

  return sendStream(event, fs.createReadStream(filePath));
});
