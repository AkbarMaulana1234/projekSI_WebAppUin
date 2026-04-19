import { defineEventHandler, readBody, createError } from "h3";
import { useDrizzle } from "../../db/index";
import { pengajuanRabTable } from "../../db/schema/pengajuanRabSchema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = Number(body.id);

  if (Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid id" });
  }

  await useDrizzle()
    .update(pengajuanRabTable)
    .set({ status: "approved_ppk" })
    .where(eq(pengajuanRabTable.id, id));

  return {
    success: true,
    message: "Proposal disetujui PPK",
  };
});