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
  const rab = await db.query.pengajuanRabTable.findFirst({
    where: and(
      eq(pengajuanRabTable.id, Number(rabId)),
      eq(pengajuanRabTable.usersId, user.id),
    ),
  });

  if (!rab) {
    throw createError({ statusCode: 404, message: "RAB tidak ditemukan" });
  }

  return {
    success: true,
    data: {
      id: rab.id,
      nomorPengajuan: rab.nomorPengajuan,
      judulKegiatan: rab.judulKegiatan,
      deskripsi: rab.deskripsi,
      fileRabUrl: rab.fileRabUrl,
      totalAnggaran: rab.totalAnggaran,
      status: rab.status,
      tanggalMulai: rab.tanggalMulai,
      tanggalSelesai: rab.tanggalSelesai,
      createdAt: rab.createdAt,
      updatedAt: rab.updatedAt,
    },
  };
});
