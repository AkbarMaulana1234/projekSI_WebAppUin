import * as schema from "./schema/index";
import "dotenv/config";
import { mysqlSchema } from "drizzle-orm/mysql-core";
import { drizzle } from "drizzle-orm/mysql2";

const db = drizzle(process.env.DATABASE_URL!, {
  schema,
  mode: "default",
});

export function useDrizzle() {
  return db;
}
