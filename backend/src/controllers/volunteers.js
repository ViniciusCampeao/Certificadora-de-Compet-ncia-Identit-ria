import mongoose from "mongoose";
import { asyncHandler, ApiError } from "../lib/http.js";
import { Volunteer } from "../models/index.js";
import { record } from "../utils/history.js";
import { escapeRegex } from "../utils/text.js";
import { isEmail, isValidCpf, isIsoDate, onlyDigits } from "../utils/validation.js";

const editable = [
  "name",
  "course",
  "period",
  "email",
  "phone",
  "cpf",
  "status",
  "termStatus",
];

const validateContact = (b) => {
  if (b.email && !isEmail(b.email)) throw new ApiError(400, "E-mail inválido");
  if (b.cpf && !isValidCpf(b.cpf)) throw new ApiError(400, "CPF inválido");
  if (b.joined && !isIsoDate(b.joined))
    throw new ApiError(400, "Data de entrada inválida");
};

const findVolunteer = async (id) => {
  if (!mongoose.isValidObjectId(id))
    throw new ApiError(404, "Voluntário não encontrado");
  const volunteer = await Volunteer.findById(id);
  if (!volunteer) throw new ApiError(404, "Voluntário não encontrado");
  return volunteer;
};

export const meProfile = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.user.id);
  if (!volunteer) throw new ApiError(404, "Voluntário não encontrado");
  res.json(volunteer);
});

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
  const name = (b.name || "").trim();
  const registration = (b.registration || "").trim();
  if (name.length < 3)
    throw new ApiError(400, "O nome deve ter ao menos 3 caracteres");
  if (!/^\d{4,}$/.test(registration))
    throw new ApiError(400, "A matrícula deve conter apenas números");
  validateContact(b);
  if (await Volunteer.exists({ registration }))
    throw new ApiError(409, "Matrícula já cadastrada");
  const volunteer = await Volunteer.create({
    name,
    registration,
    cpf: b.cpf ? onlyDigits(b.cpf) : undefined,
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
  validateContact(req.body);
  for (const [key, value] of Object.entries(req.body))
    if (editable.includes(key))
      volunteer[key] = key === "cpf" ? onlyDigits(value) : value;
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
