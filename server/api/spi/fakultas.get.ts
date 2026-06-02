import { useDrizzle } from "~~/server/db/index";
import { fakultasTable } from "~~/server/db/schema/fakultasSchema";

export default defineEventHandler(async (event) => {
  try {
    const db = useDrizzle();
    const data = await db.select().from(fakultasTable);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil data fakultas",
    };
  }
});
