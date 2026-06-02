import { useDrizzle } from "~~/server/db";
import { eq } from "drizzle-orm";
import { pembayaranTable } from "~~/server/db/schema/PembayaranSchema";

export default defineEventHandler(async (event) => {
  return "helloWorld";
});
