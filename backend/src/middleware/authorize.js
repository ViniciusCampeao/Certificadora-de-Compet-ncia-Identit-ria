import { ApiError } from "../lib/http.js";

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(new ApiError(401, "Autenticação necessária"));
    if (roles.length && !roles.includes(req.user.role))
      return next(new ApiError(403, "Acesso não autorizado para o seu perfil"));
    next();
  };
