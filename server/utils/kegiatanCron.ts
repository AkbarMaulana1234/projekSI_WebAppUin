import { useDrizzle } from "~~/server/db";
import {
  kegiatanTable,
  pengajuanRabTable,
  tagihanPencairanTable,
} from "~~/server/db/schema";
import { eq, and, lte, gte, lt, gt, ne, or, sql } from "drizzle-orm";

/**
 * Fungsi untuk mengupdate status kegiatan secara otomatis berdasarkan tanggal.
 * BELUM_DILAKSANAKAN -> SEDANG_DILAKSANAKAN (Jika hari ini di antara tgl mulai & selesai)
 * SEDANG_DILAKSANAKAN -> SELESAI (Jika hari ini sudah melewati tgl selesai DAN sudah lunas)
 */
export async function updateStatusKegiatanOtomatis() {
  const db = useDrizzle();
  const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD
  const todayDate = new Date(today);

  console.log(
    `[Cron Job] Menjalankan update status kegiatan: ${new Date().toLocaleString()}`,
  );

  try {
    // 1. Update ke SEDANG_DILAKSANAKAN
    // Kondisi: status BELUM_DILAKSANAKAN DAN today >= tanggalMulai DAN today <= tanggalSelesai
    const kegiatanToOngoing = await db
      .select({ id: kegiatanTable.id })
      .from(kegiatanTable)
      .innerJoin(
        pengajuanRabTable,
        eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id),
      )
      .where(
        and(
          eq(kegiatanTable.statusKegiatan, "BELUM_DILAKSANAKAN"),
          lte(pengajuanRabTable.tanggalMulai, todayDate),
          gte(pengajuanRabTable.tanggalSelesai, todayDate),
        ),
      );

    if (kegiatanToOngoing.length > 0) {
      for (const k of kegiatanToOngoing) {
        await db
          .update(kegiatanTable)
          .set({
            statusKegiatan: "SEDANG_DILAKSANAKAN",
            updatedAt: new Date(),
          })
          .where(eq(kegiatanTable.id, k.id));
      }
      console.log(
        `[Cron Job] ${kegiatanToOngoing.length} kegiatan diubah ke SEDANG_DILAKSANAKAN`,
      );
    }

    // 2. Update ke SELESAI (HANYA jika semua tagihan sudah lunas)
    // Kondisi:
    // - status != SELESAI
    // - tanggalSelesai < today
    // - SEMUA tagihan terkait sudah berstatus 'dibayar' (lunas)

    const kegiatanToDone = await db
      .select({
        id: kegiatanTable.id,
        kegiatanId: kegiatanTable.id,
      })
      .from(kegiatanTable)
      .innerJoin(
        pengajuanRabTable,
        eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id),
      )
      .where(
        and(
          ne(kegiatanTable.statusKegiatan, "SELESAI"),
          lt(pengajuanRabTable.tanggalSelesai, todayDate),
          // Subquery: tidak ada tagihan yang statusnya belum 'dibayar' (masih WAITING_PEMBAYARAN atau lainnya)
          sql`NOT EXISTS (
            SELECT 1 FROM ${tagihanPencairanTable}
            WHERE ${tagihanPencairanTable.kegiatanId} = ${kegiatanTable.id}
            AND ${tagihanPencairanTable.statusTagihan} != 'dibayar'
          )`,
        ),
      );

    if (kegiatanToDone.length > 0) {
      for (const k of kegiatanToDone) {
        await db
          .update(kegiatanTable)
          .set({
            statusKegiatan: "SELESAI",
            updatedAt: new Date(),
          })
          .where(eq(kegiatanTable.id, k.id));
      }
      console.log(
        `[Cron Job] ${kegiatanToDone.length} kegiatan diubah ke SELESAI (semua tagihan sudah lunas)`,
      );
    }

    // 3. Log jika ada kegiatan yang melewati tanggal selesai tapi masih ada tagihan belum lunas
    const kegiatanTerlewat = await db
      .select({
        id: kegiatanTable.id,
        judul: pengajuanRabTable.judulKegiatan,
        tanggalSelesai: pengajuanRabTable.tanggalSelesai,
      })
      .from(kegiatanTable)
      .innerJoin(
        pengajuanRabTable,
        eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id),
      )
      .where(
        and(
          ne(kegiatanTable.statusKegiatan, "SELESAI"),
          lt(pengajuanRabTable.tanggalSelesai, todayDate),
          sql`EXISTS (
            SELECT 1 FROM ${tagihanPencairanTable}
            WHERE ${tagihanPencairanTable.kegiatanId} = ${kegiatanTable.id}
            AND ${tagihanPencairanTable.statusTagihan} != 'dibayar'
          )`,
        ),
      );

    if (kegiatanTerlewat.length > 0) {
      console.warn(
        `[Cron Job] PERHATIAN! ${kegiatanTerlewat.length} kegiatan sudah melewati jadwal selesai tapi tagihan belum lunas:`,
      );
      for (const k of kegiatanTerlewat) {
        console.warn(
          `  - ${k.judul} (ID: ${k.id}, selesai: ${k.tanggalSelesai})`,
        );
      }
    }
  } catch (error) {
    console.error("[Cron Job] Gagal melakukan update status kegiatan:", error);
  }
}
