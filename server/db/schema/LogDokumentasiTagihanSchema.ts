import {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  json,
} from "drizzle-orm/mysql-core";
import { dokumentasiKegiatanTable } from "./dokumentasiSchema";
import { tagihanPencairanTable } from "./TagihanPencairanSchema";
import { usersTable } from "./usersSchema";

/**
 * Log untuk mencatat semua aktivitas pada dokumentasi kegiatan dan tagihan pencairan.
 * - dokumentasiId diisi jika log terkait dokumentasi, tagihanId = null
 * - tagihanId diisi jika log terkait tagihan, dokumentasiId = null
 */
export const logDokumentasiTagihanTable = mysqlTable(
  "log_dokumentasi_tagihan",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

    dokumentasiId: bigint("dokumentasi_id", { mode: "number" }).references(
      () => dokumentasiKegiatanTable.id,
      { onDelete: "set null" },
    ),

    tagihanId: bigint("tagihan_id", { mode: "number" }).references(
      () => tagihanPencairanTable.id,
      { onDelete: "set null" },
    ),

    action: mysqlEnum("action", [
      "review",
      "approve",
      "reject",
      "pay",
      "revisi",
    ]).notNull(),
    komentar: text("komentar").notNull(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
);
