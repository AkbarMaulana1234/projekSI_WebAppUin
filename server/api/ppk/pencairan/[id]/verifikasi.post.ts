import { and, eq, or } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  tagihanPencairanTable,
  usersTable,
  logDokumentasiTagihanTable,
} from "~~/server/db/schema";
import {
  decodeUrlId,
  isAllDocsUploaded,
  resolveTagihanId,
  mysqlTimestamp,
  toPublicUploadUrl,
  assertPpkAksesTagihan,
} from "~~/server/utils/pencairanHelpers";

export default defineEventHandler(async (event) => {
  try {
    const routeId = decodeUrlId(getRouterParam(event, "id"));
    if (Number.isNaN(routeId) || routeId === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID pencairan tidak valid",
      });
    }

    const body = await readBody(event);
    const { keputusan, catatan } = body ?? {};

    if (!keputusan || !["terverifikasi", "dikembalikan"].includes(keputusan)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Keputusan tidak valid. Pilihan: terverifikasi | dikembalikan",
      });
    }

    if (keputusan === "dikembalikan" && !catatan?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Catatan wajib diisi jika dokumen dikembalikan",
      });
    }

    const user = event.context.user;
    const db = useDrizzle();

    // Fetch PPK data (fakultasId may be null)
    const [ppkData] = await db
      .select({ fakultasId: usersTable.fakultasId, id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, Number(user.id)));

    // If fakultasId is null, treat as unrestricted access
    const ppkFakultasId = ppkData?.fakultasId ? String(ppkData.fakultasId) : null;

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

    const hasAccess = await assertPpkAksesTagihan(
      db,
      tagihanId,
      ppkFakultasId ?? "",
    );

    if (!hasAccess) {
      throw createError({
        statusCode: 403,
        statusMessage: "Anda tidak memiliki akses untuk memverifikasi tagihan ini",
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

    if (!["WAITING_PEMBAYARAN", "DIKEMBALIKAN"].includes(tagihan.statusTagihan ?? "")) {
      throw createError({
        statusCode: 422,
        statusMessage: `Tagihan tidak bisa diverifikasi. Status saat ini: ${tagihan.statusTagihan}`,
      });
    }

    if (keputusan === "terverifikasi" && tagihanId) {
      const [tagihanDoc] = await db
        .select({
          tipeDokumen: tagihanPencairanTable.tipeTagihan,
          fotoBarangUrl: tagihanPencairanTable.fotoBarangUrl,
          strukBelanjaUrl: tagihanPencairanTable.strukFileUrl,
          tokoNama: tagihanPencairanTable.tokoNama,
          rekeningPenerima: tagihanPencairanTable.rekeningPenerima,
          skUrl: tagihanPencairanTable.skFileUrl,
          spmtUrl: tagihanPencairanTable.spmtFileUrl,
          amprahUrl: tagihanPencairanTable.amprahFileUrl,
          npwpUrl: tagihanPencairanTable.npwpFileUrl,
          ktpUrl: tagihanPencairanTable.ktpFileUrl,
          bukuRekeningFileUrl: tagihanPencairanTable.bukuRekeningFileUrl,
        })
        .from(tagihanPencairanTable)
        .where(eq(tagihanPencairanTable.id, tagihanId));

      if (tagihanDoc) {
        const isBarang = tagihanDoc.tipeDokumen === "BARANG";
        const docs = isBarang
          ? [
              {
                id: "foto_barang",
                nama: "Foto Barang",
                uploaded: Boolean(tagihanDoc.fotoBarangUrl),
              },
              {
                id: "struk_belanja",
                nama: "Foto Bon / Struk",
                uploaded: Boolean(tagihanDoc.strukBelanjaUrl),
              },
            ]
          : [
              {
                id: "sk",
                nama: "SK",
                uploaded: Boolean(tagihanDoc.skUrl),
              },
              {
                id: "spmt",
                nama: "SPMT",
                uploaded: Boolean(tagihanDoc.spmtUrl),
              },
              {
                id: "amprah",
                nama: "Amprah",
                uploaded: Boolean(tagihanDoc.amprahUrl),
              },
              {
                id: "npwp",
                nama: "NPWP",
                uploaded: Boolean(tagihanDoc.npwpUrl),
              },
              {
                id: "ktp",
                nama: "Foto KTP",
                uploaded: Boolean(tagihanDoc.ktpUrl),
              },
              {
                id: "buku_rekening",
                nama: "Buku Rekening",
                uploaded: Boolean(tagihanDoc.bukuRekeningFileUrl),
              },
            ];

        if (!isAllDocsUploaded(docs)) {
          throw createError({
            statusCode: 422,
            statusMessage: "Dokumen ormawa belum lengkap. Minta revisi jika ada yang kurang.",
          });
        }
      }
    }

    const statusBaru =
      keputusan === "terverifikasi" ? "TERVERIFIKASI" : "DIKEMBALIKAN";

    await db.transaction(async (tx) => {
      await tx
        .update(tagihanPencairanTable)
        .set({
          statusTagihan: statusBaru,
          updatedAt: mysqlTimestamp(),
        })
        .where(eq(tagihanPencairanTable.id, tagihanId));

      await tx.insert(logDokumentasiTagihanTable).values({
        tagihanId,
        action: keputusan === "terverifikasi" ? "approve" : "revisi",
        komentar: catatan?.trim() || (keputusan === "terverifikasi" ? "Dokumen diverifikasi" : "Perlu perbaikan"),
        userId: ppkData.id,
      });
    });

    return {
      success: true,
      message:
        keputusan === "terverifikasi"
          ? "Dokumen ormawa lengkap. Unggah Surat Perintah Bayar dan kwitansi."
          : "Tagihan dikembalikan ke ormawa untuk diperbaiki",
      data: {
        tagihanId,
        statusBaru,
        catatan: catatan?.trim() ?? null,
      },
    };
  } catch (error: any) {
    console.error("Error POST /api/ppk/pencairan/[id]/verifikasi:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal memverifikasi tagihan",
      data: error,
    });
  }
});
