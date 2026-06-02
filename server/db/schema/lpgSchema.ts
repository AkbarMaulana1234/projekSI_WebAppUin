import {
  mysqlTable,
  bigint,
  text,
  timestamp,
  varchar,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { kegiatanTable } from "./KegiatanSchema";
import { usersTable } from "./usersSchema";

export const StatusLpg = ["WAITING_SPI", "DISETUJUI", "REVISI_SPI"] as const;
export type StatusLpgType = (typeof StatusLpg)[number];

export const lpgTable = mysqlTable("lpg", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  kegiatanId: bigint("kegiatan_id", { mode: "number" })
    .notNull()
    .references(() => kegiatanTable.id, { onDelete: "cascade" }),
  fileLpgUrl: text("file_lpg_url").notNull(),
  statusLpg: mysqlEnum("status_lpg", StatusLpg)
    .notNull()
    .default("WAITING_SPI"),
  spiNotes: text("spi_notes"),
  uploadedBy: bigint("uploaded_by", { mode: "number" })
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  lastRevisedBy: bigint("last_revised_by", { mode: "number" }).references(
    () => usersTable.id,
    { onDelete: "set null" },
  ),
  approvedBy: bigint("approved_by", { mode: "number" }).references(
    () => usersTable.id,
    { onDelete: "set null" },
  ),
  approvedAt: timestamp("approved_at", { mode: "string" }),
  submittedAt: timestamp("submitted_at", { mode: "string" })
    .defaultNow()
    .notNull(),
  archivedAt: timestamp("archived_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});
