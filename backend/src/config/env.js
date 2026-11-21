import "dotenv/config";

export const env = {
  port: Number(process.env.API_PORT || 3001),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ellp_ctrl",
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
