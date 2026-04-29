import { useDrizzle } from "~~/server/db/index";
import { pengajuanRabTable, kegiatanTable, dokumentasiKegiatanTable } from "~~/server/db/schema/index";
import { eq, and, gt } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();

    // 1. Total RAB yang sudah disetujui
    const totalApprovedRab = await db
      .select()
      .from(pengajuanRabTable)
      .where(eq(pengajuanRabTable.status, "disetujui"));

    // 2. Kegiatan yang akan dilaksanakan (BELUM_DILAKSANAKAN atau SEDANG_BERJALAN)
    const upcomingActivities = await db
      .select({
        id: kegiatanTable.id,
        statusKegiatan: kegiatanTable.statusKegiatan,
        tanggalMulai: kegiatanTable.tanggalMulai,
        tanggalSelesai: kegiatanTable.tanggalSelesai,
        judulKegiatan: pengajuanRabTable.judulKegiatan,
        deskripsi: pengajuanRabTable.deskripsi,
        totalAnggaran: pengajuanRabTable.totalAnggaran,
        fileTorUrl: pengajuanRabTable.fileTorUrl,
      })
      .from(kegiatanTable)
      .innerJoin(pengajuanRabTable, eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id))
      .where(
        and(
          eq(pengajuanRabTable.status, "disetujui"),
          eq(kegiatanTable.statusKegiatan, "BELUM_DILAKSANAKAN")
        )
      )
      .limit(10);

    // 3. Total kegiatan sedang berjalan
    const ongoingActivities = await db
      .select()
      .from(kegiatanTable)
      .innerJoin(pengajuanRabTable, eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id))
      .where(
        and(
          eq(pengajuanRabTable.status, "disetujui"),
          eq(kegiatanTable.statusKegiatan, "SEDANG_BERJALAN")
        )
      );

    // 4. Total kegiatan selesai
    const completedActivities = await db
      .select()
      .from(kegiatanTable)
      .innerJoin(pengajuanRabTable, eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id))
      .where(
        and(
          eq(pengajuanRabTable.status, "disetujui"),
          eq(kegiatanTable.statusKegiatan, "SELESAI")
        )
      );

    // 5. Total dokumentasi
    const totalDocumentation = await db
      .select()
      .from(dokumentasiKegiatanTable);

    return {
      success: true,
      summary: {
        totalApprovedRab: totalApprovedRab.length,
        upcomingActivities: upcomingActivities.length,
        ongoingActivities: ongoingActivities.length,
        completedActivities: completedActivities.length,
        totalDocumentation: totalDocumentation.length,
      },
      upcomingActivities,
      ongoingActivities: ongoingActivities.slice(0, 5),
      completedActivities: completedActivities.slice(0, 5),
    };
  } catch (error: any) {
    console.error("SPI Dashboard Error:", error);
    return {
      success: false,
      message: "Error fetching SPI dashboard data",
      error: error.message,
    };
  }
});
