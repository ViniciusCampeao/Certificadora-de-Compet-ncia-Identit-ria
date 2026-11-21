import path from "node:path";
import { unlink } from "node:fs/promises";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import { asyncHandler, ApiError } from "../lib/http.js";
import { Term, Volunteer } from "../models/index.js";
import { record } from "../utils/history.js";
import { composeTerm } from "../pdf/term.js";
import { uploadsDir } from "../config/uploads.js";

const streamTerm = (res, volunteer) => {
  const doc = new PDFDocument({ size: "A4", margin: 56 });
  res.setHeader("content-type", "application/pdf");
  res.setHeader(
    "content-disposition",
    `inline; filename="termo-${volunteer.registration}.pdf"`,
  );
  doc.pipe(res);
  composeTerm(doc, volunteer);
  doc.end();
};

const syncVolunteerStatus = (volunteerId, status) =>
  Volunteer.findByIdAndUpdate(volunteerId, { termStatus: status });

// ---- Administrador ----

export const list = asyncHandler(async (req, res) => {
  const terms = await Term.find()
    .sort({ updatedAt: -1 })
    .populate("volunteer", "name registration course");
  res.json(terms);
});

export const generate = asyncHandler(async (req, res) => {
  const { volunteerId } = req.body;
  if (!mongoose.isValidObjectId(volunteerId))
    throw new ApiError(404, "Voluntário não encontrado");
  const volunteer = await Volunteer.findById(volunteerId);
  if (!volunteer) throw new ApiError(404, "Voluntário não encontrado");

  let term = await Term.findOne({ volunteer: volunteer._id });
  if (!term) term = new Term({ volunteer: volunteer._id });
  if (term.signedFileName) {
    await unlink(path.join(uploadsDir, term.signedFileName)).catch(() => {});
  }
  term.generatedAt = new Date();
  term.status = "Gerado";
  term.signedFileName = "";
  term.signedOriginalName = "";
  term.approvedAt = null;
  term.note = "";
  await term.save();

  volunteer.termStatus = "Gerado";
  await volunteer.save();
  await record("Termo gerado", volunteer.name, req.user.name);
  res.status(201).json(term);
});

export const review = asyncHandler(async (req, res) => {
  const { decision, note } = req.body;
  const term = await Term.findById(req.params.id);
  if (!term) throw new ApiError(404, "Termo não encontrado");
  if (term.status !== "Em análise")
    throw new ApiError(409, "O termo não está em análise");

  if (decision === "aprovar") {
    term.status = "Aprovado";
    term.approvedAt = new Date();
    term.note = "";
  } else if (decision === "rejeitar") {
    term.status = "Rejeitado";
    term.note = (note || "").trim();
  } else {
    throw new ApiError(400, "Decisão inválida");
  }
  await term.save();
  await syncVolunteerStatus(term.volunteer, term.status);

  const volunteer = await Volunteer.findById(term.volunteer);
  await record(
    decision === "aprovar" ? "Termo aprovado" : "Termo rejeitado",
    volunteer?.name || "Voluntário",
    req.user.name,
  );
  res.json(term);
});

export const downloadGenerated = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    throw new ApiError(404, "Termo não encontrado");
  const term = await Term.findById(req.params.id).populate("volunteer");
  if (!term || !term.volunteer)
    throw new ApiError(404, "Termo não encontrado");
  if (
    req.user.role === "voluntario" &&
    String(term.volunteer._id) !== req.user.id
  )
    throw new ApiError(403, "Acesso não autorizado para o seu perfil");
  streamTerm(res, term.volunteer);
});

export const downloadSigned = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    throw new ApiError(404, "Termo não encontrado");
  const term = await Term.findById(req.params.id);
  if (!term || !term.signedFileName)
    throw new ApiError(404, "Nenhum documento assinado enviado");
  res.sendFile(path.join(uploadsDir, term.signedFileName));
});

// ---- Voluntário ----

export const myTerm = asyncHandler(async (req, res) => {
  const term = await Term.findOne({ volunteer: req.user.id }).populate(
    "volunteer",
    "name registration course",
  );
  if (!term) throw new ApiError(404, "Nenhum termo disponível ainda");
  res.json(term);
});

export const downloadMine = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.user.id);
  const term = await Term.findOne({ volunteer: req.user.id });
  if (!volunteer || !term)
    throw new ApiError(404, "Nenhum termo disponível ainda");
  streamTerm(res, volunteer);
});

export const uploadMine = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Selecione o termo assinado");
  const term = await Term.findOne({ volunteer: req.user.id });
  if (!term) {
    await unlink(path.join(uploadsDir, req.file.filename)).catch(() => {});
    throw new ApiError(404, "Nenhum termo foi gerado para você ainda");
  }
  if (!["Gerado", "Rejeitado", "Em análise"].includes(term.status)) {
    await unlink(path.join(uploadsDir, req.file.filename)).catch(() => {});
    throw new ApiError(409, "O termo aprovado não pode ser reenviado");
  }
  if (term.signedFileName) {
    await unlink(path.join(uploadsDir, term.signedFileName)).catch(() => {});
  }
  term.signedFileName = req.file.filename;
  term.signedOriginalName = req.file.originalname;
  term.status = "Em análise";
  term.note = "";
  await term.save();
  await syncVolunteerStatus(term.volunteer, "Em análise");
  await record("Termo assinado enviado", req.user.name, req.user.name);
  res.status(201).json(term);
});
