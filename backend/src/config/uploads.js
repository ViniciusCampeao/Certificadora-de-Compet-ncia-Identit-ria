import multer from "multer";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ApiError } from "../lib/http.js";

const root = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(root, "..", "..", "uploads");
mkdirSync(uploadsDir, { recursive: true });

const allowed = [".pdf", ".png", ".jpg", ".jpeg"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".pdf";
    cb(null, `termo-${req.user.id}-${Date.now()}${ext}`);
  },
});

export const uploadSignedTerm = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new ApiError(400, "Envie um arquivo PDF ou imagem (PNG/JPG)"));
  },
}).single("file");
