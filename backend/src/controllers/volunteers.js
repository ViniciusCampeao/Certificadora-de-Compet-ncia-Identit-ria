import { randomUUID } from "node:crypto";
import { asyncHandler, ApiError } from "../lib/http.js";
import { load, save } from "../data/store.js";
import { record } from "../utils/history.js";

const editable = [
  "name",
  "course",
  "period",
  "email",
  "phone",
  "status",
  "termStatus",
];

export const list = asyncHandler(async (req, res) => {
  const db = await load();
  let items = [...db.volunteers];
  const q = (req.query.q || "").toLocaleLowerCase("pt-BR");
  const status = req.query.status;
  if (q)
    items = items.filter((v) =>
      [v.name, v.registration, v.course].some((x) =>
        x.toLocaleLowerCase("pt-BR").includes(q),
      ),
    );
  if (status && status !== "Todos")
    items = items.filter((v) => v.status === status);
  res.json(items);
});

export const create = asyncHandler(async (req, res) => {
  const db = await load();
  const b = req.body;
  if (!b.name?.trim() || !b.registration?.trim())
    throw new ApiError(400, "Nome e matrícula são obrigatórios");
  if (db.volunteers.some((v) => v.registration === b.registration.trim()))
    throw new ApiError(409, "Matrícula já cadastrada");
  const volunteer = {
    id: randomUUID(),
    name: b.name.trim(),
    registration: b.registration.trim(),
    course: b.course || "Não informado",
    period: b.period || "Não informado",
    email: b.email || "",
    phone: b.phone || "",
    joined: b.joined || new Date().toISOString().slice(0, 10),
    status: "Ativo",
    type: "Voluntário",
    workshops: [],
    termStatus: "Pendente",
  };
  db.volunteers.unshift(volunteer);
  record(db, "Cadastro de voluntário", volunteer.name);
  await save(db);
  res.status(201).json(volunteer);
});

export const update = asyncHandler(async (req, res) => {
  const db = await load();
  const volunteer = db.volunteers.find((v) => v.id === req.params.id);
  if (!volunteer) throw new ApiError(404, "Voluntário não encontrado");
  Object.assign(
    volunteer,
    Object.fromEntries(
      Object.entries(req.body).filter(([k]) => editable.includes(k)),
    ),
  );
  record(db, "Atualização de voluntário", volunteer.name);
  await save(db);
  res.json(volunteer);
});

export const remove = asyncHandler(async (req, res) => {
  const db = await load();
  const volunteer = db.volunteers.find((v) => v.id === req.params.id);
  if (!volunteer) throw new ApiError(404, "Voluntário não encontrado");
  if (volunteer.workshops.length || volunteer.termStatus !== "Pendente")
    throw new ApiError(
      409,
      "Exclusão bloqueada: o cadastro possui histórico de oficinas ou documentos.",
    );
  db.volunteers = db.volunteers.filter((v) => v.id !== req.params.id);
  record(db, "Exclusão de cadastro sem histórico", volunteer.name);
  await save(db);
  res.json({ ok: true });
});
