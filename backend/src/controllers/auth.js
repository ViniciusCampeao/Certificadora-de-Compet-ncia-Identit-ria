import { asyncHandler, ApiError } from "../lib/http.js";
import { Admin, Volunteer } from "../models/index.js";
import { checkPassword, hashPassword } from "../utils/password.js";
import { signToken } from "../utils/token.js";

const tokenFor = (user) =>
  signToken({
    sub: user.id,
    role: user.role,
    name: user.name,
    registration: user.registration,
  });

export const login = asyncHandler(async (req, res) => {
  const identifier = (
    req.body.user ||
    req.body.username ||
    req.body.registration ||
    ""
  ).trim();
  const password = req.body.password || "";
  if (!identifier || !password)
    throw new ApiError(400, "Informe usuário e senha");

  const admin = await Admin.findOne({ username: identifier }).select(
    "+passwordHash",
  );
  if (admin && (await checkPassword(password, admin.passwordHash))) {
    const user = { id: admin.id, role: "admin", name: admin.name };
    return res.json({ token: tokenFor(user), user });
  }

  const volunteer = await Volunteer.findOne({ registration: identifier }).select(
    "+passwordHash",
  );
  if (volunteer && (await checkPassword(password, volunteer.passwordHash))) {
    const user = {
      id: volunteer.id,
      role: "voluntario",
      name: volunteer.name,
      registration: volunteer.registration,
      mustChangePassword: volunteer.mustChangePassword,
    };
    return res.json({ token: tokenFor(user), user });
  }

  throw new ApiError(401, "Usuário ou senha inválidos");
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6)
    throw new ApiError(400, "A nova senha deve ter ao menos 6 caracteres");
  if (req.user.role !== "voluntario")
    throw new ApiError(403, "Apenas voluntários alteram a senha por aqui");
  const volunteer = await Volunteer.findById(req.user.id).select(
    "+passwordHash",
  );
  if (!volunteer) throw new ApiError(404, "Voluntário não encontrado");
  if (!(await checkPassword(currentPassword || "", volunteer.passwordHash)))
    throw new ApiError(400, "Senha atual incorreta");
  volunteer.passwordHash = await hashPassword(newPassword);
  volunteer.mustChangePassword = false;
  await volunteer.save();
  res.json({ ok: true });
});
