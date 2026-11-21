import { Router } from "express";
import auth from "./auth.js";
import dashboard from "./dashboard.js";
import volunteers from "./volunteers.js";
import workshops from "./workshops.js";
import history from "./history.js";

const api = Router();

api.get("/health", (req, res) =>
  res.json({ status: "ok", storage: "arquivo JSON local", demo: true }),
);
api.use("/auth", auth);
api.use("/dashboard", dashboard);
api.use("/volunteers", volunteers);
api.use("/workshops", workshops);
api.use("/history", history);

export default api;
