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

    const { fileRabUrl } = rab;
    if (!fileRabUrl) {
      throw createError({
        statusCode: 400,
        message: "File RAB tidak tersedia",
      });
    }

    const namaFile = path.basename(fileRabUrl);

    const pathSumber = path.resolve(process.cwd(), fileRabUrl);

    const pathFolderTujuan = await createFilePath("Rab", "sedangDiAjukan");

    const pathTujuan = path.join(pathFolderTujuan, namaFile);

    await fs.rename(pathSumber, pathTujuan);

    // 5. Update status RAB di database
    await db
      .update(pengajuanRabTable)
      .set({
        status: "waiting_kaprodi",
        fileRabUrl: path
          .relative(process.cwd(), pathTujuan)
          .replace(/\\/g, "/"),
        updatedAt: new Date(),
      })
      .where(eq(pengajuanRabTable.id, rabId));

    // 6. Kembalikan respon sukses
    return {
      success: true,
      message: "Pengajuan RAB berhasil dikirim",
      data: {
        rabId,
        namaFile,
        lokasiBaru: path
          .relative(process.cwd(), pathTujuan)
          .replace(/\\/g, "/"),
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
