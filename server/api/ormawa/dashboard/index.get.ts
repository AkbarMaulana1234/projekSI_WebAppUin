import { eq, notInArray, and, sql, ne } from "drizzle-orm";
import { pengajuanRabTable } from "~~/server/db/schema";
import { useDrizzle } from "~~/server/db";
import { decodeJwt } from "~~/server/utils/authentikasi";
import { User } from "~~/server/interface/userInterface";
import { nextTick } from "vue";
export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();

    const user = event.context.user;

    const [totalRab, RabTolak, RabSelesai, RabProses] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(pengajuanRabTable)
        .where(
          and(
            eq(pengajuanRabTable.usersId, user.id),
            ne(pengajuanRabTable.status, "draft"),
          ),
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(pengajuanRabTable)
        .where(
          and(
            eq(pengajuanRabTable.status, "ditolak_spi"),
            eq(pengajuanRabTable.usersId, user.id),
          ),
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(pengajuanRabTable)
        .where(
          and(
            eq(pengajuanRabTable.status, "selesai_spi"),
            eq(pengajuanRabTable.usersId, user.id),
          ),
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(pengajuanRabTable)
        .where(
          and(
            notInArray(pengajuanRabTable.status, [
              "disetujui",
              "draft",
              "selesai_spi",
              "ditolak_spi",
            ]),
            eq(pengajuanRabTable.usersId, user.id),
          ),
        ),
    ]);

    return {
      total: totalRab[0]?.count ?? 0,
      ditolak: RabTolak[0]?.count ?? 0,
      selesai: RabSelesai[0]?.count ?? 0,
      proses: RabProses[0]?.count ?? 0,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil data RAB",
      data: error,
    });
  }
});
