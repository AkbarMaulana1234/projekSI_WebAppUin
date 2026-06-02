import { useDrizzle } from "~~/server/db/index";
import { ormawaTable } from "~~/server/db/schema/ormawaSchema";
import { programStudiTable } from "~~/server/db/schema/programStudiSchema";
import { fakultasTable } from "~~/server/db/schema/fakultasSchema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const data = await db
      .select({
        id: ormawaTable.id,
        nama: ormawaTable.nama,
        kode: ormawaTable.kode,
        totalAnggaran: ormawaTable.totalAnggaran,
        fakultasId: ormawaTable.fakultasId,
        prodiId: ormawaTable.prodiId,
        namaProdi: programStudiTable.nama,
        namaFakultas: fakultasTable.nama,
      })
      .from(ormawaTable)
      .leftJoin(programStudiTable, eq(ormawaTable.prodiId, programStudiTable.id))
      .leftJoin(fakultasTable, eq(ormawaTable.fakultasId, fakultasTable.id));

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil data ormawa",
    };
  }
});
