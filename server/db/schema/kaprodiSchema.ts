import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const kaprodiTable = mysqlTable("kaprodi_table", {
  id: int("id").autoincrement().primaryKey(),
  nama_prodi: varchar("nama_prodi", { length: 100 }).notNull(),
  kode_prodi: varchar("kode_prodi", { length: 50 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
