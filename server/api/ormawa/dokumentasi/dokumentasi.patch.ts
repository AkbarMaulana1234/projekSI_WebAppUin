import { useDrizzle } from "~~/server/db";
import { eq } from "drizzle-orm";
import { dokumentasiKegiatanTable } from "~~/server/db/schema/dokumentasiSchema";
import { tagihanPencairanTable } from "~~/server/db/schema/TagihanPencairanSchema";
import { kegiatanTable } from "~~/server/db/schema/KegiatanSchema";
import { createFilePath } from "~~/server/utils/CreateFilePath";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import fs from "node:fs";
import { createEnkripsi } from "~~/server/utils/enkripsiData";

export default defineEventHandler(async (event) => {
  const db = useDrizzle();
  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw createError({
      statusCode: 400,
      message: "Tidak ada data yang dikirim",
    });
  }

  const getField = (name: string): string | undefined => {
    const field = formData.find((f) => f.name === name);
    return field && field.data
      ? Buffer.from(field.data).toString("utf-8")
      : undefined;
  };

  const id = getField("id");
  if (!id) {
    throw createError({ statusCode: 400, message: "ID wajib disertakan" });
  }

  const idStr = String(id);
  const isTagihan = idStr.startsWith("tagihan_");
  const realId = Number(idStr.replace("doc_", "").replace("tagihan_", ""));

  if (isTagihan) {
    return await handleUpdateTagihan(db, realId, formData, getField);
  } else {
    return await handleUpdateDokumentasi(db, realId, formData, getField);
  }
});

async function handleUpdateTagihan(
  db: any,
  id: number,
  formData: any[],
  getField: (name: string) => string | undefined,
) {
  const results = await db
    .select({
      tagihan: tagihanPencairanTable,
      statusKegiatan: kegiatanTable.statusKegiatan,
    })
    .from(tagihanPencairanTable)
    .innerJoin(
      kegiatanTable,
      eq(tagihanPencairanTable.kegiatanId, kegiatanTable.id),
    )
    .where(eq(tagihanPencairanTable.id, id))
    .limit(1);

  const res = results[0];
  if (!res)
    throw createError({ statusCode: 404, message: "Tagihan tidak ditemukan" });

  const oldDoc = res.tagihan;

  const updateData: any = {
    updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
  };

  // Text fields processing
  // ...
  const textFields = [
    { name: "namaPenerima", encrypt: true },
    { name: "rekeningPenerima", encrypt: true },
    { name: "bankPenerima", encrypt: true },
    { name: "tokoNama", encrypt: false },
    { name: "tokoAlamat", encrypt: false },
    { name: "skNomor", encrypt: true },
    { name: "spmtNomor", encrypt: true },
    { name: "amprahNomor", encrypt: true },
    { name: "npwpNomor", encrypt: true },
    { name: "ktpNomor", encrypt: true },
  ];

  for (const tf of textFields) {
    const val = getField(tf.name);
    if (val !== undefined) {
      updateData[tf.name] = tf.encrypt ? createEnkripsi(val) : val;
    }
  }

  const nominal = getField("nominal");
  if (nominal !== undefined) updateData.nominal = nominal;

  // File fields processing
  const fileFields = [
    { name: "fotoStruk", dbField: "strukFileUrl", category: "barang" as const },
    {
      name: "fotoBarang",
      dbField: "fotoBarangUrl",
      category: "barang" as const,
    },
    { name: "skFile", dbField: "skFileUrl", category: "jasa" as const },
    { name: "spmtFile", dbField: "spmtFileUrl", category: "jasa" as const },
    { name: "amprahFile", dbField: "amprahFileUrl", category: "jasa" as const },
    { name: "npwpFile", dbField: "npwpFileUrl", category: "jasa" as const },
    { name: "ktpFile", dbField: "ktpFileUrl", category: "jasa" as const },
    {
      name: "bukuRekeningFile",
      dbField: "bukuRekeningFileUrl",
      category: "jasa" as const,
    },
  ];

  for (const f of fileFields) {
    const fileData = formData.find((formField) => formField.name === f.name);
    if (fileData && fileData.data && fileData.filename) {
      // Delete old file if exists
      const oldPath = (oldDoc as any)[f.dbField];
      if (oldPath) {
        const fullOldPath = join(process.cwd(), oldPath);
        if (fs.existsSync(fullOldPath)) {
          await unlink(fullOldPath).catch(() => {});
        }
      }

      // Save new file
      const targetDir = await createFilePath("dokumentasi", f.category, "");
      const newFileName = `${Date.now()}_${f.name}_${fileData.filename}`;
      const newPath = join(targetDir, newFileName);
      await writeFile(join(process.cwd(), newPath), fileData.data);
      updateData[f.dbField] = newPath;
    }
  }

  await db
    .update(tagihanPencairanTable)
    .set(updateData)
    .where(eq(tagihanPencairanTable.id, id));

  return { success: true, message: "Tagihan berhasil diperbarui" };
}

async function handleUpdateDokumentasi(
  db: any,
  id: number,
  formData: any[],
  getField: (name: string) => string | undefined,
) {
  const results = await db
    .select({
      dokumentasi: dokumentasiKegiatanTable,
      statusKegiatan: kegiatanTable.statusKegiatan,
    })
    .from(dokumentasiKegiatanTable)
    .innerJoin(
      kegiatanTable,
      eq(dokumentasiKegiatanTable.kegiatanId, kegiatanTable.id),
    )
    .where(eq(dokumentasiKegiatanTable.id, id))
    .limit(1);

  const res = results[0];
  if (!res)
    throw createError({
      statusCode: 404,
      message: "Dokumentasi tidak ditemukan",
    });

  const oldDoc = res.dokumentasi;

  const updateData: any = {};

  const deskripsi = getField("deskripsi");
  if (deskripsi !== undefined) updateData.deskripsi = deskripsi;

  const fileData = formData.find((f) => f.name === "file");
  if (fileData && fileData.data && fileData.filename) {
    // Delete old file
    if (oldDoc.fileUrl) {
      const fullOldPath = join(process.cwd(), oldDoc.fileUrl);
      if (fs.existsSync(fullOldPath)) {
        await unlink(fullOldPath).catch(() => {});
      }
    }
    // Save new file

    const targetDir = await createFilePath("dokumentasi", "kegiatan", "");
    const newFileName = `${Date.now()}_file_${fileData.filename}`;
    const newPath = join(targetDir, newFileName);

    await writeFile(join(newPath), fileData.data);
    updateData.fileUrl = newPath;
  }

  if (Object.keys(updateData).length > 0) {
    await db
      .update(dokumentasiKegiatanTable)
      .set(updateData)
      .where(eq(dokumentasiKegiatanTable.id, id));
  }

  return { success: true, message: "Dokumentasi berhasil diperbarui" };
}
