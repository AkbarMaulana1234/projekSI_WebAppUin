import { useDrizzle } from "~~/server/db";
import { eq } from "drizzle-orm";
import { dokumentasiKegiatanTable } from "~~/server/db/schema/dokumentasiSchema";
import { tagihanPencairanTable } from "~~/server/db/schema/TagihanPencairanSchema";
import { kegiatanTable } from "~~/server/db/schema/KegiatanSchema";
import { showDekripsi } from "~~/server/utils/enkripsiData";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const { kegiatanId, page, row } = body;
    if (!kegiatanId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "kegiatanId wajib disertakan",
      });
    }

    const db = useDrizzle();

    // Ambil data Dokumentasi + statusKegiatan
    const rawDokumen = await db
      .select({
        id: dokumentasiKegiatanTable.id,
        deskripsi: dokumentasiKegiatanTable.deskripsi,
        tipeDokumen: dokumentasiKegiatanTable.tipeDokumen,
        fileUrl: dokumentasiKegiatanTable.fileUrl,
        status: dokumentasiKegiatanTable.status,
        createdAt: dokumentasiKegiatanTable.createdAt,
        statusKegiatan: kegiatanTable.statusKegiatan,
      })
      .from(dokumentasiKegiatanTable)
      .innerJoin(kegiatanTable, eq(dokumentasiKegiatanTable.kegiatanId, kegiatanTable.id))
      .where(eq(dokumentasiKegiatanTable.kegiatanId, kegiatanId));

    // Ambil data Tagihan Pencairan (Barang & Jasa) + statusKegiatan
    const rawTagihan = await db
      .select({
        id: tagihanPencairanTable.id,
        tipeTagihan: tagihanPencairanTable.tipeTagihan,
        nominal: tagihanPencairanTable.nominal,
        namaPenerima: tagihanPencairanTable.namaPenerima,
        rekeningPenerima: tagihanPencairanTable.rekeningPenerima,
        bankPenerima: tagihanPencairanTable.bankPenerima,
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
        statusTagihan: tagihanPencairanTable.statusTagihan,
        createdAt: tagihanPencairanTable.createdAt,
        statusKegiatan: kegiatanTable.statusKegiatan,
      })
      .from(tagihanPencairanTable)
      .innerJoin(kegiatanTable, eq(tagihanPencairanTable.kegiatanId, kegiatanTable.id))
      .where(eq(tagihanPencairanTable.kegiatanId, kegiatanId));

    // Gabungkan data
    const combined = [
      ...rawDokumen.map((d) => ({
        id: `doc_${d.id}`,
        realId: d.id,
        tipeData: "DOKUMENTASI",
        deskripsi: d.deskripsi,
        tipeDokumen: d.tipeDokumen,
        fileUrl: d.fileUrl,
        status: d.status,
        createdAt: d.createdAt,
        statusKegiatan: d.statusKegiatan,
      })),
      ...rawTagihan.map((t) => {
        return {
          id: `tagihan_${t.id}`,
          realId: t.id,
          tipeData: "TAGIHAN",
          tipeDokumen: t.tipeTagihan, // 'BARANG' atau 'JASA'
          deskripsi:
            t.tipeTagihan === "BARANG"
              ? `Pembelian Barang: ${t.tokoNama || "-"}`
              : `Pembayaran Jasa: ${showDekripsi(t.namaPenerima) || "-"}`,
          nominal: t.nominal,
          namaPenerima: showDekripsi(t.namaPenerima),
          rekeningPenerima: showDekripsi(t.rekeningPenerima),
          bankPenerima: showDekripsi(t.bankPenerima),
          tokoNama: t.tokoNama,
          tokoAlamat: t.tokoAlamat,
          strukFileUrl: t.strukFileUrl,
          fotoBarangUrl: t.fotoBarangUrl,
          skNomor: showDekripsi(t.skNomor),
          skFileUrl: t.skFileUrl,
          spmtNomor: showDekripsi(t.spmtNomor),
          spmtFileUrl: t.spmtFileUrl,
          amprahNomor: showDekripsi(t.amprahNomor),
          amprahFileUrl: t.amprahFileUrl,
          npwpNomor: showDekripsi(t.npwpNomor),
          npwpFileUrl: t.npwpFileUrl,
          ktpNomor: showDekripsi(t.ktpNomor),
          ktpFileUrl: t.ktpFileUrl,
          bukuRekeningFileUrl: t.bukuRekeningFileUrl,
          statusTagihan: t.statusTagihan,
          createdAt: t.createdAt,
          statusKegiatan: t.statusKegiatan,
        };
      }),
    ];

    // Urutkan dari yang terbaru
    combined.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );

    const total = combined.length;
    const currentPage = Number(page) || 1;
    const itemsPerPage = Number(row) || 5;
    const offset = (currentPage - 1) * itemsPerPage;

    const paginated = combined.slice(offset, offset + itemsPerPage);

    return {
      success: true,
      data: paginated,
      total: total,
      page: currentPage,
      row: itemsPerPage,
      totalPages: Math.ceil(total / itemsPerPage),
    };
  } catch (error: any) {
    console.error("Error fetching dokumentasi:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Gagal mengambil data dokumentasi",
    });
  }
});
