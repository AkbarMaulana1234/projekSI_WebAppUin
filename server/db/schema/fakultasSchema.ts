import { mysqlTable, bigint, varchar } from "drizzle-orm/mysql-core";

export const fakultasTable = mysqlTable("fakultas", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  nama: varchar("nama", { length: 255 }).notNull(),
  kode: varchar("kode", { length: 50 }).unique().notNull(),
});
