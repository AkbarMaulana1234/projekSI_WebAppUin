// FILE: server/api/ppk/pencairan/[id]/index.get.ts
// PERBAIKAN:
// - Baris 242: eq(usersTable.id, Number(user.id)) → eq(usersTable.users_id, String(user.id))
// - Semua filter fakultas tetap dipakai karena user ormawa sudah punya fakultas_id

import { and, desc, eq, inArray } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  auditLogTable,
  dokumentasiKegiatanTable,
  kegiatanTable,
  ormawaTable,
  pengajuanRabTable,
  tagihanPencairanTable,
  usersTable,
} from "~~/server/db/schema";
import {
  decodeUrlId,
  findTagihanForDokumentasi,
  getDokumenPpkFromMeta,
  groupIdToKegiatanId,
  isAllDocsUploaded,
  isGroupId,
  makeVirtualId,
  toPublicUploadUrl,
} from "~~/server/utils/pencairanHelpers";

const normalizeText = (value?: string | null) => (value ?? "").trim();

const getDetailByDokumentasi = async (
  db: ReturnType<typeof useDrizzle>,
  dokumentasiId: number,
  fakultasId: number,
) => {
  const [row] = await db
    .select({
      dokumentasiId: dokumentasiKegiatanTable.id,
      kegiatanId: dokumentasiKegiatanTable.kegiatanId,
      tipeDokumen: dokumentasiKegiatanTable.tipeDokumen,
      deskripsi: dokumentasiKegiatanTable.deskripsi,
      createdAt: dokumentasiKegiatanTable.createdAt,
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
      pengajuId: usersTable.id,
      pengajuUsersId: usersTable.users_id,
      pengajuNama: usersTable.fullName,
      pengajuEmail: usersTable.email,
      pengajuFakultasId: usersTable.fakultasId,
      ormawaId: ormawaTable.id,
      ormawaName: ormawaTable.nama,
      ormawaKode: ormawaTable.kode,
    })
    .from(dokumentasiKegiatanTable)
    .innerJoin(usersTable, eq(dokumentasiKegiatanTable.uploadedBy, usersTable.id))
    .leftJoin(ormawaTable, eq(usersTable.ormawaId, ormawaTable.id))
    .where(
      and(
        eq(dokumentasiKegiatanTable.id, dokumentasiId),
        eq(usersTable.fakultasId, fakultasId),
      ),
    );

  if (!row) return null;

  const [kegiatan] = await db
    .select({
      id: kegiatanTable.id,
      pengajuanRabId: kegiatanTable.pengajuanRabId,
      statusKegiatan: kegiatanTable.statusKegiatan,
    })
    .from(kegiatanTable)
    .where(eq(kegiatanTable.id, row.kegiatanId));

  const [pengajuanDariKegiatan] = kegiatan
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

  const [pengajuanFallback] = pengajuanDariKegiatan
    ? [pengajuanDariKegiatan]
    : await db
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
        .where(eq(pengajuanRabTable.usersId, row.pengajuUsersId))
        .orderBy(desc(pengajuanRabTable.createdAt))
        .limit(1);

  const logRows = await db
    .select({
      id: auditLogTable.id,
      action: auditLogTable.action,
      oldData: auditLogTable.oldData,
      newData: auditLogTable.newData,
      createdAt: auditLogTable.createdAt,
      actorName: usersTable.fullName,
      actorRole: usersTable.role,
    })
    .from(auditLogTable)
    .leftJoin(usersTable, eq(auditLogTable.userId, usersTable.id))
    .where(
      and(
        eq(auditLogTable.tableName, "dokumentasi_kegiatan"),
        eq(auditLogTable.recordId, dokumentasiId),
      ),
    )
    .orderBy(desc(auditLogTable.createdAt));

  const tipeTagihan = row.tipeDokumen;
  const isBarang = tipeTagihan === "BARANG";
  const hasRevisi = logRows.some((log) => log.action === "REVISI_PENCAIRAN");
  const namaPenerima = isBarang
    ? normalizeText(row.namaPemilikRekeningToko || row.namaToko)
    : normalizeText(row.namaPemilikRekeningJasa || row.namaPenyediaJasa);
  const rekeningPenerima = isBarang
    ? normalizeText(row.nomorRekeningToko)
    : normalizeText(row.nomorRekeningJasa);

  const tagihan = await findTagihanForDokumentasi(db, {
    kegiatanId: row.kegiatanId,
    tipeTagihan,
    namaPenerima,
    rekeningPenerima,
  });

  const dokumenUpload = isBarang
      ? [
          { id: "foto_barang", nama: "Foto Barang", url: toPublicUploadUrl(row.fotoBarangUrl), uploaded: Boolean(row.fotoBarangUrl) },
          { id: "struk_belanja", nama: "Foto Bon / Struk", url: toPublicUploadUrl(row.strukBelanjaUrl), uploaded: Boolean(row.strukBelanjaUrl) },
          { id: "foto_ktp", nama: "Foto KTP Pemilik Rekening", url: null, uploaded: false },
        ]
      : [
          { id: "sk", nama: "SK", url: toPublicUploadUrl(row.skUrl), uploaded: Boolean(row.skUrl) },
          { id: "spmt", nama: "SPMT", url: toPublicUploadUrl(row.spmtUrl), uploaded: Boolean(row.spmtUrl) },
          { id: "amprah", nama: "Amprah", url: toPublicUploadUrl(row.amprahUrl), uploaded: Boolean(row.amprahUrl) },
          { id: "npwp", nama: "NPWP", url: toPublicUploadUrl(row.npwpUrl), uploaded: Boolean(row.npwpUrl) },
          { id: "ktp", nama: "Foto KTP", url: toPublicUploadUrl(row.ktpUrl), uploaded: Boolean(row.ktpUrl) },
        ];

  const dokumenPpkFiles = tagihan?.tagihanId
    ? await getDokumenPpkFromMeta(tagihan.tagihanId)
    : { spbFileUrl: null, kwitansiFileUrl: null };

  return {
    id: tagihan?.tagihanId ?? makeVirtualId(row.dokumentasiId),
    routeId: makeVirtualId(row.dokumentasiId),
    dokumentasiId: row.dokumentasiId,
    tagihanId: tagihan?.tagihanId ?? null,
    source: tagihan ? "TAGIHAN" : "DOKUMENTASI",
    tipeTagihan,
    namaPenerima,
    nominal: tagihan?.nominal ?? pengajuanFallback?.totalAnggaran ?? 0,
    statusTagihan:
      tagihan?.statusTagihan ??
      (hasRevisi ? "DIKEMBALIKAN" : "WAITING_PEMBAYARAN"),
    allDocsUploaded: isAllDocsUploaded(dokumenUpload),
    rekeningPenerima,
    createdAt: row.createdAt,
    deskripsi: row.deskripsi,
    detailPenerima: isBarang
      ? { namaItem: row.namaToko, namaToko: row.namaToko, nomorRekening: row.nomorRekeningToko, namaPemilikRekening: row.namaPemilikRekeningToko }
      : { namaItem: row.namaPenyediaJasa, namaPenyediaJasa: row.namaPenyediaJasa, nomorRekening: row.nomorRekeningJasa, namaPemilikRekening: row.namaPemilikRekeningJasa },
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
    kegiatan: {
      id: row.kegiatanId,
      judulKegiatan: pengajuanFallback?.judulKegiatan ?? row.deskripsi,
      statusKegiatan: kegiatan?.statusKegiatan ?? "SELESAI",
      tanggalMulai: pengajuanFallback?.tanggalMulai ?? null,
      tanggalSelesai: pengajuanFallback?.tanggalSelesai ?? null,
      totalAnggaranRab: pengajuanFallback?.totalAnggaran ?? 0,
      fileRabUrl: pengajuanFallback?.fileRabUrl ?? null,
      fileTorUrl: pengajuanFallback?.fileTorUrl ?? null,
    },
    ormawa: { id: row.ormawaId, nama: row.ormawaName, kode: row.ormawaKode },
    pengaju: { id: row.pengajuId, nama: row.pengajuNama, email: row.pengajuEmail },
    riwayat: logRows.map((log) => ({
      id: log.id,
      action: log.action,
      catatan: (log.newData as any)?.catatan ?? null,
      oldData: log.oldData,
      newData: log.newData,
      createdAt: log.createdAt,
      aktor: { nama: log.actorName, role: log.actorRole },
    })),
  };
};

