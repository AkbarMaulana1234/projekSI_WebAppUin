import { and, desc, eq, inArray, or } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  kegiatanTable,
  ormawaTable,
  pengajuanRabTable,
  tagihanPencairanTable,
  usersTable,
} from "~~/server/db/schema";
import { User } from "~~/server/interface/userInterface";
import { showDekripsi } from "~~/server/utils/enkripsiData";
import { resolveVirtualStatus } from "~~/server/utils/pencairanHelpers";

const normalizeText = (value?: string | null) => (value ?? "").trim();

const toPublicUploadUrl = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.replace(/\\/g, "/");
  const uploadsIndex = normalized.toLowerCase().lastIndexOf("/uploads/");
  if (uploadsIndex >= 0) return normalized.slice(uploadsIndex);
  if (normalized.startsWith("uploads/")) return `/${normalized}`;
  if (normalized.startsWith("/uploads/")) return normalized;
  return normalized;
};

const makeGroupId = (kegiatanId: number) => -(1_000_000 + Math.abs(kegiatanId));

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const user = event.context.user as User;

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

    // tagihanPencairanTable.fakultasId is varchar, usersTable/ormawaTable.fakultasId is bigint
    const ppkFakultasIdStr = String(ppkData.fakultasId);
    const ppkFakultasIdNum = Number(ppkData.fakultasId);

    const tagihanRows = await db
      .select({
        id: tagihanPencairanTable.id,
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
        fotoBarangUrl: tagihanPencairanTable.fotoBarangUrl,
        skFileUrl: tagihanPencairanTable.skFileUrl,
        spmtFileUrl: tagihanPencairanTable.spmtFileUrl,
        amprahFileUrl: tagihanPencairanTable.amprahFileUrl,
        npwpFileUrl: tagihanPencairanTable.npwpFileUrl,
        ktpFileUrl: tagihanPencairanTable.ktpFileUrl,
        bukuRekeningFileUrl: tagihanPencairanTable.bukuRekeningFileUrl,
        
        ormawaId: ormawaTable.id,
        ormawaName: ormawaTable.nama,
        ormawaKode: ormawaTable.kode,
        
        judulKegiatan: pengajuanRabTable.judulKegiatan,
        statusKegiatan: kegiatanTable.statusKegiatan,
        tanggalMulai: pengajuanRabTable.tanggalMulai,
        tanggalSelesai: pengajuanRabTable.tanggalSelesai,
        totalAnggaranRab: pengajuanRabTable.totalAnggaran,
      })
      .from(tagihanPencairanTable)
      .innerJoin(kegiatanTable, eq(tagihanPencairanTable.kegiatanId, kegiatanTable.id))
      .innerJoin(pengajuanRabTable, eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id))
      .innerJoin(usersTable, eq(tagihanPencairanTable.createdBy, usersTable.id))
      .leftJoin(ormawaTable, eq(usersTable.ormawaId, ormawaTable.id))
      .where(
        and(
          or(
            eq(tagihanPencairanTable.fakultasId, ppkFakultasIdStr),
            eq(usersTable.fakultasId, ppkFakultasIdNum),
            eq(ormawaTable.fakultasId, ppkFakultasIdNum),
          ),
          inArray(tagihanPencairanTable.tipeTagihan, ["BARANG", "JASA"]),
        ),
      )
      .orderBy(desc(tagihanPencairanTable.createdAt));

    if (tagihanRows.length === 0) {
      return {
        success: true,
        summary: {
          totalTagihan: 0,
          totalMenunggu: 0,
          totalTerverifikasi: 0,
          totalSelesai: 0,
          totalDikembalikan: 0,
        },
        data: [],
      };
    }

    const data = await Promise.all(
      tagihanRows.map(async (row) => {
        const virtualStatus = await resolveVirtualStatus(row.statusTagihan, row.id);
        const namaPenerimaDecrypted = showDekripsi(row.namaPenerima);
        const rekeningPenerimaDecrypted = showDekripsi(row.rekeningPenerima);
        const bankPenerimaDecrypted = showDekripsi(row.bankPenerima);

        const isBarang = row.tipeTagihan === "BARANG";

        const syaratDokumen = isBarang
          ? [
              {
                id: "foto_barang",
                nama: "Foto Barang",
                uploaded: Boolean(row.fotoBarangUrl),
                url: toPublicUploadUrl(row.fotoBarangUrl),
              },
              {
                id: "struk_belanja",
                nama: "Bon pembelian (struk)",
                uploaded: Boolean(row.strukFileUrl),
                url: toPublicUploadUrl(row.strukFileUrl),
              },
              {
                id: "nama_toko",
                nama: "Nama Toko",
                uploaded: Boolean(row.tokoNama),
                url: null,
              },
              {
                id: "rekening_toko",
                nama: "No. Rekening Toko",
                uploaded: Boolean(rekeningPenerimaDecrypted),
                url: null,
              },
            ]
          : [
              {
                id: "sk",
                nama: "SK (Surat Keputusan)",
                uploaded: Boolean(row.skFileUrl),
                url: toPublicUploadUrl(row.skFileUrl),
              },
              {
                id: "spmt",
                nama: "SPMT",
                uploaded: Boolean(row.spmtFileUrl),
                url: toPublicUploadUrl(row.spmtFileUrl),
              },
              {
                id: "amprah",
                nama: "Amprah",
                uploaded: Boolean(row.amprahFileUrl),
                url: toPublicUploadUrl(row.amprahFileUrl),
              },
              {
                id: "npwp",
                nama: "NPWP (jika PNS)",
                uploaded: Boolean(row.npwpFileUrl),
                url: toPublicUploadUrl(row.npwpFileUrl),
              },
              {
                id: "ktp",
                nama: "Foto KTP / tanda pengenal",
                uploaded: Boolean(row.ktpFileUrl),
                url: toPublicUploadUrl(row.ktpFileUrl),
              },
              {
                id: "rekening_penerima",
                nama: "No. Rekening Penerima",
                uploaded: Boolean(rekeningPenerimaDecrypted),
                url: null,
              },
            ];

        return {
          id: row.id,
          tipeTagihan: row.tipeTagihan,
          namaPenerima: namaPenerimaDecrypted,
          nominal: Number(row.nominal),
          statusTagihan: virtualStatus,
          rekeningPenerima: rekeningPenerimaDecrypted,
          bankPenerima: bankPenerimaDecrypted,
          createdAt: row.createdAt,
          syaratDokumen,
          kegiatan: {
            id: row.kegiatanId,
            judulKegiatan: row.judulKegiatan || (isBarang ? `Pembelian Barang di ${row.tokoNama}` : `Pembayaran Jasa ke ${namaPenerimaDecrypted}`),
            statusKegiatan: row.statusKegiatan || "SELESAI",
            tanggalMulai: row.tanggalMulai || null,
            tanggalSelesai: row.tanggalSelesai || null,
            totalAnggaranRab: Number(row.totalAnggaranRab || row.nominal),
          },
          ormawa: {
            id: row.ormawaId,
            nama: row.ormawaName,
            kode: row.ormawaKode,
          },
        };
      }),
    );

    const groupedData = new Map<number, (typeof data)[number] & {
      tipeTagihanList: string[];
      uploadLogs: Array<{
        tagihanId: number;
        tipeDokumen: string;
        createdAt: string;
      }>;
    }>();

    for (const item of data) {
      const kegiatanId = item.kegiatan.id;
      const current = groupedData.get(kegiatanId);
      if (!current) {
        groupedData.set(kegiatanId, {
          ...item,
          id: makeGroupId(kegiatanId),
          tipeTagihan: item.tipeTagihan,
          tipeTagihanList: [item.tipeTagihan],
          syaratDokumen: [...item.syaratDokumen],
          uploadLogs: [
            {
              tagihanId: item.id,
              tipeDokumen: item.tipeTagihan,
              createdAt: item.createdAt,
            },
          ],
        });
        continue;
      }

      current.tipeTagihanList = Array.from(
        new Set([...current.tipeTagihanList, item.tipeTagihan]),
      );
      current.tipeTagihan = current.tipeTagihanList.join(", ");
      current.syaratDokumen.push(...item.syaratDokumen);
      current.uploadLogs.push({
        tagihanId: item.id,
        tipeDokumen: item.tipeTagihan,
        createdAt: item.createdAt,
      });

      if (item.statusTagihan === "DIKEMBALIKAN") {
        current.statusTagihan = "DIKEMBALIKAN";
      } else if (item.statusTagihan === "WAITING_PEMBAYARAN" && current.statusTagihan !== "DIKEMBALIKAN") {
        current.statusTagihan = "WAITING_PEMBAYARAN";
      }
    }

    const grouped = Array.from(groupedData.values())
      .map((row) => ({
        ...row,
        kegiatanId: row.kegiatan.id,
        jumlahUpload: row.uploadLogs?.length ?? 1,
        namaKegiatan: row.kegiatan.judulKegiatan,
        namaOrmawa: row.ormawa?.nama,
        kodeOrmawa: row.ormawa?.kode,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return {
      success: true,
      summary: {
        totalTagihan: grouped.length,
        totalMenunggu: grouped.filter((row) =>
          ["WAITING_PEMBAYARAN", "DIKEMBALIKAN"].includes(row.statusTagihan || ""),
        ).length,
        totalTerverifikasi: grouped.filter((row) =>
          ["DOKUMEN_LENGKAP", "TERVERIFIKASI"].includes(row.statusTagihan || ""),
        ).length,
        totalSelesai: grouped.filter((row) => row.statusTagihan === "SELESAI").length,
        totalDikembalikan: grouped.filter((row) => row.statusTagihan === "DIKEMBALIKAN").length,
      },
      data: grouped,
    };
  } catch (error: any) {
    console.error("Error GET /api/ppk/pencairan:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil data pencairan",
      data: error,
    });
  }
});
