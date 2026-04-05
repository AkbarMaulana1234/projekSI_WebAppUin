import { int, mysqlEnum, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users_table", {
  id: int("id").autoincrement().primaryKey(),
  name_lengkap: varchar("name_lengkap", { length: 255 }).notNull(),
  id_users: varchar("id_users", { length: 25 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  jabatan: varchar("jabatan", { length: 100 }).notNull(),
  role: mysqlEnum("role", [
    "kaprodi",
    "ormawa",
    "dekan",
    "SPI",
    "PPK",
    "kabag",
  ]).notNull(),
});
