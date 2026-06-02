// FILE: server/api/ppk/dashboard/index.get.ts

import { eq, sql, ne, and, inArray } from "drizzle-orm";
import { pengajuanRabTable } from "~~/server/db/schema";
import { useDrizzle } from "~~/server/db";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const { user } = event.context;

    if (!user || user.role !== "ppk") {
      throw createError({
        statusCode: 403,
        statusMessage: "Akses ditolak. Peran PPK diperlukan.",
      });
    }

    const fakultasId = user.fakultasId;

    if (!fakultasId) {
      return { total: 0, menunggu: 0, disetujui: 0, revisi: 0, ditolak: 0 };
    }

    const byFakultas = eq(pengajuanRabTable.fakultasId, String(fakultasId));

    const [total, menunggu, disetujui, revisi, ditolak] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(pengajuanRabTable)
        .where(and(ne(pengajuanRabTable.status, "draft"), byFakultas)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(pengajuanRabTable)
        .where(and(eq(pengajuanRabTable.status, "waiting_ppk"), byFakultas)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(pengajuanRabTable)
        .where(
          and(
            inArray(pengajuanRabTable.status, [
              "waiting_spi",
              "disetujui",
              "selesai_spi",
              "lunas_ppk",
            ]),
            byFakultas,
          ),
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(pengajuanRabTable)
        .where(and(eq(pengajuanRabTable.status, "revisi_ppk"), byFakultas)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(pengajuanRabTable)
        .where(and(eq(pengajuanRabTable.status, "ditolak_spi"), byFakultas)),
    ]);

    return {
      total: Number(total[0]?.count ?? 0),
      menunggu: Number(menunggu[0]?.count ?? 0),
      disetujui: Number(disetujui[0]?.count ?? 0),
      revisi: Number(revisi[0]?.count ?? 0),
      ditolak: Number(ditolak[0]?.count ?? 0),
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil data dashboard",
      data: error,
    });
  }
});
