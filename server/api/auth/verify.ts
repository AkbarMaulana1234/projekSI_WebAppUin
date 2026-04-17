import { getCookie, createError } from "h3";
import { usersTable } from "~~/server/db/schema";
import { useDrizzle } from "~~/server/db";
import { eq, and } from "drizzle-orm";
import { User } from "~~/server/interface/userInterface";
export default defineEventHandler(async (event) => {
  const token = getCookie(event, "jwt_token");
  if (!token || token == "") {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: Token not found",
      data: {
        valid: false,
        user: null,
      },
    });
  }
  const decoded: User = <User>verifyJwt(token);
  if (!decoded) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: Invalid or expired token",
      data: {
        valid: false,
        user: null,
      },
    });
  }
  const check = await useDrizzle().query.usersTable.findFirst({
    where: eq(usersTable.id, decoded.id),
  });
  if (!check) {
    throw createError({
      status: 401,
      message: "user tidak valid",
      data: {
        valid: false,
        user: null,
      },
    });
  }

  return {
    valid: true,
    message: "Token is valid",
    user: decoded,
  };
});
