import { and, eq, or } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  tagihanPencairanTable,
  usersTable,
  logDokumentasiTagihanTable,
} from "~~/server/db/schema";
import {
  decodeUrlId,
  mysqlTimestamp,
  assertPpkAksesTagihan,
} from "~~/server/utils/pencairanHelpers";

const STATUS_BISA_DIKEMBALIKAN = ["WAITING_PEMBAYARAN", "TERVERIFIKASI"];

export default defineEventHandler(async (event) => {
  try {
    const rawId = getRouterParam(event, "id");
    const id = decodeUrlId(rawId);
    
    if (isNaN(id) || id === 0) {
      throw createError({ statusCode: 400, statusMessage: "ID pencairan tidak valid" });
    }

    const body = await readBody(event);
    const { catatan } = body ?? {};

    if (!catatan?.trim()) {
      throw createError({ statusCode: 400, statusMessage: "Catatan alasan pengembalian wajib diisi" });
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

    const ppkFakultasId = ppkData.fakultasId ? String(ppkData.fakultasId) : null;
    const tagihanId = Math.abs(id);

    const [tagihan] = await db
      .select({
        id: tagihanPencairanTable.id,
        statusTagihan: tagihanPencairanTable.statusTagihan,
      })
      .from(tagihanPencairanTable)
      .where(eq(tagihanPencairanTable.id, tagihanId));

    if (!tagihan) {
      throw createError({ statusCode: 404, statusMessage: "Tagihan pencairan tidak ditemukan" });
    }

    const hasAccess = await assertPpkAksesTagihan(
      db,
      tagihanId,
      ppkFakultasId,
    );

    if (!hasAccess) {
      throw createError({ statusCode: 403, statusMessage: "Anda tidak memiliki akses untuk mengembalikan tagihan ini" });
    }

    if (!STATUS_BISA_DIKEMBALIKAN.includes(tagihan.statusTagihan ?? "")) {
      throw createError({ statusCode: 422, statusMessage: `Tagihan tidak bisa dikembalikan. Status saat ini: ${tagihan.statusTagihan}` });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(tagihanPencairanTable)
        .set({
          statusTagihan: "DIKEMBALIKAN",
          updatedAt: mysqlTimestamp(),
        })
        .where(eq(tagihanPencairanTable.id, tagihanId));

      await tx.insert(logDokumentasiTagihanTable).values({
        tagihanId: tagihanId,
        action: "revisi",
        komentar: catatan.trim(),
        userId: ppkData.id,
      });
    });

    return {
      success: true,
      message: "Tagihan berhasil dikembalikan ke ormawa",
      data: { tagihanId, statusBaru: "DIKEMBALIKAN", catatan: catatan.trim() },
    };
  } catch (error: any) {
    console.error("Error POST /api/ppk/pencairan/[id]/kembalikan:", error);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: "Gagal mengembalikan tagihan", data: error });
  }
});