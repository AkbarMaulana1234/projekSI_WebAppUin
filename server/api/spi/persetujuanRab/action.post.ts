import { useDrizzle } from "~~/server/db";
import {
  pengajuanRabTable,
  approvalLogTable,
  kegiatanTable,
} from "~~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { rabId, action, catatan } = body;
    const { user } = event.context;

    if (!rabId || !action) {
      throw createError({ statusCode: 400, message: "Data tidak lengkap" });
    }

    if (user.role !== "spi") {
      throw createError({
        statusCode: 403,
        message: "Akses ditolak. Hanya SPI yang dapat melakukan aksi ini.",
      });
    }

    if ((action === "tolak" || action === "revisi") && !catatan) {
      throw createError({
        statusCode: 400,
        message: "Catatan wajib diisi untuk penolakan atau revisi",
      });
    }

    const db = useDrizzle();

    // 1. Cek status RAB saat ini
    const rab = await db.query.pengajuanRabTable.findFirst({
      where: eq(pengajuanRabTable.id, Number(rabId)),
    });

    if (!rab) {
      throw createError({ statusCode: 404, message: "RAB tidak ditemukan" });
    }

    if (rab.status !== "waiting_spi") {
      throw createError({
        statusCode: 400,
        message: "RAB tidak dalam status menunggu SPI",
      });
    }

    // 2. Tentukan status baru
    let newStatus: any = "waiting_spi";
    if (action === "setuju") {
      newStatus = "disetujui";
    } else if (action === "tolak") {
      newStatus = "ditolak_spi";
    } else if (action === "revisi") {
      newStatus = "revisi_spi"; // Menggunakan ditolak_spi untuk revisi SPI sesuai enum yang tersedia
    } else {
      throw createError({ statusCode: 400, message: "Aksi tidak valid" });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(pengajuanRabTable)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(pengajuanRabTable.id, Number(rabId)));

      // 4. Catat ke approvalLog
      await tx.insert(approvalLogTable).values({
        pengajuanRabId: Number(rabId),
        actorId: user.id, // ID internal auto-increment, bukan users_id
        action: action, // setuju, tolak, revisi
        catatanRevisi: catatan || `disetujui`,
      });

      // 5. Jika disetujui, buat record kegiatan baru (menandakan dana siap dicairkan / acara bisa dimulai)
      if (action === "setuju") {
        await tx.insert(kegiatanTable).values({
          pengajuanRabId: Number(rabId),
          statusKegiatan: "BELUM_DILAKSANAKAN",
        });
      }
    });

    return {
      success: true,
      message: `RAB berhasil ${action === "setuju" ? "disetujui" : action === "tolak" ? "ditolak" : "dikembalikan untuk direvisi"}.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Terjadi kesalahan sistem",
    };
  }
});
