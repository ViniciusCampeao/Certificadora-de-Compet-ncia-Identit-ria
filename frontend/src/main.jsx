import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const get = async (url) => {
  const r = await fetch("/api" + url);
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "Falha ao consultar");
  return d;
};
const send = async (url, method, body) => {
  const r = await fetch("/api" + url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "Falha ao salvar");
  return d;
};
const initials = (n) =>
  n
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
const date = (d) =>
  d ? new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR") : "—";
function App() {
  const [logged, setLogged] = useState(
      sessionStorage.getItem("ellp-login") === "yes",
    ),
    [page, setPage] = useState("Visão geral"),
    [data, setData] = useState(null),
    [vols, setVols] = useState([]),
    [workshops, setWorkshops] = useState([]),
    [history, setHistory] = useState([]),
    [q, setQ] = useState(""),
    [filter, setFilter] = useState("Todos"),
    [modal, setModal] = useState(""),
    [selected, setSelected] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const refresh = async () => {
    try {
      const [d, v, w, h] = await Promise.all([
        get("/dashboard"),
        get(
          `/volunteers?q=${encodeURIComponent(q)}&status=${encodeURIComponent(filter)}`,
        ),
        get("/workshops"),
        get("/history"),
      ]);
      setData(d);
      setVols(v);
      setWorkshops(w);
      setHistory(h);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    if (logged) refresh();
  }, [logged, q, filter]);
  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await send("/auth", "POST", {
        username: e.target.username.value,
        password: e.target.password.value,
      });
      sessionStorage.setItem("ellp-login", "yes");
      setLogged(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const saveVolunteer = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const f = new FormData(e.target);
      await send("/volunteers", "POST", Object.fromEntries(f));
      setModal("");
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const saveWorkshop = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const f = new FormData(e.target);
      await send("/workshops", "POST", Object.fromEntries(f));
      setModal("");
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const changeStatus = async (v) => {
    try {
      await send(`/volunteers/${v.id}`, "PATCH", {
        status: v.status === "Ativo" ? "Encerrado" : "Ativo",
      });
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };
  const updateTerm = async (v, status) => {
    try {
      await send(`/volunteers/${v.id}`, "PATCH", { termStatus: status });
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  };
  const nav = [
    "Visão geral",
    "Voluntários",
    "Oficinas",
    "Documentos",
    "Histórico",
  ];
  if (!logged)
    return (
      <main className="login">
        <div className="login-art">
          <div className="brand">
            <span className="brand-mark">e</span>
            <strong>
              ELLP<span>+ctrl</span>
            </strong>
          </div>
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
        <form className="login-form" onSubmit={login}>
          <div className="mobile-brand">
            <span className="brand-mark">e</span>
            <strong>
              ELLP<span>+ctrl</span>
            </strong>
          </div>
          <div>
            <span className="eyebrow">ACESSO AO SISTEMA</span>
            <h2>Bem-vindo de volta</h2>
            <p className="muted">Entre com sua conta de demonstração.</p>
          </div>
          {error && <div className="alert">{error}</div>}
          <label>
            Usuário
            <input name="username" placeholder="admin" required />
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
          <div className="demo-hint">
            <span className="lock">◈</span>
            <span>
              Demo local
              <br />
              <b>admin</b> / <b>ellp-demo</b>
            </span>
          </div>
          <small>Dados fictícios para apresentação acadêmica.</small>
        </form>
      </main>
    );
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">e</span>
          <strong>
            ELLP<span>+ctrl</span>
          </strong>
        </div>
        <div className="side-label">MENU PRINCIPAL</div>
        <nav>
          {nav.map((n, i) => (
            <button
              key={n}
              className={page === n ? "nav-item active" : "nav-item"}
              onClick={() => setPage(n)}
            >
              <span className="nav-icon">{["⌂", "♙", "▦", "▤", "◷"][i]}</span>
              {n}
              {n === "Documentos" && data?.pendingTerms > 0 && (
                <i>{data.pendingTerms}</i>
              )}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="project-note">
            <span className="note-icon">✳</span>
            <b>Projeto ELLP</b>
            <p>
              Extensão universitária
              <br />
              UTFPR · Cornélio Procópio
            </p>
          </div>
          <button
            className="profile"
            onClick={() => {
              sessionStorage.clear();
              setLogged(false);
            }}
          >
            <span className="avatar admin">AD</span>
            <span>
              <b>Admin demonstração</b>
              <small>Administrador</small>
            </span>
            <span className="dots">⋯</span>
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="crumb">
            ELLP+ctrl <span>/</span> <b>{page}</b>
          </div>
          <div className="top-right">
            <span className="live">
              <i /> Ambiente de demonstração
            </span>
            <button className="circle-btn" title="Ajuda">
              ?
            </button>
            <span className="avatar admin">AD</span>
          </div>
        </header>
        <section className="content">
          {error && (
            <div className="alert dismiss" onClick={() => setError("")}>
              {error}
              <b>×</b>
            </div>
          )}
          {page === "Visão geral" && (
            <Dashboard
              data={data}
              vols={vols}
              workshops={workshops}
              setPage={setPage}
              setModal={setModal}
            />
          )}
          {page === "Voluntários" && (
            <Volunteers
              vols={vols}
              q={q}
              setQ={setQ}
              filter={filter}
              setFilter={setFilter}
              changeStatus={changeStatus}
              setSelected={setSelected}
              setModal={setModal}
            />
          )}
          {page === "Oficinas" && (
            <Workshops
              workshops={workshops}
              vols={vols}
              setModal={setModal}
              setError={setError}
              onUpdated={refresh}
            />
          )}
          {page === "Documentos" && (
            <Documents vols={vols} updateTerm={updateTerm} />
          )}
          {page === "Histórico" && <History history={history} />}
        </section>
        <footer>
          <span>
            ELLP+ctrl <b>·</b> Projeto de extensão UTFPR
          </span>
          <span>Protótipo funcional · 16 out 2026</span>
        </footer>
      </main>
      {modal === "volunteer" && (
        <Modal title="Novo voluntário" close={() => setModal("")}>
          <form onSubmit={saveVolunteer}>
            <label>
              Nome completo
              <input name="name" required placeholder="Nome do voluntário" />
            </label>
            <div className="form-row">
              <label>
                Matrícula
                <input name="registration" required placeholder="20260001" />
              </label>
              <label>
                Curso
                <input name="course" placeholder="Curso" />
              </label>
            </div>
            <div className="form-row">
              <label>
                Período
                <input name="period" placeholder="1º período" />
              </label>
              <label>
                Data de entrada
                <input type="date" name="joined" defaultValue="2026-10-16" />
              </label>
            </div>
            <div className="form-row">
              <label>
                E-mail
                <input
                  type="email"
                  name="email"
                  placeholder="nome@exemplo.edu.br"
                />
              </label>
              <label>
                Telefone
                <input name="phone" placeholder="(43) 99999-9999" />
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setModal("")}
              >
                Cancelar
              </button>
              <button className="primary" disabled={busy}>
                Cadastrar
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "workshop" && (
        <Modal title="Nova oficina" close={() => setModal("")}>
          <form onSubmit={saveWorkshop}>
            <label>
              Nome da oficina
              <input
                name="name"
                required
                placeholder="Ex.: Robótica criativa"
              />
            </label>
            <div className="form-row">
              <label>
                Data
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue="2026-10-24"
                />
              </label>
              <label>
                Duração (horas)
                <input name="duration" type="number" min="1" defaultValue="2" />
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setModal("")}
              >
                Cancelar
              </button>
              <button className="primary" disabled={busy}>
                Criar oficina
              </button>
            </div>
          </form>
        </Modal>
      )}
      {selected && (
        <Modal title="Perfil do voluntário" close={() => setSelected(null)}>
          <div className="profile-detail">
            <span className="avatar big">{initials(selected.name)}</span>
            <div>
              <h3>{selected.name}</h3>
              <p>
                {selected.registration} · {selected.status}
              </p>
            </div>
          </div>
          <dl className="details">
            <dt>Curso</dt>
            <dd>{selected.course}</dd>
            <dt>Período</dt>
            <dd>{selected.period}</dd>
            <dt>E-mail</dt>
            <dd>{selected.email || "Não informado"}</dd>
            <dt>Entrada</dt>
            <dd>{date(selected.joined)}</dd>
            <dt>Oficinas</dt>
            <dd>{selected.workshops.join(", ") || "Nenhuma registrada"}</dd>
            <dt>Termo</dt>
            <dd>{selected.termStatus}</dd>
          </dl>
          <div className="modal-actions">
            <button className="secondary" onClick={() => setSelected(null)}>
              Fechar
            </button>
            <button
              className="primary"
              onClick={() =>
                changeStatus(selected).then(() => setSelected(null))
              }
            >
              {selected.status === "Ativo"
                ? "Encerrar vínculo"
                : "Reativar vínculo"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function PageTitle({ eyebrow, title, subtitle, children }) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
function Dashboard({ data, vols, workshops, setPage, setModal }) {
  return (
    <>
      <PageTitle
        eyebrow="SEXTA-FEIRA, 16 DE OUTUBRO DE 2026"
        title="Visão geral"
        subtitle="Acompanhe os vínculos e atividades do projeto."
      >
        <button className="primary" onClick={() => setModal("volunteer")}>
          ＋ Novo voluntário
        </button>
      </PageTitle>
      <div className="stats">
        <Stat
          label="Voluntários cadastrados"
          value={data?.volunteerCount ?? "—"}
          delta={`${data?.activeCount ?? 0} ativos no projeto`}
          icon="♙"
        />
        <Stat
          label="Oficinas registradas"
          value={data?.workshopCount ?? "—"}
          delta="Atividades do ELLP"
          icon="▦"
        />
        <Stat
          label="Documentos pendentes"
          value={data?.pendingTerms ?? "—"}
          delta="Aguardam acompanhamento"
          icon="▤"
        />
        <Stat
          label="Vínculos ativos"
          value={data?.activeCount ?? "—"}
          delta="Voluntários em atividade"
          icon="◉"
        />
      </div>
      <div className="home-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Voluntários recentes</h2>
              <p>Registros da base de demonstração</p>
            </div>
            <button className="text-btn" onClick={() => setPage("Voluntários")}>
              Ver todos <span>→</span>
            </button>
          </div>
          <VolunteerTable vols={vols.slice(0, 4)} compact />
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Próximas oficinas</h2>
              <p>Agenda cadastrada</p>
            </div>
            <button className="text-btn" onClick={() => setPage("Oficinas")}>
              Ver agenda <span>→</span>
            </button>
          </div>
          <div className="agenda">
            {workshops.slice(0, 3).map((w) => (
              <div className="agenda-item" key={w.id}>
                <div className="datebox">
                  <b>{new Date(`${w.date}T12:00:00`).getDate()}</b>
                  <small>
                    {new Date(`${w.date}T12:00:00`)
                      .toLocaleDateString("pt-BR", { month: "short" })
                      .replace(".", "")}
                  </small>
                </div>
                <div>
                  <b>{w.name}</b>
                  <small>
                    {w.duration}h · {w.participantsCount} participante(s)
                  </small>
                </div>
                <span className="agenda-arrow">↗</span>
              </div>
            ))}
          </div>
          <div className="callout">
            <span>✦</span>
            <p>
              Este ambiente contém somente dados fictícios para a demonstração
              do protótipo.
            </p>
          </div>
        </section>
      </div>
      <div className="progress-note">
        <div className="progress-mark">✓</div>
        <div>
          <b>Protótipo funcional para validação</b>
          <p>
            O cadastro, a busca e o controle demonstrativo dos vínculos já podem
            ser explorados.
          </p>
        </div>
        <button className="text-btn" onClick={() => setPage("Histórico")}>
          Ver atividade recente →
        </button>
      </div>
    </>
  );
}
function Stat({ label, value, delta, icon }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{delta}</small>
    </div>
  );
}
function Volunteers({
  vols,
  q,
  setQ,
  filter,
  setFilter,
  changeStatus,
  setSelected,
  setModal,
}) {
  return (
    <>
      <PageTitle
        eyebrow="GESTÃO DE PESSOAS"
        title="Voluntários"
        subtitle="Consulte cadastros e acompanhe a situação dos vínculos."
      >
        <button className="primary" onClick={() => setModal("volunteer")}>
          ＋ Novo voluntário
        </button>
      </PageTitle>
      <section className="panel list-panel">
        <div className="toolbar">
          <div className="search">
            <span>⌕</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, matrícula ou curso"
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>Todos</option>
            <option>Ativo</option>
            <option>Encerrado</option>
          </select>
          <span className="count">{vols.length} registros</span>
        </div>
        <VolunteerTable
          vols={vols}
          onSelect={setSelected}
          changeStatus={changeStatus}
        />
      </section>
      <p className="data-note">
        A lista usa registros fictícios. Exclusão de cadastros com histórico
        fica bloqueada pela API.
      </p>
    </>
  );
}
function VolunteerTable({ vols, onSelect, changeStatus, compact }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>VOLUNTÁRIO</th>
            <th>MATRÍCULA</th>
            <th>CURSO</th>
            <th>DATA DE ENTRADA</th>
            <th>STATUS</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {vols.map((v) => (
            <tr key={v.id} onClick={() => onSelect?.(v)}>
              <td>
                <div className="person">
                  <span className="avatar">{initials(v.name)}</span>
                  <span>
                    <b>{v.name}</b>
                    <small>{v.email}</small>
                  </span>
                </div>
              </td>
              <td>{v.registration}</td>
              <td className="course">{v.course}</td>
              <td>{date(v.joined)}</td>
              <td>
                <span
                  className={`status ${v.status === "Ativo" ? "green" : "gray"}`}
                >
                  <i />
                  {v.status}
                </span>
              </td>
              <td>
                {!compact && (
                  <button
                    className="dots"
                    title="Alterar vínculo"
                    onClick={(e) => {
                      e.stopPropagation();
                      changeStatus(v);
                    }}
                  >
                    ⋯
                  </button>
                )}
              </td>
            </tr>
          ))}
          {!vols.length && (
            <tr>
              <td colSpan="6" className="empty">
                Nenhum cadastro encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
function Workshops({ workshops, vols, setModal, setError, onUpdated }) {
  const [assign, setAssign] = useState({});
  const add = async (w) => {
    if (!assign[w.id])
      return setError("Selecione um voluntário para registrar a participação.");
    try {
      await send(`/workshops/${w.id}/participants`, "POST", {
        volunteerId: assign[w.id],
      });
      setError("");
      setAssign((current) => ({ ...current, [w.id]: "" }));
      await onUpdated();
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="ATIVIDADES DO PROJETO"
        title="Oficinas"
        subtitle="Organize a agenda e registre a participação de voluntários."
      >
        <button className="primary" onClick={() => setModal("workshop")}>
          ＋ Nova oficina
        </button>
      </PageTitle>
      <div className="workshop-grid">
        {workshops.map((w) => (
          <article className="workshop" key={w.id}>
            <div className="workshop-top">
              <span className="workshop-icon">▦</span>
              <span className="status blue">Agendada</span>
            </div>
            <h2>{w.name}</h2>
            <p>
              {date(w.date)} · {w.duration} horas
            </p>
            <div className="participants">
              <span className="avatar small">{w.participantsCount}</span>
              <span>{w.participantsCount} participante(s)</span>
            </div>
            <div className="assign">
              <select
                value={assign[w.id] || ""}
                onChange={(e) =>
                  setAssign({ ...assign, [w.id]: e.target.value })
                }
              >
                <option value="">Adicionar voluntário</option>
                {vols
                  .filter((v) => !w.participants.includes(v.id))
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
              </select>
              <button
                className="icon-button"
                title="Registrar participação"
                onClick={() => add(w)}
              >
                ＋
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
function Documents({ vols, updateTerm }) {
  return (
    <>
      <PageTitle
        eyebrow="ACOMPANHAMENTO DOCUMENTAL"
        title="Documentos"
        subtitle="Acompanhe o status dos termos de voluntariado."
      >
        <span className="demo-label">Fluxo de status demonstrativo</span>
      </PageTitle>
      <section className="panel list-panel">
        <div className="panel-head">
          <div>
            <h2>Termos de voluntariado</h2>
            <p>
              Estados atualizados para apresentação, sem arquivos assinados
              reais
            </p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>VOLUNTÁRIO</th>
                <th>MATRÍCULA</th>
                <th>GERADO EM</th>
                <th>STATUS</th>
                <th>AÇÃO DE DEMO</th>
              </tr>
            </thead>
            <tbody>
              {vols.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="person">
                      <span className="avatar">{initials(v.name)}</span>
                      <b>{v.name}</b>
                    </div>
                  </td>
                  <td>{v.registration}</td>
                  <td>{date(v.joined)}</td>
                  <td>
                    <span
                      className={`status ${v.termStatus === "Aprovado" ? "green" : v.termStatus === "Em análise" ? "amber" : "gray"}`}
                    >
                      <i />
                      {v.termStatus}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={v.termStatus}
                      onChange={(e) => updateTerm(v, e.target.value)}
                    >
                      <option>Pendente</option>
                      <option>Em análise</option>
                      <option>Aprovado</option>
                      <option>Rejeitado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="callout wide-callout">
        <span>i</span>
        <p>
          O PDF do termo, upload assinado e permissões por perfil fazem parte do
          escopo final. Esta versão demonstra apenas a organização e a
          atualização de status.
        </p>
      </div>
    </>
  );
}
function History({ history }) {
  return (
    <>
      <PageTitle
        eyebrow="RASTREABILIDADE"
        title="Histórico"
        subtitle="Ações registradas pelo backend durante a demonstração."
      />
      <section className="panel history-panel">
        {history.map((h, i) => (
          <div className="history-row" key={h.id}>
            <span className={`history-dot ${i === 0 ? "current" : ""}`} />
            <div>
              <b>{h.action}</b>
              <p>{h.record}</p>
              <small>{new Date(h.date).toLocaleString("pt-BR")}</small>
            </div>
            <span className="history-actor">{h.actor}</span>
          </div>
        ))}
      </section>
    </>
  );
}
function Modal({ title, close, children }) {
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <section className="modal">
        <header>
          <h2>{title}</h2>
          <button onClick={close} className="close">
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
