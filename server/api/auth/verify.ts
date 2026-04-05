import { getCookie, createError } from "h3";

export default defineEventHandler((event) => {
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
  const decoded = verifyJwt(token);
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
  return {
    valid: true,
    message: "Token is valid",
    user: decoded,
  };
});
