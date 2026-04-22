import fs from "node:fs";
import path from "node:path";
import { pengajuanRabTable } from "~~/server/db/schema";
import { useDrizzle } from "~~/server/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { rabId } = body;
  if (!rabId)
    throw createError({ statusCode: 400, message: "ID RAB tidak valid" });

  const { user } = event.context;
  const db = useDrizzle();

  const rab = await db.query.pengajuanRabTable.findFirst({
    where: eq(pengajuanRabTable.id, Number(rabId)),
  });

  if (!rab)
    throw createError({ statusCode: 404, message: "RAB tidak ditemukan" });
  if (rab.usersId !== user.id && user.role !== "admin") {
    throw createError({ statusCode: 403, message: "Akses ditolak" });
  }

  const filePath = path.resolve(process.cwd(), rab.fileRabUrl.trim());
  const relativePath = rab.fileRabUrl.trim();

  const parentDir = path.dirname(filePath);

  try {
    const files = fs.readdirSync(parentDir);
    const targetFile = path.basename(filePath);
  } catch (err) {
    console.error("Gagal baca parent directory:", err.message);
  }

  if (!fs.existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      message: `File tidak ditemukan: ${filePath}`,
    });
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
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

  return sendStream(event, fs.createReadStream(filePath));
});
