import {
  mysqlTable,
  bigint,
  varchar,
  text,
  decimal,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { kegiatanTable } from "./KegiatanSchema";
import { usersTable } from "./usersSchema";
import { programStudiTable } from "./programStudiSchema";
import { fakultasTable } from "./fakultasSchema";
export const tagihanStatusEnum = [
  "WAITING_PEMBAYARAN",
  "TERVERIFIKASI",
  "DIKEMBALIKAN",
  "SELESAI",
  "DITOLAK",
] as const;
export type TagihanStatus = (typeof tagihanStatusEnum)[number];

export const tagihanPencairanTable = mysqlTable("tagihan_pencairan", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  kegiatanId: bigint("kegiatan_id", { mode: "number" })
    .notNull()
    .references(() => kegiatanTable.id, { onDelete: "cascade" }),
  tipeTagihan: varchar("tipe_tagihan", { length: 50 }).notNull(),
  fakultasId: varchar("fakultas_Id", { length: 50 })
    .notNull()
    .references(() => fakultasTable.id),
  prodiId: varchar("prodi_id", { length: 50 }).references(
    () => programStudiTable.id,
  ),
  skNomor: varchar("sk_nomor", { length: 255 }),
  skFileUrl: text("sk_file_url"),

  spmtNomor: varchar("spmt_nomor", { length: 255 }),
  spmtFileUrl: text("spmt_file_url"),

  amprahNomor: varchar("amprah_nomor", { length: 255 }),
  amprahFileUrl: text("amprah_file_url"),

  npwpNomor: varchar("npwp_nomor", { length: 255 }),
  npwpFileUrl: text("npwp_file_url"),

  ktpNomor: varchar("ktp_nomor", { length: 255 }),
  ktpFileUrl: text("ktp_file_url"),

  namaPenerima: varchar("nama_penerima", { length: 255 }).notNull(),
  bankPenerima: varchar("bank_penerima", { length: 100 }),
  rekeningPenerima: varchar("rekening_penerima", { length: 255 }).notNull(),
  bukuRekeningFileUrl: text("buku_rekening_file_url"),

  nominal: decimal("nominal", { precision: 15, scale: 2 }).notNull(),
  tokoNama: varchar("toko_nama", { length: 255 }),
  tokoAlamat: text("toko_alamat"),
  strukFileUrl: text("struk_file_url"),
  fotoBarangUrl: text("foto_barang_url"),

  statusTagihan: mysqlEnum("status_tagihan", tagihanStatusEnum).default(
    "WAITING_PEMBAYARAN",
  ),
  createdBy: bigint("created_by", { mode: "number" })
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});
