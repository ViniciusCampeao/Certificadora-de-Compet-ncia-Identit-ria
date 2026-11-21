import mongoose from "mongoose";
import { asyncHandler, ApiError } from "../lib/http.js";
import { Workshop, Volunteer } from "../models/index.js";
import { record } from "../utils/history.js";

const withCount = (workshop) => ({
  ...workshop.toJSON(),
  participantsCount: workshop.participants.length,
});

export const list = asyncHandler(async (req, res) => {
  const items = await Workshop.find().sort({ createdAt: -1 });
  res.json(items.map(withCount));
});

export const create = asyncHandler(async (req, res) => {
  const b = req.body;
  if (!b.name?.trim() || !b.date)
    throw new ApiError(400, "Nome e data são obrigatórios");
  const workshop = await Workshop.create({
    name: b.name.trim(),
    date: b.date,
    duration: Number(b.duration) || 1,
  });
  await record("Cadastro de oficina", workshop.name);
  res.status(201).json(withCount(workshop));
});

export const addParticipant = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    throw new ApiError(404, "Oficina ou voluntário não encontrado");
  const workshop = await Workshop.findById(req.params.id);
  const volunteer = mongoose.isValidObjectId(req.body.volunteerId)
    ? await Volunteer.findById(req.body.volunteerId)
    : null;
  if (!workshop || !volunteer)
    throw new ApiError(404, "Oficina ou voluntário não encontrado");
  if (!workshop.participants.some((id) => id.equals(volunteer._id))) {
    workshop.participants.push(volunteer._id);
    volunteer.workshops.push(workshop.name);
    await workshop.save();
    await volunteer.save();
    await record(
      "Participação registrada",
      `${volunteer.name} · ${workshop.name}`,
    );
  }
  res.json(withCount(workshop));
});
