import "dotenv/config";

export const env = {
  port: Number(process.env.API_PORT || 3001),
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
