import { timestamp } from "drizzle-orm/mysql-core";
import { mysqlTable, int, text, varchar } from "drizzle-orm/mysql-core";
import { usersTable } from "./usersSchema";

export const pengajuanRabTable = mysqlTable("pengajuanRab_table", (t) => ({
  id: t.int("id").autoincrement().primaryKey(),
  nomor_pengajuan: t.varchar("nomor_pengajuan", { length: 100 }).notNull(),
  users_id: t
    .bigint("users_id", { mode: "number" })
    .notNull()
    .references(() => usersTable.id, { onDelete: "set null" }),
  judul_kegiatan: t.varchar("judul_kegiatan", { length: 500 }).notNull(),
  deskripsi: t.text("deskripsi"),
  file_rab: t.text("file_rab").notNull(),
  total_anggaran: t.varchar("total_anggaran", { length: 50 }).notNull(),
  status: t.varchar("status", { length: 50 }).default("draft"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}));
