import { usersTable } from "../db/schema/usersSchema";
import { useDrizzle } from "../db";

export default defineEventHandler((event) => {
  const users = useDrizzle().select().from(usersTable);
  return users;
});
