// FILE: server/api/ppk/kegiatan/[id]/index.get.ts

import { eq, asc, and } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  pengajuanRabTable,
  usersTable,
  ormawaTable,
  approvalLogTable,
} from "~~/server/db/schema";
import { readRevisionArchive } from "~~/server/utils/revisionArchive";

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, "id"));
    if (isNaN(id) || id <= 0) {
      throw createError({ statusCode: 400, statusMessage: "ID pengajuan tidak valid" });
    }

    const db = useDrizzle();
    const { user } = event.context;

    if (!user || user.role !== "ppk") {
      throw createError({
        statusCode: 403,
        statusMessage: "Akses ditolak. Peran PPK diperlukan.",
      });
    }

    const fakultasId = user.fakultasId;

    if (!fakultasId) {
      throw createError({ statusCode: 403, statusMessage: "PPK tidak memiliki fakultas yang valid" });
    }

    const rab = await db.query.pengajuanRabTable.findFirst({
      where: and(
        eq(pengajuanRabTable.id, id),
        eq(pengajuanRabTable.fakultasId, String(fakultasId)),
      ),
    });

    if (!rab) {
      throw createError({
        statusCode: 404,
        statusMessage: "Pengajuan tidak ditemukan atau Anda tidak memiliki akses",
      });
    }

    const pengajuInfo = await db.query.usersTable.findFirst({
      where: eq(usersTable.users_id, rab.usersId),
    });

    const ormawaInfo = pengajuInfo?.ormawaId
      ? await db.query.ormawaTable.findFirst({
          where: eq(ormawaTable.id, pengajuInfo.ormawaId),
        })
      : null;

    const riwayat = await db
      .select({
        approvalLog: approvalLogTable,
        actor: {
          fullname: usersTable.fullName,
          role: usersTable.role,
        },
      })
      .from(approvalLogTable)
      .innerJoin(usersTable, eq(usersTable.id, approvalLogTable.actorId))
      .where(eq(approvalLogTable.pengajuanRabId, id))
      .orderBy(asc(approvalLogTable.createdAt));
    const revisionSnapshots = await readRevisionArchive(id);

    return {
      success: true,
      data: {
        id: rab.id,
        nomorPengajuan: rab.nomorPengajuan,
        judulKegiatan: rab.judulKegiatan,
        deskripsi: rab.deskripsi,
        totalAnggaran: rab.totalAnggaran,
        tanggalMulai: rab.tanggalMulai,
        tanggalSelesai: rab.tanggalSelesai,
        status: rab.status,
        fileRabUrl: rab.fileRabUrl,
        fileTorUrl: rab.fileTorUrl,
        createdAt: rab.createdAt,
        updatedAt: rab.updatedAt,
        pengaju: {
          id: pengajuInfo?.id ?? null,
          nama: pengajuInfo?.fullName ?? "",
          email: pengajuInfo?.email ?? "",
        },
        ormawa: {
          id: ormawaInfo?.id ?? null,
          nama: ormawaInfo?.nama ?? "",
          kode: ormawaInfo?.kode ?? "",
          totalAnggaran: ormawaInfo?.totalAnggaran ?? 0,
        },
        riwayat: riwayat.map((r) => ({
          id: r.approvalLog.id,
          action: r.approvalLog.action,
          catatan: r.approvalLog.catatanRevisi,
          createdAt: r.approvalLog.createdAt,
          aktor: {
            nama: r.actor.fullname,
            role: r.actor.role,
          },
        })),
        revisionSnapshots,
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
