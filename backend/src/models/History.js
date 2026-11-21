import mongoose from "mongoose";
import { jsonOptions } from "./options.js";

const historySchema = new mongoose.Schema({
  actor: { type: String, default: "Sistema" },
  action: { type: String, required: true },
  record: { type: String, default: "" },
  date: { type: Date, default: Date.now },
});

historySchema.set("toJSON", jsonOptions);

export const History = mongoose.model("History", historySchema);
