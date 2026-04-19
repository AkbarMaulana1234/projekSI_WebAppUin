import { pengajuanRabTable } from "~~/server/db/schema";
import { useDrizzle } from "~~/server/db";
import { eq, sql } from "drizzle-orm";
import { usersTable } from "~~/server/db/schema";
export default defineEventHandler(async (event) => {
  const { page, row } = await readBody(event);

  // Ambil user dari middleware
  const user = event.context.user;

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const db = useDrizzle();

  // Hitung offset
  const limit = Number(row) || 10;
  const offset = (Number(page) - 1) * limit;

  // Ambil data sesuai user.id

  const data = await db
    .select({
      pengajuanRabTable,
      username: usersTable.fullName,
    })
    .from(pengajuanRabTable)
    .innerJoin(usersTable, eq(pengajuanRabTable.usersId, usersTable.id));

  // Hitung total data user
  const total = await db
    .select({ count: sql`COUNT(*)` })
    .from(pengajuanRabTable)
    .where(eq(pengajuanRabTable.usersId, user.id));

  return {
    page,
    row,
    limit,
    offset,
    total: total[0]?.count ?? 0,
    data,
  };
});
