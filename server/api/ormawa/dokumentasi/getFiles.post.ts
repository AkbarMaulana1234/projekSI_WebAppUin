import fs from "node:fs";
import path from "node:path";
import { useDrizzle } from "~~/server/db";
import { eq } from "drizzle-orm";
import { dokumentasiKegiatanTable } from "~~/server/db/schema/dokumentasiSchema";
import { tagihanPencairanTable } from "~~/server/db/schema/TagihanPencairanSchema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id } = body;

  if (!id) {
    throw createError({ statusCode: 400, message: "ID tidak valid" });
  }

  const idStr = String(id);
  const isTagihan = idStr.startsWith("tagihan_");
  const realId = Number(idStr.replace("doc_", "").replace("tagihan_", ""));

  const db = useDrizzle();
  let record: any = null;

  if (isTagihan) {
    record = await db.query.tagihanPencairanTable.findFirst({
      where: eq(tagihanPencairanTable.id, realId),
    });
  } else {
    record = await db.query.dokumentasiKegiatanTable.findFirst({
      where: eq(dokumentasiKegiatanTable.id, realId),
    });
  }

  if (!record) {
    throw createError({ statusCode: 404, message: "Data tidak ditemukan" });
  }

  const fileFields = isTagihan
    ? [
        "skFileUrl",
        "spmtFileUrl",
        "amprahFileUrl",
        "npwpFileUrl",
        "ktpFileUrl",
        "bukuRekeningFileUrl",
        "strukFileUrl",
        "fotoBarangUrl",
      ]
    : ["fileUrl"];

  const fieldLabels: Record<string, string> = {
    fileUrl: "File Dokumentasi",
    skFileUrl: "SK",
    spmtFileUrl: "SPMT",
    amprahFileUrl: "Amprah",
    npwpFileUrl: "NPWP",
    ktpFileUrl: "KTP",
    bukuRekeningFileUrl: "Buku Rekening",
    strukFileUrl: "Struk Belanja",
    fotoBarangUrl: "Foto Barang",
  };

  const results = [];

  for (const field of fileFields) {
    const fileUrl = record[field];
    if (fileUrl) {
      // fileUrl might contain multiple paths separated by semicolon
      const paths = fileUrl.split(";").map((p: string) => p.trim()).filter((p: string) => p);
      
      for (const p of paths) {
        const filePath = path.resolve(process.cwd(), p);
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            ".pdf": "application/pdf",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
          };
          const contentType = mimeTypes[ext] || "application/octet-stream";
          const base64 = fileBuffer.toString("base64");
          
          results.push({
            field,
            label: fieldLabels[field] || field,
            url: `data:${contentType};base64,${base64}`,
            type: contentType,
          });
        }
      }
    }
  }

  return {
    success: true,
    data: results,
  };
});
