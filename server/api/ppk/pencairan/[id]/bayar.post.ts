import { mkdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { cwd } from "node:process";
import { eq } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  tagihanPencairanTable,
  pembayaranTable,
  usersTable,
  ormawaTable,
  logDokumentasiTagihanTable,
} from "~~/server/db/schema";
import {
  decodeUrlId,
  getDokumenPpkFromMeta,
  mysqlTimestamp,
  resolveTagihanId,
} from "~~/server/utils/pencairanHelpers";

export default defineEventHandler(async (event) => {
  try {
    const routeId = decodeUrlId(getRouterParam(event, "id"));
    if (Number.isNaN(routeId) || routeId === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID pencairan tidak valid",
      });
    }

    const user = event.context.user;
    const db = useDrizzle();

    const [ppkData] = await db
      .select({ fakultasId: usersTable.fakultasId, id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, Number(user.id)));

    if (!ppkData?.fakultasId) {
      throw createError({
        statusCode: 403,
        statusMessage: "PPK tidak memiliki data fakultas",
      });
    }

    const tagihanId = await resolveTagihanId(
      db,
      routeId,
      ppkData.id,
      ppkData.fakultasId,
    );

    if (!tagihanId) {
      throw createError({
        statusCode: 404,
        statusMessage: "Data pencairan tidak ditemukan",
      });
    }

    const [tagihan] = await db
      .select({
        id: tagihanPencairanTable.id,
        statusTagihan: tagihanPencairanTable.statusTagihan,
        nominal: tagihanPencairanTable.nominal,
        namaPenerima: tagihanPencairanTable.namaPenerima,
      })
      .from(tagihanPencairanTable)
      .where(eq(tagihanPencairanTable.id, tagihanId));

    if (!tagihan) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tagihan pencairan tidak ditemukan",
      });
    }

    if (tagihan.statusTagihan !== "TRANSFER_DILAKUKAN") {
      throw createError({
        statusCode: 422,
        statusMessage: `Konfirmasi transfer terlebih dahulu. Status saat ini: ${tagihan.statusTagihan}`,
      });
    }

    const dokumenPpk = await getDokumenPpkFromMeta(tagihanId);
    if (!dokumenPpk.spbFileUrl || !dokumenPpk.kwitansiFileUrl) {
      throw createError({
        statusCode: 422,
        statusMessage: "Surat Perintah Bayar dan kwitansi harus diunggah sebelum pencairan",
      });
    }

    const formData = await readMultipartFormData(event);
    if (!formData?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tidak ada data yang dikirim",
      });
    }

    const getField = (name: string): string => {
      const field = formData.find((f) => f.name === name);
      return field?.data ? Buffer.from(field.data).toString("utf-8") : "";
    };

    const catatan = getField("catatan");
    const buktiField = formData.find((f) => f.name === "bukti_transfer");

    if (!buktiField?.data?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: "File bukti transfer wajib diupload",
      });
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(buktiField.type ?? "")) {
      throw createError({
        statusCode: 400,
        statusMessage: "Format file tidak valid. Gunakan PDF, JPG, atau PNG",
      });
    }

    if (buktiField.data.length > 5 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        statusMessage: "Ukuran file maksimal 5MB",
      });
    }

    const uploadDir = join(cwd(), "uploads", "ppk", "bukti-transfer", String(tagihanId));
    await mkdir(uploadDir, { recursive: true });
    const safeName = (buktiField.filename || "bukti_transfer").replace(
      /[^a-zA-Z0-9.\-]/g,
      "_",
    );
    const uniqueFilename = `${Date.now()}_${safeName}`;
    const absolutePath = join(uploadDir, uniqueFilename);
    await writeFile(absolutePath, buktiField.data);
    const relativePath = relative(cwd(), absolutePath).replace(/\\/g, "/");

    await db.transaction(async (tx) => {
      await tx.insert(pembayaranTable).values({
        tagihanId,
        ppkId: ppkData.id,
        buktiTransferUrl: relativePath,
        tanggalPembayaran: mysqlTimestamp(),
        catatanPembayaran: catatan?.trim() || null,
      });

      await tx
        .update(tagihanPencairanTable)
        .set({
          statusTagihan: "SELESAI",
          updatedAt: mysqlTimestamp(),
        })
        .where(eq(tagihanPencairanTable.id, id));

      await tx.insert(logDokumentasiTagihanTable).values({
        tagihanId: id,
        action: "pay",
        komentar: catatan?.trim() || "Pembayaran telah dilakukan",
        userId: user.id,
      });
    });

    return {
      success: true,
      message: "Pembayaran berhasil dicatat. Bukti transfer telah disimpan.",
      data: {
        tagihanId,
        namaPenerima: tagihan.namaPenerima,
        nominal: tagihan.nominal,
        statusTagihan: "SELESAI",
      },
    };
  } catch (error: any) {
    console.error("Error POST /api/ppk/pencairan/[id]/bayar:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal memproses pembayaran",
      data: error,
    });
  }
});
