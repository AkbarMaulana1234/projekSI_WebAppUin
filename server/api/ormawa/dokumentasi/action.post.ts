import { useDrizzle } from "~~/server/db";
import { eq } from "drizzle-orm";
import { logDokumentasiTagihanTable } from "~~/server/db/schema/LogDokumentasiTagihanSchema";
import { tagihanPencairanTable } from "~~/server/db/schema/TagihanPencairanSchema";
import { dokumentasiKegiatanTable } from "~~/server/db/schema/dokumentasiSchema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id, action, komentar } = body;

  if (!id || !action || !komentar) {
    throw createError({
      statusCode: 400,
      message: "ID, action, dan komentar wajib diisi",
    });
  }

  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // Hanya SPI dan PPK yang boleh melakukan aksi ini
  if (!["SPI", "PPK"].includes(user.role)) {
    throw createError({
      statusCode: 403,
      message: "Hanya SPI atau PPK yang dapat melakukan aksi ini",
    });
  }

  const idStr = String(id);
  const isTagihan = idStr.startsWith("tagihan_");
  const realId = Number(idStr.replace("doc_", "").replace("tagihan_", ""));

  const db = useDrizzle();

  return await db.transaction(async (tx) => {
    // 1. Insert Log
    await tx.insert(logDokumentasiTagihanTable).values({
      dokumentasiId: isTagihan ? null : realId,
      tagihanId: isTagihan ? realId : null,
      action: action, // 'review', 'approve', 'reject', 'pay', 'revisi'
      komentar: komentar,
      userId: Number(user.id),
    });

    // 2. Update Status
    if (isTagihan) {
      let statusTagihan = "";
      if (action === "approve") statusTagihan = "TERVERIFIKASI";
      else if (action === "reject") statusTagihan = "DITOLAK";
      else if (action === "review") statusTagihan = "DIKEMBALIKAN";
      else if (action === "pay") statusTagihan = "SELESAI";

      if (statusTagihan) {
        await tx
          .update(tagihanPencairanTable)
          .set({ statusTagihan: statusTagihan as any, updatedAt: new Date().toISOString() })
          .where(eq(tagihanPencairanTable.id, realId));
      }
    } else {
      let status = "MENUNGGU";
      if (action === "approve") status = "DITERIMA";
      else if (action === "review") status = "REVISI";
      else if (action === "reject") status = "DITOLAK";

      await tx
        .update(dokumentasiKegiatanTable)
        .set({ status: status as any })
        .where(eq(dokumentasiKegiatanTable.id, realId));
    }

    return { success: true, message: "Aksi berhasil diproses" };
  });
});
