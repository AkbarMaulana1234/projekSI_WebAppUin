import { pengajuanRabTable, usersTable } from "~~/server/db/schema";
import { useDrizzle } from "~~/server/db";
import { eq, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { rabId } = body;
  if (!rabId) {
    throw createError({ statusCode: 400, message: "rabId wajib dikirim" });
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

  // 4. Otorisasi: hanya pemilik RAB atau admin yang boleh lihat
  const isOwner = rab.usersId === user.id;
  const isAdmin = user.role === "admin"; // asumsi ada field role di JWT
  if (!isOwner && !isAdmin) {
    throw createError({ statusCode: 403, message: "Akses ditolak" });
  }

  // 5. Kembalikan metadata (file URL disertakan)
  return {
    success: true,
    data: {
      id: rab.id,
      nomorPengajuan: rab.nomorPengajuan,
      judulKegiatan: rab.judulKegiatan,
      deskripsi: rab.deskripsi,
      fileRabUrl: rab.fileRabUrl, // ← frontend akan gunakan URL ini untuk fetch file
      totalAnggaran: rab.totalAnggaran,
      status: rab.status,
      createdAt: rab.createdAt,
      updatedAt: rab.updatedAt,
    },
  };
});
