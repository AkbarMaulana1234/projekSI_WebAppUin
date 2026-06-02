import { defineEventHandler, createError } from "h3";
import { useDrizzle } from "../../../db/index";
import { eq, desc, or } from "drizzle-orm";
import { lpgTable } from "../../../db/schema/lpgSchema";
import { kegiatanTable } from "../../../db/schema/KegiatanSchema";
import { pengajuanRabTable } from "../../../db/schema/pengajuanRabSchema";
import { usersTable } from "../../../db/schema/usersSchema";

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== "spi") {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const db = useDrizzle();

  try {
    const results = await db
      .select({
        rabId: pengajuanRabTable.id,
        nomorPengajuan: pengajuanRabTable.nomorPengajuan,
        judulKegiatan: pengajuanRabTable.judulKegiatan,
        totalAnggaran: pengajuanRabTable.totalAnggaran,
        rabStatus: pengajuanRabTable.status,
        ormawaName: usersTable.fullName,
        lpgId: lpgTable.id,
        statusLpg: lpgTable.statusLpg,
        submittedAt: lpgTable.submittedAt,
      })
      .from(pengajuanRabTable)
      .innerJoin(kegiatanTable, eq(pengajuanRabTable.id, kegiatanTable.pengajuanRabId))
      .innerJoin(usersTable, eq(pengajuanRabTable.usersId, usersTable.users_id))
      .leftJoin(lpgTable, eq(kegiatanTable.id, lpgTable.kegiatanId))
      .where(
        or(
          eq(kegiatanTable.statusKegiatan, "LUNAS"),
          eq(pengajuanRabTable.status, "selesai_spi")
        )
      )
      .orderBy(desc(lpgTable.submittedAt), desc(pengajuanRabTable.updatedAt));

    return {
      success: true,
      data: results,
    };
  } catch (error: any) {
    console.error("Error fetching SPI LPG list:", error);
    throw createError({
      statusCode: 500,
      message: "Terjadi kesalahan server saat mengambil daftar LPG: " + error.message,
    });
  }
});
