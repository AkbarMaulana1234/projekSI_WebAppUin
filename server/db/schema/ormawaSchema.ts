import { mysqlTable, bigint, varchar } from "drizzle-orm/mysql-core";
import { programStudiTable } from "./programStudiSchema";

export const ormawaTable = mysqlTable("ormawa", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  nama: varchar("nama", { length: 255 }).notNull(),
  kode: varchar("kode", { length: 50 }).unique().notNull(),
  prodiId: bigint("prodi_id", { mode: "number" })
    .notNull()
    .references(() => programStudiTable.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
});
