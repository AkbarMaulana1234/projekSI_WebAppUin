import { eq } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import { tagihanPencairanTable } from "~~/server/db/schema";

// Status yang boleh dikembalikan
const STATUS_BISA_DIKEMBALIKAN = ["WAITING_PEMBAYARAN", "TERVERIFIKASI"];

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
    const { catatan } = body ?? {};

    if (!catatan?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Catatan alasan pengembalian wajib diisi",
      });
    }

    const db = useDrizzle();

    const [tagihan] = await db
      .select({
        id: tagihanPencairanTable.id,
        statusTagihan: tagihanPencairanTable.statusTagihan,
        namaPenerima: tagihanPencairanTable.namaPenerima,
      })
      .from(tagihanPencairanTable)
      .where(eq(tagihanPencairanTable.id, id));

    if (!tagihan) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tagihan pencairan tidak ditemukan",
      });
    }

    if (!STATUS_BISA_DIKEMBALIKAN.includes(tagihan.statusTagihan ?? "")) {
      throw createError({
        statusCode: 422,
        statusMessage: `Tagihan tidak bisa dikembalikan. Status saat ini: ${tagihan.statusTagihan}`,
      });
    }

    await db
      .update(tagihanPencairanTable)
      .set({
        statusTagihan: "DIKEMBALIKAN",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tagihanPencairanTable.id, id));

    return {
      success: true,
      message: "Tagihan berhasil dikembalikan ke ormawa",
      data: {
        tagihanId: id,
        statusBaru: "DIKEMBALIKAN",
        catatan: catatan.trim(),
      },
    };
  } catch (error: any) {
    console.error("Error POST /api/ppk/pencairan/[id]/kembalikan:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengembalikan tagihan",
      data: error,
    });
  }
});