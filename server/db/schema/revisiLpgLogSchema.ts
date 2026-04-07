import { mysqlTable, bigint, text, timestamp } from "drizzle-orm/mysql-core";
import { lpgTable } from "./lpgSchema";
import { usersTable } from "./usersSchema";

export const revisiLpgLogTable = mysqlTable("revisi_lpg_log", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  lpgId: bigint("lpg_id", { mode: "number" })
    .notNull()
    .references(() => lpgTable.id, { onDelete: "cascade" }),
  requesterId: bigint("requester_id", { mode: "number" })
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  catatanRevisi: text("catatan_revisi").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});
