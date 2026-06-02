import { useDrizzle } from "~~/server/db/index";
import {
  pengajuanRabTable,
  usersTable,
  ormawaTable,
  fakultasTable,
  programStudiTable,
} from "~~/server/db/schema/index";
import { eq, or, and, sql, gte, lte, like } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const query = getQuery(event);
    const status = query.status as string;

    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const filters = [];

    filters.push(eq(pengajuanRabTable.status, "waiting_spi"));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(pengajuanRabTable);

    const total = totalCountResult[0].count;

    const data = await db
      .select({
        id: pengajuanRabTable.id,
        nomorPengajuan: pengajuanRabTable.nomorPengajuan,
        judulKegiatan: pengajuanRabTable.judulKegiatan,
        totalAnggaran: pengajuanRabTable.totalAnggaran,
        status: pengajuanRabTable.status,
        createdAt: pengajuanRabTable.createdAt,
        tanggalMulai: pengajuanRabTable.tanggalMulai,
        tanggalSelesai: pengajuanRabTable.tanggalSelesai,
        pengaju: usersTable.fullName,
        ormawa: ormawaTable.nama,
        fakultas: fakultasTable.nama,
        prodi: programStudiTable.nama,
      })
      .from(pengajuanRabTable)
      .leftJoin(usersTable, eq(pengajuanRabTable.usersId, usersTable.id))
      .leftJoin(ormawaTable, eq(usersTable.ormawaId, ormawaTable.id))
      .leftJoin(
        fakultasTable,
        eq(pengajuanRabTable.fakultasId, fakultasTable.id),
      )
      .leftJoin(
        programStudiTable,
        eq(pengajuanRabTable.prodiId, programStudiTable.id),
      )
      .where(whereClause)
      .orderBy(sql`${pengajuanRabTable.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      data,
      total,
      page,
      limit,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil data RAB",
    };
  }
});
