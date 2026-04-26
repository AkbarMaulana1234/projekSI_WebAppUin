import { useDrizzle } from "~~/server/db";
import { pengajuanRabTable } from "~~/server/db/schema";
import { eq, and } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";
import { createFilePath } from "#imports";

export default defineEventHandler(async (event) => {
  try {
    // 1. Validasi Input & User
    const body = await readBody(event);
    const { rabId } = body;

    if (!rabId) {
      throw createError({
        statusCode: 400,
        message: "rabId harus disertakan",
      });
    }

    const { user } = event.context;
    if (!user?.id) {
      throw createError({
        statusCode: 401,
        message: "Anda harus login terlebih dahulu",
      });
    }

    const db = useDrizzle();

    // 2. Cari data pengajuan di database
    const rab = await db.query.pengajuanRabTable.findFirst({
      where: and(
        eq(pengajuanRabTable.id, rabId),
        eq(pengajuanRabTable.usersId, user.id),
      ),
    });

    if (!rab) {
      throw createError({
        statusCode: 404,
        message: "Data RAB tidak ditemukan atau Anda tidak memiliki akses",
      });
    }

    // 3. Validasi keberadaan file RAB dan TOR
    const { fileRabUrl, fileTorUrl } = rab;
    if (!fileRabUrl || !fileTorUrl) {
      throw createError({
        statusCode: 400,
        message:
          "Dokumen RAB atau TOR tidak lengkap. Harap lengkapi file sebelum mengajukan.",
      });
    }

    // 4. Proses pemindahan file RAB
    const namaFileRab = path.basename(fileRabUrl);
    const pathSumberRab = path.resolve(process.cwd(), fileRabUrl);
    const pathFolderTujuanRab = await createFilePath("Rab", "sedangDiAjukan");
    const pathTujuanRab = path.join(pathFolderTujuanRab, namaFileRab);

    // 5. Proses pemindahan file TOR
    const namaFileTor = path.basename(fileTorUrl);
    const pathSumberTor = path.resolve(process.cwd(), fileTorUrl);
    const pathFolderTujuanTor = await createFilePath("Tor", "sedangDiAjukan");
    const pathTujuanTor = path.join(pathFolderTujuanTor, namaFileTor);

    // Lakukan pemindahan file secara asinkron
    await Promise.all([
      fs.rename(pathSumberRab, pathTujuanRab),
      fs.rename(pathSumberTor, pathTujuanTor),
    ]);

    // Format relative path untuk disimpan di database
    const newFileRabUrl = path
      .relative(process.cwd(), pathTujuanRab)
      .replace(/\\/g, "/");
    const newFileTorUrl = path
      .relative(process.cwd(), pathTujuanTor)
      .replace(/\\/g, "/");

    // 6. Update status dan path file di database
    await db
      .update(pengajuanRabTable)
      .set({
        status: "waiting_kaprodi",
        fileRabUrl: newFileRabUrl,
        fileTorUrl: newFileTorUrl,
        updatedAt: new Date(),
      })
      .where(eq(pengajuanRabTable.id, rabId));

    // 7. Kembalikan respon sukses
    return {
      success: true,
      message: "Pengajuan kegiatan (RAB & TOR) berhasil dikirim",
      data: {
        rabId,
        fileRab: {
          namaFile: namaFileRab,
          lokasiBaru: newFileRabUrl,
        },
        fileTor: {
          namaFile: namaFileTor,
          lokasiBaru: newFileTorUrl,
        },
      },
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: `Gagal memproses pengajuan: ${error.message}`,
    });
  }
});
