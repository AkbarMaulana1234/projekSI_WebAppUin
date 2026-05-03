import { eq, sql, and, ne } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  ormawaTable,
  programStudiTable,
  fakultasTable,
  pengajuanRabTable,
  usersTable,
} from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();

    // Ambil semua ormawa beserta data prodi dan fakultas
    const ormawaList = await db
      .select({
        ormawaId: ormawaTable.id,
        ormawaName: ormawaTable.nama,
        ormawaKode: ormawaTable.kode,
        totalAnggaranOrmawa: ormawaTable.totalAnggaran,
        prodiId: programStudiTable.id,
        prodiNama: programStudiTable.nama,
        fakultasId: fakultasTable.id,
        fakultasNama: fakultasTable.nama,
        // Hitung total yang diajukan (semua status kecuali draft)
        totalDiajukan: sql<number>`
          COALESCE((
            SELECT SUM(pr.total_anggaran)
            FROM pengajuan_rab pr
            INNER JOIN users u ON pr.users_id = u.users_id
            WHERE u.ormawa_id = ${ormawaTable.id}
            AND pr.status != 'draft'
          ), 0)
        `,
        // Hitung yang sudah disetujui SPI (terpakai)
        totalTerpakai: sql<number>`
          COALESCE((
            SELECT SUM(pr.total_anggaran)
            FROM pengajuan_rab pr
            INNER JOIN users u ON pr.users_id = u.users_id
            WHERE u.ormawa_id = ${ormawaTable.id}
            AND pr.status IN ('disetujui', 'selesai_spi')
          ), 0)
        `,
        // Hitung jumlah kegiatan (semua kecuali draft)
        totalKegiatan: sql<number>`
          COALESCE((
            SELECT COUNT(*)
            FROM pengajuan_rab pr
            INNER JOIN users u ON pr.users_id = u.users_id
            WHERE u.ormawa_id = ${ormawaTable.id}
            AND pr.status != 'draft'
          ), 0)
        `,
        // Hitung kegiatan yang sudah disetujui
        totalDisetujui: sql<number>`
          COALESCE((
            SELECT COUNT(*)
            FROM pengajuan_rab pr
            INNER JOIN users u ON pr.users_id = u.users_id
            WHERE u.ormawa_id = ${ormawaTable.id}
            AND pr.status IN ('disetujui', 'selesai_spi')
          ), 0)
        `,
      })
      .from(ormawaTable)
      .innerJoin(programStudiTable, eq(ormawaTable.prodiId, programStudiTable.id))
      .innerJoin(fakultasTable, eq(programStudiTable.fakultasId, fakultasTable.id))
      .orderBy(fakultasTable.id, ormawaTable.nama);

    // Kelompokkan per fakultas
    const fakultasMap = new Map<
      number,
      {
        id: number;
        nama: string;
        ormawa: typeof ormawaList;
      }
    >();

    for (const row of ormawaList) {
      if (!fakultasMap.has(row.fakultasId)) {
        fakultasMap.set(row.fakultasId, {
          id: row.fakultasId,
          nama: row.fakultasNama,
          ormawa: [],
        });
      }
      fakultasMap.get(row.fakultasId)!.ormawa.push(row);
    }

    // Hitung summary keseluruhan
    const totalAnggaranKeseluruhan = ormawaList.reduce(
      (sum, o) => sum + Number(o.totalAnggaranOrmawa),
      0,
    );
    const totalTerpakaiKeseluruhan = ormawaList.reduce(
      (sum, o) => sum + Number(o.totalTerpakai),
      0,
    );
    const totalSisaKeseluruhan =
      totalAnggaranKeseluruhan - totalTerpakaiKeseluruhan;

    return {
      success: true,
      summary: {
        totalAnggaranKeseluruhan,
        totalTerpakaiKeseluruhan,
        totalSisaKeseluruhan,
      },
      data: Array.from(fakultasMap.values()).map((fak) => ({
        fakultas: {
          id: fak.id,
          nama: fak.nama,
        },
        ormawa: fak.ormawa.map((o) => ({
          id: o.ormawaId,
          nama: o.ormawaName,
          kode: o.ormawaKode,
          anggaran: {
            total: Number(o.totalAnggaranOrmawa),
            terpakai: Number(o.totalTerpakai),
            sisa: Number(o.totalAnggaranOrmawa) - Number(o.totalTerpakai),
          },
          totalKegiatan: Number(o.totalKegiatan),
          disetujuiCount: Number(o.totalDisetujui),
        })),
      })),
    };
  } catch (error: any) {
    console.error("Error GET /api/ppk/ormawa-anggaran:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil data anggaran ormawa",
      data: error,
    });
  }
});