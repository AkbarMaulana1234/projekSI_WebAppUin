import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { usersTable } from "./usersSchema";
export const statusEnum = [
  "draft",
  "waiting_kaprodi",
  "revisi_kaprodi",
  "waiting_ppk",
  "revisi_ppk",
  "waiting_spi",
  "ditolak_spi",
  "disetujui",
  "selesai_spi",
] as const;
export type StatusEnum = (typeof statusEnum)[number];
export const pengajuanRabTable = mysqlTable("pengajuan_rab", {
  id: int("id").autoincrement().primaryKey(),
  nomorPengajuan: varchar("nomor_pengajuan", { length: 100 })
    .unique()
    .notNull(),
  usersId: varchar("users_id", { length: 50 })
    .notNull()
    .references(() => usersTable.users_id),
  judulKegiatan: varchar("judul_kegiatan", { length: 500 }).notNull(),
  deskripsi: text("deskripsi"),
  fileRabUrl: text("file_rab_url").notNull(),
  totalAnggaran: decimal("total_anggaran", {
    precision: 15,
    scale: 2,
  }).notNull(),
  status: mysqlEnum("status", statusEnum).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
