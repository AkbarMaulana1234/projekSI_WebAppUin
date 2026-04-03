import { int, mysqlEnum, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users_table", {
  id: int("id").autoincrement().primaryKey(),
  name_lengkap: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 12 }).notNull(),
  jabatan: varchar({ length: 32 }).notNull(),
  role: mysqlEnum("role", [
    "kaprodi",
    "ormawa",
    "dekan",
    "SPI",
    "PPK",
    "kabag",
  ]).notNull(),
});
