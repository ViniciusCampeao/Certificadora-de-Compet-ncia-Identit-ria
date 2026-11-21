import { asyncHandler } from "../lib/http.js";
import { load } from "../data/store.js";

export const summary = asyncHandler(async (req, res) => {
  const db = await load();
  res.json({
    volunteerCount: db.volunteers.length,
    activeCount: db.volunteers.filter((v) => v.status === "Ativo").length,
    workshopCount: db.workshops.length,
    pendingTerms: db.volunteers.filter((v) =>
      ["Pendente", "Em análise"].includes(v.termStatus),
    ).length,
    recent: db.history.slice(0, 6),
  });
});
