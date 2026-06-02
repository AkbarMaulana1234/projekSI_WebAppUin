import { defineEventHandler, readBody, createError } from "h3";
import { useDrizzle } from "../../../db/index";
import { eq, desc } from "drizzle-orm";
import { lpgTable } from "../../../db/schema/lpgSchema";
import { kegiatanTable } from "../../../db/schema/KegiatanSchema";
import { pengajuanRabTable } from "../../../db/schema/pengajuanRabSchema";
import { usersTable } from "../../../db/schema/usersSchema";
import { revisiLpgLogTable } from "../../../db/schema/revisiLpgLogSchema";

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== "spi") {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const body = await readBody(event);
  const { lpgId } = body;

  if (!lpgId) {
    throw createError({ statusCode: 400, message: "LPG ID wajib diisi" });
  }

  const db = useDrizzle();

  try {
    const lpgDetail = await db
      .select({
        lpg: lpgTable,
        rab: pengajuanRabTable,
        ormawa: usersTable,
      })
      .from(lpgTable)
      .innerJoin(kegiatanTable, eq(lpgTable.kegiatanId, kegiatanTable.id))
      .innerJoin(pengajuanRabTable, eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id))
      .innerJoin(usersTable, eq(pengajuanRabTable.usersId, usersTable.users_id))
      .where(eq(lpgTable.id, lpgId))
      .limit(1);

    if (lpgDetail.length === 0) {
      throw createError({ statusCode: 404, message: "LPG tidak ditemukan" });
    }

    const logs = await db
      .select({
        id: revisiLpgLogTable.id,
        catatanRevisi: revisiLpgLogTable.catatanRevisi,
        createdAt: revisiLpgLogTable.createdAt,
        actor: {
          fullName: usersTable.fullName,
          role: usersTable.role,
        }
      })
      .from(revisiLpgLogTable)
      .innerJoin(usersTable, eq(revisiLpgLogTable.requesterId, usersTable.id))
      .where(eq(revisiLpgLogTable.lpgId, lpgId))
      .orderBy(desc(revisiLpgLogTable.createdAt));

    return {
      success: true,
      data: {
        ...lpgDetail[0],
        logs,
      },
    };
  } catch (error: any) {
    console.error("Error fetching SPI LPG detail:", error);
    throw createError({
      statusCode: 500,
      message: "Terjadi kesalahan server saat mengambil detail LPG: " + error.message,
    });
  }
});
