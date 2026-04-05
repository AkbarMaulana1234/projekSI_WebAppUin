import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./server/db/schema/*.ts",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    port: 3306,
  },
});
