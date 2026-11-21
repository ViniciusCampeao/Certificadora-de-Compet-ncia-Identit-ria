import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import auth from "./auth.js";
import dashboard from "./dashboard.js";
import volunteers from "./volunteers.js";
import workshops from "./workshops.js";
import history from "./history.js";

const api = Router();

api.get("/health", (req, res) =>
  res.json({ status: "ok", storage: "MongoDB" }),
);
api.use("/auth", auth);
api.use("/dashboard", requireAuth, authorize("admin"), dashboard);
api.use("/volunteers", volunteers);
api.use("/workshops", requireAuth, authorize("admin"), workshops);
api.use("/history", requireAuth, authorize("admin"), history);

export default api;
