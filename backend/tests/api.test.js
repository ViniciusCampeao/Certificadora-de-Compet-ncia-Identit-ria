import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { createApp } from "../src/app.js";
import {
  Admin,
  Volunteer,
  Workshop,
  Term,
  History,
} from "../src/models/index.js";
import { hashPassword } from "../src/utils/password.js";

const uri =
  process.env.MONGODB_URI_TEST ||
  "mongodb://127.0.0.1:27017/ellp_ctrl_test";

let server;
let base;
let adminToken;
let volunteerToken;

const call = async (path, { token, method = "GET", data } = {}) => {
  const headers = {};
  if (data) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(base + path, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
};

before(async () => {
  await mongoose.connect(uri);
  await Promise.all([
    Admin.deleteMany({}),
    Volunteer.deleteMany({}),
    Workshop.deleteMany({}),
    Term.deleteMany({}),
    History.deleteMany({}),
  ]);
  await Admin.create({
    name: "Administrador de Teste",
    username: "admin",
    passwordHash: await hashPassword("ellp-admin"),
  });
  await Volunteer.create({
    name: "Ana de Teste",
    registration: "20240001",
    course: "ADS",
    passwordHash: await hashPassword("ellp-2026"),
    mustChangePassword: true,
  });
  server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server?.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test("health responde ok", async () => {
  const { status, body } = await call("/api/health");
  assert.equal(status, 200);
  assert.equal(body.status, "ok");
});

test("login do administrador devolve token", async () => {
  const { status, body } = await call("/api/auth/login", {
    method: "POST",
    data: { user: "admin", password: "ellp-admin" },
  });
  assert.equal(status, 200);
  assert.equal(body.user.role, "admin");
  assert.equal(typeof body.token, "string");
  adminToken = body.token;
});

test("login do voluntário por matrícula", async () => {
  const { status, body } = await call("/api/auth/login", {
    method: "POST",
    data: { registration: "20240001", password: "ellp-2026" },
  });
  assert.equal(status, 200);
  assert.equal(body.user.role, "voluntario");
  assert.equal(body.user.mustChangePassword, true);
  volunteerToken = body.token;
});

test("troca de senha com senha atual errada retorna 400", async () => {
  const { status } = await call("/api/auth/senha", {
    token: volunteerToken,
    method: "POST",
    data: { currentPassword: "errada", newPassword: "novaSenha123" },
  });
  assert.equal(status, 400);
});

test("rota protegida sem token retorna 401", async () => {
  const { status } = await call("/api/dashboard");
  assert.equal(status, 401);
});

test("voluntário não acessa rota de administrador", async () => {
  const { status } = await call("/api/volunteers", { token: volunteerToken });
  assert.equal(status, 403);
});

test("cadastro e busca de voluntário", async () => {
  const created = await call("/api/volunteers", {
    token: adminToken,
    method: "POST",
    data: { name: "Bruno Lima", registration: "20240002", course: "Engenharia" },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.status, "Ativo");

  const search = await call("/api/volunteers?q=bruno", { token: adminToken });
  assert.equal(search.body.length, 1);
  assert.equal(search.body[0].registration, "20240002");
});

test("matrícula duplicada é rejeitada", async () => {
  const { status } = await call("/api/volunteers", {
    token: adminToken,
    method: "POST",
    data: { name: "Outro", registration: "20240002" },
  });
  assert.equal(status, 409);
});

test("validação de e-mail inválido", async () => {
  const { status } = await call("/api/volunteers", {
    token: adminToken,
    method: "POST",
    data: { name: "Carla Souza", registration: "20240003", email: "invalido" },
  });
  assert.equal(status, 400);
});

test("ciclo do termo: gerar e aprovar após envio", async () => {
  const volunteer = (
    await call("/api/volunteers?q=20240001", { token: adminToken })
  ).body[0];
  const generated = await call("/api/terms", {
    token: adminToken,
    method: "POST",
    data: { volunteerId: volunteer.id },
  });
  assert.equal(generated.status, 201);
  assert.equal(generated.body.status, "Gerado");

  // marca como "Em análise" diretamente (upload coberto pelos testes de fluxo)
  const term = await Term.findById(generated.body.id);
  term.status = "Em análise";
  await term.save();

  const approved = await call(`/api/terms/${generated.body.id}`, {
    token: adminToken,
    method: "PATCH",
    data: { decision: "aprovar" },
  });
  assert.equal(approved.body.status, "Aprovado");
});

test("histórico registra o administrador como responsável", async () => {
  const { body } = await call("/api/history", { token: adminToken });
  assert.ok(body.length > 0);
  assert.equal(body[0].actor, "Administrador de Teste");
});
