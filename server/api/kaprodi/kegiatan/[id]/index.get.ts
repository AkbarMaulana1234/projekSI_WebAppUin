// FILE: server/api/kaprodi/kegiatan/[id]/index.get.ts
// Endpoint untuk mengambil detail pengajuan proposal berdasarkan ID tertentu oleh Kaprodi
// Mengikuti pola server/api/ppk/kegiatan/[id]/index.get.ts dengan adaptasi prodiId Kaprodi

import { eq, asc, and, inArray } from "drizzle-orm";
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

    // Pastikan user terautentikasi dan memiliki prodiId
    if (!user || user.role !== "kaprodi") {
      throw createError({
        statusCode: 403,
        statusMessage: "Akses ditolak. Peran Kaprodi diperlukan.",
      });
    }

    const prodiId = user.prodiId;

    if (!prodiId) {
      throw createError({
        statusCode: 403,
        statusMessage: "Anda tidak memiliki program studi yang valid",
      });
    }

    // Step 1: Cari Ormawa yang terikat pada prodiId Kaprodi
    const ormawaRows = await db
      .select({ id: ormawaTable.id })
      .from(ormawaTable)
      .where(eq(ormawaTable.prodiId, prodiId));

    const ormawaIds = ormawaRows.map((o) => o.id);

    if (ormawaIds.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: "Tidak ada ormawa binaan yang terdaftar untuk prodi Anda",
      });
    }

    // Step 2: Cari all users dari Ormawa tersebut
    const ormawaUsers = await db
      .select({ usersId: usersTable.users_id })
      .from(usersTable)
      .where(inArray(usersTable.ormawaId, ormawaIds));

    const ormawaUserIds = ormawaUsers.map((u) => u.usersId);

    if (ormawaUserIds.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: "Tidak ada user ormawa terdaftar",
      });
    }

    // Step 3: Validasi akses Kaprodi terhadap ID pengajuan ini
    const aksesValid = await db.query.pengajuanRabTable.findFirst({
      where: and(
        eq(pengajuanRabTable.id, id),
        inArray(pengajuanRabTable.usersId, ormawaUserIds)
      ),
    });

    if (!aksesValid) {
      throw createError({
        statusCode: 403,
        statusMessage: "Anda tidak memiliki akses ke pengajuan ini",
      });
    }

    // Step 4: Ambil detail pengajuan
    const rab = await db.query.pengajuanRabTable.findFirst({
      where: eq(pengajuanRabTable.id, id),
    });

    if (!rab) {
      throw createError({ statusCode: 404, statusMessage: "Pengajuan tidak ditemukan" });
    }

    // Ambil info pengaju
    const pengajuInfo = await db.query.usersTable.findFirst({
      where: eq(usersTable.users_id, rab.usersId),
    });

    // Ambil info Ormawa
    const ormawaInfo = pengajuInfo?.ormawaId
      ? await db.query.ormawaTable.findFirst({
          where: eq(ormawaTable.id, pengajuInfo.ormawaId),
        })
      : null;

    // Ambil riwayat approval log
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
    console.error("Error GET /api/kaprodi/kegiatan/[id]:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil detail pengajuan",
      data: error,
    });
  }
});
