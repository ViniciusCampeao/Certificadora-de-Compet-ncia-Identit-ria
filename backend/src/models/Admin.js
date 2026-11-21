import mongoose from "mongoose";
import { jsonOptions } from "./options.js";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

adminSchema.set("toJSON", jsonOptions);

export const Admin = mongoose.model("Admin", adminSchema);
