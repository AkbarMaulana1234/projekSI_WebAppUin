import { sql, ne } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import { pengajuanRabTable } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();

    // Hitung semua status sekaligus dalam satu query
    const [counts] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        // Menunggu verifikasi PPK
        menunggu: sql<number>`SUM(CASE WHEN ${pengajuanRabTable.status} = 'waiting_ppk' THEN 1 ELSE 0 END)`,
        // Sudah diteruskan ke SPI
        disetujui: sql<number>`SUM(CASE WHEN ${pengajuanRabTable.status} = 'waiting_spi' THEN 1 ELSE 0 END)`,
        // Dikembalikan untuk revisi oleh PPK
        revisi: sql<number>`SUM(CASE WHEN ${pengajuanRabTable.status} = 'revisi_ppk' THEN 1 ELSE 0 END)`,
        // Sudah final disetujui SPI
        selesai: sql<number>`SUM(CASE WHEN ${pengajuanRabTable.status} = 'disetujui' THEN 1 ELSE 0 END)`,
        // Ditolak SPI
        ditolak: sql<number>`SUM(CASE WHEN ${pengajuanRabTable.status} = 'ditolak_spi' THEN 1 ELSE 0 END)`,
        // Sedang di kaprodi (belum sampai PPK)
        diKaprodi: sql<number>`SUM(CASE WHEN ${pengajuanRabTable.status} IN ('waiting_kaprodi', 'revisi_kaprodi') THEN 1 ELSE 0 END)`,
      })
      .from(pengajuanRabTable)
      .where(ne(pengajuanRabTable.status, "draft"));

    return {
      success: true,
      data: {
        total: counts?.total ?? 0,
        menunggu: counts?.menunggu ?? 0,
        disetujui: counts?.disetujui ?? 0,
        revisi: counts?.revisi ?? 0,
        selesai: counts?.selesai ?? 0,
        ditolak: counts?.ditolak ?? 0,
        diKaprodi: counts?.diKaprodi ?? 0,
      },
    };
  } catch (error: any) {
    console.error("Error GET /api/ppk/dashboard:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil data dashboard",
      data: error,
    });
  }
});