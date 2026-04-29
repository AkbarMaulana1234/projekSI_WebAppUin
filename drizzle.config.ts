import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./server/db/schema/*.ts",
  dialect: "mysql",
  dbCredentials: {
    host: "localhost", // alamat server MySQL
    port: 3306, // port default MySQL
    user: "root", // username MySQL
    password: "admin1234", // password MySQL
    database: "e_administrasi", // nama database yang kamu buat
  },
});
