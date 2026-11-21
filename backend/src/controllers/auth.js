import { asyncHandler, ApiError } from "../lib/http.js";

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "ellp-demo")
    return res.json({
      name: "Administrador de demonstração",
      role: "admin",
      demo: true,
    });
  throw new ApiError(401, "Usuário ou senha inválidos");
});
