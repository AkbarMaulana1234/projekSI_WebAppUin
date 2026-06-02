import {
  approvalLogTable,
  pengajuanRabTable,
  usersTable,
} from "~~/server/db/schema";
import { useDrizzle } from "~~/server/db";
import { eq, desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { rabId } = body;
    const { user } = event.context;

    if (!user || user.role !== "spi") {
      throw createError({ statusCode: 403, message: "Akses ditolak" });
    }

    if (!rabId) {
      throw createError({ statusCode: 400, message: "rabId wajib dikirim" });
    }

    const db = useDrizzle();
    const logs = await db
      .select({
        id: approvalLogTable.id,
        pengajuanRabId: approvalLogTable.pengajuanRabId,
        action: approvalLogTable.action,
        catatanRevisi: approvalLogTable.catatanRevisi,
        createdAt: approvalLogTable.createdAt,
        actor: {
          fullname: usersTable.fullName,
          role: usersTable.role,
        },
      })
      .from(approvalLogTable)
      .innerJoin(usersTable, eq(usersTable.id, approvalLogTable.actorId))
      .where(eq(approvalLogTable.pengajuanRabId, Number(rabId)))
      .orderBy(desc(approvalLogTable.createdAt));

    return {
      success: true,
      data: logs,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengambil log approval",
    };
  }
});
