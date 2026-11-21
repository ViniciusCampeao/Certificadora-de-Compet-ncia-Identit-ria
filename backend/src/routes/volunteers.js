import { Router } from "express";
import {
  list,
  create,
  update,
  remove,
  meProfile,
} from "../controllers/volunteers.js";
import { requireAuth } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/me", requireAuth, authorize("voluntario"), meProfile);
router.get("/", requireAuth, authorize("admin"), list);
router.post("/", requireAuth, authorize("admin"), create);
router.patch("/:id", requireAuth, authorize("admin"), update);
router.delete("/:id", requireAuth, authorize("admin"), remove);

export default router;
