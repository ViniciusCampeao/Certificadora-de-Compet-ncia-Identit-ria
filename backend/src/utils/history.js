import { randomUUID } from "node:crypto";

export const record = (db, action, subject, actor = "Administrador demonstração") =>
  db.history.unshift({
    id: randomUUID(),
    date: new Date().toISOString(),
    actor,
    action,
    record: subject,
  });
