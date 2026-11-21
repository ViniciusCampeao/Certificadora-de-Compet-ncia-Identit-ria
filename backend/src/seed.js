import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { Admin, Volunteer, Workshop, History } from "./models/index.js";
import { hashPassword } from "./utils/password.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(root, "..", "data", "db.json");

const run = async () => {
  const seed = JSON.parse(await readFile(dataPath, "utf8"));
  await connectDatabase(env.mongoUri);

  await Promise.all([
    Admin.deleteMany({}),
    Volunteer.deleteMany({}),
    Workshop.deleteMany({}),
    History.deleteMany({}),
  ]);

  await Admin.create({
    name: env.admin.name,
    username: env.admin.username,
    passwordHash: await hashPassword(env.admin.password),
  });

  const defaultHash = await hashPassword(env.volunteerDefaultPassword);
  const volunteers = await Volunteer.insertMany(
    seed.volunteers.map((v) => ({
      name: v.name,
      registration: v.registration,
      course: v.course,
      period: v.period,
      email: v.email,
      phone: v.phone,
      joined: v.joined,
      type: v.type,
      status: v.status,
      workshops: v.workshops,
      termStatus: v.termStatus,
      passwordHash: defaultHash,
      mustChangePassword: true,
    })),
  );

  const idByOldRef = new Map();
  seed.volunteers.forEach((v, i) => idByOldRef.set(v.id, volunteers[i]._id));

  await Workshop.insertMany(
    seed.workshops.map((w) => ({
      name: w.name,
      date: w.date,
      duration: w.duration,
      participants: w.participants
        .map((oldId) => idByOldRef.get(oldId))
        .filter(Boolean),
    })),
  );

  await History.insertMany(
    seed.history.map((h) => ({
      actor: h.actor,
      action: h.action,
      record: h.record,
      date: new Date(h.date),
    })),
  );

  console.log(
    `Carga inicial concluída: administrador "${env.admin.username}", ` +
      `${volunteers.length} voluntários, ${seed.workshops.length} oficinas.`,
  );
  await disconnectDatabase();
};

run().catch((error) => {
  console.error("Falha na carga inicial:", error);
  process.exit(1);
});
