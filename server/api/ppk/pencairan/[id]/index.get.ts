import { eq } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  tagihanPencairanTable,
  kegiatanTable,
  pengajuanRabTable,
  usersTable,
  ormawaTable,
  pembayaranTable,
} from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, "id"));
    if (isNaN(id) || id <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID tagihan tidak valid",
      });
    }

    const db = useDrizzle();

    // Detail tagihan lengkap
    const [tagihan] = await db
      .select({
        // Tagihan — semua field
        tagihanId: tagihanPencairanTable.id,
        tipeTagihan: tagihanPencairanTable.tipeTagihan,
        namaPenerima: tagihanPencairanTable.namaPenerima,
        rekeningPenerima: tagihanPencairanTable.rekeningPenerima,
        bankPenerima: tagihanPencairanTable.bankPenerima,
        nominal: tagihanPencairanTable.nominal,
        statusTagihan: tagihanPencairanTable.statusTagihan,
        createdAt: tagihanPencairanTable.createdAt,
        updatedAt: tagihanPencairanTable.updatedAt,
        // Field BARANG
        tokoNama: tagihanPencairanTable.tokoNama,
        tokoAlamat: tagihanPencairanTable.tokoAlamat,
        strukFileUrl: tagihanPencairanTable.strukFileUrl,
        // Field JASA
        skNomor: tagihanPencairanTable.skNomor,
        skFileUrl: tagihanPencairanTable.skFileUrl,
        // Kegiatan
        kegiatanId: kegiatanTable.id,
        statusKegiatan: kegiatanTable.statusKegiatan,
        tanggalMulai: kegiatanTable.tanggalMulai,
        tanggalSelesai: kegiatanTable.tanggalSelesai,
        // RAB — untuk validasi nominal
        pengajuanId: pengajuanRabTable.id,
        nomorPengajuan: pengajuanRabTable.nomorPengajuan,
        judulKegiatan: pengajuanRabTable.judulKegiatan,
        totalAnggaranRab: pengajuanRabTable.totalAnggaran,
        fileRabUrl: pengajuanRabTable.fileRabUrl,
        fileTorUrl: pengajuanRabTable.fileTorUrl,
        // Ormawa
        ormawaId: ormawaTable.id,
        ormawaName: ormawaTable.nama,
        ormawaKode: ormawaTable.kode,
        // Pengaju
        pengajuNama: usersTable.fullName,
        pengajuEmail: usersTable.email,
      })
      .from(tagihanPencairanTable)
      .innerJoin(
        kegiatanTable,
        eq(tagihanPencairanTable.kegiatanId, kegiatanTable.id),
      )
      .innerJoin(
        pengajuanRabTable,
        eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id),
      )
      .innerJoin(
        usersTable,
        eq(pengajuanRabTable.usersId, usersTable.users_id),
      )
      .leftJoin(ormawaTable, eq(usersTable.ormawaId, ormawaTable.id))
      .where(eq(tagihanPencairanTable.id, id));

    if (!tagihan) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tagihan pencairan tidak ditemukan",
      });
    }

    // Ambil riwayat pembayaran jika sudah dibayar
    const riwayatPembayaran = await db
      .select({
        id: pembayaranTable.id,
        buktiTransferUrl: pembayaranTable.buktiTransferUrl,
        tanggalPembayaran: pembayaranTable.tanggalPembayaran,
        catatanPembayaran: pembayaranTable.catatanPembayaran,
        createdAt: pembayaranTable.createdAt,
        ppkNama: usersTable.fullName,
      })
      .from(pembayaranTable)
      .innerJoin(usersTable, eq(pembayaranTable.ppkId, usersTable.id))
      .where(eq(pembayaranTable.tagihanId, id));

    // Susun dokumen yang perlu dicek PPK berdasarkan tipe
    const dokumenWajib =
      tagihan.tipeTagihan === "BARANG"
        ? [
            { nama: "Foto barang", tersedia: false },
            { nama: "Bon pembelian (struk)", tersedia: !!tagihan.strukFileUrl },
            { nama: "Rekening pemilik toko", tersedia: !!tagihan.rekeningPenerima },
            { nama: "Foto KTP pemilik toko", tersedia: false },
          ]
        : [
            { nama: "SK (Surat Keputusan)", tersedia: !!tagihan.skFileUrl },
            { nama: "SPMT", tersedia: false },
            { nama: "Amprah", tersedia: false },
            { nama: "NPWP (jika PNS)", tersedia: false },
            { nama: "Rekening penerima", tersedia: !!tagihan.rekeningPenerima },
            { nama: "Foto KTP / tanda pengenal", tersedia: false },
          ];

    return {
      success: true,
      data: {
        id: tagihan.tagihanId,
        tipeTagihan: tagihan.tipeTagihan,
        namaPenerima: tagihan.namaPenerima,
        rekeningPenerima: tagihan.rekeningPenerima,
        bankPenerima: tagihan.bankPenerima,
        nominal: tagihan.nominal,
        statusTagihan: tagihan.statusTagihan,
        createdAt: tagihan.createdAt,
        updatedAt: tagihan.updatedAt,
        // Field spesifik tipe
        ...(tagihan.tipeTagihan === "BARANG"
          ? {
              tokoNama: tagihan.tokoNama,
              tokoAlamat: tagihan.tokoAlamat,
              strukFileUrl: tagihan.strukFileUrl,
            }
          : {
              skNomor: tagihan.skNomor,
              skFileUrl: tagihan.skFileUrl,
            }),
        // Validasi nominal vs RAB
        validasiNominal: {
          nominalTagihan: Number(tagihan.nominal),
          totalAnggaranRab: Number(tagihan.totalAnggaranRab),
          selisih:
            Number(tagihan.totalAnggaranRab) - Number(tagihan.nominal),
          statusValidasi:
            Number(tagihan.nominal) <= Number(tagihan.totalAnggaranRab)
              ? "VALID"
              : "MELEBIHI_RAB",
        },
        dokumenWajib,
        kegiatan: {
          id: tagihan.kegiatanId,
          judulKegiatan: tagihan.judulKegiatan,
          nomorPengajuan: tagihan.nomorPengajuan,
          statusKegiatan: tagihan.statusKegiatan,
          tanggalMulai: tagihan.tanggalMulai,
          tanggalSelesai: tagihan.tanggalSelesai,
          fileRabUrl: tagihan.fileRabUrl,
          fileTorUrl: tagihan.fileTorUrl,
        },
        ormawa: {
          id: tagihan.ormawaId,
          nama: tagihan.ormawaName,
          kode: tagihan.ormawaKode,
        },
        pengaju: {
          nama: tagihan.pengajuNama,
          email: tagihan.pengajuEmail,
        },
        riwayatPembayaran: riwayatPembayaran.map((p) => ({
          id: p.id,
          buktiTransferUrl: p.buktiTransferUrl,
          tanggalPembayaran: p.tanggalPembayaran,
          catatan: p.catatanPembayaran,
          createdAt: p.createdAt,
          ppk: p.ppkNama,
        })),
      },
    };
  } catch (error: any) {
    console.error("Error GET /api/ppk/pencairan/[id]:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil detail pencairan",
      data: error,
    });
  }
});