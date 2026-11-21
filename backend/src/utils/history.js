import { History } from "../models/index.js";

export const record = (action, subject, actor = "Administrador demonstração") =>
  History.create({ actor, action, record: subject });
