import { Router } from "express";
import { list, create, addParticipant } from "../controllers/workshops.js";

const router = Router();
router.get("/", list);
router.post("/", create);
router.post("/:id/participants", addParticipant);
export default router;
