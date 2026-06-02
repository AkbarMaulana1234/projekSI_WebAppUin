// FILE: server/api/ppk/kegiatan/[id]/keputusan.post.ts

import { eq, and } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  pengajuanRabTable,
  approvalLogTable,
} from "~~/server/db/schema";

const KEPUTUSAN_MAP = {
  disetujui: { statusBaru: "waiting_spi" as const, action: "disetujui" },
  revisi: { statusBaru: "revisi_ppk" as const, action: "revisi" },
} as const;

type Keputusan = keyof typeof KEPUTUSAN_MAP;

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, "id"));
    if (isNaN(id) || id <= 0) {
      throw createError({ statusCode: 400, statusMessage: "ID pengajuan tidak valid" });
    }

    const body = await readBody(event);
    const { keputusan, catatan } = body ?? {};

    if (!keputusan || !Object.keys(KEPUTUSAN_MAP).includes(keputusan)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Keputusan tidak valid. Pilihan: ${Object.keys(KEPUTUSAN_MAP).join(", ")}`,
      });
    }

    if (keputusan === "revisi" && !catatan?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Catatan wajib diisi untuk keputusan revisi",
      });
    }

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
      throw createError({ statusCode: 403, statusMessage: "PPK tidak memiliki data fakultas" });
    }

    const rab = await db.query.pengajuanRabTable.findFirst({
      where: and(
        eq(pengajuanRabTable.id, id),
        eq(pengajuanRabTable.fakultasId, String(fakultasId)),
      ),
    });

    if (!rab) {
      throw createError({
        statusCode: 404,
        statusMessage: "Pengajuan tidak ditemukan atau Anda tidak memiliki akses",
      });
    }

    if (rab.status !== "waiting_ppk") {
      throw createError({
        statusCode: 422,
        statusMessage: `Pengajuan tidak bisa diproses. Status saat ini: ${rab.status}`,
      });
    }

    const { statusBaru, action } = KEPUTUSAN_MAP[keputusan as Keputusan];

    await db.transaction(async (tx) => {
      await tx
        .update(pengajuanRabTable)
        .set({ status: statusBaru, updatedAt: new Date() })
        .where(eq(pengajuanRabTable.id, id));

      await tx.insert(approvalLogTable).values({
        pengajuanRabId: id,
        actorId: user.id,
        action,
        catatanRevisi: catatan?.trim() ?? "",
      });
    });

    return {
      success: true,
      message:
        action === "disetujui"
          ? "Pengajuan berhasil disetujui dan diteruskan ke SPI"
          : "Pengajuan dikembalikan untuk revisi",
      data: { pengajuanId: id, keputusan: action, statusBaru },
    };
  } catch (error: any) {
    console.error("Error POST /api/ppk/kegiatan/[id]/keputusan:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal memproses keputusan",
      data: error,
    });
  }
});
