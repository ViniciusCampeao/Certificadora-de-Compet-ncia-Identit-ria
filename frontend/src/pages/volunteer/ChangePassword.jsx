import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { Brand } from "../../components/Brand.jsx";
import { Alert } from "../../components/Alert.jsx";

export function ChangePassword() {
  const { user, patchUser, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const { current, next, confirm } = e.target;
    if (next.value !== confirm.value) {
      setError("A confirmação não confere com a nova senha.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/senha", {
        currentPassword: current.value,
        newPassword: next.value,
      });
      patchUser({ mustChangePassword: false });
      navigate("/portal", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const sair = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="portal">
      <header className="portal-top">
        <Brand />
        <button className="text-btn" onClick={sair}>
          Sair
        </button>
      </header>
      <main className="portal-main narrow">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Alterar senha</h2>
              <p>
                {user?.mustChangePassword
                  ? "Defina uma nova senha para concluir o primeiro acesso."
                  : "Atualize a sua senha de acesso."}
              </p>
            </div>
          </div>
          <Alert message={error} onClose={() => setError("")} />
          <form onSubmit={submit}>
            <label>
              Senha atual
              <input name="current" type="password" required />
            </label>
            <label>
              Nova senha
              <input
                name="next"
                type="password"
                minLength={6}
                required
                placeholder="ao menos 6 caracteres"
              />
            </label>
            <label>
              Confirmar nova senha
              <input name="confirm" type="password" minLength={6} required />
            </label>
            <div className="modal-actions">
              <button className="primary wide" disabled={busy}>
                {busy ? "Salvando…" : "Salvar nova senha"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
