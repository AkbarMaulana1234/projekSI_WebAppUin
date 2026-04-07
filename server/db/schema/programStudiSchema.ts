import { mysqlTable, bigint, varchar } from "drizzle-orm/mysql-core";
import { fakultasTable } from "./fakultasSchema";

export const programStudiTable = mysqlTable("program_studi", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  nama: varchar("nama", { length: 255 }).notNull(),
  kode: varchar("kode", { length: 50 }).unique().notNull(),
  fakultasId: bigint("fakultas_id", { mode: "number" })
    .notNull()
    .references(() => fakultasTable.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
});
