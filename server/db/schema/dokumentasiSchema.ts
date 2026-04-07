import {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";
import { kegiatanTable } from "./KegiatanSchema";
import { usersTable } from "./usersSchema";

export const dokumentasiKegiatanTable = mysqlTable("dokumentasi_kegiatan", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  kegiatanId: bigint("kegiatan_id", { mode: "number" })
    .notNull()
    .references(() => kegiatanTable.id, { onDelete: "cascade" }),
  tipeDokumen: varchar("tipe_dokumen", { length: 50 }).notNull(),
  deskripsi: text("deskripsi"),
  fileUrl: text("file_url").notNull(),
  uploadedBy: bigint("uploaded_by", { mode: "number" })
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});
