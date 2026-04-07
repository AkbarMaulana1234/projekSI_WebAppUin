import {
  mysqlTable,
  bigint,
  varchar,
  text,
  json,
  timestamp,
} from "drizzle-orm/mysql-core";
import { usersTable } from "./usersSchema";

export const auditLogTable = mysqlTable("audit_log", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  tableName: varchar("table_name", { length: 100 }),
  recordId: bigint("record_id", { mode: "number" }),
  action: varchar("action", { length: 20 }),
  oldData: json("old_data"),
  newData: json("new_data"),
  userId: bigint("user_id", { mode: "number" }).references(
    () => usersTable.id,
    {
      onDelete: "set null",
    },
  ),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});
