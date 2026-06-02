import { useDrizzle } from "~~/server/db";
import { eq, desc } from "drizzle-orm";
import { logDokumentasiTagihanTable } from "~~/server/db/schema/LogDokumentasiTagihanSchema";
import { usersTable } from "~~/server/db/schema/usersSchema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id } = body;

  if (!id) {
    throw createError({ statusCode: 400, message: "ID wajib disertakan" });
  }

  const idStr = String(id);
  const isTagihan = idStr.startsWith("tagihan_");
  const realId = Number(idStr.replace("doc_", "").replace("tagihan_", ""));

  const db = useDrizzle();

  const logs = await db
    .select({
      id: logDokumentasiTagihanTable.id,
      action: logDokumentasiTagihanTable.action,
      komentar: logDokumentasiTagihanTable.komentar,
      createdAt: logDokumentasiTagihanTable.createdAt,
      user: {
        fullname: usersTable.fullName,
        role: usersTable.role,
      },
    })
    .from(logDokumentasiTagihanTable)
    .innerJoin(usersTable, eq(logDokumentasiTagihanTable.userId, usersTable.id))
    .where(
      isTagihan
        ? eq(logDokumentasiTagihanTable.tagihanId, realId)
        : eq(logDokumentasiTagihanTable.dokumentasiId, realId)
    )
    .orderBy(desc(logDokumentasiTagihanTable.createdAt));

  return {
    success: true,
    data: logs,
  };
});
