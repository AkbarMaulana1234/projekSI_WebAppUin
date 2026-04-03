import * as schema from "./schema/usersSchema";
import "dotenv/config";
import { mysqlSchema } from "drizzle-orm/mysql-core";
import { drizzle } from "drizzle-orm/mysql2";

const db = drizzle(process.env.DATABASE_URL!);

export function useDrizzle() {
  return db;
}
export type users = typeof schema.usersTable.$inferSelect;
