import { ApiError } from "../lib/http.js";
import { verifyToken } from "../utils/token.js";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token)
    return next(new ApiError(401, "Autenticação necessária"));
  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      name: payload.name,
      registration: payload.registration,
    };
    next();
  } catch {
    next(new ApiError(401, "Sessão inválida ou expirada"));
  }
};
