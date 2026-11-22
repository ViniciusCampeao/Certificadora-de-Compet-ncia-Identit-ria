import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client.js";
import { PageTitle } from "../../components/PageTitle.jsx";
import { Stat } from "../../components/Stat.jsx";
import { VolunteerTable } from "../../components/VolunteerTable.jsx";
import { Alert } from "../../components/Alert.jsx";

const today = new Date()
  .toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  .toUpperCase();

export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/dashboard"),
      api.get("/volunteers"),
      api.get("/workshops"),
    ])
      .then(([d, v, w]) => {
        setData(d);
        setVolunteers(v);
        setWorkshops(w);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <PageTitle
        eyebrow={today}
        title="Visão geral"
        subtitle="Acompanhe os vínculos e atividades do projeto."
      >
        <button
          className="primary"
          onClick={() => navigate("/app/voluntarios")}
        >
          ＋ Novo voluntário
        </button>
      </PageTitle>
      <Alert message={error} onClose={() => setError("")} />
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
              <p>Últimos cadastros registrados</p>
            </div>
            <button
              className="text-btn"
              onClick={() => navigate("/app/voluntarios")}
            >
              Ver todos <span>→</span>
            </button>
          </div>
          <VolunteerTable volunteers={volunteers.slice(0, 4)} />
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Próximas oficinas</h2>
              <p>Agenda cadastrada</p>
            </div>
            <button
              className="text-btn"
              onClick={() => navigate("/app/oficinas")}
            >
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
            {!workshops.length && (
              <p className="muted">Nenhuma oficina cadastrada.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
