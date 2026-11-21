import { asyncHandler } from "../lib/http.js";
import { Volunteer, Workshop, History } from "../models/index.js";

export const summary = asyncHandler(async (req, res) => {
  const [volunteerCount, activeCount, workshopCount, pendingTerms, recent] =
    await Promise.all([
      Volunteer.countDocuments(),
      Volunteer.countDocuments({ status: "Ativo" }),
      Workshop.countDocuments(),
      Volunteer.countDocuments({
        termStatus: { $in: ["Pendente", "Gerado", "Em análise"] },
      }),
      History.find().sort({ date: -1 }).limit(6),
    ]);
  res.json({ volunteerCount, activeCount, workshopCount, pendingTerms, recent });
});
