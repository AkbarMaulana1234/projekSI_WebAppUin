import { and, desc, eq, inArray, or } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  kegiatanTable,
  ormawaTable,
  pengajuanRabTable,
  tagihanPencairanTable,
  usersTable,
  pembayaranTable,
  logDokumentasiTagihanTable,
} from "~~/server/db/schema";
import {
  decodeUrlId,
  getDokumenPpkFromMeta,
  groupIdToKegiatanId,
  isAllDocsUploaded,
  isGroupId,
  toPublicUploadUrl,
  resolveVirtualStatus,
} from "~~/server/utils/pencairanHelpers";
import { showDekripsi } from "~~/server/utils/enkripsiData";

const getDetailByTagihan = async (
  db: ReturnType<typeof useDrizzle>,
  tagihanId: number,
  fakultasId: string,
) => {
  const [row] = await db
    .select({
      tagihanId: tagihanPencairanTable.id,
      kegiatanId: tagihanPencairanTable.kegiatanId,
      tipeTagihan: tagihanPencairanTable.tipeTagihan,
      namaPenerima: tagihanPencairanTable.namaPenerima,
      rekeningPenerima: tagihanPencairanTable.rekeningPenerima,
      bankPenerima: tagihanPencairanTable.bankPenerima,
      nominal: tagihanPencairanTable.nominal,
      statusTagihan: tagihanPencairanTable.statusTagihan,
      createdAt: tagihanPencairanTable.createdAt,
      tokoNama: tagihanPencairanTable.tokoNama,
      tokoAlamat: tagihanPencairanTable.tokoAlamat,
      strukFileUrl: tagihanPencairanTable.strukFileUrl,
      fotoBarangUrl: tagihanPencairanTable.fotoBarangUrl,
      skNomor: tagihanPencairanTable.skNomor,
      skFileUrl: tagihanPencairanTable.skFileUrl,
      spmtNomor: tagihanPencairanTable.spmtNomor,
      spmtFileUrl: tagihanPencairanTable.spmtFileUrl,
      amprahNomor: tagihanPencairanTable.amprahNomor,
      amprahFileUrl: tagihanPencairanTable.amprahFileUrl,
      npwpNomor: tagihanPencairanTable.npwpNomor,
      npwpFileUrl: tagihanPencairanTable.npwpFileUrl,
      ktpNomor: tagihanPencairanTable.ktpNomor,
      ktpFileUrl: tagihanPencairanTable.ktpFileUrl,
      bukuRekeningFileUrl: tagihanPencairanTable.bukuRekeningFileUrl,
      
      pengajuId: usersTable.id,
      pengajuUsersId: usersTable.users_id,
      pengajuNama: usersTable.fullName,
      pengajuEmail: usersTable.email,
      pengajuFakultasId: usersTable.fakultasId,
      
      ormawaId: ormawaTable.id,
      ormawaName: ormawaTable.nama,
      ormawaKode: ormawaTable.kode,
    })
    .from(tagihanPencairanTable)
    .innerJoin(usersTable, eq(tagihanPencairanTable.createdBy, usersTable.id))
    .leftJoin(ormawaTable, eq(usersTable.ormawaId, ormawaTable.id))
    .where(eq(tagihanPencairanTable.id, tagihanId));

  if (!row) return null;

  const virtualStatus = await resolveVirtualStatus(row.statusTagihan, tagihanId);

  const namaPenerimaDecrypted = showDekripsi(row.namaPenerima);
  const rekeningPenerimaDecrypted = showDekripsi(row.rekeningPenerima);
  const bankPenerimaDecrypted = showDekripsi(row.bankPenerima);
  const skNomorDecrypted = showDekripsi(row.skNomor);
  const spmtNomorDecrypted = showDekripsi(row.spmtNomor);
  const amprahNomorDecrypted = showDekripsi(row.amprahNomor);
  const npwpNomorDecrypted = showDekripsi(row.npwpNomor);
  const ktpNomorDecrypted = showDekripsi(row.ktpNomor);

  const [kegiatan] = await db
    .select({
      id: kegiatanTable.id,
      pengajuanRabId: kegiatanTable.pengajuanRabId,
      statusKegiatan: kegiatanTable.statusKegiatan,
    })
    .from(kegiatanTable)
    .where(eq(kegiatanTable.id, row.kegiatanId));

  const [pengajuan] = kegiatan
    ? await db
        .select({
          id: pengajuanRabTable.id,
          nomorPengajuan: pengajuanRabTable.nomorPengajuan,
          judulKegiatan: pengajuanRabTable.judulKegiatan,
          deskripsi: pengajuanRabTable.deskripsi,
          totalAnggaran: pengajuanRabTable.totalAnggaran,
          tanggalMulai: pengajuanRabTable.tanggalMulai,
          tanggalSelesai: pengajuanRabTable.tanggalSelesai,
          fileRabUrl: pengajuanRabTable.fileRabUrl,
          fileTorUrl: pengajuanRabTable.fileTorUrl,
          status: pengajuanRabTable.status,
          createdAt: pengajuanRabTable.createdAt,
        })
        .from(pengajuanRabTable)
        .where(eq(pengajuanRabTable.id, kegiatan.pengajuanRabId))
    : [];

  const logRows = await db
    .select({
      id: logDokumentasiTagihanTable.id,
      action: logDokumentasiTagihanTable.action,
      komentar: logDokumentasiTagihanTable.komentar,
      createdAt: logDokumentasiTagihanTable.createdAt,
      actorName: usersTable.fullName,
      actorRole: usersTable.role,
    })
    .from(logDokumentasiTagihanTable)
    .leftJoin(usersTable, eq(logDokumentasiTagihanTable.userId, usersTable.id))
    .where(eq(logDokumentasiTagihanTable.tagihanId, tagihanId))
    .orderBy(desc(logDokumentasiTagihanTable.createdAt));

  const [pembayaran] = await db
    .select({
      id: pembayaranTable.id,
      buktiTransferUrl: pembayaranTable.buktiTransferUrl,
      catatanPembayaran: pembayaranTable.catatanPembayaran,
      tanggalPembayaran: pembayaranTable.tanggalPembayaran,
    })
    .from(pembayaranTable)
    .where(eq(pembayaranTable.tagihanId, tagihanId));

  const isBarang = row.tipeTagihan === "BARANG";
  
  const dokumenUpload = isBarang
    ? [
        {
          id: "foto_barang",
          nama: "Foto Barang",
          url: toPublicUploadUrl(row.fotoBarangUrl),
          uploaded: Boolean(row.fotoBarangUrl),
        },
        {
          id: "struk_belanja",
          nama: "Foto Bon / Struk",
          url: toPublicUploadUrl(row.strukFileUrl),
          uploaded: Boolean(row.strukFileUrl),
        },
      ]
    : [
        {
          id: "sk",
          nama: "SK",
          url: toPublicUploadUrl(row.skFileUrl),
          uploaded: Boolean(row.skFileUrl),
        },
        {
          id: "spmt",
          nama: "SPMT",
          url: toPublicUploadUrl(row.spmtFileUrl),
          uploaded: Boolean(row.spmtFileUrl),
        },
        {
          id: "amprah",
          nama: "Amprah",
          url: toPublicUploadUrl(row.amprahFileUrl),
          uploaded: Boolean(row.amprahFileUrl),
        },
        {
          id: "npwp",
          nama: "NPWP",
          url: toPublicUploadUrl(row.npwpFileUrl),
          uploaded: Boolean(row.npwpFileUrl),
        },
        {
          id: "ktp",
          nama: "Foto KTP",
          url: toPublicUploadUrl(row.ktpFileUrl),
          uploaded: Boolean(row.ktpFileUrl),
        },
        {
          id: "buku_rekening",
          nama: "Buku Rekening",
          url: toPublicUploadUrl(row.bukuRekeningFileUrl),
          uploaded: Boolean(row.bukuRekeningFileUrl),
        },
      ];

  const dokumenPpkFiles = await getDokumenPpkFromMeta(tagihanId);

  return {
    id: row.tagihanId,
    routeId: tagihanId,
    dokumentasiId: row.tagihanId,
    tagihanId: row.tagihanId,
    source: "TAGIHAN",
    tipeTagihan: row.tipeTagihan,
    namaPenerima: namaPenerimaDecrypted,
    nominal: Number(row.nominal),
    statusTagihan: virtualStatus,
    allDocsUploaded: isAllDocsUploaded(dokumenUpload),
    rekeningPenerima: rekeningPenerimaDecrypted,
    bankPenerima: bankPenerimaDecrypted,
    createdAt: row.createdAt,
    deskripsi: isBarang
      ? `Pembelian Barang di ${row.tokoNama || "-"}`
      : `Pembayaran Jasa: ${namaPenerimaDecrypted || "-"}`,
    detailPenerima: isBarang
      ? {
          namaItem: row.tokoNama,
          namaToko: row.tokoNama,
          nomorRekening: rekeningPenerimaDecrypted,
          namaPemilikRekening: namaPenerimaDecrypted,
        }
      : {
          namaItem: namaPenerimaDecrypted,
          namaPenyediaJasa: namaPenerimaDecrypted,
          nomorRekening: rekeningPenerimaDecrypted,
          namaPemilikRekening: namaPenerimaDecrypted,
        },
    dokumenUpload,
    dokumenPpk: {
      spb: {
        nama: "Surat Perintah Bayar",
        url: toPublicUploadUrl(dokumenPpkFiles.spbFileUrl),
        uploaded: Boolean(dokumenPpkFiles.spbFileUrl),
      },
      kwitansi: {
        nama: "Kwitansi",
        url: toPublicUploadUrl(dokumenPpkFiles.kwitansiFileUrl),
        uploaded: Boolean(dokumenPpkFiles.kwitansiFileUrl),
      },
    },
    pembayaran: pembayaran
      ? {
          buktiTransferUrl: toPublicUploadUrl(pembayaran.buktiTransferUrl),
          catatan: pembayaran.catatanPembayaran,
          tanggalPembayaran: pembayaran.tanggalPembayaran,
        }
      : null,
    kegiatan: {
      id: row.kegiatanId,
      judulKegiatan: pengajuan?.judulKegiatan ?? (isBarang ? `Pembelian Barang di ${row.tokoNama}` : `Pembayaran Jasa ke ${namaPenerimaDecrypted}`),
      statusKegiatan: kegiatan?.statusKegiatan ?? "SELESAI",
      tanggalMulai: pengajuan?.tanggalMulai ?? null,
      tanggalSelesai: pengajuan?.tanggalSelesai ?? null,
      totalAnggaranRab: Number(pengajuan?.totalAnggaran ?? row.nominal),
      fileRabUrl: pengajuan?.fileRabUrl ?? null,
      fileTorUrl: pengajuan?.fileTorUrl ?? null,
    },
    ormawa: {
      id: row.ormawaId,
      nama: row.ormawaName,
      kode: row.ormawaKode,
    },
    pengaju: {
      id: row.pengajuId,
      nama: row.pengajuNama,
      email: row.pengajuEmail,
    },
    riwayat: logRows.map((log) => ({
      id: log.id,
      action: log.action,
      catatan: log.komentar,
      createdAt: log.createdAt,
      aktor: {
        nama: log.actorName,
        role: log.actorRole,
      },
    })),
  };
};

