import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { Brand } from "../../components/Brand.jsx";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { Alert } from "../../components/Alert.jsx";
import { initials, formatDate } from "../../lib/format.js";

export function VolunteerPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [term, setTerm] = useState(null);
  const [termMessage, setTermMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/volunteers/me")
      .then(setProfile)
      .catch((e) => setError(e.message));
    api
      .get("/terms/me")
      .then((t) => {
        setTerm(t);
        setTermMessage("");
      })
      .catch(() => {
        setTerm(null);
        setTermMessage("O administrador ainda não gerou o seu termo.");
      });
  }, []);

  const sair = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="portal">
      <header className="portal-top">
        <Brand />
        <div className="portal-user">
          <span className="avatar">{initials(user.name)}</span>
          <span>
            <b>{user.name}</b>
            <small>Voluntário</small>
          </span>
          <button className="text-btn" onClick={sair}>
            Sair
          </button>
        </div>
      </header>
      <main className="portal-main">
        <Alert message={error} onClose={() => setError("")} />
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Meus dados</h2>
              <p>Informações do seu vínculo com o Projeto ELLP</p>
            </div>
          </div>
          {profile && (
            <dl className="details">
              <dt>Nome</dt>
              <dd>{profile.name}</dd>
              <dt>Matrícula</dt>
              <dd>{profile.registration}</dd>
              <dt>Curso</dt>
              <dd>{profile.course}</dd>
              <dt>Período</dt>
              <dd>{profile.period}</dd>
              <dt>E-mail</dt>
              <dd>{profile.email || "Não informado"}</dd>
              <dt>Entrada</dt>
              <dd>{formatDate(profile.joined)}</dd>
              <dt>Situação</dt>
              <dd>
                <StatusBadge status={profile.status} />
              </dd>
            </dl>
          )}
          <p className="muted small">
            Para corrigir seus dados, fale com o administrador do projeto.
          </p>
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Termo de voluntariado</h2>
              <p>Situação da sua documentação</p>
            </div>
          </div>
          {term ? (
            <p className="term-line">
              Status atual: <StatusBadge status={term.status} />
            </p>
          ) : (
            <p className="muted">{termMessage}</p>
          )}
        </section>
        <div className="portal-actions">
          <Link className="button-link" to="/trocar-senha">
            Alterar senha
          </Link>
        </div>
      </main>
    </div>
  );
}
