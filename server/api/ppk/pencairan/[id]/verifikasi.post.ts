import { eq } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  tagihanPencairanTable,
  kegiatanTable,
  pengajuanRabTable,
} from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, "id"));
    if (isNaN(id) || id <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID tagihan tidak valid",
      });
    }

    const body = await readBody(event);
    const { keputusan, catatan } = body ?? {};

    // keputusan: 'terverifikasi' | 'dikembalikan'
    if (!keputusan || !["terverifikasi", "dikembalikan"].includes(keputusan)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Keputusan tidak valid. Pilihan: terverifikasi | dikembalikan",
      });
    }

    if (keputusan === "dikembalikan" && !catatan?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Catatan wajib diisi jika dokumen dikembalikan",
      });
    }

    const db = useDrizzle();

    // Ambil tagihan + total RAB untuk validasi nominal
    const [tagihan] = await db
      .select({
        id: tagihanPencairanTable.id,
        nominal: tagihanPencairanTable.nominal,
        statusTagihan: tagihanPencairanTable.statusTagihan,
        tipeTagihan: tagihanPencairanTable.tipeTagihan,
        totalAnggaranRab: pengajuanRabTable.totalAnggaran,
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
      .where(eq(tagihanPencairanTable.id, id));

    if (!tagihan) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tagihan pencairan tidak ditemukan",
      });
    }

    if (tagihan.statusTagihan !== "WAITING_PEMBAYARAN") {
      throw createError({
        statusCode: 422,
        statusMessage: `Tagihan tidak bisa diverifikasi. Status saat ini: ${tagihan.statusTagihan}`,
      });
    }

    // Cek nominal tidak melebihi RAB — hanya block jika melebihi dan mau terverifikasi
    const nominalTagihan = Number(tagihan.nominal);
    const totalRab = Number(tagihan.totalAnggaranRab);
    if (keputusan === "terverifikasi" && nominalTagihan > totalRab) {
      throw createError({
        statusCode: 422,
        statusMessage: `Nominal tagihan (${nominalTagihan}) melebihi total anggaran RAB (${totalRab}). Tidak bisa diverifikasi.`,
      });
    }

    const statusBaru =
      keputusan === "terverifikasi" ? "TERVERIFIKASI" : "DIKEMBALIKAN";

    await db
      .update(tagihanPencairanTable)
      .set({
        statusTagihan: statusBaru,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tagihanPencairanTable.id, id));

    return {
      success: true,
      message:
        keputusan === "terverifikasi"
          ? "Dokumen terverifikasi, tagihan siap dibayarkan"
          : "Tagihan dikembalikan ke ormawa untuk diperbaiki",
      data: {
        tagihanId: id,
        statusBaru,
        catatan: catatan?.trim() ?? null,
      },
    };
  } catch (error: any) {
    console.error("Error POST /api/ppk/pencairan/[id]/verifikasi:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal memverifikasi tagihan",
      data: error,
    });
  }
});