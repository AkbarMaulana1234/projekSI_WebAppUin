import { useDrizzle } from "../../db/index";
import { pengajuanRabTable } from "../../db/schema/pengajuanRabSchema";

export default defineEventHandler(async () => {
  const db = useDrizzle();
  const data = await db.select().from(pengajuanRabTable);
  return data.map((item) => ({
    ...item,
    status_rab: item.status,
  }));
});