import mongoose from "mongoose";
import { jsonOptions } from "./options.js";

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    registration: { type: String, required: true, unique: true, trim: true },
    cpf: { type: String, default: "" },
    course: { type: String, default: "Não informado" },
    period: { type: String, default: "Não informado" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    joined: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    left: { type: String, default: "" },
    type: { type: String, default: "Voluntário" },
    status: { type: String, enum: ["Ativo", "Encerrado"], default: "Ativo" },
    workshops: { type: [String], default: [] },
    termStatus: {
      type: String,
      enum: ["Pendente", "Em análise", "Aprovado", "Rejeitado"],
      default: "Pendente",
    },
    passwordHash: { type: String, select: false },
    mustChangePassword: { type: Boolean, default: true },
  },
  { timestamps: true },
);

volunteerSchema.set("toJSON", jsonOptions);

export const Volunteer = mongoose.model("Volunteer", volunteerSchema);
