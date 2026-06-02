import {
  pengajuanRabTable,
  usersTable,
  fakultasTable,
  programStudiTable,
  ormawaTable,
} from "~~/server/db/schema";
import { useDrizzle } from "~~/server/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { rabId } = body;

    if (!rabId) {
      throw createError({ statusCode: 400, message: "rabId wajib dikirim" });
    }

    const { user } = event.context;

    const db = useDrizzle();

    const data = await db
      .select({
        id: pengajuanRabTable.id,
        nomorPengajuan: pengajuanRabTable.nomorPengajuan,
        judulKegiatan: pengajuanRabTable.judulKegiatan,
        deskripsi: pengajuanRabTable.deskripsi,
        totalAnggaran: pengajuanRabTable.totalAnggaran,
        status: pengajuanRabTable.status,
        tanggalMulai: pengajuanRabTable.tanggalMulai,
        tanggalSelesai: pengajuanRabTable.tanggalSelesai,
        createdAt: pengajuanRabTable.createdAt,
        updatedAt: pengajuanRabTable.updatedAt,
        pengaju: usersTable.fullName,
        ormawa: ormawaTable.nama,
        fakultas: fakultasTable.nama,
        prodi: programStudiTable.nama,
        ormawaId: usersTable.ormawaId,
      })
      .from(pengajuanRabTable)
      .leftJoin(usersTable, eq(pengajuanRabTable.usersId, usersTable.id))
      .leftJoin(
        fakultasTable,
        eq(pengajuanRabTable.fakultasId, fakultasTable.id),
      )
      .leftJoin(
        programStudiTable,
        eq(pengajuanRabTable.prodiId, programStudiTable.id),
      )
      .leftJoin(ormawaTable, eq(ormawaTable.id, usersTable.ormawaId))
      .where(eq(pengajuanRabTable.id, Number(rabId)))
      .limit(1);

    if (data.length === 0) {
      throw createError({ statusCode: 404, message: "RAB tidak ditemukan" });
    }

    return {
      success: true,
      data: data[0],
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Terjadi kesalahan saat mengambil detail RAB",
    };
  }
});
