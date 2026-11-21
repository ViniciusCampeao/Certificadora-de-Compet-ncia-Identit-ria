import { ApiError } from "../lib/http.js";

export const notFound = (req, res) =>
  res.status(404).json({ error: "Rota não encontrada" });

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err.type === "entity.parse.failed")
    return res.status(400).json({ error: "Corpo da requisição inválido" });
  if (err.name === "ValidationError") {
    const first = Object.values(err.errors || {})[0];
    return res
      .status(400)
      .json({ error: first?.message || "Dados inválidos" });
  }
  if (err.name === "CastError")
    return res.status(400).json({ error: "Identificador inválido" });
  if (err.name === "MulterError")
    return res
      .status(400)
      .json({ error: "Arquivo inválido ou acima do tamanho permitido" });
  if (err.code === 11000)
    return res.status(409).json({ error: "Registro já cadastrado" });

  const status = err instanceof ApiError ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: err.message || "Erro interno" });
};
