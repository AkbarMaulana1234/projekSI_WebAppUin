import { defineEventHandler, readMultipartFormData, createError } from "h3";
import { writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { useDrizzle } from "../../../db/index";
import { eq } from "drizzle-orm";
import { lpgTable } from "../../../db/schema/lpgSchema";
import { kegiatanTable } from "../../../db/schema/KegiatanSchema";
import { createFilePath } from "#imports";

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: "Tidak ada data yang dikirim",
      });
    }
    const getField = (name: string): string => {
      const field = formData.find((f) => f.name === name);
      return field && field.data
        ? Buffer.from(field.data).toString("utf-8")
        : "";
    };
    const rabIdStr = getField("rabId");
    if (!rabIdStr) {
      throw createError({ statusCode: 400, message: "RAB ID wajib diisi" });
    }
    const rabId = parseInt(rabIdStr);
    const fileLpjField = formData.find((f) => f.name === "fileLpj");
    if (!fileLpjField || !fileLpjField.data || fileLpjField.data.length === 0) {
      throw createError({
        statusCode: 400,
        message: "File LPJ wajib diupload",
      });
    }
    if (fileLpjField.type !== "application/pdf") {
      throw createError({
        statusCode: 400,
        message: "File LPJ wajib berformat PDF",
      });
    }
    if (fileLpjField.data.length > 10 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        message: "Ukuran file LPJ maksimal 10MB",
      });
    }

    const db = useDrizzle();
    const user = event.context.user;

    const kegiatan = await db.query.kegiatanTable.findFirst({
      where: eq(kegiatanTable.pengajuanRabId, rabId),
    });

    if (!kegiatan) {
      throw createError({
        statusCode: 404,
        message: "Kegiatan tidak ditemukan untuk RAB ini",
      });
    }
    const uploadBaseDirLpj = await createFilePath(
      "file",
      "Lpg",
      "SedangBerlangsung",
    );
    const timestamp = Date.now();
    const originalNameLpj = fileLpjField.filename || "file_lpj.pdf";
    const safeNameLpj = originalNameLpj.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const uniqueFilenameLpj = `${timestamp}_${safeNameLpj}`;
    const absolutePathLpj = join(uploadBaseDirLpj, uniqueFilenameLpj);
    await writeFile(absolutePathLpj, fileLpjField.data);
    const relativePathLpj = relative(process.cwd(), absolutePathLpj).replace(
      /\\/g,
      "/",
    );

    const existingLpg = await db.query.lpgTable.findFirst({
      where: eq(lpgTable.kegiatanId, kegiatan.id),
    });

    let resultId;
    if (existingLpg) {
      await db
        .update(lpgTable)
        .set({
          fileLpgUrl: relativePathLpj,
          statusLpg: "WAITING_SPI",
          uploadedBy: user.id,
          updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        })
        .where(eq(lpgTable.id, existingLpg.id));
      resultId = existingLpg.id;
    } else {
      const result = await db
        .insert(lpgTable)
        .values({
          kegiatanId: kegiatan.id,
          fileLpgUrl: relativePathLpj,
          statusLpg: "WAITING_SPI",
          uploadedBy: user.id,
          submittedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
          createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
          updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        })
        .$returningId();
      resultId = result[0].id;
    }
    return {
      success: true,
      message: "LPJ berhasil diupload",
      data: {
        id: resultId,
      },
    };
  } catch (error: any) {
    console.error("Error upload LPJ:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: "Terjadi kesalahan server: " + error.message,
    });
  }
});
