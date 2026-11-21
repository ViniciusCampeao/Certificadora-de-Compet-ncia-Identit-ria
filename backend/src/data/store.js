import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(root, "..", "..", "data", "db.json");

export const load = async () => JSON.parse(await readFile(dbPath, "utf8"));

export const save = async (db) =>
  writeFile(dbPath, JSON.stringify(db, null, 2) + "\n");

export const ensureStore = () =>
  mkdir(path.dirname(dbPath), { recursive: true });
