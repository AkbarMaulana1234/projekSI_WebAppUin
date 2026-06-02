import { useDrizzle } from "~~/server/db";
import { tagihanPencairanTable } from "~~/server/db/schema";
import { createFilePath } from "#imports";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createEnkripsi } from "~~/server/utils/enkripsiData";

export default defineEventHandler(async (event) => {
  const db = useDrizzle();
  const formData = await readMultipartFormData(event);

  console.log(formData);

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

  const getFile = (name: string) => {
    return formData.find((f) => f.name === name);
  };

  const kegiatanId = getField("kegiatanId");
  const namaPenerima = getField("namaPenerima");
  const rekeningPenerima = getField("rekeningPenerima");
  const bankPenerima = getField("bankPenerima");
  const nominal = getField("nominal");
  const skNomor = getField("skNomor");

  const skFile = getFile("skFile");
  const bukuRekeningFile = getFile("bukuRekeningFile");

  if (
    !kegiatanId ||
    !namaPenerima ||
    !rekeningPenerima ||
    !bankPenerima ||
    !nominal ||
    !skNomor ||
    !skFile ||
    !bukuRekeningFile
  ) {
    throw createError({
      statusCode: 400,
      message:
        "Field bertanda * wajib diisi (kegiatanId, namaPenerima, rekeningPenerima, bankPenerima, nominal, skNomor, skFile, bukuRekeningFile)",
    });
  }

  const spmtNomor = getField("spmtNomor");
  const amprahNomor = getField("amprahNomor");
  const npwpNomor = getField("npwpNomor");
  const ktpNomor = getField("ktpNomor");
  const spmtFile = getFile("spmtFile");
  const amprahFile = getFile("amprahFile");
  const npwpFile = getFile("npwpFile");
  const ktpFile = getFile("ktpFile");

  // User authentication
  const { user } = event.context;
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "User tidak terautentikasi",
    });
  }

  const saveFile = async (
    file: any,
    prefix: string,
  ): Promise<string | null> => {
    if (!file || !file.filename || !file.data) return null;
    const dir = await createFilePath("dokumentasi", "jasa", "");
    const ext = file.filename.split(".").pop();
    const fileName = `${Date.now()}_${prefix}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = join(dir, fileName);
    await writeFile(filePath, file.data);
    return filePath;
  };

  // Simpan semua file
  const skUrl = await saveFile(skFile, "sk");
  const bukuRekeningUrl = await saveFile(bukuRekeningFile, "buku_rekening");
  const spmtUrl = spmtFile ? await saveFile(spmtFile, "spmt") : null;
  const amprahUrl = amprahFile ? await saveFile(amprahFile, "amprah") : null;
  const npwpUrl = npwpFile ? await saveFile(npwpFile, "npwp") : null;
  const ktpUrl = ktpFile ? await saveFile(ktpFile, "ktp") : null;

  // Insert ke database
  const insertData = {
    kegiatanId: Number(kegiatanId),
    tipeTagihan: "JASA",
    skNomor: createEnkripsi(skNomor),
    skFileUrl: skUrl,
    spmtNomor: createEnkripsi(spmtNomor) || null,
    spmtFileUrl: spmtUrl,
    amprahNomor: createEnkripsi(amprahNomor) || null,
    amprahFileUrl: amprahUrl,
    npwpNomor: createEnkripsi(npwpNomor) || null,
    npwpFileUrl: npwpUrl,
    ktpNomor: createEnkripsi(ktpNomor) || null,
    ktpFileUrl: ktpUrl,
    namaPenerima: createEnkripsi(namaPenerima),
    bankPenerima: createEnkripsi(bankPenerima),
    rekeningPenerima: createEnkripsi(rekeningPenerima),
    bukuRekeningFileUrl: bukuRekeningUrl,
    nominal: nominal,
    statusTagihan: "WAITING_PEMBAYARAN",
    fakultasId: String(user.fakultasId),
    prodiId: user.prodiId ? String(user.prodiId) : null,
    createdBy: user.id,
  };

  const [hasil] = await db.insert(tagihanPencairanTable).values(insertData);

  return {
    success: true,
    message: "Data jasa berhasil disimpan",
    data: hasil.insertId,
  };
});