export default defineEventHandler(async (event) => {
  try {
    const rawId = getRouterParam(event, "id");
    const id = decodeUrlId(rawId);
    
    if (Number.isNaN(id) || id === 0) {
      throw createError({ statusCode: 400, statusMessage: "ID pencairan tidak valid" });
    }

    const user = event.context.user;
    const db = useDrizzle();

    const [ppkData] = await db
      .select({ fakultasId: usersTable.fakultasId })
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

    const ppkFakultasId = String(ppkData.fakultasId);
    const ppkFakultasIdNum = Number(ppkData.fakultasId);

    // Group view
    if (isGroupId(id)) {
      const kegiatanId = groupIdToKegiatanId(id);
      const tagihanRows = await db
        .select({ id: tagihanPencairanTable.id })
        .from(tagihanPencairanTable)
        .innerJoin(usersTable, eq(tagihanPencairanTable.createdBy, usersTable.id))
        .leftJoin(ormawaTable, eq(usersTable.ormawaId, ormawaTable.id))
        .where(
          and(
            eq(tagihanPencairanTable.kegiatanId, kegiatanId),
            or(
              eq(tagihanPencairanTable.fakultasId, ppkFakultasId),
              eq(usersTable.fakultasId, ppkFakultasIdNum),
              eq(ormawaTable.fakultasId, ppkFakultasIdNum),
            ),
            inArray(tagihanPencairanTable.tipeTagihan, ["BARANG", "JASA"]),
          ),
        );

      const detailItems = (
        await Promise.all(
          tagihanRows.map((row) => getDetailByTagihan(db, row.id, ppkFakultasId))
        )
      ).filter(Boolean) as any[];

      if (detailItems.length === 0) {
        throw createError({ statusCode: 404, statusMessage: "Dokumen pencairan tidak ditemukan" });
      }

      const first = detailItems[0];
      const dokumenUpload = detailItems.flatMap((item) =>
        (item.dokumenUpload || []).map((doc: any) => ({ ...doc, groupLabel: item.tipeTagihan, dokumentasiId: item.id })),
      );

      return {
        success: true,
        data: {
          ...first,
          id,
          routeId: id,
          source: "DOKUMENTASI_GROUP",
          tipeTagihan: Array.from(new Set(detailItems.map((item) => item.tipeTagihan))).join(", "),
          statusTagihan: detailItems.some((item) => item.statusTagihan === "DIKEMBALIKAN") ? "DIKEMBALIKAN" : first.statusTagihan,
          dokumenUpload,
          riwayat: detailItems.flatMap((item) => item.riwayat || []),
          uploadLogs: detailItems.map((item) => ({ dokumentasiId: item.id, tipeDokumen: item.tipeTagihan, createdAt: item.createdAt, namaPenerima: item.namaPenerima })),
          rincianPengajuan: detailItems.map((item) => ({
            dokumentasiId: item.id,
            tipeTagihan: item.tipeTagihan,
            namaPenerima: item.namaPenerima,
            rekeningPenerima: item.rekeningPenerima,
            createdAt: item.createdAt,
            detailPenerima: item.detailPenerima,
            statusTagihan: item.statusTagihan,
          })),
        },
      };
    }

    // Single item view (whether path was v5 or 5, we decode it to positive tagihanId)
    const tagihanId = Math.abs(id);
    const detail = await getDetailByTagihan(db, tagihanId, ppkFakultasId);
    
    if (!detail) {
      throw createError({ statusCode: 404, statusMessage: "Detail pencairan tidak ditemukan" });
    }

    return {
      success: true,
      data: {
        ...detail,
        routeId: id,
      },
    };
  } catch (error: any) {
    console.error("Error GET /api/ppk/pencairan/[id]:", error);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: "Gagal mengambil detail pencairan", data: error });
  }
});
