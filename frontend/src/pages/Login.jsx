import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { Brand } from "../components/Brand.jsx";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await login(e.target.user.value, e.target.password.value);
      if (user.role === "admin") navigate("/app", { replace: true });
      else if (user.mustChangePassword)
        navigate("/trocar-senha", { replace: true });
      else navigate("/portal", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login">
      <div className="login-art">
        <Brand />
        <div className="login-copy">
          <span className="eyebrow">GESTÃO DE VOLUNTÁRIOS</span>
          <h1>
            O trabalho voluntário,
            <br />
            bem acompanhado.
          </h1>
          <p>
            Um espaço para organizar vínculos, oficinas e documentação do
            Projeto ELLP.
          </p>
        </div>
        <div className="login-foot">
          Projeto de extensão · UTFPR Cornélio Procópio
        </div>
      </div>
      <form className="login-form" onSubmit={submit}>
        <div className="mobile-brand">
          <Brand />
        </div>
        <div>
          <span className="eyebrow">ACESSO AO SISTEMA</span>
          <h2>Bem-vindo de volta</h2>
          <p className="muted">
            Administradores entram com usuário. Voluntários, com a matrícula.
          </p>
        </div>
        {error && <div className="alert">{error}</div>}
        <label>
          Usuário ou matrícula
          <input name="user" placeholder="admin ou 20241001" required />
        </label>
        <label>
          Senha
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </label>
        <button className="primary wide" disabled={busy}>
          {busy ? "Entrando…" : "Entrar"} <span>↗</span>
        </button>
      </form>
    </main>
  );
}