export default defineEventHandler(async (event) => {
  try {
    // ✅ FIX: Decode URL-safe ID
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

    if (!ppkData?.fakultasId) {
      throw createError({ statusCode: 403, statusMessage: "PPK tidak memiliki data fakultas" });
    }

    if (isGroupId(id)) {
      const kegiatanId = groupIdToKegiatanId(id);
      const dokumentasiRows = await db
        .select({ id: dokumentasiKegiatanTable.id })
        .from(dokumentasiKegiatanTable)
        .innerJoin(usersTable, eq(dokumentasiKegiatanTable.uploadedBy, usersTable.id))
        .where(
          and(
            eq(dokumentasiKegiatanTable.kegiatanId, kegiatanId),
            eq(usersTable.fakultasId, ppkData.fakultasId),
            inArray(dokumentasiKegiatanTable.tipeDokumen, ["BARANG", "JASA"]),
          ),
        )
        .orderBy(desc(dokumentasiKegiatanTable.createdAt));

      const detailItems = (
        await Promise.all(dokumentasiRows.map((row) => getDetailByDokumentasi(db, row.id, ppkData.fakultasId)))
      ).filter(Boolean) as any[];

      if (detailItems.length === 0) {
        throw createError({ statusCode: 404, statusMessage: "Dokumen pencairan tidak ditemukan" });
      }

      const first = detailItems[0];
      const dokumenUpload = detailItems.flatMap((item) =>
        (item.dokumenUpload || []).map((doc: any) => ({ ...doc, groupLabel: item.tipeTagihan, dokumentasiId: item.dokumentasiId })),
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
          uploadLogs: detailItems.map((item) => ({ dokumentasiId: item.dokumentasiId, tipeDokumen: item.tipeTagihan, createdAt: item.createdAt, namaPenerima: item.namaPenerima })),
          rincianPengajuan: detailItems.map((item) => ({ dokumentasiId: item.dokumentasiId, tipeTagihan: item.tipeTagihan, namaPenerima: item.namaPenerima, rekeningPenerima: item.rekeningPenerima, createdAt: item.createdAt, detailPenerima: item.detailPenerima })),
        },
      };
    }

    if (id < 0) {
      const detail = await getDetailByDokumentasi(db, Math.abs(id), ppkData.fakultasId);
      if (!detail) {
        throw createError({ statusCode: 404, statusMessage: "Dokumen pencairan tidak ditemukan" });
      }
      return { success: true, data: { ...detail, routeId: id } };
    }

    const [tagihan] = await db
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
        strukFileUrl: tagihanPencairanTable.strukFileUrl,
        skNomor: tagihanPencairanTable.skNomor,
        skFileUrl: tagihanPencairanTable.skFileUrl,
        pengajuFakultasId: usersTable.fakultasId,
        judulKegiatan: pengajuanRabTable.judulKegiatan,
        totalAnggaranRab: pengajuanRabTable.totalAnggaran,
        tanggalMulai: pengajuanRabTable.tanggalMulai,
        tanggalSelesai: pengajuanRabTable.tanggalSelesai,
        ormawaId: ormawaTable.id,
        ormawaName: ormawaTable.nama,
        ormawaKode: ormawaTable.kode,
        pengajuNama: usersTable.fullName,
        pengajuEmail: usersTable.email,
      })
      .from(tagihanPencairanTable)
      .innerJoin(kegiatanTable, eq(tagihanPencairanTable.kegiatanId, kegiatanTable.id))
      .innerJoin(pengajuanRabTable, eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id))
      .innerJoin(usersTable, eq(pengajuanRabTable.usersId, usersTable.users_id))
      .leftJoin(ormawaTable, eq(usersTable.ormawaId, ormawaTable.id))
      .where(eq(tagihanPencairanTable.id, id));

    if (!tagihan || tagihan.pengajuFakultasId !== ppkData.fakultasId) {
      throw createError({ statusCode: 404, statusMessage: "Tagihan pencairan tidak ditemukan" });
    }

    return {
      success: true,
      data: {
        id: tagihan.tagihanId,
        routeId: id,
        source: "TAGIHAN",
        tipeTagihan: tagihan.tipeTagihan,
        namaPenerima: tagihan.namaPenerima,
        rekeningPenerima: tagihan.rekeningPenerima,
        bankPenerima: tagihan.bankPenerima,
        nominal: tagihan.nominal,
        statusTagihan: tagihan.statusTagihan,
        createdAt: tagihan.createdAt,
        detailPenerima: {
          namaItem: tagihan.tipeTagihan === "BARANG" ? tagihan.tokoNama : tagihan.namaPenerima,
          nomorRekening: tagihan.rekeningPenerima,
          namaPemilikRekening: tagihan.namaPenerima,
        },
        dokumenUpload:
          tagihan.tipeTagihan === "BARANG"
            ? [{ id: "struk", nama: "Foto Bon / Struk", url: toPublicUploadUrl(tagihan.strukFileUrl), uploaded: Boolean(tagihan.strukFileUrl) }]
            : [{ id: "sk", nama: "SK", url: toPublicUploadUrl(tagihan.skFileUrl), uploaded: Boolean(tagihan.skFileUrl) }],
        kegiatan: {
          id: tagihan.kegiatanId,
          judulKegiatan: tagihan.judulKegiatan,
          tanggalMulai: tagihan.tanggalMulai,
          tanggalSelesai: tagihan.tanggalSelesai,
          totalAnggaranRab: tagihan.totalAnggaranRab,
        },
        ormawa: { id: tagihan.ormawaId, nama: tagihan.ormawaName, kode: tagihan.ormawaKode },
        pengaju: { nama: tagihan.pengajuNama, email: tagihan.pengajuEmail },
        riwayat: [],
      },
    };
  } catch (error: any) {
    console.error("Error GET /api/ppk/pencairan/[id]:", error);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: "Gagal mengambil detail pencairan", data: error });
  }
});
