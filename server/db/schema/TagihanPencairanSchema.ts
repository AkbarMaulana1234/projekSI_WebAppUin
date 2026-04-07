import {
  mysqlTable,
  bigint,
  varchar,
  text,
  decimal,
  timestamp,
} from "drizzle-orm/mysql-core";
import { kegiatanTable } from "./KegiatanSchema";
import { usersTable } from "./usersSchema";

export const tagihanPencairanTable = mysqlTable("tagihan_pencairan", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  kegiatanId: bigint("kegiatan_id", { mode: "number" })
    .notNull()
    .references(() => kegiatanTable.id, { onDelete: "cascade" }),
  tipeTagihan: varchar("tipe_tagihan", { length: 50 }).notNull(),
  skNomor: varchar("sk_nomor", { length: 100 }),
  skFileUrl: text("sk_file_url"),
  namaPenerima: varchar("nama_penerima", { length: 255 }).notNull(),
  rekeningPenerima: varchar("rekening_penerima", { length: 100 }).notNull(),
  bankPenerima: varchar("bank_penerima", { length: 100 }),
  nominal: decimal("nominal", { precision: 15, scale: 2 }).notNull(),
  tokoNama: varchar("toko_nama", { length: 255 }),
  tokoAlamat: text("toko_alamat"),
  strukFileUrl: text("struk_file_url"),
  statusTagihan: varchar("status_tagihan", { length: 50 }).default(
    "WAITING_PEMBAYARAN",
  ),
  createdBy: bigint("created_by", { mode: "number" })
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});
