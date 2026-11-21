import { asyncHandler } from "../lib/http.js";
import { History } from "../models/index.js";

export const list = asyncHandler(async (req, res) => {
  const items = await History.find().sort({ date: -1 }).limit(30);
  res.json(items);
});
