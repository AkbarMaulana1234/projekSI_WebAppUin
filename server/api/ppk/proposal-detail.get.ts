import { useDrizzle } from "../../db/index";
import { pengajuanRabTable } from "../../db/schema/pengajuanRabSchema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = Number(query.id);

  if (Number.isNaN(id)) {
    return null;
  }

  const db = useDrizzle();
  const [data] = await db
    .select()
    .from(pengajuanRabTable)
    .where(eq(pengajuanRabTable.id, id));

  if (!data) {
    return null;
  }

  return {
    ...data,
    status_rab: data.status,
  };
});