import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, download } from "../../api/client.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import { Brand } from "../../components/Brand.jsx";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { Alert } from "../../components/Alert.jsx";
import { initials, formatDate } from "../../lib/format.js";

const canUpload = (term) =>
  term && ["Gerado", "Rejeitado", "Em análise"].includes(term.status);

export function VolunteerPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [term, setTerm] = useState(null);
  const [termMessage, setTermMessage] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadTerm = () =>
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

  useEffect(() => {
    api
      .get("/volunteers/me")
      .then(setProfile)
      .catch((e) => setError(e.message));
    loadTerm();
  }, []);

  const sair = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const baixarTermo = () =>
    download(
      "/terms/me/pdf",
      `termo-${profile?.registration || "voluntario"}.pdf`,
    ).catch((e) => setError(e.message));

  const enviarAssinado = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Selecione o arquivo do termo assinado.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      await api.upload("/terms/me/signed", form);
      setFile(null);
      e.target.reset();
      await loadTerm();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
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
              <p>Baixe, assine e envie o seu termo</p>
            </div>
          </div>
          {term ? (
            <>
              <p className="term-line">
                Status atual: <StatusBadge status={term.status} />
              </p>
              {term.status === "Rejeitado" && term.note && (
                <div className="term-note">
                  Motivo da rejeição: {term.note}
                </div>
              )}
              {term.status === "Em análise" && (
                <p className="muted term-line">
                  Documento enviado. Aguarde a análise do administrador.
                </p>
              )}
              {term.status === "Aprovado" && (
                <p className="muted term-line">Termo aprovado. Tudo certo!</p>
              )}
              <div className="term-actions">
                <button className="secondary" onClick={baixarTermo}>
                  Baixar termo
                </button>
              </div>
              {canUpload(term) && (
                <form className="upload-form" onSubmit={enviarAssinado}>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setFile(e.target.files[0] || null)}
                  />
                  <button className="primary" disabled={busy}>
                    {busy
                      ? "Enviando…"
                      : term.status === "Rejeitado"
                        ? "Reenviar assinado"
                        : "Enviar assinado"}
                  </button>
                </form>
              )}
            </>
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
