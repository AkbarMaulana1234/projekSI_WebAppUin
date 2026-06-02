import { useDrizzle } from "~~/server/db/index";
import { programStudiTable } from "~~/server/db/schema/programStudiSchema";
import { fakultasTable } from "~~/server/db/schema/fakultasSchema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const data = await db
      .select({
        id: programStudiTable.id,
        nama: programStudiTable.nama,
        kode: programStudiTable.kode,
        fakultasId: programStudiTable.fakultasId,
        namaFakultas: fakultasTable.nama,
      })
      .from(programStudiTable)
      .leftJoin(fakultasTable, eq(programStudiTable.fakultasId, fakultasTable.id));
    
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil data program studi",
    };
  }
});
