import { randomUUID } from "node:crypto";
import { asyncHandler, ApiError } from "../lib/http.js";
import { load, save } from "../data/store.js";
import { record } from "../utils/history.js";

export const list = asyncHandler(async (req, res) => {
  const db = await load();
  res.json(
    db.workshops.map((w) => ({
      ...w,
      participantsCount: w.participants.length,
    })),
  );
});

export const create = asyncHandler(async (req, res) => {
  const db = await load();
  const b = req.body;
  if (!b.name?.trim() || !b.date)
    throw new ApiError(400, "Nome e data são obrigatórios");
  const workshop = {
    id: randomUUID(),
    name: b.name.trim(),
    date: b.date,
    duration: Number(b.duration) || 1,
    participants: [],
  };
  db.workshops.unshift(workshop);
  record(db, "Cadastro de oficina", workshop.name);
  await save(db);
  res.status(201).json(workshop);
});

export const addParticipant = asyncHandler(async (req, res) => {
  const db = await load();
  const workshop = db.workshops.find((w) => w.id === req.params.id);
  const volunteer = db.volunteers.find((v) => v.id === req.body.volunteerId);
  if (!workshop || !volunteer)
    throw new ApiError(404, "Oficina ou voluntário não encontrado");
  if (!workshop.participants.includes(volunteer.id)) {
    workshop.participants.push(volunteer.id);
    volunteer.workshops.push(workshop.name);
    record(
      db,
      "Participação registrada",
      `${volunteer.name} · ${workshop.name}`,
    );
    await save(db);
  }
  res.json(workshop);
});
