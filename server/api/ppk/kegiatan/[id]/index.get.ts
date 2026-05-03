import { eq, asc } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  pengajuanRabTable,
  usersTable,
  ormawaTable,
  approvalLogTable,
} from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, "id"));
    if (isNaN(id) || id <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID pengajuan tidak valid",
      });
    }

    const db = useDrizzle();

    // Ambil detail pengajuan beserta data pengaju dan ormawa
    const [pengajuan] = await db
      .select({
        id: pengajuanRabTable.id,
        nomorPengajuan: pengajuanRabTable.nomorPengajuan,
        judulKegiatan: pengajuanRabTable.judulKegiatan,
        deskripsi: pengajuanRabTable.deskripsi,
        totalAnggaran: pengajuanRabTable.totalAnggaran,
        tanggalMulai: pengajuanRabTable.tanggalMulai,
        tanggalSelesai: pengajuanRabTable.tanggalSelesai,
        status: pengajuanRabTable.status,
        fileRabUrl: pengajuanRabTable.fileRabUrl,
        fileTorUrl: pengajuanRabTable.fileTorUrl,
        createdAt: pengajuanRabTable.createdAt,
        updatedAt: pengajuanRabTable.updatedAt,
        // Data pengaju
        pengajuId: usersTable.id,
        pengajuNama: usersTable.fullName,
        pengajuEmail: usersTable.email,
        // Data ormawa
        ormawaId: ormawaTable.id,
        ormawaName: ormawaTable.nama,
        ormawaKode: ormawaTable.kode,
        ormawaAnggaran: ormawaTable.totalAnggaran,
      })
      .from(pengajuanRabTable)
      .innerJoin(usersTable, eq(pengajuanRabTable.usersId, usersTable.users_id))
      .leftJoin(ormawaTable, eq(usersTable.ormawaId, ormawaTable.id))
      .where(eq(pengajuanRabTable.id, id));

    if (!pengajuan) {
      throw createError({
        statusCode: 404,
        statusMessage: "Pengajuan tidak ditemukan",
      });
    }

    // Ambil riwayat approval untuk pengajuan ini
    const riwayat = await db
      .select({
        id: approvalLogTable.id,
        action: approvalLogTable.action,
        catatanRevisi: approvalLogTable.catatanRevisi,
        createdAt: approvalLogTable.createdAt,
        aktorId: usersTable.id,
        aktorNama: usersTable.fullName,
        aktorRole: usersTable.role,
      })
      .from(approvalLogTable)
      .innerJoin(usersTable, eq(approvalLogTable.actorId, usersTable.id))
      .where(eq(approvalLogTable.pengajuanRabId, id))
      .orderBy(asc(approvalLogTable.createdAt));

    return {
      success: true,
      data: {
        id: pengajuan.id,
        nomorPengajuan: pengajuan.nomorPengajuan,
        judulKegiatan: pengajuan.judulKegiatan,
        deskripsi: pengajuan.deskripsi,
        totalAnggaran: pengajuan.totalAnggaran,
        tanggalMulai: pengajuan.tanggalMulai,
        tanggalSelesai: pengajuan.tanggalSelesai,
        status: pengajuan.status,
        fileRabUrl: pengajuan.fileRabUrl,
        fileTorUrl: pengajuan.fileTorUrl,
        createdAt: pengajuan.createdAt,
        updatedAt: pengajuan.updatedAt,
        pengaju: {
          id: pengajuan.pengajuId,
          nama: pengajuan.pengajuNama,
          email: pengajuan.pengajuEmail,
        },
        ormawa: {
          id: pengajuan.ormawaId,
          nama: pengajuan.ormawaName,
          kode: pengajuan.ormawaKode,
          totalAnggaran: pengajuan.ormawaAnggaran,
        },
        riwayat: riwayat.map((r) => ({
          id: r.id,
          action: r.action,
          catatan: r.catatanRevisi,
          createdAt: r.createdAt,
          aktor: {
            id: r.aktorId,
            nama: r.aktorNama,
            role: r.aktorRole,
          },
        })),
      },
    };
  } catch (error: any) {
    console.error("Error GET /api/ppk/kegiatan/[id]:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil detail pengajuan",
      data: error,
    });
  }
});