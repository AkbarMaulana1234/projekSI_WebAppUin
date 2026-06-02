import {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { kegiatanTable } from "./KegiatanSchema";
import { usersTable } from "./usersSchema";
import { programStudiTable } from "./programStudiSchema";
import { fakultasTable } from "./fakultasSchema";

export const dokumentasiStatusEnum = [
  "MENUNGGU",
  "DITERIMA",
  "DITOLAK",
  "REVISI",
] as const;
export type DokumentasiStatus = (typeof dokumentasiStatusEnum)[number];

export const dokumentasiKegiatanTable = mysqlTable("dokumentasi_kegiatan", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  kegiatanId: bigint("kegiatan_id", { mode: "number" })
    .notNull()
    .references(() => kegiatanTable.id, { onDelete: "cascade" }),
  tipeDokumen: varchar("tipe_dokumen", { length: 50 }).notNull(),
  deskripsi: text("deskripsi"),
  fakultasId: varchar("fakultas_Id", { length: 50 })
    .notNull()
    .references(() => fakultasTable.id),
  prodiId: varchar("prodi_id", { length: 50 }).references(
    () => programStudiTable.id,
  ),
  status: mysqlEnum("status", dokumentasiStatusEnum)
    .default("MENUNGGU")
    .notNull(),
  fileUrl: text("file_url").notNull(),

  namaToko: varchar("nama_toko", { length: 100 }),
  nomorRekeningToko: varchar("nomor_rekening_toko", { length: 100 }),
  namaPemilikRekeningToko: varchar("nama_pemilik_rekening_toko", {
    length: 100,
  }),
  fotoBarangUrl: text("foto_barang_url"),
  strukBelanjaUrl: text("struk_belanja_url"),

  namaPenyediaJasa: varchar("nama_penyedia_jasa", { length: 100 }),
  nomorRekeningJasa: varchar("nomor_rekening_jasa", { length: 100 }),
  namaPemilikRekeningJasa: varchar("nama_pemilik_rekening_jasa", {
    length: 100,
  }),
  skUrl: text("sk_url"),
  spmtUrl: text("spmt_url"),
  amprahUrl: text("amprah_url"),
  npwpUrl: text("npwp_url"),
  ktpUrl: text("ktp_url"),

  uploadedBy: bigint("uploaded_by", { mode: "number" })
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),

  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});
