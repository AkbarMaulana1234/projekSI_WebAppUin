import { defineEventHandler, createError } from "h3";
import { useDrizzle } from "../../../db/index";
import { eq, and, or, isNull } from "drizzle-orm";
import { pengajuanRabTable } from "../../../db/schema/pengajuanRabSchema";
import { kegiatanTable } from "../../../db/schema/KegiatanSchema";
import { lpgTable } from "../../../db/schema/lpgSchema";

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== "ormawa") {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const db = useDrizzle();

  try {
    const readyResults = await db
      .select({
        rabId: pengajuanRabTable.id,
        nomorPengajuan: pengajuanRabTable.nomorPengajuan,
        judulKegiatan: pengajuanRabTable.judulKegiatan,
        totalAnggaran: pengajuanRabTable.totalAnggaran,
        tanggalMulai: pengajuanRabTable.tanggalMulai,
        tanggalSelesai: pengajuanRabTable.tanggalSelesai,
        statusRab: pengajuanRabTable.status,
        statusKegiatan: kegiatanTable.statusKegiatan,
        kegiatanId: kegiatanTable.id,
        lpgStatus: lpgTable.statusLpg,
        lpgId: lpgTable.id,
      })
      .from(pengajuanRabTable)
      .innerJoin(
        kegiatanTable,
        eq(pengajuanRabTable.id, kegiatanTable.pengajuanRabId),
      )
      .leftJoin(lpgTable, eq(kegiatanTable.id, lpgTable.kegiatanId))
      .where(
        and(
          eq(pengajuanRabTable.usersId, user.id),
          eq(kegiatanTable.statusKegiatan, "LUNAS"),
          or(isNull(lpgTable.id), eq(lpgTable.statusLpg, "REVISI_SPI")),
        ),
      );
    const revisiResults = await db
      .select({
        rabId: pengajuanRabTable.id,
        nomorPengajuan: pengajuanRabTable.nomorPengajuan,
        judulKegiatan: pengajuanRabTable.judulKegiatan,
        totalAnggaran: pengajuanRabTable.totalAnggaran,
        tanggalMulai: pengajuanRabTable.tanggalMulai,
        tanggalSelesai: pengajuanRabTable.tanggalSelesai,
        statusRab: pengajuanRabTable.status,
        statusKegiatan: kegiatanTable.statusKegiatan,
        kegiatanId: kegiatanTable.id,
        lpgStatus: lpgTable.statusLpg,
        lpgId: lpgTable.id,
      })
      .from(lpgTable)
      .innerJoin(kegiatanTable, eq(lpgTable.kegiatanId, kegiatanTable.id)) // LPG → Kegiatan
      .innerJoin(
        pengajuanRabTable,
        eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id),
      )
      .where(
        and(
          eq(lpgTable.uploadedBy, user.id),
          eq(lpgTable.statusLpg, "REVISI_SPI"),
        ),
      );

    // 2. Query untuk RIWAYAT LPG (Semua yang sudah pernah diupload)
    const historyResults = await db
      .select({
        rabId: pengajuanRabTable.id,
        nomorPengajuan: pengajuanRabTable.nomorPengajuan,
        judulKegiatan: pengajuanRabTable.judulKegiatan,
        totalAnggaran: pengajuanRabTable.totalAnggaran,
        tanggalMulai: pengajuanRabTable.tanggalMulai,
        tanggalSelesai: pengajuanRabTable.tanggalSelesai,
        statusRab: pengajuanRabTable.status,
        statusKegiatan: kegiatanTable.statusKegiatan,
        kegiatanId: kegiatanTable.id,
        lpgStatus: lpgTable.statusLpg,
        lpgId: lpgTable.id,
        submittedAt: lpgTable.submittedAt,
      })
      .from(lpgTable)
      .innerJoin(kegiatanTable, eq(lpgTable.kegiatanId, kegiatanTable.id))
      .innerJoin(
        pengajuanRabTable,
        eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id),
      )
      .where(eq(pengajuanRabTable.usersId, user.id));

    return {
      success: true,
      data: {
        ready: [...readyResults, ...revisiResults],
        history: historyResults,
      },
    };
  } catch (error: any) {
    console.error("Error fetching LPG lists:", error);
    throw createError({
      statusCode: 500,
      message: "Terjadi kesalahan server saat mengambil daftar LPG",
    });
  }
});
