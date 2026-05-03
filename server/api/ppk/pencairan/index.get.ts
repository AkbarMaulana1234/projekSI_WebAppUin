import { eq, desc, sql } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  tagihanPencairanTable,
  kegiatanTable,
  pengajuanRabTable,
  usersTable,
  ormawaTable,
  pembayaranTable,
} from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();

    const data = await db
      .select({
        // Tagihan
        tagihanId: tagihanPencairanTable.id,
        tipeTagihan: tagihanPencairanTable.tipeTagihan,
        namaPenerima: tagihanPencairanTable.namaPenerima,
        nominal: tagihanPencairanTable.nominal,
        statusTagihan: tagihanPencairanTable.statusTagihan,
        rekeningPenerima: tagihanPencairanTable.rekeningPenerima,
        bankPenerima: tagihanPencairanTable.bankPenerima,
        createdAt: tagihanPencairanTable.createdAt,
        // Khusus BARANG
        tokoNama: tagihanPencairanTable.tokoNama,
        strukFileUrl: tagihanPencairanTable.strukFileUrl,
        // Khusus JASA
        skNomor: tagihanPencairanTable.skNomor,
        skFileUrl: tagihanPencairanTable.skFileUrl,
        // Kegiatan
        kegiatanId: kegiatanTable.id,
        statusKegiatan: kegiatanTable.statusKegiatan,
        tanggalMulai: kegiatanTable.tanggalMulai,
        tanggalSelesai: kegiatanTable.tanggalSelesai,
        // Pengajuan RAB (nama kegiatan & total RAB)
        pengajuanId: pengajuanRabTable.id,
        judulKegiatan: pengajuanRabTable.judulKegiatan,
        totalAnggaranRab: pengajuanRabTable.totalAnggaran,
        // Ormawa pengaju
        ormawaId: ormawaTable.id,
        ormawaName: ormawaTable.nama,
        ormawaKode: ormawaTable.kode,
      })
      .from(tagihanPencairanTable)
      .innerJoin(
        kegiatanTable,
        eq(tagihanPencairanTable.kegiatanId, kegiatanTable.id),
      )
      .innerJoin(
        pengajuanRabTable,
        eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id),
      )
      .innerJoin(
        usersTable,
        eq(pengajuanRabTable.usersId, usersTable.users_id),
      )
      .leftJoin(ormawaTable, eq(usersTable.ormawaId, ormawaTable.id))
      .orderBy(desc(tagihanPencairanTable.createdAt));

    // Ringkasan per status
    const [summary] = await db
      .select({
        totalTagihan: sql<number>`COUNT(*)`,
        totalMenunggu: sql<number>`SUM(CASE WHEN ${tagihanPencairanTable.statusTagihan} = 'WAITING_PEMBAYARAN' THEN 1 ELSE 0 END)`,
        totalTerverifikasi: sql<number>`SUM(CASE WHEN ${tagihanPencairanTable.statusTagihan} = 'TERVERIFIKASI' THEN 1 ELSE 0 END)`,
        totalSelesai: sql<number>`SUM(CASE WHEN ${tagihanPencairanTable.statusTagihan} = 'SELESAI' THEN 1 ELSE 0 END)`,
        totalDikembalikan: sql<number>`SUM(CASE WHEN ${tagihanPencairanTable.statusTagihan} = 'DIKEMBALIKAN' THEN 1 ELSE 0 END)`,
      })
      .from(tagihanPencairanTable);

    return {
      success: true,
      summary: {
        totalTagihan: summary?.totalTagihan ?? 0,
        totalMenunggu: summary?.totalMenunggu ?? 0,
        totalTerverifikasi: summary?.totalTerverifikasi ?? 0,
        totalSelesai: summary?.totalSelesai ?? 0,
        totalDikembalikan: summary?.totalDikembalikan ?? 0,
      },
      data: data.map((row) => ({
        id: row.tagihanId,
        tipeTagihan: row.tipeTagihan,
        namaPenerima: row.namaPenerima,
        nominal: row.nominal,
        statusTagihan: row.statusTagihan,
        rekeningPenerima: row.rekeningPenerima,
        bankPenerima: row.bankPenerima,
        createdAt: row.createdAt,
        // Field kondisional per tipe
        ...(row.tipeTagihan === "BARANG"
          ? { tokoNama: row.tokoNama, strukFileUrl: row.strukFileUrl }
          : { skNomor: row.skNomor, skFileUrl: row.skFileUrl }),
        kegiatan: {
          id: row.kegiatanId,
          judulKegiatan: row.judulKegiatan,
          statusKegiatan: row.statusKegiatan,
          tanggalMulai: row.tanggalMulai,
          tanggalSelesai: row.tanggalSelesai,
          totalAnggaranRab: row.totalAnggaranRab,
        },
        ormawa: {
          id: row.ormawaId,
          nama: row.ormawaName,
          kode: row.ormawaKode,
        },
      })),
    };
  } catch (error: any) {
    console.error("Error GET /api/ppk/pencairan:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil data pencairan",
      data: error,
    });
  }
});