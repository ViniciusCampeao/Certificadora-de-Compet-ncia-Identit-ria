import { asyncHandler } from "../lib/http.js";
import { load } from "../data/store.js";

export const list = asyncHandler(async (req, res) => {
  const db = await load();
  res.json(db.history.slice(0, 30));
});
