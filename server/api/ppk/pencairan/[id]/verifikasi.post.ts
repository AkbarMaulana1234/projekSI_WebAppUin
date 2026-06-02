import { and, eq } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  dokumentasiKegiatanTable,
  tagihanPencairanTable,
  usersTable,
  ormawaTable,
  logDokumentasiTagihanTable,
} from "~~/server/db/schema";
import {
  buildDokumenUpload,
  decodeUrlId,
  isAllDocsUploaded,
  readPencairanMeta,
  resolveTagihanId,
  routeIdToDokumentasiId,
  mysqlTimestamp,
  writePencairanMeta,
} from "~~/server/utils/pencairanHelpers";

async function assertPpkAksesTagihan(
  db: ReturnType<typeof useDrizzle>,
  tagihanId: number,
  fakultasId: number,
  dokumentasiId: number | null,
) {
  const [tagihan] = await db
    .select({ kegiatanId: tagihanPencairanTable.kegiatanId })
    .from(tagihanPencairanTable)
    .where(eq(tagihanPencairanTable.id, tagihanId));

  if (!tagihan) return false;

  if (dokumentasiId) {
    const [row] = await db
      .select({ fakultasId: usersTable.fakultasId })
      .from(dokumentasiKegiatanTable)
      .innerJoin(usersTable, eq(dokumentasiKegiatanTable.uploadedBy, usersTable.id))
      .where(eq(dokumentasiKegiatanTable.id, dokumentasiId));
    return row?.fakultasId === fakultasId;
  }

  const [row] = await db
    .select({ fakultasId: usersTable.fakultasId })
    .from(dokumentasiKegiatanTable)
    .innerJoin(usersTable, eq(dokumentasiKegiatanTable.uploadedBy, usersTable.id))
    .where(
      and(
        eq(dokumentasiKegiatanTable.kegiatanId, tagihan.kegiatanId),
        eq(usersTable.fakultasId, fakultasId),
      ),
    )
    .limit(1);

  return Boolean(row);
}

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

    const [ppkData] = await db
      .select({ fakultasId: usersTable.fakultasId, id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, Number(user.id)));

    if (!ppkData?.fakultasId) {
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

    const meta = await readPencairanMeta(tagihanId);
    const dokumentasiId =
      routeIdToDokumentasiId(routeId) ?? meta.dokumentasiId ?? null;

    const hasAccess = await assertPpkAksesTagihan(
      db,
      tagihanId,
      ppkData.fakultasId,
      dokumentasiId,
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

    if (keputusan === "terverifikasi" && dokumentasiId) {
      const [dokumentasi] = await db
        .select({
          tipeDokumen: dokumentasiKegiatanTable.tipeDokumen,
          namaToko: dokumentasiKegiatanTable.namaToko,
          nomorRekeningToko: dokumentasiKegiatanTable.nomorRekeningToko,
          namaPemilikRekeningToko: dokumentasiKegiatanTable.namaPemilikRekeningToko,
          fotoBarangUrl: dokumentasiKegiatanTable.fotoBarangUrl,
          strukBelanjaUrl: dokumentasiKegiatanTable.strukBelanjaUrl,
          namaPenyediaJasa: dokumentasiKegiatanTable.namaPenyediaJasa,
          nomorRekeningJasa: dokumentasiKegiatanTable.nomorRekeningJasa,
          namaPemilikRekeningJasa: dokumentasiKegiatanTable.namaPemilikRekeningJasa,
          skUrl: dokumentasiKegiatanTable.skUrl,
          spmtUrl: dokumentasiKegiatanTable.spmtUrl,
          amprahUrl: dokumentasiKegiatanTable.amprahUrl,
          npwpUrl: dokumentasiKegiatanTable.npwpUrl,
          ktpUrl: dokumentasiKegiatanTable.ktpUrl,
        })
        .from(dokumentasiKegiatanTable)
        .where(eq(dokumentasiKegiatanTable.id, dokumentasiId));

      if (dokumentasi) {
        const docs = buildDokumenUpload({
          dokumentasiId,
          kegiatanId: 0,
          tipeDokumen: dokumentasi.tipeDokumen,
          deskripsi: null,
          createdAt: "",
          ...dokumentasi,
        });

        if (!isAllDocsUploaded(docs)) {
          throw createError({
            statusCode: 422,
            statusMessage:
              "Dokumen ormawa belum lengkap. Minta revisi jika ada yang kurang.",
          });
        }
      }
    }

    const statusBaru =
      keputusan === "terverifikasi" ? "DOKUMEN_LENGKAP" : "DIKEMBALIKAN";

    if (dokumentasiId) {
      await writePencairanMeta(tagihanId, { dokumentasiId });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(tagihanPencairanTable)
        .set({
          statusTagihan: statusBaru,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tagihanPencairanTable.id, id));

      await tx.insert(logDokumentasiTagihanTable).values({
        tagihanId: id,
        action: keputusan === "terverifikasi" ? "approve" : "revisi",
        komentar: catatan?.trim() || (keputusan === "terverifikasi" ? "Dokumen diverifikasi" : "Perlu perbaikan"),
        userId: Number(user.id),
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
