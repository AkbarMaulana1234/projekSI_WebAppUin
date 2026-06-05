import { eq } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import { tagihanPencairanTable, usersTable } from "~~/server/db/schema";
import {
  decodeUrlId,
  getDokumenPpkFromMeta,
  mysqlTimestamp,
  resolveTagihanId,
  assertPpkAksesTagihan,
  writePencairanMeta,
} from "~~/server/utils/pencairanHelpers";

export default defineEventHandler(async (event) => {
  try {
    // ✅ FIX: Decode URL-safe ID
    const rawId = getRouterParam(event, "id");
    const routeId = decodeUrlId(rawId);
    
    if (Number.isNaN(routeId) || routeId === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID pencairan tidak valid",
      });
    }

    const user = event.context.user;
    const db = useDrizzle();

    const [ppkData] = await db
      .select({ fakultasId: usersTable.fakultasId, id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, Number(user.id)));

    if (!ppkData) {
      throw createError({
        statusCode: 404,
        statusMessage: "Data PPK tidak ditemukan",
      });
    }

    if (!ppkData.fakultasId) {
      throw createError({
        statusCode: 403,
        statusMessage: "PPK tidak memiliki data fakultas",
      });
    }

    const tagihanId = await resolveTagihanId(
      db,
      routeId,
      ppkData.id,
      ppkData.fakultasId,
    );

    if (!tagihanId) {
      throw createError({
        statusCode: 404,
        statusMessage: "Data pencairan tidak ditemukan",
      });
    }

    const [tagihan] = await db
      .select({
        id: tagihanPencairanTable.id,
        statusTagihan: tagihanPencairanTable.statusTagihan,
      })
      .from(tagihanPencairanTable)
      .where(eq(tagihanPencairanTable.id, tagihanId));

    if (!tagihan) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tagihan pencairan tidak ditemukan",
      });
    }

    const hasAccess = await assertPpkAksesTagihan(
      db,
      tagihanId,
      ppkData.fakultasId ? String(ppkData.fakultasId) : null,
    );

    if (!hasAccess) {
      throw createError({
        statusCode: 403,
        statusMessage: "Anda tidak memiliki akses untuk mencatat transfer tagihan ini",
      });
    }

    if (tagihan.statusTagihan !== "TERVERIFIKASI") {
      throw createError({
        statusCode: 422,
        statusMessage: `Unggah SPB dan kwitansi terlebih dahulu. Status saat ini: ${tagihan.statusTagihan}`,
      });
    }

    const dokumenPpk = await getDokumenPpkFromMeta(tagihanId);
    if (!dokumenPpk.spbFileUrl || !dokumenPpk.kwitansiFileUrl) {
      throw createError({
        statusCode: 422,
        statusMessage: "Surat Perintah Bayar dan kwitansi harus lengkap sebelum transfer",
      });
    }

    await writePencairanMeta(tagihanId, { transferDone: true });

    await db
      .update(tagihanPencairanTable)
      .set({
        updatedAt: mysqlTimestamp(),
      })
      .where(eq(tagihanPencairanTable.id, tagihanId));

    return {
      success: true,
      message:
        "Transfer dicatat. Unggah bukti pembayaran agar ormawa dapat melihat bukti transfer.",
      data: {
        tagihanId,
        statusTagihan: "TRANSFER_DILAKUKAN",
      },
    };
  } catch (error: any) {
    console.error("Error POST /api/ppk/pencairan/[id]/transfer:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mencatat transfer",
      data: error,
    });
  }
});
