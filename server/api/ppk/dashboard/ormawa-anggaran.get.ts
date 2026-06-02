// FILE: server/api/ppk/ormawa-anggaran/index.get.ts
//
// Pola mengikuti index.get.ts milik ormawa:
// - Query bertahap tanpa join untuk filter
// - Subquery SQL untuk hitung agregat per ormawa

import { eq, sql } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import { ormawaTable } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const { user } = event.context;

    const fakultasId = user.fakultasId;

    if (!fakultasId) {
      return {
        success: true,
        summary: { totalAnggaranKeseluruhan: 0, totalTerpakaiKeseluruhan: 0, totalSisaKeseluruhan: 0 },
        data: [],
      };
    }

    // Ambil data ormawa beserta kalkulasi anggaran via subquery
    // Pola subquery SQL sama seperti index.get.ts ormawa yang hitung count pengajuan
    const ormawaList = await db
      .select({
        ormawaId: ormawaTable.id,
        ormawaName: ormawaTable.nama,
        ormawaKode: ormawaTable.kode,
        totalAnggaranOrmawa: ormawaTable.totalAnggaran,
        prodiId: ormawaTable.prodiId,
        totalDiajukan: sql<number>`
          COALESCE((
            SELECT SUM(pr.total_anggaran)
            FROM pengajuan_rab pr
            INNER JOIN users u ON pr.users_id = u.users_id
            WHERE u.ormawa_id = ${ormawaTable.id}
            AND pr.status != 'draft'
          ), 0)
        `,
        totalTerpakai: sql<number>`
          COALESCE((
            SELECT SUM(pr.total_anggaran)
            FROM pengajuan_rab pr
            INNER JOIN users u ON pr.users_id = u.users_id
            WHERE u.ormawa_id = ${ormawaTable.id}
            AND pr.status IN ('disetujui', 'selesai_spi')
          ), 0)
        `,
        totalKegiatan: sql<number>`
          COALESCE((
            SELECT COUNT(*)
            FROM pengajuan_rab pr
            INNER JOIN users u ON pr.users_id = u.users_id
            WHERE u.ormawa_id = ${ormawaTable.id}
            AND pr.status != 'draft'
          ), 0)
        `,
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
      .where(eq(ormawaTable.fakultasId, fakultasId))
      .orderBy(ormawaTable.nama);

    const totalAnggaranKeseluruhan = ormawaList.reduce(
      (sum, o) => sum + Number(o.totalAnggaranOrmawa), 0,
    );
    const totalTerpakaiKeseluruhan = ormawaList.reduce(
      (sum, o) => sum + Number(o.totalTerpakai), 0,
    );

    return {
      success: true,
      summary: {
        totalAnggaranKeseluruhan,
        totalTerpakaiKeseluruhan,
        totalSisaKeseluruhan: totalAnggaranKeseluruhan - totalTerpakaiKeseluruhan,
      },
      data: [
        {
          fakultas: { id: fakultasId, nama: "" },
          ormawa: ormawaList.map((o) => ({
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
        },
      ],
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
