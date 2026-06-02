import { useDrizzle } from "~~/server/db";
import { tagihanPencairanTable } from "~~/server/db/schema/TagihanPencairanSchema";
import { createFilePath } from "#imports";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createEnkripsi } from "~~/server/utils/enkripsiData";

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
  const tokoNama = getField("tokoNama");
  const tokoAlamat = getField("tokoAlamat");
  const rekeningPenerima = getField("rekeningPenerima");
  const bankPenerima = getField("bankPenerima");
  const namaPenerima = getField("namaPenerima");
  const nominalStr = getField("nominal");
  const nominal = nominalStr ? parseFloat(nominalStr) : 0;

  const strukBelanjaField = formData.find((f) => f.name === "fotoStruk");
  const fotoBarangField = formData.find((f) => f.name === "fotoBarang");

  if (!strukBelanjaField) {
    throw createError({
      statusCode: 400,
      message: "Foto struk wajib diupload",
    });
  }

  const targetPath = await createFilePath("dokumentasi", "barang", "");

  // simpan file struk
  const strukName = Date.now() + "_struk_" + strukBelanjaField.filename;
  const strukPath = join(targetPath, strukName);
  await writeFile(strukPath, strukBelanjaField.data);

  // simpan file foto barang jika ada
  let fotoBarangPath = null;
  if (fotoBarangField && fotoBarangField.data && fotoBarangField.filename) {
    const fotoBarangName = Date.now() + "_barang_" + fotoBarangField.filename;
    fotoBarangPath = join(targetPath, fotoBarangName);
    await writeFile(fotoBarangPath, fotoBarangField.data);
  }

  const { user } = event.context;
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "User tidak terautentikasi",
    });
  }

  // insert ke database tagihan_pencairan
  const [hasil] = await db.insert(tagihanPencairanTable).values({
    kegiatanId: Number(kegiatanId),
    tipeTagihan: "BARANG",
    namaPenerima: createEnkripsi(namaPenerima),
    rekeningPenerima: createEnkripsi(rekeningPenerima),
    bankPenerima: createEnkripsi(bankPenerima),
    nominal: nominal.toString(),
    tokoNama,
    tokoAlamat,
    strukFileUrl: strukPath,
    fotoBarangUrl: fotoBarangPath,
    fakultasId: String(user.fakultasId),
    prodiId: user.prodiId ? String(user.prodiId) : null,
    createdBy: user.id,
  });

  return {
    success: true,
    message: "Barang berhasil diupload",
    data: hasil.insertId,
  };
});
