import { mysqlTable, bigint, varchar } from "drizzle-orm/mysql-core";
import { programStudiTable } from "./programStudiSchema";
import { fakultasTable } from "./fakultasSchema";

export const ormawaTable = mysqlTable("ormawa", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  nama: varchar("nama", { length: 255 }).notNull(),
  kode: varchar("kode", { length: 50 }).unique().notNull(),
  totalAnggaran: bigint("totalAnggaran", { mode: "number" })
    .default(0)
    .notNull(),
  fakultasId: bigint("fakultas_id", { mode: "number" })
    .notNull()
    .references(() => fakultasTable.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  prodiId: bigint("prodi_id", { mode: "number" }).references(
    () => programStudiTable.id,
    {
      onDelete: "set null",
      onUpdate: "cascade",
    },
  ),
});
