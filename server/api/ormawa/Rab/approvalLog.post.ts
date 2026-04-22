import {
  approvalLogTable,
  pengajuanRabTable,
  usersTable,
} from "~~/server/db/schema";
import { useDrizzle } from "~~/server/db";
import { eq, and, desc, asc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { rabId } = body;
  const { user } = event.context;
  const db = useDrizzle();

  // Validasi input
  if (!rabId) {
    throw createError({
      statusCode: 400,
      statusMessage: "rabId is required",
    });
  }

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  // Cek apakah pengajuan RAB dengan id tersebut ada dan milik user yang sedang login
  const pengajuan = await db
    .select()
    .from(pengajuanRabTable)
    .where(
      and(
        eq(pengajuanRabTable.id, rabId),
        eq(pengajuanRabTable.usersId, user.id),
      ),
    )
    .limit(1);
  if (pengajuan.length === 0) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: RAB not found or not owned by user",
    });
  }

  // Ambil approval log untuk RAB tersebut
  const applog = await db
    .select({
      approvalLog: approvalLogTable,
      actor: {
        fullname: usersTable.fullName,
        role: usersTable.role,
      },
    })
    .from(approvalLogTable)
    .innerJoin(usersTable, eq(usersTable.id, approvalLogTable.actorId))
    .where(eq(approvalLogTable.pengajuanRabId, rabId))
    .orderBy(desc(approvalLogTable.createdAt));
  console.log(applog);
  return {
    success: true,
    data: applog,
  };
});
