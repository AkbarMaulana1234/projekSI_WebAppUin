import {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
  int,
} from "drizzle-orm/mysql-core";
import { pengajuanRabTable } from "./pengajuanRabSchema";
import { usersTable } from "./usersSchema";

export const approvalLogTable = mysqlTable("approval_log", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  pengajuanRabId: int("pengajuan_rab_id")
    .notNull()
    .references(() => pengajuanRabTable.id, { onDelete: "cascade" }),
  actorId: bigint("actor_id", { mode: "number" })
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  roleActor: varchar("role_actor", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // setuju, revisi, tolak
  catatanRevisi: text("catatan_revisi"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});
