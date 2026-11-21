import mongoose from "mongoose";
import { jsonOptions } from "./options.js";

const workshopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    duration: { type: Number, default: 1, min: 1 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" }],
  },
  { timestamps: true },
);

workshopSchema.set("toJSON", jsonOptions);

export const Workshop = mongoose.model("Workshop", workshopSchema);
