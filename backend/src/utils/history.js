import { History } from "../models/index.js";

export const record = (action, subject, actor = "Sistema") =>
  History.create({ actor, action, record: subject });
