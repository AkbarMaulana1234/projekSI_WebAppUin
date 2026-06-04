// FILE: server/api/ppk/kegiatan/[id]/file.post.ts

import fs from "node:fs";
import path from "node:path";
import { eq, and } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import { pengajuanRabTable } from "~~/server/db/schema";
import {
  getRevisionArchiveEntry,
  resolveRevisionFilePath,
} from "~~/server/utils/revisionArchive";

export default defineEventHandler(async (event) => {
  const rabId = Number(getRouterParam(event, "id"));
  if (isNaN(rabId) || rabId <= 0) {
    throw createError({ statusCode: 400, message: "ID pengajuan tidak valid" });
  }

  const body = await readBody(event);
  const { documentType = "rab", revisionId = "", side = "after" } = body;

  if (!["rab", "tor"].includes(documentType)) {
    throw createError({
      statusCode: 400,
      message: "Tipe dokumen tidak valid. Gunakan 'rab' atau 'tor'.",
    });
  }
  if (revisionId && !["before", "after"].includes(side)) {
    throw createError({
      statusCode: 400,
      message: "Sisi revisi tidak valid. Gunakan 'before' atau 'after'.",
    });
  }

  const db = useDrizzle();
  const { user } = event.context;

  if (!user || user.role !== "ppk") {
    throw createError({
      statusCode: 403,
      message: "Akses ditolak. Peran PPK diperlukan.",
    });
  }

  const fakultasId = user.fakultasId;

  if (!fakultasId) {
    throw createError({
      statusCode: 403,
      message: "PPK tidak memiliki fakultas yang valid",
    });
  }

  const rab = await db.query.pengajuanRabTable.findFirst({
    where: and(
      eq(pengajuanRabTable.id, rabId),
      eq(pengajuanRabTable.fakultasId, String(fakultasId)),
    ),
  });

  if (!rab) {
    throw createError({
      statusCode: 404,
      message: "Data pengajuan tidak ditemukan atau Anda tidak memiliki akses",
    });
  }

  const revisionEntry = revisionId
    ? await getRevisionArchiveEntry(rabId, String(revisionId))
    : null;
  const revisionFilePath = revisionEntry
    ? resolveRevisionFilePath(
        revisionEntry,
        documentType as "rab" | "tor",
        side as "before" | "after",
      )
    : null;
  const fileUrl = documentType === "tor" ? rab.fileTorUrl : rab.fileRabUrl;

  if (!revisionFilePath && !fileUrl) {
    throw createError({
      statusCode: 404,
      message: `File ${documentType.toUpperCase()} belum diunggah untuk pengajuan ini`,
    });
  }

  const filePath = revisionFilePath || path.resolve(process.cwd(), fileUrl.trim());

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
