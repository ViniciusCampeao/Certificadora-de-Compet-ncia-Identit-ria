import mongoose from "mongoose";
import { jsonOptions } from "./options.js";

const termSchema = new mongoose.Schema(
  {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      required: true,
      unique: true,
    },
    generatedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Gerado", "Em análise", "Aprovado", "Rejeitado"],
      default: "Gerado",
    },
    signedFileName: { type: String, default: "" },
    signedOriginalName: { type: String, default: "" },
    approvedAt: { type: Date, default: null },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

termSchema.set("toJSON", jsonOptions);

export const Term = mongoose.model("Term", termSchema);
