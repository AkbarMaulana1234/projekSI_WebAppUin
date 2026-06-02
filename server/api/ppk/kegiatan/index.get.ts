// FILE: server/api/ppk/kegiatan/index.get.ts

import { eq, inArray, desc, and, ne } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  pengajuanRabTable,
  usersTable,
  ormawaTable,
  kegiatanTable,
  tagihanPencairanTable,
} from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  try {
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
      return {
        success: true,
        summary: { totalMasuk: 0, totalWaitingPPK: 0, totalRevisiPPK: 0 },
        data: [],
      };
    }

    const pengajuan = await db
      .select({
        id: pengajuanRabTable.id,
        nomorPengajuan: pengajuanRabTable.nomorPengajuan,
        usersId: pengajuanRabTable.usersId,
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
      })
      .from(pengajuanRabTable)
      .where(
        and(
          ne(pengajuanRabTable.status, "draft"),
          eq(pengajuanRabTable.fakultasId, String(fakultasId)),
        ),
      )
      .orderBy(desc(pengajuanRabTable.createdAt));

    const pengajuanUserIds = [...new Set(pengajuan.map((item) => item.usersId))];
    const ormawaUsers = pengajuanUserIds.length
      ? await db
          .select({
            usersId: usersTable.users_id,
            ormawaId: usersTable.ormawaId,
            fullName: usersTable.fullName,
            email: usersTable.email,
            intId: usersTable.id,
          })
          .from(usersTable)
          .where(inArray(usersTable.users_id, pengajuanUserIds))
      : [];

    const userMap = new Map(ormawaUsers.map((u) => [u.usersId, u]));
    const ormawaIds = [
      ...new Set(
        ormawaUsers
          .map((u) => u.ormawaId)
          .filter((id): id is number => id !== null),
      ),
    ];
    const ormawaDetailRows = ormawaIds.length
      ? await db
          .select({ id: ormawaTable.id, nama: ormawaTable.nama, kode: ormawaTable.kode })
          .from(ormawaTable)
          .where(inArray(ormawaTable.id, ormawaIds))
      : [];
    const ormawaMap = new Map(ormawaDetailRows.map((o) => [o.id, o]));

    const pengajuanIds = pengajuan.map((item) => item.id);
    const kegiatanRows = pengajuanIds.length
      ? await db
          .select({
            id: kegiatanTable.id,
            pengajuanRabId: kegiatanTable.pengajuanRabId,
            statusKegiatan: kegiatanTable.statusKegiatan,
          })
          .from(kegiatanTable)
          .where(inArray(kegiatanTable.pengajuanRabId, pengajuanIds))
      : [];

    const kegiatanMap = new Map(
      kegiatanRows.map((row) => [row.pengajuanRabId, row]),
    );

    const kegiatanIds = kegiatanRows.map((row) => row.id);
    const tagihanRows = kegiatanIds.length
      ? await db
          .select({
            kegiatanId: tagihanPencairanTable.kegiatanId,
            statusTagihan: tagihanPencairanTable.statusTagihan,
            nominal: tagihanPencairanTable.nominal,
          })
          .from(tagihanPencairanTable)
          .where(inArray(tagihanPencairanTable.kegiatanId, kegiatanIds))
      : [];

    const tagihanMap = new Map<
      number,
      { total: number; selesai: number; nominalSelesai: number; statuses: Set<string> }
    >();

    for (const item of tagihanRows) {
      const current = tagihanMap.get(item.kegiatanId) ?? {
        total: 0,
        selesai: 0,
        nominalSelesai: 0,
        statuses: new Set<string>(),
      };
      current.total += 1;
      if (item.statusTagihan) {
        current.statuses.add(item.statusTagihan);
        if (item.statusTagihan === "SELESAI") {
          current.selesai += 1;
          current.nominalSelesai += Number(item.nominal ?? 0);
        }
      }
      tagihanMap.set(item.kegiatanId, current);
    }

    const activityData = pengajuan.map((r) => {
      const userInfo = userMap.get(r.usersId);
      const ormawaInfo = userInfo?.ormawaId
        ? ormawaMap.get(userInfo.ormawaId)
        : null;
      const kegiatanInfo = kegiatanMap.get(r.id);
      const tagihanInfo = kegiatanInfo
        ? tagihanMap.get(kegiatanInfo.id)
        : undefined;

      return {
        id: r.id,
        nomorPengajuan: r.nomorPengajuan,
        judulKegiatan: r.judulKegiatan,
        deskripsi: r.deskripsi,
        totalAnggaran: Number(r.totalAnggaran ?? 0),
        tanggalMulai: r.tanggalMulai,
        tanggalSelesai: r.tanggalSelesai,
        status: r.status,
        fileRabUrl: r.fileRabUrl,
        fileTorUrl: r.fileTorUrl,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        pengaju: {
          id: userInfo?.intId ?? null,
          nama: userInfo?.fullName ?? "",
          email: userInfo?.email ?? "",
        },
        ormawa: {
          id: ormawaInfo?.id ?? null,
          nama: ormawaInfo?.nama ?? "",
          kode: ormawaInfo?.kode ?? "",
        },
        statusKegiatan: kegiatanInfo?.statusKegiatan ?? null,
        pencairan: {
          totalTagihan: tagihanInfo?.total ?? 0,
          selesaiTagihan: tagihanInfo?.selesai ?? 0,
          nominalSelesai: tagihanInfo?.nominalSelesai ?? 0,
          statuses: Array.from(tagihanInfo?.statuses ?? []),
        },
      };
    });

    return {
      success: true,
      summary: {
        totalMasuk: activityData.length,
        totalWaitingPPK: activityData.filter((d) => d.status === "waiting_ppk").length,
        totalRevisiPPK: activityData.filter((d) => d.status === "revisi_ppk").length,
        totalWaitingSPI: activityData.filter((d) => d.status === "waiting_spi").length,
        totalSelesaiSPI: activityData.filter((d) => d.status === "selesai_spi").length,
      },
      data: activityData,
    };
  } catch (error: any) {
    console.error("Error GET /api/ppk/kegiatan:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengambil data pengajuan kegiatan",
      data: error,
    });
  }
});
