import { useDrizzle } from "../../db/index";
import { pengajuanRabTable } from "../../db/schema/pengajuanRabSchema";

export default defineEventHandler(async () => {
  const db = useDrizzle();
  const data = await db.select().from(pengajuanRabTable);

  return {
    total: data.length,
    disetujui: data.filter((d) => d.status === "approved_ppk").length,
    revisi: data.filter((d) => d.status === "revisi_ppk").length,
  };
});