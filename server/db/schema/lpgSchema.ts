import {
  mysqlTable,
  bigint,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { kegiatanTable } from "./KegiatanSchema";

export const lpgTable = mysqlTable("lpg", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  kegiatanId: bigint("kegiatan_id", { mode: "number" })
    .notNull()
    .references(() => kegiatanTable.id, { onDelete: "cascade" }),
  fileLpgUrl: text("file_lpg_url").notNull(),
  statusLpg: varchar("status_lpg", { length: 50 }).default("WAITING_SPI"),
  spiNotes: text("spi_notes"),
  ormawaNotes: text("ormawa_notes"),
  submittedAt: timestamp("submitted_at", { mode: "string" })
    .defaultNow()
    .notNull(),
  archivedAt: timestamp("archived_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});
