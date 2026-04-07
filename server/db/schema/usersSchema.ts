import {
  mysqlTable,
  bigint,
  varchar,
  boolean,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { programStudiTable } from "./programStudiSchema";
import { ormawaTable } from "./ormawaSchema";
import { fakultasTable } from "./fakultasSchema";

export const usersTable = mysqlTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  users_id: varchar("users_id", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: mysqlEnum(["ormawa", "kaprodi", "ppk", "spi"]), // ormawa, kaprodi, ppk, spi
  prodiId: bigint("prodi_id", { mode: "number" }).references(
    () => programStudiTable.id,
    { onDelete: "set null" },
  ),
  ormawaId: bigint("ormawa_id", { mode: "number" }).references(
    () => ormawaTable.id,
    { onDelete: "set null" },
  ),
  fakultasId: bigint("fakultas_id", { mode: "number" }).references(
    () => fakultasTable.id,
    { onDelete: "set null" },
  ),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});
