import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import { PageTitle } from "../../components/PageTitle.jsx";
import { Alert } from "../../components/Alert.jsx";
import { formatDateTime } from "../../lib/format.js";

export function History() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/history")
      .then(setHistory)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <PageTitle
        eyebrow="RASTREABILIDADE"
        title="Histórico"
        subtitle="Ações registradas pelo sistema nas alterações de cadastro."
      />
      <Alert message={error} onClose={() => setError("")} />
      <section className="panel history-panel">
        {history.map((h, i) => (
          <div className="history-row" key={h.id}>
            <span className={`history-dot ${i === 0 ? "current" : ""}`} />
            <div>
              <b>{h.action}</b>
              <p>{h.record}</p>
              <small>{formatDateTime(h.date)}</small>
            </div>
            <span className="history-actor">{h.actor}</span>
          </div>
        ))}
        {!history.length && <p className="muted">Nenhuma ação registrada.</p>}
      </section>
    </>
  );
}
