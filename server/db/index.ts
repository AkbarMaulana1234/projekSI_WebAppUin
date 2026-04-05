import * as schema from "./schema/usersSchema";
import "dotenv/config";
import { mysqlSchema } from "drizzle-orm/mysql-core";
import { drizzle } from "drizzle-orm/mysql2";

export type users = typeof schema.usersTable.$inferSelect;
const db = drizzle(process.env.DATABASE_URL!, {
  schema,
  mode: "default",
});

export function useDrizzle() {
  return db;
}
