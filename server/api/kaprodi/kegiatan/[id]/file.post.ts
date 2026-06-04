// FILE: server/api/kaprodi/kegiatan/[id]/file.post.ts
// Endpoint untuk mengalirkan file RAB/TOR fisik ke browser Kaprodi
// Mengikuti pola server/api/ppk/kegiatan/[id]/file.post.ts dengan adaptasi prodiId Kaprodi

import fs from "node:fs";
import path from "node:path";
import { eq, and, inArray } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  pengajuanRabTable,
  usersTable,
  ormawaTable,
} from "~~/server/db/schema";
import {
  getRevisionArchiveEntry,
  resolveRevisionFilePath,
} from "~~/server/utils/revisionArchive";

export default defineEventHandler(async (event) => {
  try {
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

    // Pastikan user terautentikasi dan memiliki prodiId
    if (!user || user.role !== "kaprodi") {
      throw createError({
        statusCode: 403,
        message: "Akses ditolak. Peran Kaprodi diperlukan.",
      });
    }

    const prodiId = user.prodiId;

    if (!prodiId) {
      throw createError({
        statusCode: 403,
        message: "Anda tidak memiliki program studi yang valid",
      });
    }

    // Step 1: Cari Ormawa yang terikat pada prodiId Kaprodi
    const ormawaRows = await db
      .select({ id: ormawaTable.id })
      .from(ormawaTable)
      .where(eq(ormawaTable.prodiId, prodiId));

    const ormawaIds = ormawaRows.map((o) => o.id);

    if (ormawaIds.length === 0) {
      throw createError({
        statusCode: 403,
        message: "Tidak ada ormawa binaan yang terdaftar untuk prodi Anda",
      });
    }

    // Step 2: Cari all users dari Ormawa tersebut
    const ormawaUsers = await db
      .select({ usersId: usersTable.users_id })
      .from(usersTable)
      .where(inArray(usersTable.ormawaId, ormawaIds));

    const ormawaUserIds = ormawaUsers.map((u) => u.usersId);

    if (ormawaUserIds.length === 0) {
      throw createError({
        statusCode: 403,
        message: "Tidak ada user ormawa terdaftar",
      });
    }

    // Step 3: Validasi akses terhadap pengajuan ini
    const aksesValid = await db.query.pengajuanRabTable.findFirst({
      where: and(
        eq(pengajuanRabTable.id, rabId),
        inArray(pengajuanRabTable.usersId, ormawaUserIds)
      ),
    });

    if (!aksesValid) {
      throw createError({
        statusCode: 403,
        message: "Anda tidak memiliki akses ke file pengajuan ini",
      });
    }

    // Step 4: Ambil data pengajuan untuk mendapatkan path file
    const rab = await db.query.pengajuanRabTable.findFirst({
      where: eq(pengajuanRabTable.id, rabId),
    });

    if (!rab) {
      throw createError({
        statusCode: 404,
        message: "Data pengajuan tidak ditemukan",
      });
    }

    // Tentukan path URL berdasarkan file yang diminta
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
      `inline; filename="${path.basename(filePath)}"`
    );

    return sendStream(event, fs.createReadStream(filePath));
  } catch (error: any) {
    console.error("Error POST /api/kaprodi/kegiatan/[id]/file:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: "Gagal mengalirkan dokumen",
      data: error,
    });
  }
});
