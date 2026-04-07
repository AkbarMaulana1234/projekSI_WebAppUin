import {
  mysqlTable,
  bigint,
  varchar,
  date,
  timestamp,
} from "drizzle-orm/mysql-core";
import { pengajuanRabTable } from "./pengajuanRabSchema";

export const kegiatanTable = mysqlTable("kegiatan", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  pengajuanRabId: bigint("pengajuan_rab_id", { mode: "number" })
    .notNull()
    .references(() => pengajuanRabTable.id, { onDelete: "cascade" }),
  statusKegiatan: varchar("status_kegiatan", { length: 50 }).default(
    "BELUM_DILAKSANAKAN",
  ),
  tanggalMulai: date("tanggal_mulai", { mode: "string" }),
  tanggalSelesai: date("tanggal_selesai", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});
