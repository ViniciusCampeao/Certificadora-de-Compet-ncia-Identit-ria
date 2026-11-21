import "dotenv/config";

export const env = {
  port: Number(process.env.API_PORT || 3001),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ellp_ctrl",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jwtSecret: process.env.JWT_SECRET || "troque-esta-chave-em-producao",
  jwtExpires: process.env.JWT_EXPIRES || "8h",
  admin: {
    name: process.env.ADMIN_NAME || "Administrador do ELLP",
    username: process.env.ADMIN_USER || "admin",
    password: process.env.ADMIN_PASSWORD || "ellp-admin",
  },
  volunteerDefaultPassword: process.env.VOLUNTARIO_SENHA_PADRAO || "ellp-2026",
};
