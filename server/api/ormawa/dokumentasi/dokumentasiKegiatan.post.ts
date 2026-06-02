import { useDrizzle } from "~~/server/db";
import { dokumentasiKegiatanTable } from "~~/server/db/schema";
import { createFilePath } from "#imports"; // import util nuxt js
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

export default defineEventHandler(async (event) => {
  const db = useDrizzle();
  const formData = await readMultipartFormData(event);

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: "Tidak ada data yang dikirim",
    });
  }

  const getField = (name: string): string => {
    const field = formData.find((f) => f.name === name);
    return field && field.data ? Buffer.from(field.data).toString("utf-8") : "";
  };

  const kegiatanId = getField("kegiatanId");
  const deskripsi = getField("deskripsi");
  const tipeDokumen = getField("tipeDokumen") || "DOKUMENTASI";

  const fileField = formData.find((f) => f.name === "file");
  if (!fileField) {
    throw createError({ statusCode: 400, message: "File wajib diupload" });
  }

  // bikin folder target sesuai util
  const targetPath = await createFilePath("dokumentasi", "kegiatan", "");

  // simpan file ke folder
  const fileName = Date.now() + "_" + fileField.filename;
  const filePath = join(targetPath, fileName);
  await writeFile(filePath, fileField.data);

  const { user } = event.context;
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "User tidak terautentikasi",
    });
  }

  // insert ke database
  const [hasil] = await db.insert(dokumentasiKegiatanTable).values({
    kegiatanId: Number(kegiatanId),
    deskripsi,
    tipeDokumen,
    fileUrl: filePath,
    fakultasId: String(user.fakultasId),
    prodiId: user.prodiId ? String(user.prodiId) : null,
    uploadedBy: user.id,
    status: "MENUNGGU",
  });

  return {
    success: true,
    message: "Dokumentasi berhasil diupload",
    data: hasil.insertId,
  };
});
