// FILE: server/api/ppk/pencairan/[id]/kembalikan.post.ts
// PERBAIKAN: eq(usersTable.id, Number(user.id)) → eq(usersTable.users_id, String(user.id))
// PERBAIKAN: Decode URL-safe ID

import { and, eq } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  auditLogTable,
  dokumentasiKegiatanTable,
  tagihanPencairanTable,
  kegiatanTable,
  pengajuanRabTable,
  usersTable,
  ormawaTable,
  logDokumentasiTagihanTable,
} from "~~/server/db/schema";
import {
  decodeUrlId,
  groupIdToKegiatanId,
  isGroupId,
  mysqlTimestamp,
} from "~~/server/utils/pencairanHelpers";

const STATUS_BISA_DIKEMBALIKAN = ["WAITING_PEMBAYARAN", "TERVERIFIKASI"];

export default defineEventHandler(async (event) => {
  try {
    // ✅ FIX: Decode URL-safe ID
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

    // ✅ PERBAIKAN: pakai users_id (varchar) bukan id (integer)
    const [ppkData] = await db
      .select({ fakultasId: usersTable.fakultasId })
      .from(usersTable)
      .where(eq(usersTable.users_id, String(user.id)));

    if (!ppkData?.fakultasId) {
      throw createError({ statusCode: 403, statusMessage: "PPK tidak memiliki data fakultas" });
    }

    if (id < 0) {
      const dokumentasiRows = isGroupId(id)
        ? await db
            .select({ id: dokumentasiKegiatanTable.id, tipeDokumen: dokumentasiKegiatanTable.tipeDokumen })
            .from(dokumentasiKegiatanTable)
            .innerJoin(usersTable, eq(dokumentasiKegiatanTable.uploadedBy, usersTable.id))
            .where(and(eq(dokumentasiKegiatanTable.kegiatanId, groupIdToKegiatanId(id)), eq(usersTable.fakultasId, ppkData.fakultasId)))
        : await db
            .select({ id: dokumentasiKegiatanTable.id, tipeDokumen: dokumentasiKegiatanTable.tipeDokumen })
            .from(dokumentasiKegiatanTable)
            .innerJoin(usersTable, eq(dokumentasiKegiatanTable.uploadedBy, usersTable.id))
            .where(and(eq(dokumentasiKegiatanTable.id, Math.abs(id)), eq(usersTable.fakultasId, ppkData.fakultasId)));

      if (dokumentasiRows.length === 0) {
        throw createError({ statusCode: 404, statusMessage: "Dokumen pencairan tidak ditemukan" });
      }

      await db.insert(auditLogTable).values(
        dokumentasiRows.map((dokumen) => ({
          tableName: "dokumentasi_kegiatan",
          recordId: dokumen.id,
          action: "REVISI_PENCAIRAN",
          oldData: { status: "WAITING_PEMBAYARAN" },
          newData: { status: "DIKEMBALIKAN", catatan: catatan.trim(), tipeDokumen: dokumen.tipeDokumen },
          userId: Number(user.id),
        })),
      );

      return {
        success: true,
        message: "Catatan revisi pencairan berhasil dikirim",
        data: { dokumentasiId: dokumentasiRows.map((row) => row.id), statusBaru: "DIKEMBALIKAN", catatan: catatan.trim() },
      };
    }

    const [tagihan] = await db
      .select({
        id: tagihanPencairanTable.id,
        statusTagihan: tagihanPencairanTable.statusTagihan,
        namaPenerima: tagihanPencairanTable.namaPenerima,
        pengajuFakultasId: usersTable.fakultasId,
      })
      .from(tagihanPencairanTable)
      .innerJoin(kegiatanTable, eq(tagihanPencairanTable.kegiatanId, kegiatanTable.id))
      .innerJoin(pengajuanRabTable, eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id))
      .innerJoin(usersTable, eq(pengajuanRabTable.usersId, usersTable.users_id))
      .leftJoin(ormawaTable, eq(usersTable.ormawaId, ormawaTable.id))
      .where(eq(tagihanPencairanTable.id, id));

    if (!tagihan) {
      throw createError({ statusCode: 404, statusMessage: "Tagihan pencairan tidak ditemukan" });
    }

    if (tagihan.pengajuFakultasId !== ppkData.fakultasId) {
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
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tagihanPencairanTable.id, id));

      await tx.insert(logDokumentasiTagihanTable).values({
        tagihanId: id,
        action: "revisi",
        komentar: catatan.trim(),
        userId: Number(user.id),
      });
    });

    return {
      success: true,
      message: "Tagihan berhasil dikembalikan ke ormawa",
      data: { tagihanId: id, statusBaru: "DIKEMBALIKAN", catatan: catatan.trim() },
    };
  } catch (error: any) {
    console.error("Error POST /api/ppk/pencairan/[id]/kembalikan:", error);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: "Gagal mengembalikan tagihan", data: error });
  }
});