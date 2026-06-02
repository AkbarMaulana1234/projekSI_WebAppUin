import { defineEventHandler, createError } from "h3";
import { useDrizzle } from "~~/server/db";
import { kegiatanTable, pengajuanRabTable } from "~~/server/db/schema";
import { eq, desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user;
    if (!user || !user.id) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const db = useDrizzle();

    const data = await db
      .select({
        kegiatan: kegiatanTable,
        pengajuan: pengajuanRabTable,
      })
      .from(kegiatanTable)
      .innerJoin(
        pengajuanRabTable,
        eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id),
      )
      .where(eq(pengajuanRabTable.usersId, user.id))
      .orderBy(desc(kegiatanTable.createdAt));
    console.log(data);
    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    console.error("Error fetching kegiatan list:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
});
