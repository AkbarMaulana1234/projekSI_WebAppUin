import fs from "node:fs";
import path from "node:path";
import { useDrizzle } from "~~/server/db";
import { eq } from "drizzle-orm";
import { lpgTable } from "../../../db/schema/lpgSchema";
import { kegiatanTable } from "../../../db/schema/KegiatanSchema";
import { pengajuanRabTable } from "../../../db/schema/pengajuanRabSchema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { rabId } = body;

  if (!rabId) {
    throw createError({ statusCode: 400, message: "ID RAB tidak valid" });
  }

  const { user } = event.context;
  const db = useDrizzle();

  // Validate access and get the file URL
  const result = await db
    .select({
      fileLpgUrl: lpgTable.fileLpgUrl,
      usersId: pengajuanRabTable.usersId,
    })
    .from(lpgTable)
    .innerJoin(kegiatanTable, eq(lpgTable.kegiatanId, kegiatanTable.id))
    .innerJoin(
      pengajuanRabTable,
      eq(kegiatanTable.pengajuanRabId, pengajuanRabTable.id),
    )
    .where(eq(pengajuanRabTable.id, Number(rabId)))
    .limit(1);

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      message: "Data LPG tidak ditemukan",
    });
  }

  const lpgData = result[0];

  // Access control: only the owner Ormawa or SPI/Admin can view it

  if (!lpgData.fileLpgUrl) {
    throw createError({
      statusCode: 404,
      message: `File LPJ belum diunggah`,
    });
  }

  const filePath = path.resolve(process.cwd(), lpgData.fileLpgUrl.trim());
  console.log(filePath);
  if (!fs.existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      message: `File tidak ditemukan secara fisik`,
    });
  }

  const contentType = "application/pdf";

  setHeader(event, "Content-Type", contentType);
  setHeader(
    event,
    "Content-Disposition",
    `inline; filename="${path.basename(filePath)}"`,
  );

  return sendStream(event, fs.createReadStream(filePath));
});
