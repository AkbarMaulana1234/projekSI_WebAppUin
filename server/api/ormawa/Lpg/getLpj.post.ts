import { defineEventHandler, readBody, createError } from "h3";
import { useDrizzle } from "../../../db/index";
import { eq, desc } from "drizzle-orm";
import { lpgTable } from "../../../db/schema/lpgSchema";
import { kegiatanTable } from "../../../db/schema/KegiatanSchema";
import { revisiLpgLogTable } from "../../../db/schema/revisiLpgLogSchema";
import { usersTable } from "../../../db/schema/usersSchema";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { rabId } = body;

    if (!rabId) {
      throw createError({ statusCode: 400, message: "RAB ID wajib diisi" });
    }

    const db = useDrizzle();

    // Get kegiatanId
    const kegiatan = await db.query.kegiatanTable.findFirst({
      where: eq(kegiatanTable.pengajuanRabId, Number(rabId)),
    });

    if (!kegiatan) {
      return { success: true, data: null, logs: [] };
    }

    // Get LPG
    const lpg = await db.query.lpgTable.findFirst({
      where: eq(lpgTable.kegiatanId, kegiatan.id),
    });

    if (!lpg) {
      return { success: true, data: null, logs: [] };
    }

    // Get Logs
    const logsData = await db
      .select({
        id: revisiLpgLogTable.id,
        catatanRevisi: revisiLpgLogTable.catatanRevisi,
        createdAt: revisiLpgLogTable.createdAt,
        actor: {
          fullname: usersTable.fullName,
          role: usersTable.role,
        },
      })
      .from(revisiLpgLogTable)
      .innerJoin(usersTable, eq(revisiLpgLogTable.requesterId, usersTable.id))
      .where(eq(revisiLpgLogTable.lpgId, lpg.id))
      .orderBy(desc(revisiLpgLogTable.createdAt));

    return {
      success: true,
      data: lpg,
      logs: logsData,
    };
  } catch (error: any) {
    console.error("Error fetching LPJ:", error);
    throw createError({
      statusCode: 500,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
});
