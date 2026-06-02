import fs from "node:fs";
import path from "node:path";
import { pengajuanRabTable } from "~~/server/db/schema";
import { useDrizzle } from "~~/server/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { rabId, documentType = "rab" } = body;

    if (!rabId) {
      throw createError({ statusCode: 400, message: "ID pengajuan tidak valid" });
    }

    if (!["rab", "tor"].includes(documentType)) {
      throw createError({
        statusCode: 400,
        message: "Tipe dokumen tidak valid. Gunakan 'rab' atau 'tor'.",
      });
    }

    const db = useDrizzle();

    const rab = await db.query.pengajuanRabTable.findFirst({
      where: eq(pengajuanRabTable.id, Number(rabId)),
    });

    if (!rab) {
      throw createError({
        statusCode: 404,
        message: "Data pengajuan tidak ditemukan",
      });
    }

    const fileUrl = documentType === "tor" ? rab.fileTorUrl : rab.fileRabUrl;

    if (!fileUrl) {
      throw createError({
        statusCode: 404,
        message: `File ${documentType.toUpperCase()} belum diunggah untuk pengajuan ini`,
      });
    }

    const filePath = path.resolve(process.cwd(), fileUrl.trim());

    if (!fs.existsSync(filePath)) {
      throw createError({
        statusCode: 404,
        message: `File tidak ditemukan secara fisik.`,
      });
    }

    const ext = path.extname(filePath).toLowerCase();

    const mimeTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
    };
    
    const contentType = mimeTypes[ext] || "application/octet-stream";

    setHeader(event, "Content-Type", contentType);
    setHeader(
      event,
      "Content-Disposition",
      `inline; filename="${path.basename(filePath)}"`,
    );

    return sendStream(event, fs.createReadStream(filePath));
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Gagal mengambil file",
    });
  }
});
