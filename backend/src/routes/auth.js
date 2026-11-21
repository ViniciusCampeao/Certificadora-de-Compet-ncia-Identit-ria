import { Router } from "express";
import { login, me, changePassword } from "../controllers/auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/senha", requireAuth, changePassword);
export default router;
