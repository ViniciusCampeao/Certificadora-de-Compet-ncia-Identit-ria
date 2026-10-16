import http from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const root = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(root, "data", "db.json");
const port = Number(process.env.API_PORT || 3001);
const load = async () => JSON.parse(await readFile(dbPath, "utf8"));
const save = async (db) =>
  writeFile(dbPath, JSON.stringify(db, null, 2) + "\n");
const json = (res, code, body) => {
  res.writeHead(code, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
  });
  res.end(JSON.stringify(body));
};
const bodyOf = (req) =>
  new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("JSON inválido"));
      }
    });
  });
const record = (db, action, record) =>
  db.history.unshift({
    id: randomUUID(),
    date: new Date().toISOString(),
    actor: "Administrador demonstração",
    action,
    record,
  });
const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type",
    });
    return res.end();
  }
  const url = new URL(req.url, "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== "api")
    return json(res, 404, { error: "Rota não encontrada" });
  try {
    const db = await load();
    const resource = parts[1];
    const id = parts[2];
    if (req.method === "GET" && resource === "health")
      return json(res, 200, {
        status: "ok",
        storage: "arquivo JSON local",
        demo: true,
      });
    if (req.method === "POST" && resource === "auth") {
      const b = await bodyOf(req);
      if (b.username === "admin" && b.password === "ellp-demo")
        return json(res, 200, {
          name: "Administrador de demonstração",
          role: "admin",
          demo: true,
        });
      return json(res, 401, { error: "Usuário ou senha inválidos" });
    }
    if (req.method === "GET" && resource === "dashboard")
      return json(res, 200, {
        volunteerCount: db.volunteers.length,
        activeCount: db.volunteers.filter((v) => v.status === "Ativo").length,
        workshopCount: db.workshops.length,
        pendingTerms: db.volunteers.filter((v) =>
          ["Pendente", "Em análise"].includes(v.termStatus),
        ).length,
        recent: db.history.slice(0, 6),
      });
    if (req.method === "GET" && resource === "volunteers") {
      let list = [...db.volunteers];
      const q = (url.searchParams.get("q") || "").toLocaleLowerCase("pt-BR");
      const status = url.searchParams.get("status");
      if (q)
        list = list.filter((v) =>
          [v.name, v.registration, v.course].some((x) =>
            x.toLocaleLowerCase("pt-BR").includes(q),
          ),
        );
      if (status && status !== "Todos")
        list = list.filter((v) => v.status === status);
      return json(res, 200, list);
    }
    if (resource === "volunteers" && req.method === "POST") {
      const b = await bodyOf(req);
      if (!b.name?.trim() || !b.registration?.trim())
        return json(res, 400, { error: "Nome e matrícula são obrigatórios" });
      if (db.volunteers.some((v) => v.registration === b.registration.trim()))
        return json(res, 409, { error: "Matrícula já cadastrada" });
      const v = {
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
      db.volunteers.unshift(v);
      record(db, "Cadastro de voluntário", v.name);
      await save(db);
      return json(res, 201, v);
    }
    if (resource === "volunteers" && id && req.method === "PATCH") {
      const v = db.volunteers.find((x) => x.id === id);
      if (!v) return json(res, 404, { error: "Voluntário não encontrado" });
      const b = await bodyOf(req);
      Object.assign(
        v,
        Object.fromEntries(
          Object.entries(b).filter(([k]) =>
            [
              "name",
              "course",
              "period",
              "email",
              "phone",
              "status",
              "termStatus",
            ].includes(k),
          ),
        ),
      );
      record(db, "Atualização de voluntário", v.name);
      await save(db);
      return json(res, 200, v);
    }
    if (resource === "volunteers" && id && req.method === "DELETE") {
      const v = db.volunteers.find((x) => x.id === id);
      if (!v) return json(res, 404, { error: "Voluntário não encontrado" });
      if (v.workshops.length || v.termStatus !== "Pendente")
        return json(res, 409, {
          error:
            "Exclusão bloqueada: o cadastro possui histórico de oficinas ou documentos.",
        });
      db.volunteers = db.volunteers.filter((x) => x.id !== id);
      record(db, "Exclusão de cadastro sem histórico", v.name);
      await save(db);
      return json(res, 200, { ok: true });
    }
    if (req.method === "GET" && resource === "workshops")
      return json(
        res,
        200,
        db.workshops.map((w) => ({
          ...w,
          participantsCount: w.participants.length,
        })),
      );
    if (req.method === "POST" && resource === "workshops" && !parts[3]) {
      const b = await bodyOf(req);
      if (!b.name?.trim() || !b.date)
        return json(res, 400, { error: "Nome e data são obrigatórios" });
      const w = {
        id: randomUUID(),
        name: b.name.trim(),
        date: b.date,
        duration: Number(b.duration) || 1,
        participants: [],
      };
      db.workshops.unshift(w);
      record(db, "Cadastro de oficina", w.name);
      await save(db);
      return json(res, 201, w);
    }
    if (
      req.method === "POST" &&
      resource === "workshops" &&
      parts[3] === "participants"
    ) {
      const w = db.workshops.find((x) => x.id === id);
      const b = await bodyOf(req);
      const v = db.volunteers.find((x) => x.id === b.volunteerId);
      if (!w || !v)
        return json(res, 404, {
          error: "Oficina ou voluntário não encontrado",
        });
      if (!w.participants.includes(v.id)) {
        w.participants.push(v.id);
        v.workshops.push(w.name);
        record(db, "Participação registrada", `${v.name} · ${w.name}`);
        await save(db);
      }
      return json(res, 200, w);
    }
    if (req.method === "GET" && resource === "history")
      return json(res, 200, db.history.slice(0, 30));
    return json(res, 404, { error: "Rota não encontrada" });
  } catch (e) {
    return json(res, 500, { error: e.message || "Erro interno" });
  }
});
await mkdir(path.dirname(dbPath), { recursive: true });
server.listen(port, () =>
  console.log(`API ELLP+ctrl em http://localhost:${port}`),
);
