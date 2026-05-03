import { eq, inArray, desc, sql } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  pengajuanRabTable,
  usersTable,
  ormawaTable,
} from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();

    // Ambil semua pengajuan yang statusnya masuk ke PPK
    const data = await db
      .select({
        id: pengajuanRabTable.id,
        nomorPengajuan: pengajuanRabTable.nomorPengajuan,
        judulKegiatan: pengajuanRabTable.judulKegiatan,
        deskripsi: pengajuanRabTable.deskripsi,
        totalAnggaran: pengajuanRabTable.totalAnggaran,
        tanggalMulai: pengajuanRabTable.tanggalMulai,
        tanggalSelesai: pengajuanRabTable.tanggalSelesai,
        status: pengajuanRabTable.status,
        fileRabUrl: pengajuanRabTable.fileRabUrl,
        fileTorUrl: pengajuanRabTable.fileTorUrl,
        createdAt: pengajuanRabTable.createdAt,
        updatedAt: pengajuanRabTable.updatedAt,
        // Data pengaju (ormawa)
        pengajuId: usersTable.id,
        pengajuNama: usersTable.fullName,
        pengajuEmail: usersTable.email,
        // Data ormawa
        ormawaId: ormawaTable.id,
        ormawaName: ormawaTable.nama,
        ormawaKode: ormawaTable.kode,
      })
      .from(pengajuanRabTable)
      .innerJoin(usersTable, eq(pengajuanRabTable.usersId, usersTable.users_id))
      .leftJoin(ormawaTable, eq(usersTable.ormawaId, ormawaTable.id))
      .where(
        inArray(pengajuanRabTable.status, ["waiting_ppk", "revisi_ppk"]),
      )
      .orderBy(desc(pengajuanRabTable.createdAt));

    // Hitung ringkasan per status untuk PPK
    const [summary] = await db
      .select({
        totalMasuk: sql<number>`COUNT(*)`,
        totalWaitingPPK: sql<number>`SUM(CASE WHEN ${pengajuanRabTable.status} = 'waiting_ppk' THEN 1 ELSE 0 END)`,
        totalRevisiPPK: sql<number>`SUM(CASE WHEN ${pengajuanRabTable.status} = 'revisi_ppk' THEN 1 ELSE 0 END)`,
      })
      .from(pengajuanRabTable)
      .where(
        inArray(pengajuanRabTable.status, ["waiting_ppk", "revisi_ppk"]),
      );

    return {
      success: true,
      summary: {
        totalMasuk: summary?.totalMasuk ?? 0,
        totalWaitingPPK: summary?.totalWaitingPPK ?? 0,
        totalRevisiPPK: summary?.totalRevisiPPK ?? 0,
      },
      data: data.map((row) => ({
        id: row.id,
        nomorPengajuan: row.nomorPengajuan,
        judulKegiatan: row.judulKegiatan,
        deskripsi: row.deskripsi,
        totalAnggaran: row.totalAnggaran,
        tanggalMulai: row.tanggalMulai,
        tanggalSelesai: row.tanggalSelesai,
        status: row.status,
        fileRabUrl: row.fileRabUrl,
        fileTorUrl: row.fileTorUrl,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        pengaju: {
          id: row.pengajuId,
          nama: row.pengajuNama,
          email: row.pengajuEmail,
        },
        ormawa: {
          id: row.ormawaId,
          nama: row.ormawaName,
          kode: row.ormawaKode,
        },
      })),
    };
  } catch (error: any) {
    console.error("Error GET /api/ppk/kegiatan:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil data pengajuan kegiatan",
      data: error,
    });
  }
});