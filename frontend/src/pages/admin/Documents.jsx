import { useEffect, useMemo, useState } from "react";
import { api, download } from "../../api/client.js";
import { PageTitle } from "../../components/PageTitle.jsx";
import { Modal } from "../../components/Modal.jsx";
import { Alert } from "../../components/Alert.jsx";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { ConfirmDialog } from "../../components/ConfirmDialog.jsx";
import { initials } from "../../lib/format.js";

export function Documents() {
  const [volunteers, setVolunteers] = useState([]);
  const [terms, setTerms] = useState([]);
  const [error, setError] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [regenerating, setRegenerating] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    Promise.all([api.get("/volunteers"), api.get("/terms")])
      .then(([v, t]) => {
        setVolunteers(v);
        setTerms(t);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const termByVolunteer = useMemo(() => {
    const map = {};
    terms.forEach((t) => {
      if (t.volunteer) map[t.volunteer.id] = t;
    });
    return map;
  }, [terms]);

  const run = async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const generate = (volunteer) =>
    run(() => api.post("/terms", { volunteerId: volunteer.id }));

  const approve = (term) =>
    run(() => api.patch(`/terms/${term.id}`, { decision: "aprovar" }));

  const confirmReject = async (e) => {
    e.preventDefault();
    const note = e.target.note.value;
    const term = rejecting;
    setRejecting(null);
    await run(() =>
      api.patch(`/terms/${term.id}`, { decision: "rejeitar", note }),
    );
  };

  return (
    <>
      <PageTitle
        eyebrow="ACOMPANHAMENTO DOCUMENTAL"
        title="Documentos"
        subtitle="Gere, analise e aprove os termos de voluntariado."
      />
      <Alert message={error} onClose={() => setError("")} />
      <section className="panel list-panel">
        <div className="panel-head">
          <div>
            <h2>Termos de voluntariado</h2>
            <p>Gere o termo, acompanhe o envio e aprove a documentação</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>VOLUNTÁRIO</th>
                <th>MATRÍCULA</th>
                <th>STATUS</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => {
                const term = termByVolunteer[v.id];
                return (
                  <tr key={v.id}>
                    <td>
                      <div className="person">
                        <span className="avatar">{initials(v.name)}</span>
                        <b>{v.name}</b>
                      </div>
                    </td>
                    <td>{v.registration}</td>
                    <td>
                      <StatusBadge status={term ? term.status : "Pendente"} />
                      {term?.status === "Rejeitado" && term.note && (
                        <small className="reject-hint">{term.note}</small>
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="mini"
                          disabled={busy}
                          onClick={() => (term ? setRegenerating(v) : generate(v))}
                        >
                          {term ? "Regerar" : "Gerar termo"}
                        </button>
                        {term && (
                          <button
                            className="mini"
                            onClick={() =>
                              download(
                                `/terms/${term.id}/pdf`,
                                `termo-${v.registration}.pdf`,
                              ).catch((e) => setError(e.message))
                            }
                          >
                            Baixar
                          </button>
                        )}
                        {term?.signedFileName && (
                          <button
                            className="mini"
                            onClick={() =>
                              download(
                                `/terms/${term.id}/signed`,
                                term.signedOriginalName ||
                                  `assinado-${v.registration}`,
                              ).catch((e) => setError(e.message))
                            }
                          >
                            Ver assinado
                          </button>
                        )}
                        {term?.status === "Em análise" && (
                          <>
                            <button
                              className="mini primary"
                              disabled={busy}
                              onClick={() => approve(term)}
                            >
                              Aprovar
                            </button>
                            <button
                              className="mini danger"
                              disabled={busy}
                              onClick={() => setRejecting(term)}
                            >
                              Rejeitar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      {rejecting && (
        <Modal title="Rejeitar termo" close={() => setRejecting(null)}>
          <form onSubmit={confirmReject}>
            <label>
              Motivo da rejeição
              <textarea
                name="note"
                rows="3"
                placeholder="Explique o que o voluntário precisa corrigir"
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setRejecting(null)}
              >
                Cancelar
              </button>
              <button className="primary danger">Rejeitar termo</button>
            </div>
          </form>
        </Modal>
      )}

      {regenerating && (
        <ConfirmDialog
          title="Regerar termo"
          message={`Regerar o termo de ${regenerating.name}? O documento assinado e a análise atuais serão descartados.`}
          confirmLabel="Regerar"
          danger
          busy={busy}
          onClose={() => setRegenerating(null)}
          onConfirm={() => {
            const target = regenerating;
            setRegenerating(null);
            generate(target);
          }}
        />
      )}
    </>
  );
}
