import mongoose from "mongoose";
import { asyncHandler, ApiError } from "../lib/http.js";
import { Volunteer } from "../models/index.js";
import { record } from "../utils/history.js";
import { escapeRegex } from "../utils/text.js";

const editable = [
  "name",
  "course",
  "period",
  "email",
  "phone",
  "status",
  "termStatus",
];

const findVolunteer = async (id) => {
  if (!mongoose.isValidObjectId(id))
    throw new ApiError(404, "Voluntário não encontrado");
  const volunteer = await Volunteer.findById(id);
  if (!volunteer) throw new ApiError(404, "Voluntário não encontrado");
  return volunteer;
};

export const list = asyncHandler(async (req, res) => {
  const filter = {};
  const status = req.query.status;
  if (status && status !== "Todos") filter.status = status;
  const q = (req.query.q || "").trim();
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { registration: rx }, { course: rx }];
  }
  const items = await Volunteer.find(filter).sort({ createdAt: -1 });
  res.json(items);
});

export const create = asyncHandler(async (req, res) => {
  const b = req.body;
  if (!b.name?.trim() || !b.registration?.trim())
    throw new ApiError(400, "Nome e matrícula são obrigatórios");
  if (await Volunteer.exists({ registration: b.registration.trim() }))
    throw new ApiError(409, "Matrícula já cadastrada");
  const volunteer = await Volunteer.create({
    name: b.name.trim(),
    registration: b.registration.trim(),
    course: b.course || undefined,
    period: b.period || undefined,
    email: b.email || "",
    phone: b.phone || "",
    joined: b.joined || undefined,
  });
  await record("Cadastro de voluntário", volunteer.name);
  res.status(201).json(volunteer);
});

export const update = asyncHandler(async (req, res) => {
  const volunteer = await findVolunteer(req.params.id);
  for (const [key, value] of Object.entries(req.body))
    if (editable.includes(key)) volunteer[key] = value;
  await volunteer.save();
  await record("Atualização de voluntário", volunteer.name);
  res.json(volunteer);
});

export const remove = asyncHandler(async (req, res) => {
  const volunteer = await findVolunteer(req.params.id);
  if (volunteer.workshops.length || volunteer.termStatus !== "Pendente")
    throw new ApiError(
      409,
      "Exclusão bloqueada: o cadastro possui histórico de oficinas ou documentos.",
    );
  await volunteer.deleteOne();
  await record("Exclusão de cadastro sem histórico", volunteer.name);
  res.json({ ok: true });
});
