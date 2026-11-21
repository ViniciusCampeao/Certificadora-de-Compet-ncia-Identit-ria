import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import { PageTitle } from "../../components/PageTitle.jsx";
import { Alert } from "../../components/Alert.jsx";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { initials, formatDate } from "../../lib/format.js";

export function Documents() {
  const [volunteers, setVolunteers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/volunteers")
      .then(setVolunteers)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <PageTitle
        eyebrow="ACOMPANHAMENTO DOCUMENTAL"
        title="Documentos"
        subtitle="Situação dos termos de voluntariado por participante."
      />
      <Alert message={error} onClose={() => setError("")} />
      <section className="panel list-panel">
        <div className="panel-head">
          <div>
            <h2>Termos de voluntariado</h2>
            <p>Estado atual da documentação de cada voluntário</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>VOLUNTÁRIO</th>
                <th>MATRÍCULA</th>
                <th>ENTRADA</th>
                <th>STATUS DO TERMO</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="person">
                      <span className="avatar">{initials(v.name)}</span>
                      <b>{v.name}</b>
                    </div>
                  </td>
                  <td>{v.registration}</td>
                  <td>{formatDate(v.joined)}</td>
                  <td>
                    <StatusBadge status={v.termStatus} />
                  </td>
                </tr>
              ))}
              {!volunteers.length && (
                <tr>
                  <td colSpan="4" className="empty">
                    Nenhum voluntário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
