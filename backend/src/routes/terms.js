import { Router } from "express";
import {
  list,
  generate,
  review,
  downloadGenerated,
  downloadSigned,
  myTerm,
  downloadMine,
  uploadMine,
} from "../controllers/terms.js";
import { requireAuth } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { uploadSignedTerm } from "../config/uploads.js";

const router = Router();

// Voluntário (rotas específicas antes de "/:id")
router.get("/me", requireAuth, authorize("voluntario"), myTerm);
router.get("/me/pdf", requireAuth, authorize("voluntario"), downloadMine);
router.post(
  "/me/signed",
  requireAuth,
  authorize("voluntario"),
  uploadSignedTerm,
  uploadMine,
);

// Administrador
router.get("/", requireAuth, authorize("admin"), list);
router.post("/", requireAuth, authorize("admin"), generate);
router.get("/:id/pdf", requireAuth, downloadGenerated);
router.get("/:id/signed", requireAuth, authorize("admin"), downloadSigned);
router.patch("/:id", requireAuth, authorize("admin"), review);

export default router;
