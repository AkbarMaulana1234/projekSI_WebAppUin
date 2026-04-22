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

  // Langsung gunakan path dari database tanpa modifikasi (sudah absolut)
  const filePath = path.resolve(process.cwd(), rab.fileRabUrl.trim());
  const relativePath = rab.fileRabUrl.trim();
  console.log("=== DETAIL PATH ===");
  console.log("cwd:", process.cwd());
  console.log("relativePath dari DB:", JSON.stringify(relativePath));
  console.log("filePath hasil resolve:", filePath);

  // Cek parent directory
  const parentDir = path.dirname(filePath);
  console.log("Parent directory:", parentDir);

  // Baca isi parent directory
  try {
    const files = fs.readdirSync(parentDir);
    console.log("Isi parent directory:", files);
    const targetFile = path.basename(filePath);
    console.log("File yang dicari:", targetFile);
    console.log("Apakah ada dalam daftar?", files.includes(targetFile));
  } catch (err) {
    console.error("Gagal baca parent directory:", err.message);
  }

  // Cek akses file dengan F_OK (hanya cek existence)
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    console.log("✅ File ada (F_OK)");
  } catch (err) {
    console.log("❌ File tidak ada (F_OK):", err.message);
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
